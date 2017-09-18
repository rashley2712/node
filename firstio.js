"use strict"

var fs = require('fs')

var filename = process.argv[2]

var contents = fs.readFileSync(filename)
var lines = contents.toString().split('\n').length

console.log(lines - 1)
