const express = require('express')
const app = express()

require('dotenv').config()
var fs = require('fs');

var path = require('path')

var httpServer = require('http').Server(app);


const { PeerServer } = require('peer');
const peerServer = PeerServer({
    path: '/peerjs',
    port: 8443
},(server)=>{

});


//Static folder for Client part
app.use(express.static(path.join(__dirname, "/public/")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/index.html"));
})

const io = require('socket.io')(httpServer)

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


httpServer.listen(process.env.HTTP_PORT, () => {
    console.log('Server started at port: ' + process.env.HTTP_PORT)
});

