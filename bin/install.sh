
cd ~/git/erlebt.de/websites/jekyll-boot-founds
rm node_modules -Rf
rm package.json
rm package-lock.json

npm init -f
# npm i -g gulp-cli
npm install --save-dev gulp
npm install --save-dev gulp-hub
npm install --save-dev browser-sync
npm install --save-dev del
npm install --save-dev gulp-load-plugins
npm install --save-dev gulp-uglify
npm install --save-dev gulp-exec
npm install --save-dev cross-spawn
npm install --save-dev gulp-autoprefixer
npm install --save-dev gulp-sass
npm install --save-dev gulp-strip-comments
npm install --save-dev js-yaml
npm install --save-dev yargs
npm install --save-dev fs
npm install --save-dev gulp-cssnano
npm install --save-dev gulp-sourcemaps
npm install --save-dec gulp-if
npm install --save-dev gulp-concat

npm install --save lodash lodash.template

npm install --save bootstrap
npm install --save jquery
npm install --save popper.js
npm install --save foundation-sites

