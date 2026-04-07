const { expect } = require("chai");

describe("NewsVerification", function () {
  async function deployFixture() {
    const NewsVerification = await ethers.getContractFactory("NewsVerification");
    const contract = await NewsVerification.deploy();
    await contract.waitForDeployment();
    return contract;
  }

  it("stores and retrieves a news verification record", async function () {
    const contract = await deployFixture();

    await contract.addNewsRecord("hash-1", "FAKE", 9200);
    const record = await contract.getNewsRecord("hash-1");

    expect(record.contentHash).to.equal("hash-1");
    expect(record.result).to.equal("FAKE");
    expect(record.confidence).to.equal(9200n);
    expect(record.timestamp).to.be.greaterThan(0n);
  });
});
