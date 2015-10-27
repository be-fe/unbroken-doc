var gulp = require('gulp');
var unbrokenDoc = require('./index');

unbrokenDoc.init('unbroken-doc', {
    addIgnores: [
        /[\\\/]build[\\\/]/,
        /[\\\/]test-out-of-src\.txt/, 
    ]
});

gulp.task('doc', unbrokenDoc.tasks.doc);
gulp.task('validate', unbrokenDoc.tasks.validate);
