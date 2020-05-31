#!/usr/bin/env node
/** nodeserver.js  */

'use strict'

var http = require('http')
var url = require('url')
var fs = require('fs')
var formidable = require('formidable');
var path = require('path')
var os = require('os')
var astronomy = require('./astronomy.js')
const { parse } = require('querystring');

var port = process.argv[2]

var rootPath = "/var/www/";
		

if (port == undefined) port = 80

function convertData(response, filename, callback) {
	var spawn = require("child_process").spawn;
	var pythonScript = ["/home/rashley/code/node/viatomToCSV.py"];
	pythonScript.push(filename); 
	var pythonCall = spawn('python3', pythonScript);
	var pythonResponse = "";
	pythonCall.stdout.on('data', function (data){
		pythonResponse+= data;
		});

	pythonCall.stdout.on('close', function(code) {
		callback(response, pythonResponse);
		});
	
	pythonCall.stderr.on('data', function(data) {
		console.error(data.toString())
		});	

}

function reportConversion(response, pythonResponse) {
	console.log("Python response: ");
	console.log(pythonResponse);
	var startIndex = pythonResponse.indexOf('written to file:') + 'written to file:'.length + rootPath.length;
	var endIndex = pythonResponse.indexOf('\n', startIndex);
	console.log(startIndex, endIndex);
	console.log("converted " + pythonResponse.substring(startIndex, endIndex));
	var filename =  pythonResponse.substring(startIndex, endIndex);
	var startIndex = pythonResponse.indexOf('saving image to:') + 'saving image to:'.length + rootPath.length;
	var endIndex = pythonResponse.indexOf('\n', startIndex);
	console.log(startIndex, endIndex);
	console.log("image " + pythonResponse.substring(startIndex, endIndex));
	var imageFilename =  pythonResponse.substring(startIndex, endIndex);
	response.writeHead(200, { 'Content-Type': 'text/html', 'Content-Encoding': 'utf-8'});
	response.write("<html>");
	
	response.write("<p><a href='" + filename + "'>" + filename + "</a></p>");
	var textFilename = filename.split('.')[0] + ".txt";
	console.log("text " + textFilename);
	response.write("<p><img src='" + imageFilename + "'/></p>");
	response.write("<p><iframe src='" + textFilename +"'></iframe></p>");
	response.write("</html>");
response.end();
}


var server = http.createServer(function (request, response) {
	// request handling logic
	var ip = request.socket.remoteAddress;
    console.log("Request received from: " + ip);
	console.log("URL: " + request.url);
	if (request.method === 'POST') {
		console.log("This was a post request...");
		var form = new formidable.IncomingForm();
		form.parse(request, function(err, fields, files) {
			if (err) console.error(err.message);
			console.log(fields);
			console.log(files);
			var destinationPath = "/var/www/uploads/" + files.fileToUpload.name;
			var fromName = files.fileToUpload.path;
			console.log("Tmp name: ", fromName, "... writing to ... " + destinationPath);
			fs.rename(fromName, destinationPath, function (err) {
				if (err) throw err;
				//response.write('File uploaded and saved to ' + destinationPath);
				convertData(response, destinationPath, reportConversion);
				//response.end();
			  });
			
		});
		
        // response.end('ok');
  	} else {
	var URLData = url.parse(request.url, true)
	// console.log(URLData)
	var parts = URLData.pathname.split('/')
	// console.log("Requesting: " + parts)
	switch(parts[1]) {
		case 'status' :
			writeout(null, "OK");
			break;
		case 'date' :
			var now = new Date();
			var dateTimeString = now.toLocaleString();
			writeout(null, dateTimeString);
			break;
		case 'dir' :
			var directoryPath = URLData.query.path;
			console.log("Listing a directory for " + directoryPath);
			fs.readdir("/var/www/" + directoryPath, null, writedir);
			break;
		case 'astro' :
			console.log("Requesting astronomy data.... ");
			var astrotool = parts[2];
			var date = URLData.query.date;
			switch(astrotool) {
				case 'moonphase':
					astronomy.moon(date, writeout)
					break;
				case 'sun':
					astronomy.sun(date, writeout)
					break;
			}
			break;
		case 'info' :
			var systemInfo = {};
			systemInfo['hostname'] = os.hostname();
			systemInfo['platform'] = os.platform();
			systemInfo['release']  = os.release();
			systemInfo['uptime']   = os.uptime();
			systemInfo['arch']     = os.arch();
			systemInfo['type']     = os.type();
			systemInfo['totalmem'] = os.totalmem();
			systemInfo['cpus']     = os.cpus();
			
			console.log(systemInfo);
			writeout(null, JSON.stringify(systemInfo, null, '\n'));
			break;
		case 'ucam' : 
			console.log("Requesting ucam data...");
			var filename = URLData.pathname.substring("ucam".length + 1);
			var filename = "/home/rashley/ucam" + filename;
			console.log("Getting file: " + filename);
			fileServer(filename, response);
			break;
		default :
			var filename = URLData.pathname.substring(1);
			console.log("Getting file: " + filename);
			fileServer(filename, response);
		}
	  }

	function fileServer(filename, response) {
		if (filename=="") { filename = "index.html"};
		var fullFilename = "";
		if (filename[0]=='/') {
			console.log("Full path given...");
			fullFilename = filename;
		} else {
			fullFilename = rootPath + filename
		}
		var contentType = 'text/html';
		var extname = path.extname(filename);
		var contentEncoding = 'utf8';
		switch (extname) {
			case '.dat':
			case '.txt':
					contentType = 'text/plain';
					break;
			case '.js':
					contentType = 'text/javascript';
					break;
			case '.css':
					contentType = 'text/css';
					break;
			case '.json':
					contentType = 'application/json';
					break;
			case '.png':
					contentType = 'image/png';
					break;
			case '.csv':
					contentType = 'text/csv';
					break;
			case '.gif':
					contentType = 'image/gif';
					break;
			case '.jpg':
					contentType = 'image/jpg';
					break;
			case '.ttf':
					contentType = 'application/x-font-ttf';
					break;
			case '.fit':
			case '.fits':
					contentType = 'application/fits';
					break;					
			case '.gz':
					contentType = 'application/gzip';
					contentEncoding = 'gzip';
 					console.log("Serving a zip file.")
					break;
			case '.mp4':
					contentType = 'video/mp4';
					console.log("Serving a video file.")
					break;
			}

			fs.readFile(fullFilename, function(error, content) {
			console.log(fullFilename);
			try {
				var stats = fs.statSync(fullFilename);
				console.log(stats);
				response.writeHead(200, { 'Content-Type': contentType, 'Content-Encoding': contentEncoding , 'Content-Length' : stats.size});
			} catch(err) {
				console.log("statSync error: " + err);
				response.writeHead(404, { 'Content-Type': 'text/html', 'Content-Encoding': 'utf8' });
				content = "404 File not found";
			}
			//if (content!=null) console.log(content.toString())
		  response.end(content, 'utf-8');
		})

	}

	function writeout(err, data) {
		response.writeHead(200, { 'Content-Type': 'application/json',
							  'Access-Control-Allow-Origin': '*' })
		response.write(data)
		response.end()
	}

	function writeoutHTML(err, data) {
		response.writeHead(200, { 'Content-Type': 'text/html',
							  'Access-Control-Allow-Origin': '*' })
		response.write(data)
		response.end()
	}


	function writedir(err, files) {
		var directoryContent = "<html><h1>Directory listing...</h1><br>";
		directoryContent+="<table border='1'>";
		for (var i in files) {
			directoryContent+="<tr>";
			directoryContent+="<td><a href='" + directoryPath  + "/" + files[i].toString() + "'>" + files[i].toString() + "</a></td>\n";
			directoryContent+="<td>" + getSizeAsString(rootPath + directoryPath + "/" + files[i].toString()) + "</td>\n";
			directoryContent+="</tr>";
		}
		directoryContent+= "</table>";
		directoryContent+= "</html>";
		writeoutHTML(null, directoryContent);
	}


	}).on('error', function(err) { console.error(err)})

server.listen(port)

server.on('listening', function(socket) {
	console.log("Listening on port: " + port);
	})


function getSizeAsString(filename) {
	var sizeStr;
	try {
		var stats = fs.statSync(filename);
		var size = parseInt(stats.size);
		if (size > 1E6) {
			sizeStr = Math.round(size/1E6) + " MB";
		} else {
			sizeStr = Math.round(size/1E3) + " kB";
		}
	} catch(err) {
		console.log("statSync error while getting file size of " + filename + ",   error: " + err);		
		sizeStr = "unknown";
	}
			
	return sizeStr;
}
