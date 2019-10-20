const express = require('express');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const users = [];
const connections = [];

server.listen(process.env.PORT || 3000);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
io.sockets.on('connection', (socket) => {
  console.log(socket);
})
