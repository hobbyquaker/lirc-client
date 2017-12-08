module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        xo: {
            target: ['lib/*']
        },
        jsdoc2md: {
            oneOutputFile: {
                src: 'index.js',
                dest: 'docs/api.md'
            }
        },
        concat: {
            options: {
                separator: '\n'
            },
            dist: {
                src: ['docs/README.header.md', 'docs/api.md', 'docs/README.footer.md'],
                dest: 'README.md'
            }
        },
        shell: {
            purgebadges: {
                command: 'node_modules/.bin/camo-purge'
            }
        }
    });

    grunt.loadNpmTasks('grunt-xo');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-shell');
    grunt.registerTask('test', ['xo', 'shell:purgebadges']);

    grunt.loadNpmTasks('grunt-jsdoc-to-markdown');
    grunt.registerTask('doc', ['jsdoc2md', 'concat']);
};