
const { series } = require('gulp');
var yargs = require('yargs');
const { build } = require('./tasks/build');
const { watch } = require('./tasks/watch');
const { clean } = require('./tasks/clean');
const { strip } = require('./tasks/strip');
const { server } = require('./tasks/server');

exports.watch = series( watch );
exports.clean = series( clean );
exports.build = series( build );
exports.strip = series( strip );

const SYNC = !!(yargs.argv.sync);

if ( SYNC == true) {
  exports.default = series( build, server, watch );
} else {
  exports.default = series( build, watch );
}
