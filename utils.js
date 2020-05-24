exports.formatTime = function(date) {
	var hours;
	var minutes;
	var seconds;
	var millis;
	var timeString;
	console.log(date);
	hours = date.getHours();
 	minutes = date.getMinutes();
	seconds = date.getSeconds();
	millis = date.getMilliseconds();
	
	if (hours<10) hours = "0" + hours;
	if (seconds<10) seconds = "0" + seconds;
	if (minutes<10) minutes = "0" + minutes;
	if (millis<100) millis = "0" + millis;
	if (millis<10) millis = "0" + millis;
	
	timeString = hours + ":" + minutes + ":" + seconds + "." + millis;
	return timeString;
}
