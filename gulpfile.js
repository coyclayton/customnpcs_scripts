var minify = require('gulp-minify');
const gulp = require('gulp');
const concat = require('gulp-concat');

gulp.task('econsim', function(){
    return gulp.src([
        "./zzz__library.js",
        "./econsim/econsim.js"
    ])
    .pipe(concat('econsim'))
    .pipe(minify())
    .pipe(gulp.dest('dist'))
});