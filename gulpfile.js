// Generated on 2017-09-06 using generator-jhipster 4.7.0
'use strict';

var gulp = require('gulp'),
    expect = require('gulp-expect-file'),
    es = require('event-stream'),
    flatten = require('gulp-flatten'),
    sass = require('gulp-sass'),
    rev = require('gulp-rev'),
    templateCache = require('gulp-angular-templatecache'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    ngConstant = require('gulp-ng-constant'),
    rename = require('gulp-rename'),
    eslint = require('gulp-eslint'),
    argv = require('yargs').argv,
    gutil = require('gulp-util'),
    protractor = require('gulp-protractor').protractor,
    del = require('del'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    KarmaServer = require('karma').Server,
    plumber = require('gulp-plumber'),
    changed = require('gulp-changed'),
    gulpIf = require('gulp-if'),
    replace = require('gulp-string-replace'),
    sassLint = require('gulp-sass-lint');

var handleErrors = require('./gulp/handle-errors'),
    serve = require('./gulp/serve'),
    util = require('./gulp/utils'),
    copy = require('./gulp/copy'),
    inject = require('./gulp/inject'),
    build = require('./gulp/build');

var config = require('./gulp/config');

gulp.task('clean', function () {
    return del([config.dist], { dot: true });
});

gulp.task('clean-template-cache', function () {
    return del([config.dist + 'index-template.html'], { dot: true });
});

gulp.task('copy', ['copy:i18n', 'copy:fonts', 'copy:common']);

gulp.task('copy:i18n', copy.i18n);

gulp.task('copy:languages', copy.languages);

gulp.task('copy:fonts', copy.fonts);

gulp.task('copy:common', copy.common);

gulp.task('copy:swagger', copy.swagger);

gulp.task('copy:images', copy.images);

gulp.task('images', function () {
    return gulp.src(config.app + 'content/images/**')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.dist + 'content/images'))
        .pipe(imagemin({optimizationLevel: 5, progressive: true, interlaced: true}))
        .pipe(rev())
        .pipe(gulp.dest(config.dist + 'content/images'))
        .pipe(rev.manifest(config.revManifest, {
            base: config.dist,
            merge: true
        }))
        .pipe(gulp.dest(config.dist))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('sass', function () {
    return es.merge(
        gulp.src(config.sassSrc)
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(expect(config.sassSrc))
        .pipe(sass({includePaths:config.bower}).on('error', sass.logError))
        .pipe(gulp.dest(config.cssDir)),
        gulp.src(config.bower + '**/fonts/**/*.{woff,woff2,svg,ttf,eot,otf}')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(changed(config.app + 'content/fonts'))
        .pipe(flatten())
        .pipe(gulp.dest(config.app + 'content/fonts'))
    );
});

gulp.task('styles', ['sass'], function () {
    return gulp.src(config.app + 'content/css')
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('inject', function() {
    runSequence('inject:dep', 'inject:app');
});

gulp.task('inject:dep', ['inject:test', 'inject:vendor']);

gulp.task('inject:app', inject.app);

gulp.task('inject:vendor', inject.vendor);

gulp.task('inject:test', inject.test);

gulp.task('inject:troubleshoot', inject.troubleshoot);

gulp.task('assets:prod', ['images', 'styles', 'html', 'copy:swagger', 'copy:images'], build);

gulp.task('html', function () {
    return gulp.src(config.app + 'app/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(templateCache({
            module: 'jhipsterAngularJsApp',
            root: 'app/',
            moduleSystem: 'IIFE'
        }))
        .pipe(gulp.dest(config.tmp));
});

gulp.task('ngconstant:dev', function () {
    return ngConstant({
        name: 'jhipsterAngularJsApp',
        constants: {
            VERSION: util.parseVersion(),
            DEBUG_INFO_ENABLED: true,
            BUILD_TIMESTAMP: ''
        },
        template: config.constantTemplate,
        stream: true
    })
    .pipe(rename('app.constants.js'))
    .pipe(gulp.dest(config.app + 'app/'));
});

gulp.task('ngconstant:prod', function () {
    return ngConstant({
        name: 'jhipsterAngularJsApp',
        constants: {
            VERSION: util.parseVersion(),
            DEBUG_INFO_ENABLED: false,
            BUILD_TIMESTAMP: new Date().getTime()
        },
        template: config.constantTemplate,
        stream: true
    })
    .pipe(rename('app.constants.js'))
    .pipe(gulp.dest(config.app + 'app/'));
});

function replaceIndexFunction(aReplacement) {
    del([config.app + 'index.html'])
        .then(function(paths) {
            gulp.src([config.app + 'index-template.html']) // Any file globs are supported 
                .pipe(replace(new RegExp('@base@', 'g'), aReplacement))
                .pipe(rename('index.html'))
                .pipe(gulp.dest(config.app));
        });

}
gulp.task('replaceIndex:dev', function() {
    replaceIndexFunction('/');
});

gulp.task('replaceIndex:prod', function() {
    replaceIndexFunction('/jhipster-angular-js-app/');
});

// check app for eslint errors
gulp.task('eslint', function () {
    return gulp.src(['gulpfile.js', config.app + 'app/**/*.js'])
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failOnError());
});

// check app for eslint errors anf fix some of them
gulp.task('eslint:fix', function () {
    return gulp.src(config.app + 'app/**/*.js')
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(eslint({
            fix: true
        }))
        .pipe(eslint.format())
        .pipe(gulpIf(util.isLintFixed, gulp.dest(config.app + 'app')));
});

// check app for sass-lint errors
gulp.task('sassLint', function() {
    return gulp.src([config.app + '**/*.s+(a|c)ss'])
        .pipe(plumber({
            errorHandler: handleErrors
        }))
        .pipe(sassLint({
            options: {
                formatter: 'stylish',
                'merge-default-rules': true,
                'output-file': null
            },
            configFile: '.sass-lint.yml'
        }))
        .pipe(sassLint.format())
        .pipe(sassLint.failOnError());
});

// this tasks performs all the taks related to checking the code : eslint, sassLint,...
gulp.task('linting', ['eslint', 'sassLint']);

gulp.task('test', ['inject:test', 'ngconstant:dev'], function (done) {
    new KarmaServer({
        configFile: __dirname + '/' + config.test + 'karma.conf.js',
        singleRun: true
    }, done).start();
});

/* to run individual suites pass `gulp itest --suite suiteName` */
gulp.task('protractor', function () {
    var configObj = {
        configFile: config.test + 'protractor.conf.js'
    };
    if (argv.suite) {
        configObj['args'] = ['--suite', argv.suite];
    }
    return gulp.src([])
        .pipe(plumber({errorHandler: handleErrors}))
        .pipe(protractor(configObj))
        .on('error', function () {
            gutil.log('E2E Tests failed');
            process.exit(1);
        });
});

gulp.task('itest', ['protractor']);

gulp.task('watch', function () {
    gulp.watch('bower.json', ['install']);
    gulp.watch(['gulpfile.js', 'pom.xml'], ['ngconstant:dev']);
    gulp.watch(config.sassSrc, ['styles']);
    gulp.watch(config.app + 'content/images/**', ['images']);
    gulp.watch(config.app + 'app/**/*.js', ['inject:app']);
    gulp.watch(config.app + 'index-template.html', ['replaceIndex:dev']);
    gulp.watch([config.app + '*.html', config.app + 'app/**', config.app + 'i18n/**']).on('change', browserSync.reload);
});

gulp.task('install', ['linting'], function () {
    runSequence(['inject:dep', 'ngconstant:dev'], 'sass', 'copy:languages', 'inject:app', 'inject:troubleshoot', 'replaceIndex:dev');
});

gulp.task('serve', ['install'], serve);

gulp.task('build', ['linting', 'clean'], function (cb) {
    runSequence(['copy', 'inject:vendor', 'ngconstant:prod', 'copy:languages'], 'inject:app', 'replaceIndex:prod', 'inject:troubleshoot', 'assets:prod', 'clean-template-cache', cb);
});

gulp.task('default', ['serve']);
