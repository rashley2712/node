'use strict'

var http = require('http')
var url = require('url')
var astronomy = require('./astronomy.js')

var port = process.argv[2]

if (port == undefined) port = 8080

var server = http.createServer(function (req, res) {
	// request handling logic
	console.log("Request received")
	console.log("Method: " + req.method)
	console.log("URL: " + req.url)
	var URLData = url.parse(req.url, true)
	// console.log(URLData)	
	res.writeHead(200, { 'Content-Type': 'application/json', 
						  'Access-Control-Allow-Origin': '*' }) 
	var responseObject = {}
	
	astronomy.moonphase(null, function(err, moonphase) {
		console.log(moonphase)
		res.write(moonphase)
		res.end()
	})

	}).on('error', function(err) { console.error(err)})

server.listen(port)

server.on('listening', function(socket) {
	console.log("Listening on port: " + port)
	})


