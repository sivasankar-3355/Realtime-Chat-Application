const express = require('express')
const app = express()
const path = require('path')
const http = require('http')
const server = http.createServer(app)
const socketio = require('socket.io')
const io = socketio(server)
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')
const botName = 'Chatcord Bot'

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', socket => {

    console.log('New ws connected')

    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room)
        socket.join(user.room)

        //shown only to connected user
        socket.emit('message', formatMessage(botName, 'Welcome to chatcord!!'))

        //broadcast to everyone except the connected user
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`))

        //send users room info 
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    //disconnect
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))
            //send users room info 
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })

    //listening to the message send from client side
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

})

server.listen(6969, () => {
    console.log('listening...')
})

