let express = require('express');
let app = express();

const helper = require('./helpers/private-key');

const restUrl = 'http://127.0.0.1:8008/';

app.get('/', (req, res) => {

    //get the payload
    const payload = helper.encodePayload({
        Verb: 'set',
        Name: 'foo',
        Value: 42
    });

    //get the keys

    const keys = helper.createPrivateKey();

    console.log(keys);

    //get the transaction header
    const transactionHeader = helper.createTransactionHeader(payload,keys);

    //create transaction
    const transaction = helper.createTransaction(transactionHeader, payload);

    //create batchheader
    const batchheader = helper.createBatchHeader(transaction,keys);

    //create batch 
    const batch = helper.createBatch(batchheader, transaction);

    //create batch list
    const batchListBytes = helper.createBatchList(batch);

    const request = require('request')

    request.post({
        url: restUrl+'batches',
        body: batchListBytes,
        headers: { 'Content-Type': 'application/octet-stream' }
    }, (err, response) => {
        
        console.log("Error",err);
        console.log("response",response.body)
    })

    res.send('ok');
});



app.get('/generate-key', (req, res) => {
    helper.createPrivateKey();
    res.send('Keys generated');
});



app.listen(3001, function () {
    console.log('ok');
});