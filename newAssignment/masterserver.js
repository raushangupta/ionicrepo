
var http = require('http');
var express = require('express');
var app = express();
var fs = require("fs");
var path  = require("path");
var async = require('async');
var NoSQL = require('nosql').load('C:\serverDetail.nosql');;
var ejs = require('ejs');
app.set("view engine",'ejs');


// app.use(express.static(__dirname + ' '));
// app.use(express.static(path.join(__dirname)));
// app.get('/back', function (request, response) {
//     response.sendFile(__dirname + '/rkg1.jpg');
//     response.set('content-type','text/html');
//      response.send(fs.readFileSync(__dirname+ '/index.html'));
//     response.end();
// });



app.get('/', function(req, res){
    res.set('content-type','text/html');
    res.send(fs.readFileSync(__dirname+'/index.html'));
    res.end();
});

app.get('/status', function (req, res) {
    NoSQL.find().make(function (filter) {
        filter.callback(function (err, registeredServer) {
            if (err) {
                console.log(err);
            }
            console.log(registeredServer.length);
            for (var i = 0; i < registeredServer.length; i++) {
                console.log(registeredServer[i].hostname + " : " + registeredServer[i].portnumber);
            }
            async.map(registeredServer, getServerStatus, function (error, result) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log(result);
                    res.render('index.ejs' ,{ result});
                }
            });
            function getServerStatus(registeredServer, callback) {
                var options = {
                    hostname: registeredServer.hostname,
                    port: registeredServer.portnumber,
                    path: '/alive'
                }
                var req = http.get(options);
                req.on("response" , function (res){
                    console.log("response STATUS: " + res.statusCode);
                    registeredServer.status = res.statusCode;
                    callback(null, registeredServer);
                });
                req.on("error", function (res) {
                    console.log(" error STATUS: " + res.code);
                    registeredServer.status = res.code;
                    callback(null, registeredServer);
                });
            }
        });
    });
});



app.post('/registerme', function (req, res) {
    var body = [];
    req.on('error', function (err) {
        console.error(err);
    }).on('data', function (chunk) {
        body.push(chunk);
    }).on('end', function () {
        body = Buffer.concat(body).toString();
        var serverData = JSON.parse(body);
        console.log(serverData);
        var getdetail = NoSQL.find().make(function (filter) {
            filter.filter((myserver) => myserver.portnumber == serverData.portnumber);
            filter.callback(function (err, result) {
                console.log(result);
                if (result.length == 1) {
                    res.status(409).send({ status: "Server already registered " + JSON.stringify(result[0]) });
                }
                else {
                    NoSQL.insert(serverData);
                    res.status(200).send({ status: "Server registered " + body });
                }
            });
        });

    });
});




var server = app.listen(9090, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("master server is listening at http://%s:%s", host, port);
});