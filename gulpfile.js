var gulp = require('gulp');
require('./tasks/libs/watcher').call(gulp, null);

// make default options can be overwritten
gulp.opts = {
  iconfont: {
    options: {
      "fontName": "custom-iconfont"
    }
  },
  webfont: {}
};

gulp.task('iconfont', require('./tasks/iconfont'));
gulp.task('webfont', require('./tasks/webfont'));

gulp.task('material-design-icons', require('./tasks/material-design-icons'));

gulp.task('build', ['material-design-icons'], function () {
  gulp.start(['iconfont', 'webfont'])
});

gulp.task('dev', function () {
  gulp.setWatcher();
  gulp.start('build');
});
