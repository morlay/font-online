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

gulp.task('build', ['iconfont', 'webfont']);
gulp.task('dev', function () {
  gulp.setWatcher();
  gulp.start('build');
});
