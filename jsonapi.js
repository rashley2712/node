'use strict'

var http = require('http')
var url = require('url')

var port = process.argv[2]

var server = http.createServer(function (req, res) {
	// request handling logic
	console.log("Request received")
	console.log("Method: " + req.method)
	console.log("URL: " + req.url)
	var URLData = url.parse(req.url, true)
	var timeString = URLData.query.iso
	var inputDate = new Date(timeString)
	var response = {}
	if (URLData.pathname.indexOf('parsetime')!=-1) {
		response.hour = inputDate.getHours()
		response.minute = inputDate.getMinutes()
		response.second = inputDate.getSeconds()
	} else { 
		response.unixtime = inputDate.getTime()
		
	}
	res.writeHead(200, { 'Content-Type': 'application/json' }) 
	res.write(JSON.stringify(response))
	res.end()
	}).on('error', function(err) { console.error(err)})

server.listen(port)

server.on('listening', function(socket) {
	console.log("Listening on port: " + port)
	})


