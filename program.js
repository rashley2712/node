//console.log(process.argv);

sum = 0;
values = [];
for (i=0; i <process.argv.length; i++) {
	// console.log(process.argv[i])
	if (i>1) {
		value = Number(process.argv[i]);
		values.push(value)
	}
	
}

// console.log(values);

total = 0;
for (i=0; i< values.length; i++) {
	total+= values[i];
	
}

console.log(total);