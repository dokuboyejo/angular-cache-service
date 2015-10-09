module.exports = function(config) {
   config.set({
      // base path, that will be used to resolve files and exclude
      basePath : './',
      port : 8099,
      configFile : 'karma.conf.js',
      frameworks : [ 'mocha', 'sinon-chai' ],
      singleRun : false,
      browsers : [ 'Chrome', 'Firefox', 'Opera', 'Safari', 'IE', 'PhantomJS' ],
      // files to exclude
      exclude : [],
      // map of preprocessors that is used mostly for plugins
      preprocessors : {
         'src/**/*.js' : [ 'coverage' ]
      },
      // list of karma plugins
      plugins : [ 'karma-jasmine', 'karma-mocha', 'karma-sinon-chai', 'karma-chrome-launcher', 'karma-firefox-launcher', 'karma-opera-launcher', 'karma-safari-launcher', 'karma-ie-launcher', 'karma-phantomjs-launcher', 'karma-coverage', 'karma-mocha-reporter', 'karma-htmlfile-reporter' ],
      // configure reportes
      reporters : [ 'mocha', 'html', 'coverage' ],
      htmlReporter : {
         outputFile : 'result/jUnit-TestResults.html'
      },
      coverageReporter : {
         type : 'html',
         dir : 'coverage/'
      },
      autoWatch : true,
      /* all possible values: LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG || LOG_DISABLE */
      logLevel : config.LOG_INFO,
      captureTimeout : 60000,
      browserDisconnectTimeout : 20000,
      browserDisconnectTolerance : 0,
      browserNoActivityTimeout : 100000
   });
};
