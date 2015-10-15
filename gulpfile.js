'use strict';

var gulp = require('gulp');
var bump = require('gulp-bump');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require("gulp-rename");
var fs = require('fs');
var karmaServer = require('karma').Server;
var jshint = require('gulp-jshint').Server;
var karmaConfig = '/test/resources/karma.conf.js';
var cwd = process.cwd();

var getPackageJson = function() {
   return JSON.parse(fs.readFileSync('./package.json', 'utf8'));
};

// Default task

// Internal use - updates package.json with minor version increment
gulp.task('version-bump', function() {
   return gulp.src([ cwd + '/package.json' ]).pipe(bump()).pipe(gulp.dest('./'));
});

gulp.task('test', function(done) {
   new karmaServer({
      configFile : __dirname + karmaConfig,
      singleRun : true
   }, function() {
      done();
   }).start();
});

gulp.task('lint', function() {
   return gulp.src('src/*Service.js').pipe(jshint()).pipe(jshint.reporter('fail', {
      verbose : true
   }));
});

gulp.task('release', [ 'version-bump', 'test' ], function() {
   gulp.src('src/*.js').pipe(sourcemaps.init({loadMaps: true})).pipe(uglify({
      mangle : false
   })).on('error', gutil.log.bind(gutil, 'JS minify Error')).pipe(rename('angular-cache-service.min.js')).pipe(sourcemaps.write('./')).pipe(gulp.dest('./dist'));
});