'use strict'

var fs = require('fs')

var directory = process.argv[2];
var extension = process.argv[3];

if (directory==undefined) {
	console.log("Please specify a directory.")
	process.exit()
}

if (extension==undefined) {
	console.log("Please specify a file extension.")
	process.exit()
}

var listing = fs.readdir(directory, function(err, data) {
	if (err) { 
		console.log(err)
		return
		}		
	filterList(data)
	})

function filterList(list) {
	for (var l in list) if (list[l].indexOf("." + extension)!=-1) console.log(list[l])
}
	
