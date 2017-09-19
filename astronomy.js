
function moonphase(inputDate, callback) {
	if (inputDate == undefined) inputDate = new Date()
	callPython("moonphase.py", callback)
}


function callPython(pythonScript, callback) {
	var spawn = require("child_process").spawn;
	var pythonCall = spawn('python',[pythonScript, "--json"]);

	pythonResponse = ""
	pythonCall.stdout.on('data', function (data){
		pythonResponse+= data
	});

	pythonCall.stdout.on('close', function(code) {
		callback(null, pythonResponse)
	})

}



module.exports.moonphase = moonphase
