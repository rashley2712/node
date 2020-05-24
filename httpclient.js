'use strict'

var http = require('http')

var url = process.argv[2]

if (url == undefined) {
	console.log("Please specify a URL.")
	process.exit()
}


function response(res) {
	// console.log("Got response: " + res.statusCode)
	res.setEncoding('utf8')
	
	res.on("data", function(data) { 
		console.log(data)
		})

	res.on("error", function(err) {
		console.log("Got an error: " + err.message)
		})
	
	res.on("end", function(data) {
		//console.log("End of the page")
		})
	}

var fetch = http.get(url, response).on('error', console.error)
 

