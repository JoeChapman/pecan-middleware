'use strict';

var Bluebird = require('bluebird'),
    fs = Bluebird.promisifyAll(require('fs')),
    url = require('url'),
    pathUtil = require('path'),
    join = pathUtil.join,
    Pecan = require('pecan');

function Helper(src, path, compiler, next) {
    this.src = src;
    this.path = path;
    this.compiler = compiler;
    this.next = next;
}

Helper.prototype = {

    errorhandler: function errorhandler(err) {
        if (err && err.cause) {
            // a js file doesn't exist, we compile it.
            if ('ENOENT' === err.cause.code && pathUtil.extname(err.cause.path) === '.js') {
                return this.compiler.compile();
            }
        }
        this.next(err);
    },

    getStats: function getStats(path) {
        return fs.statAsync(path);
    },

    compareStats: function compareStats(jsPath, tmplStats) {
        return this.getStats(jsPath)
            .then(function (jsStats) {
                if (tmplStats.mtime > jsStats.mtime) {
                    // Source has changed, compile it
                    return this.compiler.compile();
                }
                this.next();
            }.bind(this))
            .catch(this.errorhandler.bind(this));
    }

};

module.exports = function middleware(src, options) {

    // default options
    options = options || {};
    src = src || options.src;

    // throw if src is not defined
    if (!src) {
        throw new Error('First argument must be the source path');
    }

    var dest = options.dest || src,
        ext = options.ext || '.jade',
        allow = options.allow || '/templates/';

    return function (req, res, next) {
        var path,
            paths,
            compiler,
            helper;

        if ('GET' !== req.method && 'HEAD' !== req.method) {
            return next();
        }

        path = url.parse(req.url).pathname;

        // if its not js or isn't a template, then don't to compile it
        if (!/\.js$/.test(path) || path.indexOf(allow) === -1) {
            next();
        } else {

            options.next = next;

            path = path.replace(allow, '');

            paths = {
                jsPath: join(dest, path),
                tmplPath: join(src, path.replace('.js', ext))
            };

            // create a new compiler with options
            compiler = new Pecan.create(paths, options);

            // create a helper class
            helper = new Helper(src, path, compiler, next);

            // Hang the request until the previous has been processed
            if (Pecan.queue[paths.tmplPath]) {
                return Pecan.queue[paths.tmplPath].on('end', next);
            }

            // Compile if there are differences between the source and the output
            helper.getStats(paths.tmplPath)
                .then(helper.compareStats.bind(helper, paths.jsPath))
                .catch(helper.errorhandler.bind(helper));

        }

    };
};
