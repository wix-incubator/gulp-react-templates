'use strict';
// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var rt = require('react-templates');
var PluginError = gutil.PluginError;
//var applySourceMap = require('vinyl-sourcemaps-apply');
var path = require('path');
var merge = require('merge');

// Consts
var PLUGIN_NAME = 'gulp-react-templates';

function prefixStream(prefixText) {
    var stream = through();
    stream.write(prefixText);

//    var reactTemplates = require('react-templates');
//    var conf = grunt.config.get('reactTemplates');
////            console.log(conf);
//    var src = conf.src || ['packages/*/src/main/**/*.rt'];
//    var glob = require('glob');
////        var files = glob.sync(src, {cwd: process.cwd()});
//
//    var files = [];
//    src.forEach(function (s) {
//        files = files.concat(glob.sync(s, {cwd: process.cwd()}));
//    });
//
////            console.log(files);
//
////            options._ = this.data.src; // set positional arguments
//    conf._ = files;
//    var ret = reactTemplates.executeOptions(conf);
//    return ret === 0;

    return stream;
}

module.exports = function (opt) {
    function replaceExtension(filePath) {
        return filePath + '.js';
    }

    function transform(file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }
        if (file.isStream()) {
            return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        //console.log('rt ' + file.path);

        var data;
        var str = file.contents.toString('utf8');
        var dest = replaceExtension(file.path);

        var options = merge({
            filename: file.path,
            sourceFiles: [file.relative],
            generatedFile: replaceExtension(file.relative)
        }, opt);

        try {
            data = rt.convertTemplateToReact(str, options);
        } catch (err) {
            return cb(new PluginError(PLUGIN_NAME, err));
        }

        file.contents = new Buffer(data);

        file.path = dest;
        cb(null, file);
    }

    return through.obj(transform);
};