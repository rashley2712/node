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
				informViewers();
				
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

function getConnectionForUsername(username) {
	for (i in clients) {
		if (clients[i].username == username) return clients[i].connection;
	}
	return false;
}

function getViewersOnly() {
	clientShortList = []
	for (i in clients) {
		if (clients[i].username == 'viewer') clientShortList.push(clients[i]);
	}
	return clientShortList;
	
}

function informViewers() {
	// Informs all viewers of an update to the user list
	console.log("Updating the viewers of a change to the list of users.");
	var clientdata = [];
	for (i in clients) {
		var clientObject = {username: null, status: null, ping: null};
		clientObject.username = clients[i].username;
		clientObject.ping = clients[i].ping;
		clientObject.status = clients[i].status;
		console.log(clientObject);
		clientdata.push(clientObject);
	}
	console.log("Updated user list...");
	console.log(clientdata);
	JSONpacket = JSON.stringify({msg: "users", data: clientdata});
	for (i in clients) {
		connection = clients[i].connection;
		connection.send(JSONpacket);
	}
}

function informViewersOfKeyPress(player, direction, status) {
	// Informs all viewers of a keypress from a player
	clientdata = {player: player, direction: direction, status: status};
	
	console.log(clientdata);
	JSONpacket = JSON.stringify({msg: "keypress", data: clientdata});
	clientShortList = getViewersOnly();
	for (i in clientShortList) {
		connection = clientShortList[i].connection;
		console.log("Sending a keypress message to :" + clientShortList[i].username);
		connection.send(JSONpacket);
	}
}

function handleMessage(mString, connection) {
	var pMessage = mString.split("|");
	var command = pMessage[0];
	// console.log("Raw message: " + mString);
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
			informViewers();
		
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

	if (command=="keypress") {
		direction = pMessage[1];
		status = pMessage[2];
		console.log("keypress received: " + direction + "[" + status + "]");
		for (i in clients) {
			if(clients[i].connection == connection) thisClient = clients[i];
		}
		player = thisClient.username;
		
		informViewersOfKeyPress(player, direction, status);
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

