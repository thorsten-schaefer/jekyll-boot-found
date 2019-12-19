#!/bin/bash

APP=/assets/css/app.css
APPSEARCH=/assets/css/app
NOW=$(date +"_%Y-%d-%m_%H-%M-%S")
APPRN=/assets/css/app$NOW.css
OLDFILE=./_site$APP
NEWFILE=./_site$APPRN


grep -rl $APP ./_site | xargs \
	sed -i 's|'$APP'|'$APPRN'|g'

grep -rl $APPSEARCH ./_site | xargs \
	sed -i -r 's|'app_[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}'|'app$NOW'|g'

mv $OLDFILE $NEWFILE

