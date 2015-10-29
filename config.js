/*@{{
@[ 配置文件 ]{_unbroken_doc_e8ecfc779_}
}}@*/
module.exports = {
    "projectKey": "default",
    commentSyntax: {
        none: {start: '', end: ''},
        xml: {start: '<!--', end: '-->'},
        java: {start: '/*', end: '*/'}
    },
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
    srcPath: '.',
    docCacheFolderPath: './.doc_cache/',
    ignores: [
        /[\/\\]\./,
        /^\../,
        /([\/\\]|^)node_modules[\/\\]/,
        /([\/\\]|^)bower_modules[\/\\]/,
        /([\/\\]|^)vendor[\/\\]/,
        /([\/\\]|^)build[\/\\]/,
        /\.(mp4|avi|mkv|rm|rmvb|mp3|wav|xls|doc|xlsx|docx|class|png|jpg|gif|rar|eot|svg|ttf|woff|woff2|swf|db|jar|iml|jpeg)$/i,
    ],
    addIgnores: [

    ]
};