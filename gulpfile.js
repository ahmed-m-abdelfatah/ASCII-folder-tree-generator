// prettier-ignore
const gulp = require('gulp'),
      sass = require('gulp-sass')(require('sass')),
      autoPrefixer = require('gulp-autoprefixer'),
      // sourcemaps = require('gulp-sourcemaps'),
      concat = require('gulp-concat'),
      connect = require('gulp-connect'),
      pug = require('gulp-pug'),
      imagemin = require('gulp-imagemin'),
      plumber = require('gulp-plumber'),
      zip = require('gulp-zip'),
      uglify = require('gulp-uglify'),
      htmlmin = require('gulp-htmlmin');

const paths = {
  src: './src',
  build: './build',
  dist: './dist',
};

const sources = {
  html: [`${paths.src}/**/_*.+(pug|html)`, `${paths.src}/**/!(_)*.+(html)`, `${paths.src}/**/!(_)*.+(pug)`],
  img: [`${paths.src}/assets/img/**/!(_)*.+(png|jpg|jpeg|gif|svg|ico)`],
  css: [
    `${paths.src}/assets/styles/**/_*.+(css|scss)`,
    `${paths.src}/assets/styles/**/!(_)*.+(css|scss)`,
    `${paths.src}/assets/styles/**/!(_)*.rtl.+(css|scss)`,
  ],
  js: [`${paths.src}/assets/js/**/*.js`],
  lib: [`${paths.src}/assets/lib/**/*.*`],
  dist: [`${paths.build}/**/*.*`, './README.md'],
};

const tasks = {
  connect: 'connect',
  html: 'html',
  img: 'img',
  css: 'css',
  js: 'js',
  lib: 'lib',
  dist: 'dist',
  start: 'start',
  watch: 'watch',
  default: 'default',
  final: 'final',
};

// connect to server
gulp.task(tasks.connect, (done, root = paths.build) => {
  connect.server({
    root,
    livereload: true,
    port: 8000,
  });

  done();
});

// handel html
gulp.task(tasks.html, (done, dest = paths.build) => {
  /**
   * this for watching only: _*.+(pug|html)
   * this for watching & compiling only: !(_)*.+(pug|html)
   * console.log(sources.html.filter(item => !item.includes('_*')));
   */

  gulp
    .src([sources.html[1]])
    .pipe(plumber())
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(dest));

  gulp
    .src([sources.html[2]])
    .pipe(plumber())
    .pipe(pug({ pretty: false }))
    .pipe(gulp.dest(dest));

  gulp.src(sources.html).pipe(connect.reload());

  done();
});

// handel img
gulp.task(tasks.img, (_, dest = `${paths.build}/assets/img`) => {
  return gulp.src(sources.img).pipe(plumber()).pipe(imagemin()).pipe(gulp.dest(dest)).pipe(connect.reload());
});

// handel css
gulp.task(tasks.css, (done, dest = `${paths.build}/assets/css`) => {
  /**
   * In css task we use that method to stop duplicates in all.min.css
   * this for watching only: _*.+(css|scss)
   * this for watching & compiling only: !(_)*.+(css|scss)
   * console.log(sources.css.filter(item => !item.includes('_*')));
   */

  // ltr
  gulp
    .src(sources.css[1])
    .pipe(plumber())
    // .pipe(sourcemaps.init())
    .pipe(concat('all.min.css'))
    .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoPrefixer({ cascade: true }))
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest));

  // rtl
  gulp
    .src(sources.css[2])
    .pipe(plumber())
    // .pipe(sourcemaps.init())
    .pipe(concat('all.rtl.min.css'))
    .pipe(sass.sync({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoPrefixer({ cascade: true }))
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dest));

  gulp.src(sources.css).pipe(connect.reload());
  done();
});

// handel js
gulp.task(tasks.js, (_, dest = `${paths.build}/assets/js`) => {
  return (
    gulp
      .src(sources.js)
      .pipe(plumber())
      // .pipe(sourcemaps.init())
      .pipe(concat('all.min.js'))
      .pipe(uglify())
      // .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dest))
      .pipe(connect.reload())
  );
});

// handel lib
gulp.task(tasks.lib, (_, dest = `${paths.build}/assets/lib`) => {
  return gulp.src(sources.lib).pipe(gulp.dest(dest)).pipe(connect.reload());
});

// handel dist
gulp.task(tasks.dist, (_, dest = paths.dist) => {
  return gulp.src(sources.dist).pipe(zip('website.zip')).pipe(gulp.dest(dest));
});

// watch files
gulp.task(tasks.watch, done => {
  gulp.watch(sources.html, gulp.series(tasks.html));
  gulp.watch(sources.img, gulp.series(tasks.img));
  gulp.watch(sources.css, gulp.series(tasks.css));
  gulp.watch(sources.js, gulp.series(tasks.js));
  gulp.watch(sources.lib, gulp.series(tasks.lib));

  done();
});

// starting
gulp.task(tasks.start, gulp.series(tasks.html, tasks.img, tasks.css, tasks.js, tasks.lib));
gulp.task(tasks.final, gulp.series(tasks.html, tasks.img, tasks.css, tasks.js, tasks.lib, tasks.dist));
gulp.task(tasks.default, gulp.parallel(tasks.connect, tasks.watch, tasks.start));
