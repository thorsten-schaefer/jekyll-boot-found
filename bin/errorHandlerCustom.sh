#!/bin/bash

PFAD=~/git/erlebt.de/websites/jekyll-boot-found
NOW=$(date +"_%H-%M")
UHR="_Uhr"
ERRORFILE=ERROR_OCCURED$NOW$UHR
DELETEFILES=$PFAD/ERROR_O*

if ls $DELETEFILES 1> /dev/null 2>&1; then
    rm $DELETEFILES
else
    echo ""
fi

echo $ERRORFILE
touch $PFAD/$ERRORFILE
chmod +x $PFAD/$ERRORFILE

