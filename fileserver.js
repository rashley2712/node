'use strict'

var http = require('http')
var fs = require('fs')
var port = process.argv[2]
var filename = process.argv[3]


var server = http.createServer(function (req, res) {
	// request handling logic
	console.log("Request received")
	console.log("Will send back the file: " + filename)

	var src = fs.createReadStream(filename)
	src.pipe(res)
	}).on('error', function(err) { console.error(err)})

server.listen(port)

server.on('listening', function(socket) {
	console.log("Listening on port: " + port)
	})

