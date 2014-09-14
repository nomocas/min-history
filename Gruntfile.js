/**  @author Gilles Coomans <gilles.coomans@gmail.com> */
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		//pkg: grunt.file.readJSON('package.json'),
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
			my_target: {
				options: {
			      compress: {
			        drop_console: true
			      }
			    },
				files: {
					'min-history.min.js': ['./min-history.js']
				}
			}
		}
	});


	grunt.loadNpmTasks('grunt-http-server');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	// Default task(s).
	grunt.registerTask('default', ["uglify"]);
};