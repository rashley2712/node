'use strict'

var http = require('http')

var url = process.argv[2]

if (url == undefined) {
	console.log("Please specify a URL.")
	process.exit()
}

var allData = ""

function response(res) {
	// console.log("Got response: " + res.statusCode)
	res.setEncoding('utf8')
	
	res.on("data", function(data) { 
		// console.log("Got data...")
		allData+= data
	})

	res.on("error", function(err) {
		console.log("Got an error: " + err.message)
		})
	
	res.on("end", function(data) {
		// console.log("End of the page")
		console.log(allData.length)
		console.log(allData)
		})
	}

var fetch = http.get(url, response).on('error', console.error)
 

