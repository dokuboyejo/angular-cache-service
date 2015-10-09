module.exports = function(grunt) {
	'use strict';
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: [
			    '/**',
				' * <%= pkg.description %>',
				' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
				' * @author <%= pkg.author %>',
				' * @copyright (c) <%= grunt.template.today("yyyy") %>',
				' * @overview <%= pkg.name %> is a thoroughly written cacheService for AngularJS, utilizing the power of IndexedDB, WebSQL, localStorage,  sessionStorage and a polyFill storage',
				' */'
		    ].join('\n')
		},
		dirs: {
			dest: 'dist'
		},
		// lint the source and test files
		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js', 'src/test/unit/**/*.js'],
			options: {
				globals: {
					/* libraries */
					jasmine: true,
					jQuery: true,
					yui: true,
					/* browsers */
					phantom: true,
					console: true,
					module: true,
					/* output */
					verbose: true,
					/* jasmine and mocha */
					describe : true,
					it : true,
					/* jasmine and chai */
					expect : true,
					/* jasmine */
					runs: true,
					waitsFor: true,
					/* underscore.js */
					_ : true
				},
				/* mocha */
				expr: true,
				/* prohibit single | & */
				bitwise : true,
				/* must use === for comparisions, no == */
				eqeqeq : true,
				/* check for property existence within foreach */
				forin : true,
				/* check for unused variables */
				unused : true
			}
		},
	    concat : {
	    	options : {
	    		sourceMap :true
	    	},
	    	dist : {
		    	src  : ['src/**/*.js'],
		    	dest : '.tmp/main.js'
	    	}
    	},
    	uglify : {
    		options : {
	    	    sourceMap : true,
	    	    sourceMapIncludeSources : true,
	    	    sourceMapIn : '.tmp/main.js.map'
    	  	},
    	  	dist : {
	    	    src  : '<%= concat.dist.dest %>',
	    	    dest : '<%= dirs.dest %>/<%= pkg.name %>.min.js'
    	    }
    	},
		// test runner
		karma: {
			// unit test
			unit: {
				files: [
					{src: ['bower_components/jquery/jquery.min.map', 'bower_components/angular/angular.min.js.map'],
					       served: true, included: false},
					{src: ['bower_components/jquery/jquery.min.js', 'bower_components/angular/angular.min.js', 
					       'bower_components/angular-mocks/angular-mocks.js', 'src/test/resources/**/*.js'],
					       served: true, included: true},
					{src: ['src/**/*.js'], served: true, included: true},
					{src: ['test/unit/**/*.js'], served: true, included: true}
				],
				options: {
					configFile: 'karma.conf.js',
			    	frameworks: ['mocha', 'sinon-chai'], // ['jasmine'],
			    	singleRun: false,
			    	browsers: ['Chrome'], //, 'Firefox', 'Opera', 'Safari', 'IE', 'PhantomJS'],
		  			autoWatch: true
				},
		   },
		   /* dev test */
		   //dev: {},
		   /* ci test */
		   //continous: {}
	   }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-mocha');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'karma']);
};