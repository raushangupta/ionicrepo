

var http = require('http');
var express = require('express');
var app = express();
var MASTER_HOST = "localhost";
var MASTER_PORT = 9090;

app.get('/alive', function (req, res) {
    res.status(200).send({"message" : 'i am alive'});
});
var body =JSON.stringify({
    hostname: "localhost",
    portnumber: "9061"
});
var server = app.listen(9061, function () {
    var host = server.address().address;
    var port = server.address().port;  
    console.log("slave server listening at http://%s:%s", host, port);
});
var options = {
    hostname: MASTER_HOST,
    port: MASTER_PORT,
    path: '/registerme',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
};
var req = http.request(options, (res) => {
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
});
req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
});
req.write(body);
req.end();