var gulp = require('gulp');

var doc = require('../../index');

doc.init('example-two', {
    srcPath: 'src',
    docCacheFolderPath: './.doc/cache',
    addIgnores: [
        /^src[\\\/]build/,
        /^README\.md/,
        /^README_cn\.md/,
    ]
});

gulp.task('my-doc', doc.tasks.doc);
gulp.task('my-validate', doc.tasks.validate);
