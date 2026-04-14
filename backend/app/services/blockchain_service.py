import json
import time
import uuid
from pathlib import Path

from app.core.config import settings


_mock_records: dict[str, dict] = {}
_tx_metadata: dict[str, dict] = {}


def _normalize_tx_hash(value: str) -> str:
    text = str(value or "").strip()
    if not text:
        return text
    return text if text.startswith("0x") else f"0x{text}"


class BlockchainService:
    def __init__(self) -> None:
        self._web3 = None
        self._account = None
        self._contract = None
        self._enabled = False
        self._load_client()

    def _load_client(self) -> None:
        required = (
            settings.BLOCKCHAIN_RPC_URL,
            settings.BLOCKCHAIN_PRIVATE_KEY,
            settings.BLOCKCHAIN_CONTRACT_ADDRESS,
        )
        if not all(required):
            return

        try:
            from web3 import Web3
            from web3.exceptions import TimeExhausted
        except ImportError:
            return

        artifact_path = Path(settings.BLOCKCHAIN_ARTIFACT_PATH)
        if not artifact_path.exists():
            raise FileNotFoundError(f"Contract artifact not found: {artifact_path}")

        artifact = json.loads(artifact_path.read_text(encoding="utf-8"))
        provider = Web3.HTTPProvider(settings.BLOCKCHAIN_RPC_URL)
        web3 = Web3(provider)
        if not web3.is_connected():
            raise ConnectionError("Unable to connect to blockchain RPC provider.")

        account = web3.eth.account.from_key(settings.BLOCKCHAIN_PRIVATE_KEY)
        contract = web3.eth.contract(
            address=Web3.to_checksum_address(settings.BLOCKCHAIN_CONTRACT_ADDRESS),
            abi=artifact["abi"],
        )

        self._web3 = web3
        self._account = account
        self._contract = contract
        self._time_exhausted_error = TimeExhausted
        self._enabled = True

    @property
    def enabled(self) -> bool:
        return self._enabled

    def _confidence_to_int(self, confidence: float) -> int:
        return int(round(float(confidence) * 10000))

    def store_result(self, text_hash: str, result: str, confidence: float) -> dict:
        if not self.enabled:
            tx_hash = _normalize_tx_hash(uuid.uuid4().hex[:40])
            block_number = 0
            record = {
                "contentHash": text_hash,
                "result": result,
                "confidence": self._confidence_to_int(confidence),
                "timestamp": int(time.time()),
            }
            _mock_records[text_hash] = record
            _tx_metadata[text_hash] = {"txHash": tx_hash, "blockNumber": block_number}
            return {"txHash": tx_hash, "blockNumber": block_number}

        nonce = self._web3.eth.get_transaction_count(self._account.address)
        gas_price = self._web3.eth.gas_price
        transaction = self._contract.functions.addNewsRecord(
            text_hash,
            result,
            self._confidence_to_int(confidence),
        ).build_transaction(
            {
                "from": self._account.address,
                "nonce": nonce,
                "gas": 250000,
                "gasPrice": gas_price,
                "chainId": settings.BLOCKCHAIN_CHAIN_ID,
            }
        )
        signed_tx = self._account.sign_transaction(transaction)
        tx_hash = self._web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        metadata = {
            "txHash": _normalize_tx_hash(tx_hash.hex()),
            "blockNumber": None,
        }
        try:
            receipt = self._web3.eth.wait_for_transaction_receipt(tx_hash, timeout=12, poll_latency=1)
            metadata["txHash"] = _normalize_tx_hash(receipt.transactionHash.hex())
            metadata["blockNumber"] = receipt.blockNumber
        except self._time_exhausted_error:
            # Sepolia confirmation time can be slow. Return the tx hash immediately
            # so the frontend can show the pending blockchain proof without timing out.
            pass
        _tx_metadata[text_hash] = metadata
        return metadata

    def get_result(self, text_hash: str) -> dict | None:
        if not self.enabled:
            record = _mock_records.get(text_hash)
            if record is None:
                return None
            return {**record, **_tx_metadata.get(text_hash, {})}

        record = self._contract.functions.getNewsRecord(text_hash).call()
        if not record[0]:
            return None
        return {
            "contentHash": record[0],
            "result": record[1],
            "confidence": record[2],
            "timestamp": record[3],
            **_tx_metadata.get(text_hash, {}),
        }


blockchain_service = BlockchainService()


def store_result(text_hash: str, result: str, confidence: float) -> dict:
    return blockchain_service.store_result(text_hash, result, confidence)


def get_result(text_hash: str) -> dict | None:
    return blockchain_service.get_result(text_hash)
