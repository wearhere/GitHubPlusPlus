var concat = require('gulp-concat');
var del = require('del');
var gulp = require('gulp');
var runSequence = require('run-sequence');

// Compiles content scripts to src/content.js.
gulp.task('content scripts', function() {
  return gulp.src('./src/content/**/*.js')
    .pipe(concat('content.js'))
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
