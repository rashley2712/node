'use strict'

var net = require('net')
var strftime = require('strftime')
var port = process.argv[2]

var server = net.createServer(function (socket) {
	// socket handling logic
	}).on('error', function(err) { console.error(err)})

server.listen(port)

server.on('listening', function(socket) { 
	console.log("listening")
	})

server.on('close', function(socket) { 
	console.log("client closed the connection")
	})

server.on('connection', function(socket) {
	console.log("client connected")
	var timeStamp = new Date()
    console.log("Sending..." + strftime('%Y-%m-%d %H:%M', timeStamp))
	socket.write(strftime('%Y-%m-%d %H:%M\n', timeStamp))
	socket.end()
	})

