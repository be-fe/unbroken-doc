var gulp = require('gulp');

var doc = require('../../index');

doc.init('example-two', {
    srcPath: 'src',
    docCacheFolderPath: './.doc/cache',
    addIgnores: [
        /^src[\\\/]build/,
    ]
});

gulp.task('my-doc', doc.doc);
gulp.task('my-validate', doc.validate);
