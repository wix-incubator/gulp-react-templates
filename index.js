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