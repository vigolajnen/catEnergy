"use strict";

const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const pug = require("gulp-pug");
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const svgo = require("gulp-svgo");
const cheerio = require("gulp-cheerio");
const imagemin = require("gulp-imagemin");
const del = require("del");
const terser = require("gulp-terser");
const concat = require("gulp-concat");
const sync = require("browser-sync").create();

const styles = () => {
  return gulp
    .src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
};
exports.styles = styles;

const htmlPug = () => {
  return gulp
    .src("source/pug/*.pug")
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(gulp.dest("build"));
};
exports.htmlPug = htmlPug;

const scripts = () => {
  return gulp
    .src("source/js/script.js")
    .pipe(terser())
    .pipe(rename("script.min.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
};
exports.scripts = scripts;

const optimizeImages = () => {
  return gulp
    .src("source/img/**/*.{png,jpg,svg}")
    .pipe(
      imagemin([
        imagemin.mozjpeg({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.svgo(),
      ])
    )
    .pipe(gulp.dest("build/img"));
};
exports.optimizeImages = optimizeImages;

const copyImages = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}").pipe(gulp.dest("build/img"));
};
exports.images = copyImages;

const clean = () => {
  return del("build");
};
exports.clean = clean;

const createWebp = () => {
  return gulp
    .src("source/img/**/*.{png,jpg}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("source/img"));
};
exports.createWebp = createWebp;

const sprite = () => {
  return gulp
    .src("source/img/icons/{icon-*,htmlacademy*}.svg")
    .pipe(
      svgo({
        plugins: [
          {
            inlineStyles: true,
            minifyStyles: true,
            removeStyleElement: true,
          },
        ],
      })
    )
    .pipe(
      cheerio({
        run: function ($) {
          const defs = Array.from(
            $("defs").map((i, el) => {
              const html = $(el).html();

              $(el).remove();

              return html;
            })
          ).join("");

          const clipPaths = Array.from(
            $("clipPath").map((i, el) => {
              const html = $.html(el);

              $(el).remove();

              return html;
            })
          ).join("");

          if (defs.length || clipPaths.length) {
            $("svg").prepend(`<defs>${defs}${clipPaths}</defs>`);
          }
        },
        parserOptions: { xmlMode: true },
      })
    )
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
};
exports.sprite = sprite;

const copy = (done) => {
  return gulp
    .src(
      [
        "source/fonts/**/*.{woff,woff2}",
        "source/*.ico",
        "source/img/**",
        "!source/img/icons/*.svg",
        "source/*.webmanifest",
      ],
      {
        base: "source",
      }
    )
    .pipe(gulp.dest("build"));
  done();
};
exports.copy = copy;

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build",
    },
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });
  done();
};
exports.server = server;

const reload = (done) => {
  sync.reload();
  done();
};
exports.reload = reload;

const watcher = () => {
  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("styles"));
  gulp.watch("source/js/**/*.js", gulp.series("scripts"));
  gulp.watch("source/pug/**/*.pug", gulp.series("htmlPug", "reload"));
};

const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(styles, htmlPug, scripts, sprite, createWebp)
);
exports.build = build;

exports.default = gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(styles, htmlPug, scripts, sprite, createWebp),
  gulp.series(server, watcher)
);
