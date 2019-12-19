#!/bin/bash

APP=/assets/js/all.js
APPSEARCH=/assets/js/all
NOW=$(date +"_%Y-%d-%m_%H-%M-%S")
APPRN=/assets/js/all$NOW.js
OLDFILE=./_site$APP
NEWFILE=./_site$APPRN


grep -rl $APP ./_site | xargs \
	sed -i 's|'$APP'|'$APPRN'|g'

grep -rl $APPSEARCH ./_site | xargs \
	sed -i -r 's|'all_[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}'|'all$NOW'|g'

mv $OLDFILE $NEWFILE

