var $             = require('gulp-load-plugins')();
var concat = require('gulp-concat');
var browserSync   = require('browser-sync');
var config        = require('../util/loadConfig').javascript;
var isProduction  = require('../util/isProduction');
var uglify        = require('gulp-uglify');
var exec          = require('gulp-exec');
const { src, dest, series } = require('gulp');

function javascript() {
  browserSync.notify(config.notification);
  src(config.src)
  // return src('assets/downloads/**/*.js')
  // return src(['assets/downloads/jquery.min.js', 'assets/downloads/popper.min.js','assets/downloads/bootstrap.min.js'])
    // .pipe($.sourcemaps.init())
    // .pipe($.babel())
    // .pipe($.concat(config.filename))
    // .pipe($.if(isProduction, uglify({ mangle: false })))
    // .pipe($.if(!isProduction, $.sourcemaps.write()))
    // Write the file to source dir and build dir
    // .pipe(dest(config.dest.buildDir))
     // .pipe(dest(config.dest.jekyllRoot))
    .pipe(concat(config.filename))
    .pipe(dest(config.dest.buildDir))
    .pipe(exec('./bin/remameAllJs.sh'));
    return src('_includes/**/*.js')
    .pipe(dest(config.dest.buildDir));
};

exports.javascript = series( javascript );
