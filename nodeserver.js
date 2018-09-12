#!/usr/bin/env node
/** nodeserver.js  */

'use strict'

var http = require('http')
var url = require('url')
var fs = require('fs')
var path = require('path')
var os = require('os')

var port = process.argv[2]

if (port == undefined) port = 80

var server = http.createServer(function (request, response) {
	// request handling logic
	var ip = request.socket.remoteAddress;
    console.log("Request received from: " + ip)
	console.log("URL: " + request.url)
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
		case 'info' :
			var systemInfo = {};
			systemInfo['hostname'] = os.hostname();
			systemInfo['platform'] = os.platform();
			systemInfo['release']  =  os.release();
			systemInfo['uptime']   = os.uptime();
			systemInfo['arch']     = os.arch();
			systemInfo['type']     = os.type();
			systemInfo['totalmem'] = os.totalmem();
			systemInfo['cpus']     = os.cpus();
			
			console.log(systemInfo);
			writeout(null, JSON.stringify(systemInfo, null, '\n'));
			break;
		default :
			var filename = URLData.pathname.substring(1);
			console.log("Getting file: " + filename);
			fileServer(filename, response);
		}

	function fileServer(filename, response) {
		var rootPath = "/var/www/";
		if (filename=="") { filename = "index.html"};
		var fullFilename = rootPath + filename
		var contentType = 'text/html';
		var extname = path.extname(filename);
		var contentEncoding = 'utf8';
		switch (extname) {
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
					contentType = 'application/json';
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

		for (var i in files) {
			directoryContent+="<a href='" + directoryPath  + "/" + files[i].toString() + "'>" + files[i].toString() + "</a><br>\n";
		}
		directoryContent+= "</html>";
		writeoutHTML(null, directoryContent);
	}


	}).on('error', function(err) { console.error(err)})

server.listen(port)

server.on('listening', function(socket) {
	console.log("Listening on port: " + port);
	})
