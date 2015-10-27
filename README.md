# Background

Writing doc is one of the headaches in many projects. Some pains include, but not limited to:
 
* No good way to refer to a specific part of content
* Links are vulnerable due to code refactoring
 
This plugin is to provide a way to easily create stable markers across your project, and make your
documentation links more strong. 

# Installation

First, you need to have node/npm and gulp.

```
cd MY_PROJECT
npm install --save unbroken-doc
```

And then, in your `gulpfile.js`, you should specify the tasks.

If you don't have name conflicting concern, just have something like the followings in your gulpfile:

```
var unbrokenDoc = require('unbroken-doc');

unbrokenDoc.setup();

// so in Console, you can run

// watching the project and update the index and marks  
# gulp doc 

// validate the paths and keys
# gulp validate
```

Otherwise, you might want to have different name for the tasks. There are two in this plugin at the moment:

* doc
* validate

Therefore, you could have something like this:

```
var unbrokenDoc = require('unbroken-doc');

gulp.task('my-doc', unbrokenDoc.doc);
gulp.task('my-validate', unbrokenDoc.validate);

// which defines the tasks as below
# gulp my-doc
# gulp my-validate
```