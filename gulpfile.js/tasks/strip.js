var browserSync   = require('browser-sync');
var config        = require('../util/loadConfig').stripcomments;
const { src, dest, series } = require('gulp');
const strip         = require('gulp-strip-comments');

function stripcomments(done) {
  browserSync.notify(config.notification);
  return src(config+"/**/*.html")
    .pipe(strip())
    .pipe(dest(config+"/"));
    done();
};

exports.strip = series( stripcomments );
