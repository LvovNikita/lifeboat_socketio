const http = require('http')
const express = require('express')

const app = express()
const server = http.Server(app)
const socketio = require('socket.io')

const io = new socketio.Server(server, {})

const state = require('./server/state')

app.get('/', (req, res, next) => {
    res.sendFile(__dirname + '/client/index.html')
})

function updateStateDecorator(fn) {
    state.numOfPlayers = io.engine.clientsCount
    if (fn) fn()
    io.emit('updateState', state)
    console.log(state)
}

io.on('connect', socket => {
    updateStateDecorator(() => {
        state.players.push({
            socketId: socket.id
        })
    })
    socket.conn.on('close', () => {
        updateStateDecorator(() => {
            state.players = state.players.filter(player => player.socketId != socket.id)
        })
    })
})

server.listen(3000)