const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const BadWordsFilter = require('bad-words')

const messageUtils = require('./utils/messages');
const usersUtils = require('./utils/users');

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = usersUtils.addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error);
        }

        socket.join(user.room);
        socket.emit('message', messageUtils.generateMessage(`Welcome ${user.username}`, 'Admin'));
        socket.broadcast.to(user.room).emit('message', messageUtils.generateMessage(`${user.username} has joined!`, 'Admin'));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: usersUtils.getUsersInRoom(user.room)
        })
    });

    socket.on('sendMessage', (message, callback) => {
        const user = usersUtils.getUser(socket.id);
        const filter = new BadWordsFilter();
        if (filter.isProfane(message)) {
            return callback('bad words are not allowed');
        }
        console.log(user); 
        io.to(user.room).emit('message', messageUtils.generateMessage(message, user.username));
        callback();
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = usersUtils.getUser(socket.id);
        io.to(user.room).emit('location-message', messageUtils.generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`, user.username))
        callback('Delivered');
    });

    socket.on('disconnect', () => {
        const user = usersUtils.removeUser(socket.id)
    
        if (user) {
            io.to(user.room).emit('message', messageUtils.generateMessage(`${user.username} has left!`, 'Admin'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: usersUtils.getUsersInRoom(user.room)
            })
        }
    })

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})