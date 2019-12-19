var browserSync   = require('browser-sync');
var config        = require('../util/loadConfig').copy;
const { src, dest, series }         = require('gulp');

function copy() {
  browserSync.notify(config.notification);
  return src(config.assets)
    .pipe(dest(config.dist));
};

exports.copy = series( copy );
