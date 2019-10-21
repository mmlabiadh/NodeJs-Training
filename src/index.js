const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const BadWordsFilter = require('bad-words')

const messageUtils = require('./utils/messages');

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.emit('message', messageUtils.generateMessage('Welcome!'))
    socket.broadcast.emit('message', messageUtils.generateMessage('A new user has joined!'))

    socket.on('sendMessage', (message, callback) => {
        const filter = new BadWordsFilter();
        if (filter.isProfane(message)) {
            return callback('bad words are not allowed');
        }
        io.emit('message', messageUtils.generateMessage(message))
        callback();
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('location-message', messageUtils.generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback('Delivered');
    })

    socket.on('disconnect', () => {
        io.emit('message', messageUtils.generateMessage('A user has left!'))
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})