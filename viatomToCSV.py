#!/usr/bin/env python3
import argparse, os
import datetime
import numpy
import matplotlib.pyplot


if __name__ == "__main__":
	
	parser = argparse.ArgumentParser(description='Examines a VIATOM binary file and converts it to CSV format.')
	parser.add_argument('file', type=str, help='Input filename.')
	parser.add_argument('-o', '--output', type=str, help="")
	args = parser.parse_args()

	if args.output is None:
		args.output = args.file + "_converted.csv"	
	fileHandle = open(args.file, 'rb')
	data = fileHandle.read()
	fileHandle.close()
	
	O2 = []
	heartRate = []
	times = []
	three = []
	movement = []

	# First two lines (of 5 bytes each) are the date and time
	year = data[3] * 256 + data[2]
	month = data[4]
	day = data[5]
	hour = data[6]
	minute = data[7]
	second = data[8]
	print("Year: ", year, "Month:", month, "Day:", day, " - ", hour, ":", minute, ":", second)  
	decimalString = ""
	for c in range(25):
		decimalString+= str(data[c]) + " : " 
	count = 0
	for i in range(20, len(data), 5):
		decimalString = ""
		for c in range(5):
			decimalString+= str(data[i+c]) + " : " 
		time = (i-20)/5*2
		count+=1
		if data[i]==0 or data[i]==255 or data[i+1]==0 or data[i+1]==255:
			continue
		times.append(time)
		heartRate.append(data[i+1])
		three.append(data[i+2])
		movement.append(data[i+3])
		O2.append(data[i])
		
	print("%d datapoints read\n%d good datapoints"%(count, len(heartRate)))

	# Write to csv format
	startTime = datetime.datetime(year, month, day, hour, minute, second)
	outfile = open(args.output, "wt")
	outfile.write("time, spO2, pulse, movement\n")
	timeMinutes = []
	for t, sp, hr, mv in zip(times, O2, heartRate, movement):
		currentTime = startTime + datetime.timedelta(seconds=t)
		timeMinutes.append(t/60)
		outfile.write("%s, %d, %d, %d\n"%((str(currentTime), sp, hr, mv) ))
	outfile.close()
	print("written to file:", args.output)

	# Write a text file
	textFilename = os.path.splitext(args.output)[0] + '.txt'
	print("text file name:", textFilename) 
	outfile = open(textFilename, "wt")
	outfile.write("time, spO2, pulse, movement\n")
	timeMinutes = []
	for t, sp, hr, mv in zip(times, O2, heartRate, movement):
		currentTime = startTime + datetime.timedelta(seconds=t)
		timeMinutes.append(t/60)
		outfile.write("%s, %d, %d, %d\n"%((str(currentTime), sp, hr, mv) ))
	outfile.close()
	print("written to text file:", args.output)

	matplotlib.pyplot.figure(figsize=(12,6))
	matplotlib.pyplot.plot(timeMinutes, heartRate, label="Heart", lw=0.4)
	matplotlib.pyplot.plot(timeMinutes, O2, label="SpO$_{2}$")
	matplotlib.pyplot.plot(timeMinutes, movement, label="Movement")
	matplotlib.pyplot.legend()
	matplotlib.pyplot.xlabel('Time [minutes]')
	matplotlib.pyplot.ylabel('[minute$^{-1}$]')
	matplotlib.pyplot.draw()
	rawFilename = os.path.split(args.file)[-1]
	imageFilename = '/var/www/images/' + rawFilename + ".png"
	print("saving image to:", imageFilename)
	matplotlib.pyplot.savefig(imageFilename)
