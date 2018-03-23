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
	output = True
	JSON = False
	if arg.json:
		output = False
		JSON = True
	if arg.date == 'now':	
		currentDate = ephem.Date(datetime.datetime.utcnow())
	else:
		currentDate = ephem.Date(arg.date)
		currentDate+= .5
			
	if output: print "Using the following date for calculations: ", currentDate

	#---------------------------------------------------------------------------------
		
	roque = ephem.Observer()
	roque.lon = '342.1184'
	roque.lat = '28.7606'
	roque.elevation = 2326			# Useless parameter!
	roque.date = currentDate
	
	roque.horizon = "-1.19"
	sunset = roque.next_setting(ephem.Sun())
	sunrise = roque.next_rising(ephem.Sun())
	
	roque.horizon = "-18"
	eTwilight = roque.next_setting(ephem.Sun(), use_center=False)
	mTwilight = roque.next_rising(ephem.Sun(), use_center=False)
	
	if output:  
		print "Sunset:", sunset
		print "Evening twilight:", eTwilight
		print "Morning twilight:", mTwilight
		print "Sunrisgfdgdge:", sunrise
		
	if JSON:
		response = {}
		response['sunset'] = str(sunset)
		response['sunrise'] = str(sunrise)
		response['etwilight'] = str(eTwilight)
		response['mtwilight'] = str(mTwilight)
		sys.stdout.write(json.dumps(response))
	
	sys.stdout.flush()
	sys.exit()
