var server = require('browser-sync');
var config      = require('../util/loadConfig').browsersync;
const { series } = require('gulp');

function server() {
  browserSync.init({
    notify: config.notify,
    open: config.open,
    port: config.port,
    server: {
      baseDir: config.server.basedir
    },
    xip: config.xip
  });
};

exports.server = series( server );
