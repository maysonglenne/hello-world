var gulp = require('gulp'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    autoprefix = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    gutil = require('gulp-util'),
    minifyCSS = require('gulp-minify-css'),
    sourcemaps = require('gulp-sourcemaps'),
    rev = require('gulp-rev'),
    watch = require('gulp-watch'),
    browserSync = require('browser-sync'),
    del = require('del'),
    connect = require('gulp-connect-php'),
    usemin = require('gulp-usemin'),
    runSequence = require('run-sequence');

var onError = function (err) {
    gutil.beep();
    console.log(err);
};

gulp.task('default', function (callback) {
    runSequence('css', 'watch', 'webserver', callback)
});

gulp.task('webserver', function () {
    runWebserver();
});

gulp.task('webserver:dist', function () {
    runWebserver('dist');
});

function runWebserver(env) {
    return connect.server({
        base: env === 'dist' ? './dist' : './'
    }, function () {
        browserSync({
            port: env === 'dist' ? 8003 : 8002,
            proxy: '127.0.0.1:8000'
        });
    });
}

gulp.task('watch', function () {
    gulp.watch('./styles/*.less', ['css', browserSync.reload]);
    gulp.watch('./js/*.js', browserSync.reload);
    gulp.watch('./**/*.php', browserSync.reload);
});

gulp.task('css', function () {
    return gulp.src('./styles/*.less')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(less())
        .pipe(autoprefix('last 4 version', 'ie 9'))
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./.css'));
});

gulp.task('clean', function () {
    del(['./dist/*', '.tmp/*'], {force: true});
});

gulp.task('usemin', ['css'], function () {
    return gulp.src(['./includes/head.php', './includes/footer.php'])
        .pipe(usemin({
            css: [minifyCSS, rev],
            js: [sourcemaps.init(), uglify(), rev(), sourcemaps.write('.')]
        })).pipe(gulp.dest('.tmp/'));
});

gulp.task('copy:assets', function () {
    gulp.src(['./*.php', './*.txt', './*.xml', './*.html', './favicon.ico']).pipe(gulp.dest('./dist'));
    gulp.src('./services/**/*').pipe(gulp.dest('./dist/services'));
    gulp.src('./api/**/*').pipe(gulp.dest('./dist/api'));
    gulp.src(['./includes/**/*', '!./includes/footer.php', '!./includes/head.php']).pipe(gulp.dest('./dist/includes'));
    gulp.src('./images/**/*').pipe(gulp.dest('./dist/images'));
    gulp.src('./fonts/**/*').pipe(gulp.dest('./dist/fonts'));
    gulp.src('./error/**/*').pipe(gulp.dest('./dist/error'));
});

gulp.task('copy:tmp', function () {
    gulp.src('.tmp/scripts/**').pipe(gulp.dest('./dist/scripts'));
    gulp.src('.tmp/css/**').pipe(gulp.dest('./dist/css'));
    gulp.src('.tmp/*.php').pipe(gulp.dest('./dist/includes'));
});

gulp.task('copy:dist',['copy:assets', 'copy:tmp']);

gulp.task('build', function (callback) {
    runSequence('clean', 'usemin', 'copy:dist', callback);
});
