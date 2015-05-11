module.exports = function(grunt) {
  grunt.initConfig({
    shell: {
        multiple: {
            command: [
               'bower install',
               'mkdir -p lib',
               'rm -rf lib/*',
               'mv bower_components/** lib/',
               'rm -rf bower_components'
            ].join('&&')
        }
    },
    shell2: {
        multiple: {
            command: [
               'echo test'
            ].join('&&')
        }
    },  
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          // target.css file: source.less file
          "src/main.css": "src/main.less"
        }
      }
    },
    watch: {
      styles: {
        files: ['less/**/*.less'], // which files to watch
        tasks: ['less'],
        options: {
          nospawn: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('watch', ['watch']);
  grunt.registerTask('fetch', ['shell']);
  grunt.registerTask('lessc', ['less']);
};
