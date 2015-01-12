'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var rename = require('gulp-rename');
var svgscaler = require('svg-scaler');
var cheerio = require('cheerio');
var mapStream = require('map-stream');


var gridString = cheerio.load(String(fs.readFileSync(path.join(__dirname, 'tpls/iconfont/grid.svg'))), {
  xmlMode: true
})('svg').html();

module.exports = function () {

  var gulp = this;

  return gulp.src(['bower_components/material-design-icons/{,**/}svg/production/*48px.svg'])
    .pipe(rename(function (pathObj) {
      pathObj.dirname = '';
      pathObj.basename = pathObj.basename.replace(/^ic_/, '').replace(/_48px/, '').replace(/_/g, '-')
    }))
    .pipe(svgscaler({width: 576}))
    .pipe(prependGrid())
    .pipe(gulp.dest('src/iconfonts'));


};

function prependGrid() {
  return mapStream(function (file, callback) {

    var $ = cheerio.load(String(file.contents), {
      xmlMode: true
    });

    $('svg').prepend(['<g id="gridlines">', gridString, '</g>'].join(''));
    file.contents = new Buffer($.html());

    callback(null, file);

  });
}
