#!/bin/bash

#
# script to take a picture using rpi camera module
#

echo "rpi camera"
echo $LOCAL_PATH
echo $DURATION_MS
echo $INTERVAL_MS

raspistill -a 12 -t $DURATION_MS -tl $INTERVAL_MS -o $LOCAL_PATH%04d.jpg
