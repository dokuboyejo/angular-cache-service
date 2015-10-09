'use strict';

var gulp = require('gulp');
var gulpMomentumDeploy = require('./index');
var argv = require('yargs').argv;
var mocha = require('gulp-mocha');

// Default task
gulp.task('default', function() {
   var opts = {
      defaultEarStructure : true,
      prjRoot : 'myprofile',
      prjName : 'myprofile',
      prPath : argv.prPath ? argv.prPath : 'C:/IBM/ServerProfiles/FinancialAdviserLocal',
      wsPath : argv.wsPath ? argv.wsPath : 'C:/Workspaces/financialadviser-local',
      jspAtRoot : false,
      resTypes : [ 'js', 'less', 'jsp', 'html', 'htm', 'json' ]
   };
   gulp.src('').pipe(gulpMomentumDeploy(opts));
});

gulp.task('test', function () {
   return gulp.src('./test.js')
       .pipe(mocha({reporter: 'mocha-better-spec-reporter'}));
});
