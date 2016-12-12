#!/bin/bash

#
# script to take a picture using rpi camera module
#

echo "rpi camera"
echo $LOCAL_PATH

raspistill -a 12 -o $LOCAL_PATH.jpg
