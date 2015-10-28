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
npm install unbroken-doc
npm install gulp
```

And then, in your `gulpfile.js`, you should specify the tasks.
There are two in this plugin at the moment:

* doc
* validate

Therefore, you could have something like this:

```
var unbrokenDoc = require('unbroken-doc');

unbrokenDoc.init('my-custom-project', OPTIONS);
gulp.task('doc', unbrokenDoc.tasks.doc);
gulp.task('validate', unbrokenDoc.tasks.validate);

// which defines the tasks as below
# gulp my-doc
# gulp my-validate
```

# Options of config

OPTIONS is the config object, you can refer to the default config object below:

```
{
    // the key of the project, will be used to generate the unique marker key
    "projectKey": "default",
    
    // the comment syntax, so that the marker can be error-free embeded on the content
    commentSyntax: {
        none: {start: '', end: ''},
        xml: {start: '<!--', end: '-->'},
        java: {start: '/*', end: '*/'}
    },
    
    // the file that we going to process, the comment gives the comment syntax to be used in such file type
    fileTypes: {
        sh: {},
        py: {},

        sql: {
            comment: 'java'
        },

        java: {
            comment: 'java'
        },

        js: {
            comment: 'java'
        },
        json: {
            comment: 'java'
        },

        less: {
            comment: 'java'
        },
        css: {
            comment: 'java'
        },

        jsp: {
            comment: 'xml'
        },
        html: {
            comment: 'xml'
        },
        xml: {
            comment: 'xml'
        },
        mustache: {},

        data: {},
        properties: {},
        md: {
            comment: 'none'
        },
        txt: {
            comment: 'none'
        }
    },
    
    // the src path to watch
    srcPath: '.',
    
    // where the cache file sits
    docCacheFolderPath: './.doc_cache/',
    
    // which files that we ignore. Follows are the default ignores
    ignores: [
        /[\/\\]\./,
        /^\../,
        /[\/\\]node_modules[\/\\]/,
        /[\/\\]vendor[\/\\]/,
        /\.(mp4|avi|mkv|rm|rmvb|mp3|wav|xls|doc|xlsx|docx|class|png|jpg|gif|rar|eot|svg|ttf|woff|woff2|swf|db|jar|iml|jpeg)$/i,
    ],
    
    // you can simply specify the following ignore rule, so that they are appended to the main ignore
    addIgnores: [

    ]
};
```

Or, you can pass in a function as the `config` in `.setup(projectKey, config)` or `.init(projectKey, config)`.
The function will have the current config as input, and should return the new config object.

```
unbrokenDoc.setup('my-project', function(config) {
    config.srcPath = './src';
    
    return config;
});
```

The processing logic of this plugin in Chinese :
 
[ 程序运作逻辑 ]{_unbroken_doc_385f148fa_}