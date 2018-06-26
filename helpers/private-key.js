const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const fs = require('fs')
const path = require('path');

const context = createContext('secp256k1')
const privateKey = context.newRandomPrivateKey()
const signer = new CryptoFactory(context).newSigner(privateKey);

const cbor = require('cbor');

const { createHash } = require('crypto')
const { protobuf } = require('sawtooth-sdk')

/*
* Generate the keys
*/
const createPrivateKey = function createPrivateKey() {

    //const output = `PRIVATE_KEY=${privateKey.asHex()}\nPUBLIC_KEY=${signer.getPublicKey().asHex()}`

    return {
        privateKey:privateKey.asHex(),
        publicKey:signer.getPublicKey().asHex()
    }
}

/*
* Encode the payload
*/
const encodePayload = function encodePayload(payload) {

    return cbor.encode(payload)

}

/*
*Create the transaction header
*/
const createTransactionHeader = function createTransactionHeader(payloadBytes,keys) {

    return  protobuf.TransactionHeader.encode({
        familyName: 'intkey',
        familyVersion: '1.0',
        inputs: [],
        outputs: [],
        signerPublicKey: keys.publicKey,
        batcherPublicKey:  keys.publicKey,
        dependencies: [],
        payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
    }).finish();


}

/*
* Create the transactions
*/
const createTransaction = function createTransaction(transactionHeaderBytes, payloadBytes) {

    const signature = signer.sign(transactionHeaderBytes);
    
    return transaction = protobuf.Transaction.create({
        header: transactionHeaderBytes,
        headerSignature:signature,
        payload: payloadBytes
    });
}
/*
* Create batch heaader
*/
const createBatchHeader = function createBatchHeader(transaction,keys) {

    const transactions = [transaction];

   return protobuf.BatchHeader.encode({
        signerPublicKey:keys.publicKey,
        transactionIds: transactions.map((txn) => txn.headerSignature),
    }).finish();

}
/*
*Create batches
*/
const createBatch = function createBatch(batchHeaderBytes,transactions) {

    const signature = signer.sign(batchHeaderBytes)

    return protobuf.Batch.create({
        header: batchHeaderBytes,
        headerSignature: signature,
        transactions: transactions
    });
}

/*
* Create batch list
*/
const createBatchList = function createBatchList(batch){

    return batchListBytes = protobuf.BatchList.encode({
        batches: [batch]
    }).finish()
}



module.exports = {
    createPrivateKey, encodePayload, createTransactionHeader, createTransaction,
    createBatchHeader, createBatch,createBatchList
}