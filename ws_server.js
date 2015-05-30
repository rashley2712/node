var WebSocketServer = require('websocket').server;
var http = require('http');
var utils = require('./utils.js');

var clients = [];
var games = [];
var gameHeartBeatRate = 0; 
var gameActive = false;
var players = [];
var gameTimer;
var positionPacket;
var width = 400;
var height = 400;
var starterTimer = null;
var trailLength = 175;

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
		console.log(connection.remoteAddress + " disconnected");
		for (i in clients) {
			console.log(clients[i].username);
			if(clients[i].connection == connection) {
				console.log(timeStamp() + connection.remoteAddress + " (" + clients[i].username + ") disconnected.");
				clients.splice(i, 1);
				if (gameActive) stopGame();
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

function getClientByConnection(connection) {
	for (i in clients) 
		if (clients[i].connection==connection) return clients[i];
	return false;
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

function giveOtherPlayersPoints(username, points) {
	for (var i in clients) {
		if (clients[i].username!=username) clients[i].score+= points;
	}
}

function startGame() {
	players = [];
	starterTimer = null;
	for (i in clients) {
		playerStatus = {};
		// console.log(clients[i].username); 
		playerStatus.username = clients[i].username;
		if (playerStatus.username!='viewer') {
			playerStatus.x = width/2 + Math.round(Math.random()*150 - 75);
			playerStatus.y = height/2 + Math.round(Math.random()*150 - 75);
			playerStatus.direction = Math.floor(Math.random()*4);
			playerStatus.trail = [];
			playerStatus.cursor = 0;
			players.push(playerStatus);
		}
	} 
	console.log(players);
	gameHeartBeatRate = 30;
	gameTimer = setInterval(gameBeat, gameHeartBeatRate);	
	gameActive = true;
	positionPacket = JSONpacket = JSON.stringify({msg: "positions", data: players});
	
	// Tell the clients that the game has started.
	for (i in clients) {
		connection = clients[i].connection;
		connection.sendUTF(JSON.stringify({msg: "start", data: 1}));
	}
	
}

function stopGame(message) {
	clearInterval(gameTimer);
	gameActive = false;
	players = [];
	positionPacket = "";
	data = {reason: message};
	JSONpacket = JSON.stringify({msg: "stop", data: data});
	for (i in clients) {
		connection = clients[i].connection;
		connection.sendUTF(JSONpacket);
	}
}

function gameBeat() {
	increment = 1;
	for (i in players) {
		direction = players[i].direction;
		switch (direction) {
			case 0: // move right
				players[i].x+= increment;
				break;
			case 1: // move down
				players[i].y+= increment;
				break;
			case 2: // move left
				players[i].x-= increment;
				break;
			case 3: // move up
				players[i].y-= increment;
				break;
		}
		// Wrap around the edges of the playing area
		if (players[i].x > width)  players[i].x = 0;
		if (players[i].x < 0)      players[i].x = width;
		if (players[i].y > height) players[i].y = 0;
		if (players[i].y < 0)      players[i].y = height;
		
		// Add the new point to the player's trail...
		if (players[i].cursor!=trailLength) {
			players[i].cursor++;
		} else {
			players[i].trail.shift();
		}	
		players[i].trail.push({x: players[i].x, y:players[i].y});
	}
	// console.log(players);
	positionPacket = JSONpacket = JSON.stringify({msg: "positions", data: players});
	
}

function processKeyPress(player, direction, status) {
	if (status=='off') return;
	for (i in players) {
		if (players[i].username == player) activePlayer = players[i];
	}
	switch(direction) { 
		case 'up':
			activePlayer.direction = 3;
			break;
		case 'down':
			activePlayer.direction = 1;
			break;
		case 'left':
			activePlayer.direction = 2;
			break;
		case 'right':
			activePlayer.direction = 0;
			break;
	}
}

function informPositions() {
	JSONpacket = JSONpacket = JSON.stringify({msg: "positions", data: players});
	console.log(JSONpacket);
	for (i in clients) {
		connection = clients[i].connection;
		connection.send(JSONpacket);
	}
}


function informViewers() {
	// Informs all players of an update to the user list
	console.log("Updating all the players of a change to the list of users.");
	var clientdata = [];
	for (i in clients) {
		var clientObject = {username: null, status: null, score: null};
		clientObject.username = clients[i].username;
		clientObject.score = clients[i].score;
		clientObject.status = clients[i].status;
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
	// console.log("Command: " + command);
	if (command=="connect") {
		username = pMessage[1];
		if (uniqueUsername(username)) {
			id = clients.length;
			var clientData = {connection: null, username: null, status: 0, id: null, score: 0, ping: null};
			clientData.connection = connection;
			clientData.id = id;
			clientData.username = username;
			clientData.ping = 999;
			clientData.status = 1;
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
	
	if (command=="positions") {
		// Respond to the request with the current positions of all of the players
		if (gameActive) {
			connection.sendUTF(positionPacket);
		} else {
			console.log("Positions request but game is not active.");
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
	
	if (command=="suicide") {
		player = pMessage[1];
		reason = "Player " + player + " has committed suicide.";
		console.log(reason);
		giveOtherPlayersPoints(player, 1);
		stopGame(reason);
		informViewers();
	}
	
	if (command=="startgame") {
		player = pMessage[1];
		console.log(timeStamp() + "Startgame requested by " + player);
		if (!gameActive) startGame();
	}

	if (command=="keypress") {
		direction = pMessage[1];
		status = pMessage[2];
		console.log("keypress received: " + direction + "[" + status + "]");
		for (i in clients) {
			if(clients[i].connection == connection) thisClient = clients[i];
		}
		player = thisClient.username;
		
		if (gameActive) processKeyPress(player, direction, status);
		
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
		username = pMessage[1];
		newStatus = pMessage[2];
		console.log(timeStamp() + "update status received... from "  + username + " [" + newStatus + "]");
		activeClient = getClientByConnection(connection);
		oldStatus = activeClient.status;
		activeClient.status = parseInt(newStatus);
		informViewers();
		
		// If user has indicated 'ready' then check if all players are ready...
		if (newStatus==2) {
			allReady = true;
			for (i in clients) {
				if (clients[i].status!=2) allReady = false;
			}
		
			// Start the game countdown!
			if (allReady) {
				console.log("All players are ready! Starting in 5 seconds.");
				starterTimer = setTimeout(startGame, 5000);
				for (i in clients) {
					connection = clients[i].connection;
					connection.sendUTF(JSON.stringify({msg: "Game starting in 5 seconds!", data: null}));
				}
			}
		}
		
		// The user has gone from ready to not ready
		if ((newStatus==1) && (oldStatus == 2)) {
			if (starterTimer!=null) {
				clearTimeout(starterTimer);
				starterTimer = null;
				for (i in clients) {
					connection = clients[i].connection;
					connection.sendUTF(JSON.stringify({msg: "Game start cancelled", data: null}));
				}
			}
		
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

