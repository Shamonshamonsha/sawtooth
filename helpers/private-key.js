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

    const output = `PRIVATE_KEY=${privateKey.asHex()}\nPUBLIC_KEY=${signer.getPublicKey().asHex()}`

    fs.writeFile(path.resolve(__dirname, './.env'), output, (err) => {
        if (err) {
            return console.log(err)
        }
    })
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
const createTransactionHeader = function createTransactionHeader(payloadBytes) {

    return  protobuf.TransactionHeader.encode({
        familyName: 'intkey',
        familyVersion: '1.0',
        inputs: [],
        outputs: [],
        signerPublicKey: '02cb65a26f7af4286d5f8118400262f7790e20018f2d01e1a9ffc25de1aafabdda',

        batcherPublicKey: '02cb65a26f7af4286d5f8118400262f7790e20018f2d01e1a9ffc25de1aafabdda',
        dependencies: [],
        payloadSha512: createHash('sha512').update(payloadBytes).digest('hex')
    }).finish();


}

/*
* Create the transactions
*/
const createTransaction = function createTransaction(transactionHeaderBytes, payloadBytes) {

    const signature = signer.sign(transactionHeaderBytes)

    console.log(signature);

    return transaction = protobuf.Transaction.create({
        header: transactionHeaderBytes,
        headerSignature:signature,
        payload: payloadBytes
    });
}
/*
* Create batch heaader
*/
const createBatchHeader = function createBatchHeader(transaction) {

    const transactions = [transaction];

   return protobuf.BatchHeader.encode({
        signerPublicKey: '02cb65a26f7af4286d5f8118400262f7790e20018f2d01e1a9ffc25de1aafabdda',
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