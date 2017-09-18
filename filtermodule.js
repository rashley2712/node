var fs = require('fs')

function filterDirectory(directory, extension, callback) {

	var listing = fs.readdir(directory, function(err, data) {
	if (err) { 
		callback(err)
		return
		}		
	callback(null, filterList(extension, data))
	})
}

function filterList(extension, list) {
	var filteredList = []
	for (var l in list) if (list[l].indexOf("." + extension)!=-1) filteredList.push(list[l])
	return filteredList
}

// module.exports = filterDirectory
module.exports.test = filterDirectory
