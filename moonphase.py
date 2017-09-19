#!/usr/bin/env python

import sys
import ephem
import datetime
import argparse
import json

if __name__ == "__main__":

	parser = argparse.ArgumentParser(description='Performs astro calculations with PyEphem and returns data.')
	parser.add_argument('-d', '--date', type=str, default="now", help='Date for computation. Default is "now".')
	parser.add_argument('--json', action='store_true', help='Output as JSON object.')
	arg = parser.parse_args()

	moon = ephem.Moon()

	output = True
	JSON = False
	if arg.json:
		output = False
		JSON = True

	if arg.date == 'now':	
		currentDate = ephem.Date(datetime.datetime.utcnow())
	else:
		currentDate = ephem.Date(arg.date)	
	if output: print currentDate
	moon.compute(currentDate)
	if output: print "Illuminated:", moon.phase
	if output: print "Next new moon:", ephem.next_new_moon(currentDate)
	timeToNewMoon = ephem.next_new_moon(currentDate) - currentDate
	timeSinceLastNewMoon = currentDate - ephem.previous_new_moon(currentDate)
	period = timeToNewMoon + timeSinceLastNewMoon
	phase = timeSinceLastNewMoon / period
	if output: 
		print timeSinceLastNewMoon, phase
		print timeToNewMoon
	
	if phase>0.5:
		mode = "waning"
	else:
		mode = "waxing" 
	if output: print "%1.0f%% illuminated, %s"%(moon.phase, mode)
	
	if JSON:
		response = {}
		response['illuminated'] = moon.phase
		response['mode'] = mode
		sys.stdout.write(json.dumps(response))
	
	sys.stdout.flush()
	sys.exit()
