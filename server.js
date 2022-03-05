const path = require('path');
const express = require('express');
const app = express();
const WebSocket = require('ws');
let server = require('http').createServer();
let WSServer = WebSocket.Server;
let wss = new WSServer({
    server: server,
    perMessageDeflate: false
  });
 app.get('/client',(req,res)=>res.sendFile(path.resolve(__dirname, './client.html')));
server.on('request', app)
const WS_PORT  = 8888;
const HTTP_PORT = 8000;

// const wsServer = new WebSocket.Server({port: process.env.port || WS_PORT} , ()=> console.log(`WS Server is listening at ${process.env.port || WS_PORT}`
// ));

let connectedClients = [];

wss.on('connection', (ws, req)=>{
    console.log('Connected');
    connectedClients.push(ws);

    ws.on('message', data => {
        connectedClients.forEach((ws,i)=>{
            if(ws.readyState === ws.OPEN){
                ws.send(data);
            }else{
                connectedClients.splice(i ,1);
            }
        })
    });
});


server.listen(process.env.PORT || HTTP_PORT, ()=> console.log(`HTTP server listening at ${process.env.PORT || HTTP_PORT}`));