const express = require("express");
const app = express();

require("dotenv").config();
http_port =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? process.env.HTTP_DEV_PORT
    : process.env.HTTP_PORT;
var path = require("path");

var httpServer = require("http").Server(app);
const { PeerServer } = require("peer");
const peerServer = PeerServer(
  {
    path: "/peerjs",
    port:
      !process.env.NODE_ENV || process.env.NODE_ENV === "development"
        ? process.env.PEERJS_DEV_PORT
        : process.env.PEERJS_PORT,
  },
  (server) => {
    server.addListener("connection", (socket) => {
      console.log("Happened");
    });
  }
);

//Static folder for Client part
app.use(express.static(path.join(__dirname, "/public/")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

const io = require("socket.io")(httpServer);

io.on("connection", (socket) => {
  socket.on("join-room", async (room_id, id, name) => {
    room_id = room_id.toLowerCase();
    console.log("User connected to room:" + room_id + " with id: " + id);

    socket.join(room_id);
    socket.to(room_id).broadcast.emit("user-connected", { name, id });

    socket.on("message", (message) => {
      socket
        .to(room_id)
        .broadcast.emit("received-message", { name, id }, message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected from room:" + room_id + " with id: " + id);
      socket.to(room_id).broadcast.emit("user-disconnected", id);
    });
  });
});

httpServer.listen(http_port, () => {
  console.log("Server started at port: " + http_port);
});
