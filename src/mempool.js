class MemPool {
  constructor() {
    this.transactions = [];
  }

  updateOrAddTransaction(transaction) {
    const txHash = this.transactions.find(tx => tx.hash === transaction.hash);

    if (txHash) {
      this.transactions[this.transactions.indexOf(txHash)] = transaction;
    } else {
      this.transactions.push(transaction);
    }

  }

  mineMemPool(minerAddress, difficulty) {
    const tempMemPool = this.popTransactionsFromMemPool();

    this.generateMinerRewardTransaction(minerAddress);

    // each tx in this block shold get the timeStamp of its block
    for (const tx of tempMemPool) {
      tx.timeStamp = Date.now();
    }

    const block = new Block(Date.now(), tempMemPool, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    this.chain.push(block);

    this.adjustDifficulty();
  }

  popTransactionsFromMemPool() {
    // As per to Mica requirements - one block can only take up to 4 txs
    // each tx that doesn't make it to the mining process stays in memPool
    const tempMemPool = this.transactions.slice(0, MAX_NUM_OF_TX_PER_BLOCK - 1);
    this.transactions = this.transactions.slice(MAX_NUM_OF_TX_PER_BLOCK - 1);
    return tempMemPool;
  }

  generateMinerRewardTransaction(minerAddress) {
    const rewardTransaction = new Transaction(null, minerAddress, this.miningReward);
    this.transactions.unshift(rewardTransaction);
  }
}

module.exports.MemPool = MemPool
