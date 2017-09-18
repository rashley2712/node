'use strict'
var fs = require('fs');
var filename = process.argv[2];

if (filename == undefined) {
	console.log("Please specify a filename.");
	process.exit();
}

var fileBuffer = fs.readFile(filename, function (err, data) {
	var fileString = data.toString();
	var lines = fileString.split('\n');
	console.log(lines.length - 1);	
})
