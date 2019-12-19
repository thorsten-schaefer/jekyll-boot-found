var browserSync   = require('browser-sync');
var config        = require('../util/loadConfig').jekyll;
var gulp          = require('gulp');
var isProduction  = require('../util/isProduction');
var spawn         = require('cross-spawn');

function jekyllbuild(done) {
  var processEnv = process.env;
  if (isProduction) {
    processEnv.JEKYLL_ENV = 'production';
  }
  browserSync.notify(config.notification);
  return spawn('bundle', ['exec', 'jekyll', 'build'], {stdio: 'inherit', env:processEnv})
    .on('close', done);
};

exports.jekyllbuild = jekyllbuild;
