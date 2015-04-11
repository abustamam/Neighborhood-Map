var gulp         = require('gulp'),
    deploy       = require('gulp-gh-pages'),
    htmlhint     = require('gulp-htmlhint'),
    csslint      = require('gulp-csslint'),
    jshint       = require('gulp-jshint'),
    htmlmin      = require('gulp-htmlmin'),
    cssmin       = require('gulp-minify-css'),
    uglify       = require('gulp-uglify'),
    webp         = require('gulp-webp'),
    del          = require('del'),
    notify       = require('gulp-notify'),
    critical     = require('critical'),
    rename       = require('gulp-rename');

// Default task
gulp.task('default', ['clean'], function() {
  gulp.start('htmlmin', 'cssmin', 'uglify', 'imagemin');
});

// Lint HTML
gulp.task('htmlLint', function () {
  return gulp.src('src/*.html')
    .pipe(htmlhint());
});

// Lint CSS

gulp.task('cssLint', function () {
  return gulp.src(['src/assets/css/*.css', '!src/css/*.min.css'])
    .pipe(csslint({
      'unique-headings': false,
      'important': false,
      'universal-selector': false,
      'ids' : false,
      'fallback-colors': false,
      'box-sizing': false
    }))
    .pipe(csslint.reporter());
});

// Lint JS

gulp.task('jsHint', function() {
  return gulp.src('src/assets/js/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .on('error', function (error) {
      console.error(String(error));
    });
});

// Minify HTML
gulp.task('htmlmin', ['clean'], function() {
  return gulp.src('src/*.html')
    .pipe(htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
      removeOptionalTags: true
    }))
    .pipe(gulp.dest('build'))
    .pipe(notify({ message: 'HTML minification complete' }));
});

// Minify CSS
gulp.task('cssmin', ['clean'], function() {
  gulp.start('cssmax');
  gulp.start('fonts');
  return gulp.src(['src/assets/css/*.css', '!src/assets/css/*.min.css'])
    .pipe(rename({suffix: '.min'}))
    .pipe(cssmin())
    .pipe(gulp.dest('build/assets/css/'))
    .pipe(notify({ message: 'CSS minification complete' }));
});

// Move already-minified assets to build dir
gulp.task('cssmax', function(){
  return gulp.src('src/assets/css/*.min.css')
    .pipe(gulp.dest('build/assets/css/'))
    .pipe(notify({ message: 'CSS moved' }));
});

// Move fonts to build dir

gulp.task('fonts', function(){
  return gulp.src('src/assets/fonts/*')
    .pipe(gulp.dest('build/assets/fonts'))
    .pipe(notify({ message: 'fonts moved'}));
});

// Uglify JS
gulp.task('uglify', ['clean'], function () {
  gulp.start('jsmax');
  return gulp.src(['src/assets/js/*.js', '!src/assets/js/*.min.js'])
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('build/assets/js'))
    .pipe(notify({ message: 'JS uglification complete' }));
});

// Move already-minified assets to build/assets dir
gulp.task('jsmax', function(){
  return gulp.src('src/assets/js/**/*.min.js')
    .pipe(gulp.dest('build/assets/js'))
    .pipe(notify({ message: 'js moved' }));
})

// Image optimizer
gulp.task('imagemin', ['clean'], function () {
  var formats = ['src/assets/img/**/*.png', 'src/assets/img/**/*.jpg', 'src/assets/img/**/*.svg'];
  return gulp.src(formats)
      .pipe(webp())
      .pipe(gulp.dest('build/assets/img'))
      .pipe(notify({ message: 'Image minification complete' }));
});

gulp.task('clean', function(cb) {
  del(['build'], cb)
});

// Lint all
gulp.task('lint', function() {
  gulp.start('htmlLint', 'cssLint', 'jsHint');
});

// Minify all
gulp.task('minify', ['htmlmin', 'cssmin', 'uglify', 'imagemin']);

// Minify, and deploy to GH pages
gulp.task('build', function () {
  return gulp.src("./build/**/*")
    .pipe(deploy());
});

gulp.task('deploy', ['minify'], function() {
  gulp.start('build');
});