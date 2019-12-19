#!/bin/bash
#cp .git-gh-pages-ignore _site/.gitignore
touch _site/.nojekyll
cd _site
#git init
#git remote add origin https://github.com/ThorstenSchaeferWetter/blogsite
git checkout -b gh-pages
git add .
git commit -m "update"
git push origin gh-pages
cd ..
git checkout master
