'use strict'

var http = require('http')
var fs = require('fs')
var map = require('through2-map')  

var port = process.argv[2]

var server = http.createServer(function (req, res) {
	// request handling logic
	console.log("Request received")
	console.log(req.method)
	req.pipe(map( function(chunk) {	
		console.log(chunk.toString())
		return chunk.toString().toUpperCase()
		})).pipe(res)
	}).on('error', function(err) { console.error(err)})

server.listen(port)

server.on('listening', function(socket) {
	console.log("Listening on port: " + port)
	})

