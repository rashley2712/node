var WebSocketServer = require('websocket').server;
var http = require('http');
var utils = require('./utils.js');

var clients = [];
var games = [];

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
server.listen(1337, function() { });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            // process WebSocket message
			handleMessage(message.utf8Data, connection);
        }
    });

    connection.on('close', function() {
		// close user connection
        console.log("A connection was closed...");
		//console.log(connection);
		console.log(connection.remoteAddress + " disconnected");
		for (i in clients) {
			if(clients[i].connection == connection) {
				console.log(timeStamp() + connection.remoteAddress + " (" + clients[i].username + ") disconnected.");
				clients.splice(i, 1);
			}
		}
    });
});

function timeStamp() {
	var d = new Date();
	timeString = utils.formatTime(d);
	return timeString + " : ";
}

function uniqueUsername(username) {
	for (i in clients) 	{
		if (clients[i].username==username) return false;
		console.log("checking usernames: " + clients[i].username);
	}
	return true;
}


function handleMessage(mString, connection) {
	var pMessage = mString.split("|");
	var command = pMessage[0];
	console.log("Command: " + command);
	if (command=="connect") {
		username = pMessage[1];
		if (uniqueUsername(username)) {
			id = clients.length;
			var clientData = {connection: null, username: null, status: 0, id: null, ping: null};
			clientData.connection = connection;
			clientData.id = id;
			clientData.username = username;
			clientData.ping = 999;
			clientData.status = 0;
			clients.push(clientData);
			connection.sendUTF(JSON.stringify({msg: "connected", data: "You are connected as user: " + username}));
			console.log(timeStamp() + "New user connected [" + id + "] " + username);
		} else {
			connection.sendUTF(JSON.stringify({msg: "error", data: "Username (" + username + ") is already connected. Sorry."}));
			connection.close();
			console.log(timeStamp() + "Non-unique username request rejected");
		}
	}
	
	if (command=="list") {
		console.log(timeStamp() + "... request to list users...");
		var clientdata = [];
		for (i in clients) {
			var clientObject = {username: null, status: null, ping: null};
			console.log("[" + i +"] " + clients[i].username);
			clientObject.username = clients[i].username;
			clientObject.ping = clients[i].ping;
			clientObject.status = clients[i].status;
			console.log(clientObject);
			clientdata.push(clientObject);
		}
		connection.sendUTF(JSON.stringify({msg: "users", data: clientdata}));	
	}

	if (command=="ping") {
		console.log(timeStamp() + "ping request received...  [" + pMessage[1] + "]");
		var timeString = pMessage[1];
		connection.sendUTF(JSON.stringify({msg: "pong", data: timeString}));	
	}

	if (command=="setping") {
		console.log(timeStamp() + "set ping request received...  [" + pMessage[1] + "]");
		for (i in clients) 	{
			if (clients[i].connection==connection) clients[i].ping = pMessage[1];
		}
	}
	
	if (command=="updatestatus") {
		console.log(timeStamp() + "update status received...  [" + pMessage[1] + "]");
		for (i in clients) 	{
			if (clients[i].connection==connection) clients[i].status = parseInt(pMessage[1]);
		}
	}
	
	if (command=="requestgame") {
		// Get this usernames of the players
		var fromindex, toindex = -1;
		for(i in clients) {
			if (clients[i].connection == connection) fromindex = i;
			if (clients[i].username == pMessage[1]) toindex = i; 
		}
		if ((fromindex!=-1)&&(toindex!=-1)) {
			console.log(timeStamp() + " game requested from '" + clients[fromindex].username + "' to '" + clients[toindex].username + "'");
			var destinationConnection = clients[toindex].connection;
			
			destinationConnection.sendUTF(JSON.stringify({msg: "gamerequest", data: clients[fromindex].username}));
		}
	}
	
}

