/*eslint-env node */

var gulp = require('gulp');
var deploy = require('gulp-gh-pages');
var htmlhint = require('gulp-htmlhint');
var csslint = require('gulp-csslint');
var htmlmin = require('gulp-htmlmin');
var cssmin = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var webp = require('gulp-webp');
var del = require('del');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

// Default task
gulp.task('default', ['htmlmin', 'cssmin', 'uglify', 'imagemin', 'browserSync'], function() {
  //gulp.start('htmlmin', 'cssmin', 'uglify', 'imagemin');
  gulp.watch('src/assets/css/**/*.css', ['cssmin']);
  gulp.watch('src/assets/js/**/*.js', ['uglify']);
  gulp.watch('src/index.html', ['htmlmin']);
  gulp.watch('./build/index.html').on('change', browserSync.reload);
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: './build'
  });
})

// Lint HTML
gulp.task('htmlLint', function() {
  return gulp.src('src/*.html')
    .pipe(htmlhint());
});

// Lint CSS

gulp.task('cssLint', function() {
  return gulp.src(['src/assets/css/*.css', '!src/assets/css/*.min.css'])
    .pipe(csslint({
      'unique-headings': false,
      'important': false,
      'universal-selector': false,
      'ids': false,
      'fallback-colors': false,
      'box-sizing': false
    }))
    .pipe(csslint.reporter());
});

// Lint JS

gulp.task('eslint', function() {
  return gulp.src('src/assets/js/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

// Minify CSS
gulp.task('cssmin', ['clean', 'cssmax', 'fonts'], function() {
  // gulp.start('cssmax');
  // gulp.start('fonts');
  return gulp.src(['src/assets/css/*.css', '!src/assets/css/*.min.css'])
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(cssmin())
    .pipe(gulp.dest('build/assets/css/'))
    .pipe(notify({
      message: 'CSS minification complete'
    }))
    .pipe(browserSync.stream());
});

// Move already-minified assets to build dir
gulp.task('cssmax', ['clean'], function() {
  return gulp.src('src/assets/css/*.min.css')
    .pipe(gulp.dest('build/assets/css/'))
    .pipe(notify({
      message: 'CSS moved'
    }));
});

// Move fonts to build dir

gulp.task('fonts', ['clean'], function() {
  return gulp.src('src/assets/fonts/*')
    .pipe(gulp.dest('build/assets/fonts'))
    .pipe(notify({
      message: 'fonts moved'
    }));
});

// Uglify JS
gulp.task('uglify', ['clean', 'jsmax'], function() {
  return gulp.src(['src/assets/js/*.js', '!src/assets/js/*.min.js'])
    .pipe(sourcemaps.init())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('build/assets/js'))
    .pipe(notify({
      message: 'JS uglification complete'
    }))
    .pipe(browserSync.stream());
});

// Move already-minified assets to build/assets dir
gulp.task('jsmax', function() {
  return gulp.src('src/assets/js/**/*.min.js')
    .pipe(gulp.dest('build/assets/js'))
    .pipe(notify({
      message: 'js moved'
    }));
})

// Image optimizer
gulp.task('imagemin', ['clean'], function() {
  var formats = ['src/assets/img/**/*.png', 'src/assets/img/**/*.jpg', 'src/assets/img/**/*.svg'];
  return gulp.src(formats)
    .pipe(webp())
    .pipe(gulp.dest('build/assets/img'))
    .pipe(notify({
      message: 'Image minification complete'
    }));
});

gulp.task('htmlmin', ['clean'], function() {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('build'))
    .pipe(notify({
      message: 'HTML moved'
    }));
});

gulp.task('clean', function() {
});

// Lint all
gulp.task('lint', function() {
  gulp.start('htmlLint', 'cssLint', 'eslint');
});

// Minify all
gulp.task('minify', ['htmlmin', 'cssmin', 'uglify', 'imagemin']);

// Minify, and deploy to GH pages
gulp.task('build', function() {
  return gulp.src('./build/**/*')
    .pipe(deploy());
});

// gulp.task('watch', function() {
//   gulp.watch(['src/index.html', 'src/assets/css/*.css', '!src/assets/css/*.min.css','src/assets/js/*.js', '!src/assets/js/*.min.js','src/assets/img/**/*.png', 'src/assets/img/**/*.jpg', 'src/assets/img/**/*.svg'], ['minify'])
// })

gulp.task('deploy', ['minify'], function() {
  gulp.start('build');
});
