const {Transaction} = require('./transaction');
const {Block} = require('./block');
const {MemPool} = require('./mempool');
const {MerkleTree} = require('./merkle');

const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const MAX_NUM_OF_TX_PER_BLOCK = 4;
const INITIAL_MINING_REWARD = 100;
const INITIAL_DIFFICULTY = 2;
const MINE_DIFFICULTY_RATE = 2000;

class Blockchain {
  constructor() {
    this.chain = [this.createGenesis()];
    this.difficulty = INITIAL_DIFFICULTY;
    this.miningReward = INITIAL_MINING_REWARD;
  }

  createGenesis() {
    const block = new Block("Genesis Time", "Genesis Block", "-");
    block.merkleRoot = SHA256(this.transactions).toString();
    block.difficulty = 0;
    return block;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  mineMemPool(minerAddress, memPool) {
    // generate miner reward tx
    memPool.transactions.unshift(new Transaction(null, minerAddress, this.miningReward));

    // As per to Mica requirements - one block can only take up to 4 txs
    // each tx that doesn't make it to the mining process stays in memPool
    const tempMemPool    = memPool.transactions.slice(0, MAX_NUM_OF_TX_PER_BLOCK);
    memPool.transactions = memPool.transactions.slice(MAX_NUM_OF_TX_PER_BLOCK);

    // each tx in this block shold get the timeStamp of its block
    for (const tx of tempMemPool) {
      tx.timeStamp = Date.now();
    }

    const block = new Block(Date.now(), tempMemPool, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    this.chain.push(block);

    this.adjustDifficulty();
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.transactions) {

        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }

        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }

      }
    }

    return balance;
  }

  adjustDifficulty() {  // if it was too easy/hard to mine a block (according to what MineRate we specify), then adjust difficulty
    if (this.getLatestBlock().timeStamp + MINE_DIFFICULTY_RATE > Date.now()) {
      this.difficulty += 1;
    } else if (this.getLatestBlock().timeStamp + MINE_DIFFICULTY_RATE > Date.now() + MINE_DIFFICULTY_RATE) {
      this.difficulty -= 1;
    }
  }

  isChainValid() {
    // for each block, check if it hasn't been manipulated
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // check if some/all transactions in certain block has been manipulated
      if (!currentBlock.hasValidTransactions()) {
        throw new Error("Chain have manipulated transactions. Chain not valid!");
      }

      // check if the whole block has been manipulated
      if (currentBlock.hash !== currentBlock.calculateHash() || currentBlock.previousHash !== previousBlock.hash) {
        throw new Error("Chain have manipulated block. Chain not valid!");
      }

    }

    return true;
  }

  replaceChain(newChain) {
    if (!newChain) {
      throw new Error("New chain received is empty!");
      return;
    } else if (newChain.length > this.chain.length) {
      console.log("Chain replaced to new chain.");
      this.chain = newChain;
    }
  }

}

module.exports.Blockchain = Blockchain;
