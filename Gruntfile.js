'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        sass: {
            styleExpanded: {
                options: {
                    outputStyle: 'expanded',
                    sourcemap: true
                },
                files: {
                    'app/css/style.css': 'sass/style.scss'
                }
            },

            styleMin: {
                options: {
                    outputStyle: 'compressed',
                    sourcemap: true
                },
                files: {
                    'app/css/style.min.css': 'sass/style.scss'
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            core: {
                src: [
                    "javascript/app.controller.js",
                    "javascript/app.directive.js",
                    "javascript/app.router.js",
                    "javascript/app.service.js",
                    "javascript/app.config.js",
                    "javascript/app.database.js",
                    "javascript/app.filter.js",
                    "javascript/app.js"
                ],
                dest: 'app/js/app.js'
            }
        },
        uglify: {
            options: {
                // Use these options when debugging
                // mangle: false,
                // compress: false,
                // beautify: true
            },
            core: {
                files: {
                    'app/js/app.min.js': ['app/js/app.js']
                }
            },
        },
        watch: {
            watchSassStyle: {
                files: ['sass/**/*.scss'],
                tasks: ['sassCompile'],
                options: {
                    interrupt: false,
                    spawn: false
                }
            },
            watchJsCore: {
                files: ['javascript/*.js'],
                tasks: ['jsCoreCompile'],
                options: {
                    interrupt: false,
                    spawn: false
                }
            }
        },

        concurrent: {
            options: {
                logConcurrentOutput: true,
                limit: 10
            },
            monitor: {
                tasks: [
                    'watch:watchSassStyle',
                    'watch:watchJsCore',
                    'notify:watching'
                ]
            },
            release: {
                tasks: [
                    'sassCompile',
                    'jsCoreCompile',
                    'notify:release'
                ]
            }
        },
        notify: {
            sassStyleCompile: {
                options: {
                    enabled: true,
                    message: 'Sas Style Compiled!',
                    title: 'Style',
                    success: false,
                    duration: 1
                }
            },
            jsCoreCompile: {
                options: {
                    enabled: true,
                    message: 'JS Core Compiled!',
                    title: "Core",
                    success: true,
                    duration: 1
                }
            },
            watching: {
                options: {
                    enabled: true,
                    message: 'Watching Files!',
                    title: 'Watching',
                    success: false,
                    duration: 1
                }
            },
            release: {
                options: {
                    enabled: true,
                    message: 'Release task!',
                    title: 'Release',
                    success: false,
                    duration: 1
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-rename');
    grunt.loadNpmTasks('grunt-remove-logging');
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-testem');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-eslint');

    grunt.registerTask('jsCoreCompile', ['concat:core', 'uglify:core', 'notify:jsCoreCompile']);
    grunt.registerTask('sassCompile', ['sass:styleExpanded', 'sass:styleMin', 'notify:sassStyleCompile']);

    grunt.registerTask('develop', ['concurrent:monitor']);
    grunt.registerTask('release', ['concurrent:release']);
};
