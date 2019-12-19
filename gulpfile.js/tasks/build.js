var yargs = require('yargs');

const { series, parallel } = require('gulp');
const { clean } = require('./clean');
const { sass } = require('./sass');
const { jekyllbuild } = require('./jekyll');
const { copy } = require('./copy');
const { strip } = require('./strip');
const { javascript } = require('./javascript');

exports.build = series( clean, jekyllbuild, parallel( sass, javascript, copy), strip);
