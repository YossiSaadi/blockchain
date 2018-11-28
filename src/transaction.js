const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timeStamp = Date.now();
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(this.fromAddress +
      this.toAddress +
      this.amount +
      this.timeStamp
    ).toString();
  }

  signTransaction(senderWallet) {
    const signingKey = senderWallet.keyPair;
    if (signingKey.getPublic('hex') !== this.fromAddress) { // private key does not belong to this fromAddress wallet
      throw new Error(`Can't make a transaction on behalf of other's wallet!`);
    }

    const hashTx = this.hash;
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  isTransactionValid() {
    if (this.fromAddress === null) { // checks case of Mining reward tx
      return true;
    }
    if (!this.signature || this.signature.length === 0) { // checks case of no signature
      throw new Error(`Transaction must be signed!`);
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex'); // make the fromAddress a publicKey object
    return publicKey.verify(this.calculateHash(), this.signature); // check if that hashTx has been signed by signature
  }

  toString() {
    return `
        *Transaction*:
          TimeStamp: ${this.timeStamp}
          From:      ${this.fromAddress}
          Amount:    ${this.amount}
          To:        ${this.toAddress}
          Hash:      ${this.hash}`;
  }
}

module.exports.Transaction = Transaction;
