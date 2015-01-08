'use strict';

var path = require('path');
var _ = require('lodash');

var svgicons2svgfont = require('gulp-svgicons2svgfont');
var svg2ttf = require('gulp-svg2ttf');
var ttf2eot = require('gulp-ttf2eot');
var ttf2woff = require('gulp-ttf2woff');
var rename = require('gulp-rename');
var md5 = require('MD5');
var mapStream = require('map-stream');
var syncProcessor = require('gulp-sync-processor');
var taskName = path.basename(__filename, path.extname(__filename));

var defaultConfig = {
  src: [
    'src/iconfonts/*.svg'
  ],
  dest: 'dest/assets/fonts',
  destSass: 'dest/scss',
  destSassVars: 'dest/scss',
  options: {
    "fontName": "iconfont",
    "normalize": true,
    "fixedWidth": true,
    "fontHeight": 512,
    "centerHorizontally": true,
    "fontShortName": "icon",
    "bem": true
  }
};

module.exports = function () {

  var gulp = this;
  var conf = _.merge(defaultConfig, gulp.opts[taskName]);

  function bundle() {

    var tplData = {
      fontConfig: conf.options
    };

    return gulp.src(conf.src)
      .pipe(svgicons2svgfont(conf.options))
      .on('codepoints', collectCodePointList(tplData))
      .pipe(getHashOfIconFontSvg(tplData.fontConfig))
      .pipe(svg2ttf())                 // Generating TTF font (but ignore svg)
      .pipe(ttf2eot({clone: true}))    // Generating EOT font
      .pipe(ttf2woff({clone: true}))   // Generating WOFF font
      .pipe(syncProcessor({
        options: {
          data: tplData,
          isProcess: function (data) {
            return data.codepoints.length > 0
          }
        },
        files: [
          {src: path.join(__dirname, 'tpls/iconfont/iconfonts.html.ejs')},
          {src: path.join(__dirname, 'tpls/iconfont/_icons.auto.scss.ejs')},
          {src: path.join(__dirname, 'tpls/iconfont/_icon.auto.scss.ejs')}
        ]
      }))
      .pipe(rename(function (pathObj) {
        switch (pathObj.extname) {
          case '.scss':
            switch (pathObj.basename) {
              case '_icons.auto':
                pathObj.dirname = conf.destSassVars;
                break;
              case '_icon.auto':
                pathObj.dirname = conf.destSass;
                break;
            }
            break;
          default:
            pathObj.dirname = conf.dest;
        }
      }))
      .pipe(gulp.dest(process.cwd()))
      .pipe(gulp.pipeTimer(taskName))
  }

  gulp.watcher([].concat(conf.src), bundle);

  return bundle();

};

function collectCodePointList(tplData) {
  return function (codepoints) {
    tplData.codepoints = _.map(codepoints, function (obj) {
      obj.codepoint = obj.codepoint.toString(16);
      return obj;
    });
  }
}

function getHashOfIconFontSvg(fontConfig) {
  return mapStream(function (file, callback) {
    fontConfig.hash = md5(String(file.contents));
    callback(null, file);
  })
}
