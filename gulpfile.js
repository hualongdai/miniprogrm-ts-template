'use strict';
const {
  dest,
  parallel,
  series,
  src,
  watch,
} = require('gulp');
const gulpBabel = require('gulp-babel');
const gulpCached = require('gulp-cached');
const gulpClean = require('gulp-clean');
const gulpLess = require('gulp-less');
const gulpPlumber = require('gulp-plumber');
const gulpRename = require('gulp-rename');
const gulpSourceMaps = require('gulp-sourcemaps');
const gulpTypescript = require('gulp-typescript');
const gulpUglifyES = require('gulp-uglify-es');
const through = require('through2');
const alias = require('gulp-ts-path-alias');

const formatTypescriptFile = require('./script/formatTypescriptFile');


const IS_PROD = !!process.env.GROUP;

const SRC_DIR = './src';
const DIST_DIR = './dist';
const SRC_FILE = [
  `${SRC_DIR}/**/*.png`,
  `${SRC_DIR}/**/*.gif`,
  `${SRC_DIR}/**/*.jpg`,
  `${SRC_DIR}/**/*.json`,
  `${SRC_DIR}/**/*.wxml`,
  `${SRC_DIR}/**/*.wxs`,
  `${SRC_DIR}/**/*.wxss`,
];
const SRC_JAVASCRIPT = `${SRC_DIR}/**/*.js`;
const SRC_LESS = `${SRC_DIR}/**/*.less`;
const SRC_TYPESCRIPT = `${SRC_DIR}/**/*.ts`;

const NOOP = () => {
  return through.obj(function(chunk, encode, callback) {
    this.push(chunk);
    callback();
  });
};

const compileJavascript = () => {
  return src(SRC_JAVASCRIPT)
    .pipe(gulpPlumber({
      errorHandler: () => {},
    }))
    .pipe(gulpCached('compileJavascript'))
    .pipe(IS_PROD ? NOOP() : gulpSourceMaps.init())
    .pipe(IS_PROD ? gulpBabel() : NOOP())
    .pipe(IS_PROD ? gulpUglifyES.default() : NOOP())
    .pipe(IS_PROD ? NOOP() : gulpSourceMaps.write())
    .pipe(IS_PROD ? addPromise() : NOOP())
    .pipe(dest(DIST_DIR));
};

const compileLess = () => {
  return src(SRC_LESS)
    .pipe(gulpPlumber({
      errorHandler: () => {},
    }))
    .pipe(gulpCached('compileLess'))
    .pipe(IS_PROD ? NOOP() : gulpSourceMaps.init())
    .pipe(gulpLess())
    .pipe(IS_PROD ? NOOP() : gulpSourceMaps.write())
    .pipe(gulpRename(path => {
      path.extname = '.wxss';
    }))
    .pipe(dest(DIST_DIR));
};

const compileTypescript = () => {
  const tsProject = gulpTypescript.createProject('./tsconfig.json');
  return src(SRC_TYPESCRIPT)
    .pipe(gulpPlumber({
      errorHandler: () => {},
    }))
    .pipe(formatTypescriptFile())
    .pipe(gulpCached('compileTypescript'))
    .pipe(IS_PROD ? NOOP() : gulpSourceMaps.init())
    .pipe(tsProject())
    .pipe(IS_PROD ? gulpBabel() : NOOP())
    .pipe(IS_PROD ? gulpUglifyES.default() : NOOP())
    .pipe(IS_PROD ? NOOP() : gulpSourceMaps.write())
    .pipe(alias('.', tsProject.config.compilerOptions.paths))
    .pipe(dest(DIST_DIR));
};

const cleanDist = () => {
  return src(DIST_DIR, { allowEmpty: true })
    .pipe(gulpClean());
};

const copyFile = () => {
  return src(SRC_FILE)
    .pipe(gulpCached('copyFile'))
    .pipe(dest(DIST_DIR));
};

const watchFileChange = () => {
  watch(SRC_FILE, copyFile);
  watch(SRC_JAVASCRIPT, compileJavascript);
  watch(SRC_LESS, compileLess);
  watch(SRC_TYPESCRIPT, compileTypescript);
};

if (IS_PROD) {
  exports.build = series(
    cleanDist,
    parallel(
      compileJavascript,
      compileLess,
      copyFile
    ),
    compileTypescript
  );
} else {
  exports.build = series(
    cleanDist,
    parallel(
      compileJavascript,
      compileLess,
      copyFile
    ),
    compileTypescript
  );
}

exports.watch = series(
  exports.build,
  watchFileChange
);
