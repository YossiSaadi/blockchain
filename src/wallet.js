const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const {Transaction} = require('../src/transaction');

class Wallet {
  constructor() {
    this.keyPair = ec.genKeyPair();
    this.publicKey = this.keyPair.getPublic('hex');
  }

  createTransaction(from, to, amount) {
    const tx = new Transaction(from, to, amount);
    tx.signTransaction(this);

    return tx;
  }

  toString() {
    return `Wallet Address: ${this.publicKey}`;
  }
}

module.exports.Wallet = Wallet
