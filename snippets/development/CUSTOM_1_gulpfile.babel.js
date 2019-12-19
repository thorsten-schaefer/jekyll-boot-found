'use strict';

var plugins = require('gulp-load-plugins');
var yargs = require('yargs');
var browser = require('browser-sync');
var gulp = require('gulp');
var rimraf = require('rimraf');
var yaml = require('js-yaml');
var fse = require('fs-extra');
var dateformat = require('dateformat');
var webpackStream = require('webpack-stream');
var webpack2 = require('webpack');
var named = require('vinyl-named');
var log = require('fancy-log');
var colors = require('ansi-colors');
var config = require('config-yml');
var autoprefixer = require('autoprefixer');
var path = require('path');
var ftp = require('vinyl-ftp');
var wait = require('gulp-wait');
var rename = require('gulp-rename');
var rxrename = require('gulp-regex-rename')
var uncss = require('gulp-uncss');

// retrieve configuration from custom config file
const CONF = config.CUSTOM_1_config;
console.log('Wordpress Theme directory is   ' + CONF.PATHS.td);

// Output commands on console
const exec = require('child_process').exec;

// Load all Gulp plugins into one variable
const $ = plugins();

// retrieve custom sourcepath for /src
const SRC = CONF.PATHS.src;

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

// Check for --clean flag
const CLEAN = !!(yargs.argv.clean);

// Check for --development flag unminified with sourcemaps
const DEV = !!(yargs.argv.dev);

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
	if (CLEAN) {
		rimraf(CONF.PATHS.td + '/**/*', done);
		log('--clean Flag is set -> CLEANUP');
		wait(1500);
	}
	else {
		log('--clean Flag is NOT set -> do NOT CLEANUP');
		done();
	}

}


// Copy files out of the assets folder
// This task skips over the "images", "js", and "scss" folders, which are parsed separately
function copy() {
	return gulp.src(CONF.PATHS.assets + '/**/*')
		.pipe(gulp.dest(CONF.PATHS.dist + '/assets'));
}

function copyfile(filepath) {
	var filename = path.basename(filepath);
	var pathname = path.dirname(filepath);
	var subfolder = path.relative(CONF.PATHS.main, pathname);
	var destpath = CONF.PATHS.td + '/' + subfolder;
	gulp.src(filepath).pipe(gulp.dest(destpath, { overwrite: true }));
	log('=> File ' + colors.bold(colors.magenta(filename)) + ' copied to ' + destpath + '/');
	return;
}

function removefile(filepath) {
	var file = path.basename(filepath);
	// remove file
	// With a callback:
	fse.remove(CONF.PATHS.td + '/' + file, err => {
		if (err) return console.error(err)
		log('File ' + colors.bold(colors.magenta(CONF.PATHS.td + '/' + file)) + ' was succesful removed.');
	})
}




function themefiles() {
	if (CONF.PATHS.td == ".") { var outputfolder = CONF.PATHS.dist + "/main" }
	else { var outputfolder = CONF.PATHS.td }
	return gulp.src(CONF.PATHS.package, { base: CONF.PATHS.main })
		.pipe(gulp.dest(outputfolder));
}

// Compile Sass into CSS
// In production, the CSS is compressed
function sass() {
	const postCssPlugins = [ 		// Autoprefixer siehe https://www.npmjs.com/package/autoprefixer
		autoprefixer({ browsers: CONF.COMPATIBILITY }),
	].filter(Boolean);
	const sourcefiles = [SRC + '/assets/scss/app.scss', SRC + '/assets/scss/editor.scss'];

	return gulp.src(sourcefiles)
		.pipe($.sourcemaps.init())
		.pipe($.sass({
			includePaths: CONF.PATHS.sass
		})
			.on('error', $.sass.logError))
		.pipe($.postcss(postCssPlugins))
		.pipe(rename({ suffix: "-roh", }))
		.pipe(gulp.dest(CONF.PATHS.dist + '/assets/css'))	//******************  DEST roh ******************************
		// .pipe(rename({  suffix: "-uncss", }))
		// .pipe(uncss(CONF.PATHS.uncss_options))
		// .pipe(gulp.dest(CONF.PATHS.dist + '/assets/css'))	//******************  DEST  uncss ******************************
		.pipe(rename({ suffix: "-cleancss", }))
		.pipe($.cleanCss({ compatibility: 'ie9' }))
		.pipe(gulp.dest(CONF.PATHS.dist + '/assets/css'))	//******************  DEST  cleanCss ******************************
		.pipe(rename({ suffix: "-sourcemap", }))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest(CONF.PATHS.dist + '/assets/css'));	//******************  DEST  sourcemap ******************************
		// .pipe(rename({	suffix: "-rev", }))
		// .pipe($.rev())
		// .pipe(gulp.dest(CONF.PATHS.dist + '/assets/css'))	//******************  DEST  rev ******************************
		// .pipe(rename({	suffix: "-manifest", }))
		// .pipe($.rev.manifest())
		// .pipe(gulp.dest(CONF.PATHS.dist + '/assets/css'))	//******************  DEST  manifest ******************************
}


function cssrename() {
	const suffix = '-roh-cleancss-sourcemap';
	const sourcefiles = [CONF.PATHS.dist + '/assets/css/app' + suffix + '.css',
						 CONF.PATHS.dist + '/assets/css/editor'+ suffix + '.css'];
	return gulp.src(sourcefiles)
		.pipe(rxrename(/\-roh-cleancss-sourcemap\.css$/, '.css'))
		.pipe(gulp.dest(CONF.PATHS.dist + '/assets/css'));
}

let webpackConfig = {
	resolve: {
		// siehe https://webpack.js.org/configuration/resolve
		modules: [CONF.PATHS.node_modules_local]
	},
	mode: (PRODUCTION ? 'production' : 'development'),
	//externals: { jquery: 'jQuery' },
	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ["@babel/preset-env"],
						compact: false
					}
				}
			}
		]
	},
	devtool: !PRODUCTION && 'source-map'
}


// Combine JavaScript into one file
// In production, the file is minified
function javascript() {
	return gulp.src(CONF.PATHS.entries)
		.pipe(named())
		.pipe($.sourcemaps.init())
		.pipe(webpackStream(webpackConfig, webpack2))
		.pipe($.if(PRODUCTION, $.uglify()
			.on('error', e => { console.log(e); })
		))
		.pipe($.if(!PRODUCTION, $.sourcemaps.write()))
		.pipe(gulp.dest(CONF.PATHS.dist + '/assets/js'));
}

// Combine JavaScript into one file
// In production, the file is minified
const webpack = {
	config: {
		resolve: {
			// siehe https://webpack.js.org/configuration/resolve
			modules: [CONF.PATHS.node_modules_local]
		},
		externals: { jquery: 'jQuery' },
		mode: (PRODUCTION ? 'production' : 'development'),
		module: {
			rules: [
				{
					test: /.js$/,
					loader: 'babel-loader',
					//   options: {
					//     presets: [ "@babel/preset-env" ],
					//     compact: false
					//   }
					exclude: /node_modules(?![\\\/]foundation-sites)/,
				},
			],
		},
		externals: {
			jquery: 'jQuery',
		},
	},

	changeHandler(err, stats) {
		log('[webpack]', stats.toString({
			colors: true,
		}));

		browser.reload();
	},

	build() {
		return gulp.src(CONF.PATHS.entries)
			.pipe(named())
			//.pipe(webpackStream(webpack.config, webpack2))
			.pipe(webpackStream(webpackConfig, webpack2))
			.pipe($.if(PRODUCTION, $.uglify()
				.on('error', e => { console.log(e); }),
			))
			.pipe($.if(CONF.REVISIONING && PRODUCTION || CONF.REVISIONING && DEV, $.rev()))
			.pipe(gulp.dest(CONF.PATHS.dist + '/assets/js'))
			.pipe($.if(CONF.REVISIONING && PRODUCTION || CONF.REVISIONING && DEV, $.rev.manifest()))
			.pipe(gulp.dest(CONF.PATHS.dist + '/assets/js'));
	},

	watch() {
		const watchConfig = Object.assign(webpack.config, {
			watch: true,
			resolve: {
				// siehe https://webpack.js.org/configuration/resolve
				modules: [CONF.PATHS.node_modules_local]
			},
			devtool: 'inline-source-map',
		});

		return gulp.src(CONF.PATHS.entries)
			.pipe(named())
			.pipe(webpackStream(watchConfig, webpack2, webpack.changeHandler)
				.on('error', (err) => {
					log('[webpack:error]', err.toString({
						colors: true,
					}));
				}),
			)
			.pipe(gulp.dest(CONF.PATHS.dist + '/assets/js'));
	},
};

gulp.task('webpack:build', webpack.build);
gulp.task('webpack:watch', webpack.watch);

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
	return gulp.src(SRC + '/assets/images/**/*')
		.pipe($.if(PRODUCTION, $.imagemin([
			$.imagemin.jpegtran({
				progressive: true,
			}),
			$.imagemin.optipng({
				optimizationLevel: 5,
			}),
			$.imagemin.gifsicle({
				interlaced: true,
			}),
			$.imagemin.svgo({
				plugins: [
					{ cleanupAttrs: true },
					{ removeComments: true },
				]
			})
		])))
		.pipe(gulp.dest(CONF.PATHS.dist + '/assets/images'));
}

// Create a .zip archive of the theme
function archive() {
	var time = dateFormat(new Date(), "yyyy-mm-dd_HH-MM");
	var pkg = JSON.parse(fs.readFileSync('./package.json'));
	var title = pkg.name + '_' + time + '.zip';

	return gulp.src(CONF.PATHS.package)
		.pipe($.zip(title))
		.pipe(gulp.dest('packaged'));
}

// PHP Code Sniffer task
gulp.task('phpcs', function () {
	return gulp.src(CONF.PATHS.phpcs)
		.pipe($.phpcs({
			bin: 'wpcs/vendor/bin/phpcs',
			standard: './codesniffer.ruleset.xml',
			showSniffCode: true,
		}))
		.pipe($.phpcs.reporter('log'));
});

// PHP Code Beautifier task
gulp.task('phpcbf', function () {
	return gulp.src(CONF.PATHS.phpcs)
		.pipe($.phpcbf({
			bin: 'wpcs/vendor/bin/phpcbf',
			standard: './codesniffer.ruleset.xml',
			warningSeverity: 0
		}))
		.on('error', log)
		.pipe(gulp.dest('.'));
});

// Start BrowserSync to preview the site in
function server(done) {
	browser.init({
		proxy: CONF.BROWSERSYNC.url,

		ui: {
			port: 8080
		},

	});
	done();
}
// Rename the Css Files
function renamecss(done) {
	fse.copy(CONF.PATHS.dist + '/assets/css/app-roh-cleancss-sourcemap.css', CONF.PATHS.dist + '/assets/css/app.css')
		.then(() => { log('success app.scss!') }).catch(err => { console.error(err) });
	fse.copy(CONF.PATHS.dist + '/assets/css/editor-roh-cleancss-sourcemap.css', CONF.PATHS.dist + '/assets/css/editor.css')
		.then(() => { log('success editor.scss!') }).catch(err => { console.error(err) });
	done();
}

// Output folder content to console
function dir(done) {
	var command = 'dir \"' + CONF.PATHS.dist + '/assets/css\"';
	log('Befehl: ' + command);
	//exec(befehl, (stdout) => log(colors.bold(colors.magenta(stdout))));
	exec(command, (err, stdout, stderr) => log(stdout));
	done();
}

// Reload the browser with BrowserSync
function reload(done) {
	browser.reload({ stream: false });
	done();
}

// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
	gulp.watch(CONF.PATHS.assets, copy);
	gulp.watch(SRC + '/assets/scss/**/*.scss', gulp.series(sass, renamecss, reload, dir))
		.on('change', path => log('File ' + colors.bold(colors.magenta(path)) + ' changed.'))
		.on('unlink', path => log('File ' + colors.bold(colors.magenta(path)) + ' was removed.'));
	gulp.watch(CONF.PATHS.main + '/**/*.{php,twig}', reload)
		.on('change', path => {
			log('File ' + colors.bold(colors.magenta(path)) + ' changed.');
			copyfile(path);
		})
		.on('unlink', path => {
			removefile(path);
		})
	gulp.watch(SRC + '/assets/images/**/*', gulp.series(images, reload));
	//gulp.watch(SRC + '/assets/js/**/*.js').on('all', gulp.series(webpack.watch, reload));
	//vorher: gulp.series(webpack.watch, reload));
	gulp.watch(SRC + '/assets/js/**/*.js').on('all', gulp.series(javascript, reload));
}

gulp.watch('./app/views/**/*.html', function (e) {
	gulp.src(e.path)
		.pipe(wait(1500))
		.pipe(refresh(server));
});


// deploy on public web server
function deploy() {
	var dir = '/public_html/multisite/wp-content/themes/theme02';
	var conn = ftp.create({
		host: 'es31.siteground.eu',
		user: 'tschaefer@ipduties.de',
		password: '2vBG42WaegaaQv',
		parallel: 3,
		log: log,
	});
	gulp.src(CONF.PATHS.package, { cwd: 'CONF.PATHS.main', buffer: false })
		.pipe(conn.newer(dir))
		.pipe(conn.dest(dir));
	gulp.src([CONF.PATHS.dist + '/**/*'], { cwd: 'CONF.PATHS.dist', buffer: false })
		.pipe(conn.newer(dir + '/dist'))
		.pipe(conn.dest(dir + '/dist'));
};


// Build the "dist" folder, and copy themfiles, by running all of the below tasks,
gulp.task('build',
	//gulp.series(clean, gulp.parallel(sass, 'webpack:build', images, copy, themefiles)));
	gulp.series(clean, gulp.parallel(sass, javascript, images, copy, themefiles), cssrename));

// Build the site, run the server, and watch for file changes
gulp.task('default',
	// gulp.series('build', server, gulp.parallel('webpack:watch', watch)));
	gulp.series('build', server, watch));

// Package task
gulp.task('package',
	gulp.series('build', archive));

// FTP-deploy task
gulp.task('deploy', deploy);
