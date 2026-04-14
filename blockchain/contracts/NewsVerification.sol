// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract NewsVerification {
    struct NewsRecord {
        string contentHash;
        string result;
        uint256 confidence;
        uint256 timestamp;
    }

    mapping(string => NewsRecord) public records;

    event NewsRecordAdded(
        string indexed contentHash,
        string result,
        uint256 confidence,
        uint256 timestamp
    );

    function addNewsRecord(
        string memory _hash,
        string memory _result,
        uint256 _confidence
    ) public {
        require(bytes(_hash).length > 0, "Hash is required");
        require(bytes(_result).length > 0, "Result is required");

        NewsRecord memory record = NewsRecord({
            contentHash: _hash,
            result: _result,
            confidence: _confidence,
            timestamp: block.timestamp
        });

        records[_hash] = record;
        emit NewsRecordAdded(_hash, _result, _confidence, block.timestamp);
    }

    function getNewsRecord(
        string memory _hash
    ) public view returns (NewsRecord memory) {
        return records[_hash];
    }
}
