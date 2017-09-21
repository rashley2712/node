
function moon(inputDate, callback) {
	if (inputDate == undefined) inputDate = new Date()
	callPython(["moonphase.py"], callback)
}

function sun(inputDate, callback) {
	inputDate="2014-09-21"
	if (inputDate == undefined) inputDate = new Date()
	callPython(["sun.py", "-d " + inputDate], callback)
}


function callPython(pythonScript, callback) {
	var spawn = require("child_process").spawn;
	pythonScript.push("--json")
	var pythonCall = spawn('python',pythonScript);

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
