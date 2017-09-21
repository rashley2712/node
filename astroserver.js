'use strict'

var http = require('http')
var url = require('url')
var astronomy = require('./astronomy.js')

var port = process.argv[2]

if (port == undefined) port = 8080

var server = http.createServer(function (req, res) {
	// request handling logic
	var ip = req.socket.remoteAddress;
    console.log("Request received from: " + ip)
	//console.log("Method: " + req.method)
	console.log("URL: " + req.url)
	var URLData = url.parse(req.url, true)
	//console.log(URLData)	
	res.writeHead(200, { 'Content-Type': 'application/json', 
						  'Access-Control-Allow-Origin': '*' }) 
	var responseObject = {}
	
	switch(URLData.path.substring(1)) {
		case 'status' :
			writeout(null, "OK")
			break;
		case 'moonphase' :
			astronomy.moon(null, writeout)
			break;
		case 'sun':
			astronomy.sun(null, writeout)
			break;
		default :
			res.write("No such service\n")
			res.write("Try these: 'moonphase', 'sun', 'status'\n")
			res.end()
		}
	
	function writeout(err, data) {
		console.log("Saying: " + data)
		res.write(data)
		res.end()
	}
	

	}).on('error', function(err) { console.error(err)})

server.listen(port)

server.on('listening', function(socket) {
	console.log("Listening on port: " + port)
	})


