from app.services.blockchain_service import BlockchainService


def test_blockchain_service_mock_store_and_get():
    service = BlockchainService()

    result = service.store_result("hash-1", "FAKE", 0.92)
    record = service.get_result("hash-1")

    assert result["txHash"].startswith("0x")
    assert "blockNumber" in result
    assert record is not None
    assert record["contentHash"] == "hash-1"
    assert record["result"] == "FAKE"
    assert record["confidence"] == 9200
