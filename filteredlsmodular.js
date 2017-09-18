'use strict'

var filtermodule = require('./filtermodule.js')

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

filtermodule.test(directory, extension, printLS)

function printLS(err, listings) {
	for (var l in listings) {
		console.log(listings[l])
	}
}
