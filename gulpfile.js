/* jshint node: true */

var concat = require('gulp-concat');
var declare = require('gulp-declare');
var del = require('del');
var gulp = require('gulp');
var handlebars = require('gulp-handlebars');
var order = require('gulp-order');
var runSequence = require('run-sequence');
var wrap = require('gulp-wrap');
var wrapper = require('gulp-wrapper');

// Compiles Handlebars templates to src/templates.js.
gulp.task('templates', function() {
  return gulp.src('./src/content/**/*.html')
    .pipe(handlebars())
    .pipe(wrap('function(data, options, asString){' +
      ' var html = Handlebars.template(<%= contents %>)(data, options);' +
      ' return asString ? html : $(html);' +
      '}'))
    .pipe(declare({
      root: 'Templates',
      noRedeclare: true, // Avoid duplicate declarations.
    }))
    .pipe(concat('templates.js'))
    .pipe(wrapper({
      // Scope `Templates` to the extension namespace; don't leak it into GitHub.
      header: 'var Templates = {};'
    }))
    .pipe(gulp.dest('./src/content'));
});

// Compiles content scripts to src/content.js.
gulp.task('content scripts', ['templates'], function() {
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
  del(['src/content.js', 'src/templates.js'], cb);
});

gulp.task('watch', function() {
  gulp.watch('src/content/**/*.js', ['content scripts']);
  gulp.watch('src/content/**/*.html', ['templates']);
});

gulp.task('default', function(cb) {
  runSequence('clean', 'content scripts', 'watch', cb);
});
