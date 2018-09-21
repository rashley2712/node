
function moon(inputDate, callback) {
	if (inputDate == undefined) inputDate = "now";
	callPython([__dirname + "/moonphase.py", "-d" + inputDate], callback)
}

function sun(inputDate, callback) {
	if (inputDate == undefined) inputDate = "now";
	callPython([__dirname + "/sun.py", "-d" + inputDate], callback)
}


function callPython(pythonScript, callback) {
	var spawn = require("child_process").spawn;
	pythonScript.push("--json")
	var pythonCall = spawn('python', pythonScript);
	pythonResponse = ""
	pythonCall.stdout.on('data', function (data){
		pythonResponse+= data
		});

	pythonCall.stdout.on('close', function(code) {
		callback(null, pythonResponse)
		})
	
	pythonCall.stderr.on('data', function(data) {
		console.error(data.toString())
		})	

}



module.exports.moon = moon
module.exports.sun = sun
