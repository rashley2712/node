'use strict'

var http = require('http')

var urls = []
var content = []
var finished = [false, false, false]
for (var i=2; i<5; i++) {
    urls.push(process.argv[i])
	}

var calls = []

for (var u in urls) {
	getHTTPbyIndex(u)
	}

function getHTTPbyIndex(index) {
	var allData = ""
	function response(res) {
		res.setEncoding('utf8')
	
		res.on("data", function(data) { 	
			allData+= data
		})

		res.on("error", function(err) {
			console.log("Got an error: " + err.message)
			})
	
		res.on("end", function(data) {
			finished[index] = true;
			content[index] = allData;
			checkFinished()
			})
	}

 
	http.get(urls[index], response) 
}

function checkFinished() {
	for (var u in urls) {
		if (!finished[u]) return
		}
	
	for (var u in urls) {
		console.log(content[u]);
		}
	
}
