const { src, dest, watch, series, parallel } = require('gulp');
const { makeError } 	= require('./makeError');
const { build } 	= require('./build');
const { sass } 		= require('./sass');
const { copy } 		= require('./copy');
const { javascript } = require('./javascript');
var browser = require('browser-sync');
var plumber = require('gulp-plumber');
var exec    = require('gulp-exec');
var config  = require('../util/loadConfig').watch;

const mm = require('micromatch');
const fs = require('fs');
var mergeArray = require('merge-array');
var colors = require('ansi-colors');
var log = require('fancy-log');

var globs = [];

function reload(done) {
	browser.reload({ stream: false });
	done();
}
function teste(param) {
	log('File ' + colors.bold(colors.magenta(param)) + ' changed.');
}

function watching(done) {
	watch(config.pages, series(build, reload))
	.on('change', path => log('File ' + colors.bold(colors.magenta(path)) + ' changed.'))
	.on('change', function (path, stats) {
		teste(path);
	})
	.on('unlink', path => log('File ' + colors.bold(colors.magenta(path)) + ' was removed.'))
	.on('error', function(err){
		log('Es trat ein Fehler auf ' + colors.bold(colors.magenta(err.message)));
	});
	watch(config.javascript, series( javascript, reload ));
	watch(config.sass, series( sass ));
	watch(config.media, series( copy, reload ));
	done();
}

exports.watch = series( watching );
