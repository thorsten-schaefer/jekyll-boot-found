#!/bin/bash

NOW=$(date +"_%Y-%d-%m_%H-%M-%S")
EXCL="--exclude=./_site --exclude=./archiv  --exclude=./archiv-master --exclude=./.git"
TF="--transform s/^./master$NOW/"
TAR="tar $EXCL $TF -cf archiv-master/master$NOW.tar ."

$TAR

git checkout master
git add .
git commit -m "update"
git push origin master
