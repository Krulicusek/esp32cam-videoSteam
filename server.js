const path = require('path');

const express = require('express');
const app = express();
const basicAuth = require('express-basic-auth');
var auth = require('basic-auth')
const WebSocket = require("ws");
let server = require('http').createServer();
//var reconnect = require('reconnect-ws');
var WSServer = WebSocket.Server;
var wss = new WSServer({
    server: server,
    perMessageDeflate: false    
    });


const HTTP_PORT = 8000;
app.use(express.json);
// app.use( (req, res) => {
 
//       if (  req.headers.authorization !== 'Basic eW91cmxvZ2luOnlvdXJwYXNzd29yZA=='
//          && req.headers.authorization !== 'Basic b3RoZXJsb2dpbjpvdGhlcnBhc3N3b3Jk')        
//         return res.status(401).send('Authentication required.') // Access denied.   
    
//       // Access granted...
//       res.send('hello world')
//       // or call next() if you use it as middleware (as snippet #1)
//     });
app.use(function(req, res, next) {
    var user = auth(req);

    if (user === undefined || user['name'] !== 'admin' || user['pass'] !== 'metalika554') {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="MyRealmName"');
        res.end('Unauthorized');
    } else {
        next();
    }
});
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