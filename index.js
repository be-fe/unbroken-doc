var chokidar = require('chokidar');
var npath = require('path');
var fs = require('fs');
var md5 = require('md5');
var _ = require('lodash');

var config = require('./config');

(function () {
    var taskDefs = {};

    var rgxRawMarker = new RegExp(
            '@@\\{'         // 预生成标记的起始token
            + '([^{}]*)'    // 在 @@{ /* 不应该包含任何的 { 和 } */ } 中
            + '\\}',
            'g'
        ),
        rgxExistingMarker = new RegExp(
            '@\\{\\{'                   // 已生成标记的起始token为 @{{
            + '\\s*'
            + '(?:#(\\d+))?'            // #DDD 为标记的权重, 目前没有作用
            + '\\s*'
            + '\\[([^\\[\\]]*)\\]'      // 前面是 [ /* 标记名称 */ ]
            + '\\{([^{}]+)\\}'          // 后面是 { /* 标记的Key */ }
            + '[^]*?'                   // 标记中, 可以包含简单的内容
            + '\\}\\}@',                // 结束 token
            'g'
        );

    var ensurePath = function (path) {
        if (!fs.existsSync(path)) {
            ensurePath(npath.dirname(path));

            fs.mkdirSync(path);
        }
    };

    var docIndexUpdated = 0, _docIndex;

    var getDocIndex = function () {
        if (fs.existsSync(config.docIndexFilePath)) {
            var stat = fs.statSync(config.docIndexFilePath);
            if (stat.mtime.getTime() > docIndexUpdated) {
                _docIndex = JSON.parse(fs.readFileSync(config.docIndexFilePath).toString());
                docIndexUpdated = stat.atime.getTime();

                console.log('index file renewed.');
            }
            return _docIndex;
        } else {
            if (!_docIndex) {
                _docIndex = {
                    seq: 0,
                    keys: {},
                    files: {}
                };
                debounceSaveDocIndex();
            }
            return _docIndex;
        }
    };

    var debounceSaveDocIndex = _.debounce(function () {
        fs.writeFileSync(config.docIndexFilePath, JSON.stringify(_docIndex, null, '  '));
        docIndexUpdated = new Date().getTime();
    }, 800);

    var createWatcher = function () {
        return chokidar.watch(config.srcPath, {
            ignored: config.ignores
        });
    };

    /*@{{
     [ doc 项目监控处理程序 ]{_unbroken_doc_0e9af2478_}
     }}@*/
    taskDefs.doc = function () {
        var allTypeMap = {}, allTypes = [];

        var generateKey = function () {
            var docIndex = getDocIndex();

            docIndex.seq++;
            debounceSaveDocIndex();
            return '_' + config.projectKey + '_' + md5(Math.random()).substr(0, 8) + docIndex.seq.toString(36) + '_';
        };

        var fileQueue = {};

        /*@{{
         [ 隔时批量索引项目内容 ]{_unbroken_doc_0e5174551_}

         在 chokidar 获知文件更改的时候, 不是立即处理, 而是放在一个队列里, 隔时批量处理, 避免多次反复操作.

         }}@*/
        setInterval(function () {
            var docIndex;
            for (var path in fileQueue) {
                if (!docIndex) {
                    var docIndex = getDocIndex()
                }

                if (fs.existsSync(path)) {
                    var logic = fileQueue[path];

                    if (typeof logic.comment == 'string') {
                        logic.comment = config.commentSyntax[logic.comment];
                    }

                    if (!logic.comment) {
                        console.log('No comment syntax set for %s, process next file.', path);
                        continue;
                    }

                    var stat = fs.statSync(path);
                    //console.log('stat', stat, docIndex.files[path].atime);

                    // 使用 stat.atime 来检测文件是否需要重新索引
                    if (!docIndex.files || !docIndex.files[path] || stat.atime.getTime() > docIndex.files[path].atime) {
                        var fileInfo = docIndex.files[path] = docIndex.files[path] || {atime: stat.atime.getTime()};

                        var content = fs.readFileSync(path).toString();

                        var newContent = content.replace(rgxRawMarker, function (match, name) {
                            name = ' ' + _.trim(name) + ' ';
                            var key = generateKey();

                            return logic.comment.start + '@{{\n[' + name + ']{' + key + '}\n}}@' + logic.comment.end;
                        });

                        if (newContent != content) {
                            fs.writeFileSync(path, newContent);
                        }

                        newContent.replace(rgxExistingMarker, function (match, rank, name, key) {
                            docIndex.keys[key] = {
                                name: name,
                                path: path,
                                rank: rank
                            };
                            debounceSaveDocIndex();

                            console.log('existing - ', name, key, rank);
                        });

                        fileInfo.atime = new Date().getTime();
                        debounceSaveDocIndex();
                    }
                }
            }
            fileQueue = {};
        }, 200);

        /*@{{
         [ 加入批处理队列 ]{_unbroken_doc_da5379fc3_}
         }}@*/
        var processFile = function (path, extname) {
            path = path.split('\\').join('/');
            var logic = config.fileTypes[extname.substr(1)];
            if (logic) {
                fileQueue[path] = logic;
            }
        };

        /*@{{
         [ 监视文件更改 ]{_unbroken_doc_d5b774c32_}
         }}@*/
        var watcher = createWatcher()
            .on('add', function (path) {
                // 获取所有文件类型
                var extname = npath.extname(path);
                allTypeMap[extname] = 1;

                processFile(path, extname);
                //console.log(path);
            })
            .on('change', function (path) {
                var extname = npath.extname(path);

                processFile(path, extname);
            })
            .on('ready', function () {
                // 输出文件类型列表
                var allTypes = _.keys(allTypeMap);

                console.log('all types detected : %s', allTypes.map(function (type) {
                    return JSON.stringify(type);
                }).join());
            });
    };


    var validators = {
        /*@{{
         [ 校对cache中的文件路径 ]{_unbroken_doc_236ad77f4_}
         }}@*/
        validateFiles: function (files, docIndex) {
            var newFiles = {};
            for (var path in files) {
                if (!fs.existsSync(path)) {
                    console.log('path %s does not exist anymore, removed.', path);
                } else {
                    newFiles[path] = files[path];
                }
            }
            docIndex.files = newFiles;
            debounceSaveDocIndex();
        },
        /*@{{
         [ 校对cache中的标记keys ]{_unbroken_doc_4fb26dc65_}
         }}@*/
        validateKeys: function (keys, docIndex) {
            var tmpKeys = {};
            var watcher = createWatcher()
                .on('add', function (path) {
                    path = path.split('\\').join('/');
                    var content = fs.readFileSync(path).toString();

                    content.replace(rgxExistingMarker, function (match, rank, name, key) {
                        tmpKeys[key] = {
                            name: name,
                            path: path,
                            rank: rank
                        };

                        console.log('existing - ', name, key, rank);
                    });
                })
                .on('ready', function () {
                    var missingKeys = {}, keysNotAdded = {};

                    // 检测在index文件中定义, 但在项目内容中未找到的标记.
                    // 做警示提醒, 不做自动操作
                    _.each(tmpKeys, function (content, key) {
                        if (!keys[key]) {
                            keys[key] = content;

                            console.log('New key added %s (%s) from %s.', key, content.name, content.path);
                            debounceSaveDocIndex();
                        }
                    });

                    // 检测在项目内容中找到, 但没在index文件中定义的标记.
                    // 如果有, 则自动添加到index 文件
                    _.each(keys, function (content, key) {
                        if (!tmpKeys[key]) {
                            missingKeys[key] = content;
                            console.log('WARNING: %s (%s) from %s is missing.', key, content.name, content.path);
                        }
                    });

                    watcher.close();
                });
        }
    };

    /*@{{
     [ validate 校对任务 ]{_unbroken_doc_7f7ba06d6_}
     }}@*/
    taskDefs.validate = function () {

        if (fs.existsSync(config.docIndexFilePath)) {

            var docIndex = getDocIndex();

            validators.validateFiles(docIndex.files, docIndex);

            validators.validateKeys(docIndex.keys, docIndex);

            // in future, validate backlinks? content? references?
        } else {
            console.log('Doc index文件还没有生成, 请先运行: gulp doc');
        }
    };

    module.exports = {
        /*@{{
         [ unbroken-doc 初始化 ]{_unbroken_doc_c067c8957_}
         }}@*/
        init: function (projectKey, configOrFunc) {
            if (!projectKey) {
                throw Error('You should specify a proper project key as it is the key element of your markers.' +
                '\n on .init() method.');
            }
            config.projectKey = projectKey;

            if (typeof configOrFunc == 'function') {
                config = configOrFunc(config);
            } else if (configOrFunc) {
                _.extend(config, configOrFunc);
            }

            this.applyConfig();
        },

        applyConfig: function () {
            config.docCacheFolderPath += '/';
            config.projectKey = config.projectKey.replace(/\W+/g, '_');
            config.ignores = config.ignores.concat(config.addIgnores);
            config.docIndexFilePath = config.docCacheFolderPath + 'unbroken-doc-index.json';

            ensurePath(config.docCacheFolderPath);
        },
        tasks: taskDefs
    }
})();