/**  @author Gilles Coomans <gilles.coomans@gmail.com> */
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		'http-server': {
			'dev': {
				// the server root directory
				root: './',

				port: 8282,
				host: '10.37.129.2',

				cache: 10, // sec
				showDir: true,
				autoIndex: true,
				defaultExt: 'html',

				//wait or not for the process to finish
				runInBackground: false
			}
		},
		uglify: {
			min: {
				options: {
			      compress: {
			        drop_console: false
			      }
			    },
				files: {
					'./dist/min-history.min.js': ['./lib/min-history.js']
				}
			}
		}
	});


	grunt.loadNpmTasks('grunt-http-server');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	// Default task(s).
	grunt.registerTask('default', ["uglify"]);
};