var $             = require('gulp-load-plugins')();
var autoprefixer  = require('gulp-autoprefixer');
var browserSync   = require('browser-sync');
var config        = require('../util/loadConfig').sass;

var isProduction  = require('../util/isProduction');
const sass          = require('gulp-sass');
const exec          = require('gulp-exec');

const { src, dest, series, parallel } = require('gulp');

function makesass() {
  browserSync.notify(config.notification);
  var minifycss = $.if(isProduction, $.cssnano());

  return src(config.src)
    .pipe($.sourcemaps.init())
    .pipe($.sass()
      .on('error', $.sass.logError))
    .pipe(autoprefixer(config.compatibility))
    .pipe(minifycss)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(dest(config.dest.jekyllRoot))
    .pipe(dest(config.dest.buildDir))
    .pipe(exec('./bin/remameAppCss.sh'))
    .pipe(browserSync.stream());
};

exports.sass = makesass;
