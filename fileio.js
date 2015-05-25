var fs = require('fs');
filename = process.argv[2];

if (filename == undefined) {
	console.log("Please specify a filename.");
	process.exit();
}
lineCounter = 0;

fileBuffer = fs.readFile(filename, function (err, data) {
	fileString = data.toString();
	lines = fileString.split('\n');
	console.log(lines.length - 1);	
})
