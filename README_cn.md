# 背景

写文档, 众所周知, 是一个折寿的活儿. 其中, 文档之间链接是一个巨大的痛点:

* 内容指向: 当你要指向某个文件的某个具体部分的内容, 你只能用你自己的语言来描述
* 脆弱的链接: 文档中链接的建立不仅成本高, 而且不稳定, 随着内容的重构, 会纷纷失效
 
这个plugin, 就是为了提供一种有效的机制, 让你容易的去维护项目或文档中的链接, 让各个链接
更加的稳定, 更容易创建和维护. 

# 安装

首先, 安装 node/npm 和全局 gulp, 然后在你的项目中加入 unbroken-doc 和 gulp这两个模块.

```
cd MY_PROJECT
npm install unbroken-doc
npm install gulp
```

其次, 由于这个项目输出的是gulp的任务, 所以在你的 `gulpfile.js` 中, 你需要做适当的配置.

目前, 项目里有两个任务, 分别是

* doc (文档监控任务)
* validate (文档链接校对程序)
 
在`gulpfile.js`, 你可以这么定义:

```
var gulp = require('gulp');
var unbrokenDoc = require('unbroken-doc');

// 注意 my-custom-project 需要替换成你自己的内容, 它对应的是一个 projectKey,
// 这个projectKey是用来生成marker的唯一id的, 所以很重要.

// 关于OPTIONS (可选), 请参照后面的说明
unbrokenDoc.init('my-custom-project', OPTIONS);

gulp.task('doc', unbrokenDoc.tasks.doc);
gulp.task('validate', unbrokenDoc.tasks.validate);
```

设置好之后, 在命令行中, 以下任务就可以运行了.

```
# gulp doc
# gulp validate
```

# 如何使用

设置好之后, 你可以在你的项目文件夹中运行 `gulp doc` (或者你自行定义的其他task名称)

这个任务会启动一个监视进程, 用来检查项目内容的更改. 当发现有更改的内容时, 它会尝试把相应的预设标记转换成正式标记.

## 添加标记(marker)

当监视进程运行之后, 在项目的任何地方 (没有被ignore的部分), 只要输入类似 `@@{ 某些注释 }` 的预设标记.
 
监视进程就会把它自动赋一个随机的id, 并转换成正式的标记:
```
@{{
@[ 某些注释 ]{_projectkey_randomkey}
}}@
```

注意, `@@{}` 就是预设标记, 中间可以加一些简单的单行注释. 如果它被添加到一些特殊的程序文件(如 `*.js` 文件)中, 那么正式的标记还会被
自动包裹在一个多行注释中.
```
/*@{{
@[  ]{_projectkey_randomkey}
}}@*/
```
## 添加标记链接

极其简单, 只要复制和粘贴 `@[ SOME DESCRIPTION ]{_projectkey_randomkey}` 到任何地方, 你就算是创建了一个指向 `_projectkey_randomkey`
这个标记的连接了.

在很多的编辑器中, 你可以很快捷的把光标移动到标记这一行, 按下 `ctrl+c` 或 `cmd+c`, 这一行就会被复制到剪切板, 

# 高级配置

## unbrokenDoc.init( projectKey, [options] )

`projectKey` 是最重要的需要配置的信息, 它关系到你的标记的唯一id是如何被生成的.

有关 `options`, 可以看看下面的内容.

## 配置 options

Options 是相应的配置对象, 如果没有传入, 程序会使用缺省的设置.

关于各个设置的属性, 可以看看下面这个缺省的例子:

```
{   
    // 用于实现不同文件中多行注释包裹的效果
    commentSyntax: {
        none: {start: '', end: ''},
        xml: {start: '<!--', end: '-->'},
        java: {start: '/*', end: '*/'}
    },
    
    // 指定监视的文件类型, 如果comment为空, 则不做处理
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
    
    // 要监视的项目路径
    srcPath: '.',
    
    // 一些缓存文件保存的地方
    docCacheFolderPath: './.doc_cache/',
    
    // ignores相对应的是chokidar下ignore的定义, 可参照 https://github.com/paulmillr/chokidar 中ignored的说明
    ignores: [
        // 过滤掉所有 以 '.' 开头的文件夹
        /[\/\\]\./,
        /^\../,
        
        // 过滤掉 node_modules, bower_modules, vendor, build 等文件夹
        /([\/\\]|^)node_modules[\/\\]/,
        /([\/\\]|^)bower_modules[\/\\]/,
        /([\/\\]|^)vendor[\/\\]/,
        /([\/\\]|^)build[\/\\]/,
        
        // 过滤掉典型的非文本文件
        /\.(mp4|avi|mkv|rm|rmvb|mp3|wav|xls|doc|xlsx|docx|class|png|jpg|gif|rar|eot|svg|ttf|woff|woff2|swf|db|jar|iml|jpeg)$/i,
    ],
    
    // 如果你想保留缺省的ignores, 但添加一些项目特殊的ignore, 可以在这里面指定. 这个属性在程序运行前, 会和 ignores 做一次合并 
    addIgnores: [

    ]
};
```

同时, 你也可以传入一个函数 `function(config)` 作为 `.init()` 的 `config`. 这个函数会接收现有的`config`, 然后需要
返回一个新的`config`对象.
```
unbrokenDoc.init('my-project', function(config) {
    config.srcPath = './src';
    
    return config;
});
```

有关详细的实现, 可以参照: 
 
@[ 程序运作逻辑 ]{_unbroken_doc_385f148fa_}