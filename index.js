'use strict';
// through2 is a thin wrapper around node transform streams
var through = require('through2');
var gutil = require('gulp-util');
var rt = require('react-templates');
var PluginError = gutil.PluginError;
var path = require('path');
var merge = require('merge');

// Consts
var PLUGIN_NAME = 'gulp-react-templates';

function normalizeName(name) {
    return name.replace(/-/g, '_');
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

        var data;
        var filePath = file.path;
        var str = file.contents.toString('utf8');
        var dest = replaceExtension(file.path);

        var options = merge({
            filename: file.path,
            sourceFiles: [file.relative],
            generatedFile: replaceExtension(file.relative)
        }, opt);

        var shouldAddName = options.modules === 'none' && !options.name;
        if (shouldAddName) {
            options.name = normalizeName(path.basename(filePath, path.extname(filePath))) + 'RT';
        }

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
