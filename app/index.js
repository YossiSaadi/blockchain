const express = require('express');
const bodyParser = require('body-parser');
const {P2pServer} = require('./p2p-server');

const {Blockchain} = require('../src/blockchain');
const {Transaction} = require('../src/transaction');
const {Wallet} = require('../src/wallet');
const {MemPool} = require('../src/mempool');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
var mp = new MemPool();
const p2pServer = new P2pServer(bc, mp);

app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

app.get('/memPool', (req, res) => {
  res.json(mp.transactions);
});

app.get('/public', (req, res) => {
  res.json({publicKey: wallet.publicKey});
});

app.post('/transact', (req, res) => {
  const {to, amount} = req.body;
  const tx = wallet.createTransaction(wallet.publicKey, to, amount);
  p2pServer.broadcastTransaction(tx);
  mp.transactions.push(tx);
  res.redirect('/memPool');
});

app.post('/mine', (req, res) => {
  bc.mineMemPool(wallet.publicKey, mp);

  p2pServer.syncChains();

  res.redirect('/blocks');
});

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
p2pServer.listen();
