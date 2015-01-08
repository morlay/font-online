'use strict';

var path = require('path');

var _ = require('lodash');

var svg2ttf = require('gulp-svg2ttf');
var ttf2eot = require('gulp-ttf2eot');
var ttf2woff = require('gulp-ttf2woff');

var rename = require('gulp-rename');
var syncProcessor = require('gulp-sync-processor');

var mapStream = require('map-stream');

var taskName = path.basename(__filename, path.extname(__filename));

var defaultConfig = {
  src: [
    './src/webfonts/*.ttf'
  ],
  dest: './dest/assets/fonts',
  destSass: './dest/scss/'
};

module.exports = function () {

  var gulp = this;
  var conf = _.merge(defaultConfig, gulp.opts[taskName]);

  var fonts = [];

  function bundle() {
    return gulp.src(conf.src)
      .pipe(getFileNameAsFontName(fonts))
      .pipe(svg2ttf())
      .pipe(ttf2eot({clone: true}))
      .pipe(ttf2woff({clone: true}))
      .pipe(syncProcessor({
        options: {
          data: {
            fonts: fonts
          },
          isProcess: function (data) {
            return data.fonts.length > 0
          }
        },
        files: [
          {src: path.join(__dirname, 'tpls/webfont/webfonts.html.ejs')},
          {src: path.join(__dirname, 'tpls/webfont/_webfont.auto.scss.ejs')}
        ]
      }))
      .pipe(rename(function (pathObj) {
        if (pathObj.extname === '.scss') {
          pathObj.dirname = conf.destSass;
        } else {
          pathObj.dirname = conf.dest;
        }
      }))
      .pipe(gulp.dest(process.cwd()))
      .pipe(gulp.pipeTimer(taskName))
  }

  gulp.watcher([].concat(conf.src), bundle);

  return bundle();

};


function getFileNameAsFontName(fonts) {
  return mapStream(function (file, callback) {
    fonts.push({
      fontName: path.basename(file.path, path.extname(file.path))
    });
    callback(null, file);
  })
}
