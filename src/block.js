const SHA256 = require('crypto-js/sha256');
const {MerkleTree} = require('./merkle');

class Block {
  constructor(timeStamp, transactions, previousHash = '') {
    this.timeStamp = timeStamp;
    this.transactions = transactions; // Array of Transaction
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(this.timeStamp +
      JSON.stringify(this.transactions) +
      this.previousHash +
      this.nonce
    ).toString();
  }

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    this.difficulty = difficulty;

    this.createMerkle();
  }

  createMerkle() {
    this.merkle = new MerkleTree(this.transactions.map(x => x.hash));
    this.merkleRoot = this.merkle.getRoot().toString();
  }

  hasValidTransactions() {
    for (const transaction of this.transactions) {
      if (!transaction.isTransactionValid()) {
        return false;
      }
    }
    return true;
  }

  toString() {
    return `*Block*:
      TimeStamp:     ${this.timeStamp}
      Previous Hash: ${this.previousHash}
      Hash:          ${this.hash}
      Nonce:         ${this.nonce}
      Difficulty:    ${this.difficulty}
      Merkle Root:   ${this.merkleRoot}

      Transactions:  ${this.transactions}
      `;
  }

}

module.exports.Block = Block;
