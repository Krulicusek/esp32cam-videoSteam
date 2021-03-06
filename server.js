const path = require('path');
const express = require('express');
const app = express();
var auth = require('basic-auth')
const WebSocket = require("ws");

let server = require('http').createServer(function (req, res) {
    var credentials = auth(req)    
    if (!credentials || credentials.name !== 'kathriiss' || credentials.pass !== 'metalika554') {
     res.statusCode = 401
     res.setHeader('WWW-Authenticate', 'Basic realm="example"')
     res.end('Access denied')
    } else {
        
    }
   });

var WSServer = WebSocket.Server;
var wss = new WSServer({
    server: server,
    perMessageDeflate: false    
    });


const HTTP_PORT = 8000;


app.get('/client', (req, res) => res.sendFile(path.resolve(__dirname, './client.html')));

server.on('request', app);
let connectedClients = [];
wss.on('connection', (ws, req) => {
    console.log('Connected');
    connectedClients.push(ws);

    ws.on('message', data => {
        connectedClients.forEach((ws, i) => {
            if (ws.readyState === ws.OPEN) {
                ws.send(data);
            } else {
                connectedClients.splice(i, 1);
            }
        })
    });
    ws.on('error', function() {
        console.log('socket error');
    });
    ws.on('close', function() {
        console.log('socket close');      
    });
});

server.listen(process.env.PORT || HTTP_PORT, () => console.log(`HTTP server listening at ${process.env.PORT || HTTP_PORT}`));