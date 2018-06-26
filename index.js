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

    //get the transaction header
    const transactionHeader = helper.createTransactionHeader(payload);

    //create transaction
    const transaction = helper.createTransaction(transactionHeader, payload);

    //create batchheader
    const batchheader = helper.createBatchHeader(transaction);

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
        if (err) return console.log(err)
        console.log(response.body)
    })

    res.send('ok');
});



app.get('/generate-key', (req, res) => {
    helper.createPrivateKey();
    res.send('Keys generated');
});



app.listen(3000, function () {
    console.log('ok');
});