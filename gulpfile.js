/* jshint node: true */

var concat = require('gulp-concat');
var del = require('del');
var gulp = require('gulp');
var order = require('gulp-order');
var runSequence = require('run-sequence');
var wrapper = require('gulp-wrapper');

// Compiles content scripts to src/content.js.
gulp.task('content scripts', function() {
  return gulp.src('./src/content/**/*.js')
    .pipe(order([
      'lib/**/*.js' // Order library code first.
    ]))
    .pipe(concat('content.js'))
    // Don't pollute Github's global namespace.
    .pipe(wrapper({
      header: '(function() {',
      footer: '})();'
    }))
    .pipe(gulp.dest('./src'));
});

// Cleans all auto-built files.
gulp.task('clean', function(cb) {
  del(['src/content.js'], cb);
});

gulp.task('watch', function() {
  gulp.watch('src/content/**/*.js', ['content scripts']);
});

gulp.task('default', function(cb) {
  runSequence('clean', 'content scripts', 'watch', cb);
});
