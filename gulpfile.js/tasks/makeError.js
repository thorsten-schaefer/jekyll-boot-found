var exec          = require('gulp-exec');
const { src, dest, series } = require('gulp');


function makeError() {
	return src('./bin/errorHandlerCustom.sh')
	.pipe(dest('./bin/makeErrorTest.txt'));
}

exports.makeError = series( makeError ) ;
