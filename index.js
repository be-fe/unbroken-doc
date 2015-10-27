var chokidar = require('chokidar');
var gulp = require('gulp');
var npath = require('path');
var fs = require('fs');
var md5 = require('md5');
var _ = require('lodash');

var config = require('./config');

(function () {
    var taskDefs = {};

    var rgxRawMarker = new RegExp(
            '@@\\{'
            + '([^{}]*)'
            + '\\}',
            'g'
        ),
        rgxExistingMarker = new RegExp(
            '@\\{\\{'
            + '\\s*'
            + '(?:#(\\d+))?'
            + '\\s*'
            + '\\[([^\\[\\]]*)\\]'
            + '\\{([^{}]+)\\}'
            + '[^]*?'
            + '\\}\\}@',
            'g'
        );

    var ensurePath = function(path) {
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

    taskDefs.doc = function () {
        var allTypeMap = {}, allTypes = [];

        var generateKey = function () {
            var docIndex = getDocIndex();

            docIndex.seq++;
            debounceSaveDocIndex();
            return '_' + config.projectKey + '_' + md5(Math.random()).substr(0, 8) + docIndex.seq.toString(36) + '_';
        };

        var fileQueue = {};

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
                    if (!docIndex.files[path] || stat.atime.getTime() > docIndex.files[path].atime) {
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
        }, 800);

        var processFile = function (path, extname) {
            path = path.split('\\').join('/');
            var logic = config.fileTypes[extname.substr(1)];
            if (logic) {
                fileQueue[path] = logic;
            }
        };

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
        /**
         * exists or not?
         * @param files
         * @param docIndex
         */
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
        /**
         * exists or not? warnings instead of direct removals
         * @param keys
         */
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
                    _.each(tmpKeys, function(content, key) {
                        if (!keys[key]) {
                            keys[key] = content;

                            console.log('New key added %s (%s) from %s.', key, content.name, content.path);
                            debounceSaveDocIndex();
                        }
                    });

                    // 检测在项目内容中找到, 但没在index文件中定义的标记.
                    // 如果有, 则自动添加到index 文件
                    _.each(keys, function(content, key){
                        if (!tmpKeys[key]) {
                            missingKeys[key] = content;
                            console.log('WARNING: %s (%s) from %s is missing.', key, content.name, content.path);
                        }
                    });

                    watcher.close();
                });
        }
    };

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
        setup: function(projectKey, configOrFunc) {
            this.init(projectKey, configOrFunc);

            gulp.task('doc', taskDefs.doc);
            gulp.task('validate', taskDefs.validate);
        },
        init: function(projectKey, configOrFunc) {
            config.projectKey = projectKey || 'default';

            if (typeof configOrFunc == 'function') {
                config = configOrFunc(config);
            } else if (configOrFunc) {
                _.extend(config, configOrFunc);
            }

            this.applyConfig();
        },
        applyConfig: function() {
            config.docCacheFolderPath += '/';
            config.projectKey = config.projectKey.replace(/\W+/g, '_');
            config.ignores = config.ignores.concat(config.addIgnores);
            config.docIndexFilePath = config.docCacheFolderPath + 'unbroken-doc-index.json';

            ensurePath(config.docCacheFolderPath);
        },
        doc: taskDefs.doc,
        validate: taskDefs.validate
    }
})();