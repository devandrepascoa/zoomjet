const express = require('express')
const app = express()

const { v4: uuid } = require('uuid')
require('dotenv').config()
var fs = require('fs');

var path = require('path')
var privateKey = fs.readFileSync('sslcert/selfsigned.key', 'utf8');
var certificate = fs.readFileSync('sslcert/selfsigned.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };

// Redirect from http port 80 to https
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80, () => {
    console.log('Server started at port: ' + process.env.HTTP_PORT)
});

var httpsServer = require('https').Server(credentials, app);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const { PeerServer } = require('peer');
const peerServer = PeerServer({
    secure: true,
    ssl: credentials,
    path: '/peerjs',
    port: 8443
});


//Static folder for Client part
app.use(express.static(path.join(__dirname, "/public/")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"));
})

const io = require('socket.io')(httpsServer, credentials)

io.on('connection', socket => {
    socket.on('join-room', async (room_id, id, name) => {
        console.log("User connected to room:" + room_id + " with id: " + id)

        socket.join(room_id)
        socket.to(room_id).broadcast.emit('user-connected', { name, id })
        
        socket.on('message', (message) => {
            socket.to(room_id).broadcast.emit('received-message', { name, id }, message)
        })

        socket.on('disconnect', () => {
            console.log("User disconnected from room:" + room_id + " with id: " + id)
            socket.to(room_id).broadcast.emit('user-disconnected', id)
        })
    })
})


httpsServer.listen(process.env.HTTPS_PORT, () => {
    console.log('Server started at port: ' + process.env.HTTPS_PORT)
});

