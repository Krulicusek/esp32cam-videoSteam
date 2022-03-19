const path = require('path');
const flash = require('connect-flash');
const passport = require('passport');
const express = require('express');
const session = require('express-session');
const app = express();
const WebSocket = require('ws');
let server = require('http').createServer();
const login = require("./login_routes");
let WSServer = WebSocket.Server;
let wss = new WSServer({
    server: server,
    perMessageDeflate: false
});
app.use(require('cookie-parser')());
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash);
app.use(session({secret: 'secretDogCam',
resave: true,
saveUninitialized : true}));
app.use(passport.initialize());
app.use(passport.session());

const WS_PORT = 8888;
const HTTP_PORT = 8000;

app.use("/", login);
app.get('/client', (req, res) => res.sendFile(path.resolve(__dirname, './client.html')));
server.on('request', app);
let connectedClients = [];
var reconnectInterval = 1000 * 5;
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
        setTimeout(connect, reconnectInterval);
    });
});


server.listen(process.env.PORT || HTTP_PORT, () => console.log(`HTTP server listening at ${process.env.PORT || HTTP_PORT}`));