
var config      = require('../util/loadConfig').clean;
var del         = require('del');
var gulp        = require('gulp');

function clean(done) {
  del.sync(config);
  done();
};

exports.clean = clean;
