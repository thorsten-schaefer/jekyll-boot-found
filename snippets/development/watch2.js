const { src, dest, watch, series, parallel } = require('gulp');
const { makeError } 	= require('./makeError');
const { build } 	= require('./build');
const { sass } 		= require('./sass');
const { copy } 		= require('./copy');
const { javascript } = require('./javascript');
var browser = require('browser-sync');
var plumber = require('gulp-plumber');
var exec 					= require('gulp-exec');
var config        = require('../util/loadConfig').watch;
var thorsten        = require('../util/loadConfigThorsten');
const mm = require('micromatch');
const fs = require('fs');
var mergeArray = require('merge-array');
const chokidar = require('chokidar');


var globs = [];

function reload(done) {
	browser.reload({ stream: false });
	done();
}


function errorHandlerCustom() {

	// console.log(e);
	return src('./bin/errorHandlerCustom.sh')

	// .pipe(exec(err.toString()+' > error.log'))
	.pipe(exec('./bin/errorHandlerCustom.sh'));
	// .pipe(exec(err.toString()+' > logfile'));

};

function scripts(myPath) {
	GLOBS=config.pages+'\,'+config.sass
	console.log(GLOBS)

	const config_pages='{'+config.pages+'}';
	match = mm.capture(config_pages, myPath);
	if (typeof match !== 'undefined' && match !== null){
		console.log("CHECK!!!!");
	} else {
		console.log("it seems undefined!");
	};
	return src(myPath)
	.pipe(dest('pathTest'));
};


function add(list, elementToAdd) {
	if (typeof(elementToAdd) == 'string') {
		list.push(elementToAdd);
	}
	else {
		for (const value of elementToAdd) {
			list.push(value);
		}
		return list;
	}

	return list;
}

function watching(done) {
	for (const entry of Object.values(config)) {
		add(globs, entry);
	}
	plumber({
		errorHandler: function(err) {
			// errorHandlerCustom(e);
			fs.appendFile('message.txt', err.toString()+'\n', (err) => {
				if (err) throw err;
				console.log('The Error Message was appended to the Logfile!');
			}
		);
		src('./bin/errorHandlerCustom.sh')

		.pipe(exec('./bin/errorHandlerCustom.sh'));
		(err);
	}
})
.pipe(watch(globs, series(build, reload)))
.on('change' , function (path, stats) {
	// series( makeError);
	scripts(path);
})
.on('error', function(err){ console.log(err.message); });


// // The task won't be run until 500ms have elapsed since the first change
// watch('src/*.js', { delay: 500 }, function(cb) {
//   // body omitted
//   cb();
// });


// .pipe(watch(config.javascript, series( javascript, reload )));
// watch(config.pages, series( build, reload	 ));
// watch(config.sass, series( sass ));
// watch(config.media, series( copy, reload ));

done();
}

function watcher() {
	// The task will be executed upon startup
	watch('src/*.js', { ignoreInitial: false,  delay: 500  }, function(cb) {
		// body omitted
		cb();
	});
};

exports.watch = series( watching );
