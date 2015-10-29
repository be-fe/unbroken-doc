[中文文档请看这里](./README_cn.md)

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
var gulp = require('gulp');
var unbrokenDoc = require('unbroken-doc');

unbrokenDoc.init('my-custom-project', OPTIONS);

gulp.task('doc', unbrokenDoc.tasks.doc);
gulp.task('validate', unbrokenDoc.tasks.validate);

// which defines the tasks as below
# gulp doc
# gulp validate
```

# How to use in your project

After having the gulp task ready, you can `cd` to your project folder, and run `gulp doc` 
(or the task that you defined).

The process will keep watching your project, and help you parsing markers.

## Add a marker

At anywhere on your project, you would simply enter something like `@@{ SOME DESCRIPTION }`
on any place of any text file. 

The watcher will detect it and replace it with something like:
```
@{{
@[ SOME DESCRIPTION ]{_projectkey_randomkey}
}}@
```

Note that, if you insert the ``@@{}`` pre-marker on a file of a special type, e.g. on a js file, 
the actual marker will also be enclosed within a multi-line comment automatically. 
```
/*@{{
@[  ]{_projectkey_randomkey}
}}@*/
```

## Add a reference to a marker

That's so easy, simply copy the bit `@[ SOME DESCRIPTION ]{_projectkey_randomkey}` to anywhere that 
you want to have the reference.

In most editor (IDE), you can simply move your cursor at the line of the marker, and press `ctrl+c`
or `cmd+c`, this line will then be copied to your clipboard. 

And next, you just simply paste it to the place you'd like to have the reference.

# Config details

## unbrokenDoc.init( projectKey, options )

`projectKey` is the most important information in the setting, it will determine how your marker is generated.

For more information about `options` see below.

## Options of config

OPTIONS is the config object, if nothing is passed into `.init()`, the default object is used.
You can refer to the default config object below to get more idea:

```
{   
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
        // ignore all folders that start with '.'
        /[\/\\]\./,
        /^\../,
        
        // ignore node_modules, bower_modules, vendor, build folders
        /([\/\\]|^)node_modules[\/\\]/,
        /([\/\\]|^)bower_modules[\/\\]/,
        /([\/\\]|^)vendor[\/\\]/,
        /([\/\\]|^)build[\/\\]/,
        
        // ignore typical non-text files
        /\.(mp4|avi|mkv|rm|rmvb|mp3|wav|xls|doc|xlsx|docx|class|png|jpg|gif|rar|eot|svg|ttf|woff|woff2|swf|db|jar|iml|jpeg)$/i,
    ],
    
    // you can simply specify the following ignore rule, so that they are appended to the main ignore
    addIgnores: [

    ]
};
```

Or, you can pass in a function as the `config` in `.init(projectKey, config)`.
The function will have the current config as input, and should return the new config object.

```
unbrokenDoc.setup('my-project', function(config) {
    config.srcPath = './src';
    
    return config;
});
```

The processing logic of this plugin in Chinese :
 
[ 程序运作逻辑 ]{_unbroken_doc_385f148fa_}