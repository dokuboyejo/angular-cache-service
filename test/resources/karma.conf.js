module.exports = function(config) {
   'use strict';
   config.set({

      basePath : '../../',

      files : [ 'test/resources/lib/angularjs/angular.min.js', 'test/resources/lib/angularjs/angular-route.min.js', 'test/resources/lib/angularjs/angular-resource.min.js', 'test/resources/lib/angularjs/angular-mocks.js', 'test/resources/lib/jquery/jquery.js', 'src/*Service.js', 'test/**/*Spec.js' ],

      autoWatch : true,

      frameworks : [ 'mocha', 'sinon-chai' ],

      // To speed up testing, remove the browsers that don't need to
      // be tested (only installed browsers + launchers will be
      // tested) -- PhantomJS is required for running tests on Jenkins
      // browsers : ['PhantomJS', 'Chrome', 'IE8', 'IE9', 'IE', 'Safari', 'Firefox'],
      browsers : [ 'PhantomJS', 'Chrome', 'Safari', 'Firefox', 'Opera', 'IE8', 'IE9', 'IE10', 'IE' ],

      plugins : [ 'karma-chrome-launcher', 'karma-firefox-launcher', 'karma-opera-launcher', 'karma-safari-launcher', 'karma-ie-launcher', 'karma-phantomjs-launcher', 'karma-mocha', 'karma-sinon-chai', 'karma-coverage', 'karma-mocha-reporter', 'karma-junit-reporter', 'karma-htmlfile-reporter' ],

      customLaunchers : {
         IE10 : {
            base : 'IE',
            'x-ua-compatible' : 'IE=EmulateIE10'
         },
         IE9 : {
            base : 'IE',
            'x-ua-compatible' : 'IE=EmulateIE9'
         },
         IE8 : {
            base : 'IE',
            'x-ua-compatible' : 'IE=EmulateIE8'
         }
      },

      reporters : [ 'mocha', 'coverage', 'html', 'junit' ],

      preprocessors : {
         // source files, that you wanna generate coverage for
         // do not include tests or libraries
         // (these files will be instrumented by Istanbul)
         'src/*.js' : [ 'coverage' ]
      },

      mochaReporter : {
         colors : {
            success : 'green',
            info : 'bgGreen',
            warning : 'cyan',
            error : 'bgYellow'
         }
      },

      junitReporter : {
         outputDir : 'test/browser',
         outputFile : 'test-results.xml',
         suite : 'unit'
      },

      htmlReporter : {
         outputFile : 'test/coverage/jUnit-TestResults.html'
      },

      coverageReporter : {
         instrumenterOptions : {
            istanbul : {
               noCompact : true
            }
         },
         reporters : [ {
            type : 'html',
            dir : 'test/coverage/html-coverage/'
         }, {
            type : 'cobertura',
            dir : 'test/coverage/cobertura-coverage/'
         } ]
      }
   });
};