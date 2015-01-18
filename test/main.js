'use strict';
var rt = require('../');
var should = require('should');
var reactTemplates = require('react-templates/src/reactTemplates');
var gutil = require('gulp-util');
//var fs = require('fs');
var path = require('path');
//var sourcemaps = require('gulp-sourcemaps');
//var stream = require('stream');
require('mocha');

var createFile = function (filepath, contents) {
    var base = path.dirname(filepath);
    return new gutil.File({
        path: filepath,
        base: base,
        cwd: path.dirname(base),
        contents: contents
    });
};

describe('gulp-react-templates', function () {
    describe('rt()', function () {
        before(function () {
            this.testData = function (expected, newPath, done) {
                console.log('' + expected + ' ' + newPath);

                var newPaths = [newPath],
                    expectedSourceMap;

                if (expected.v3SourceMap) {
                    expectedSourceMap = JSON.parse(expected.v3SourceMap);
                    expected = [expected.js];
                } else {
                    expected = [expected];
                }

                return function (newFile) {
                    this.expected = expected.shift();
                    this.newPath = newPaths.shift();

                    should.exist(newFile);
                    should.exist(newFile.path);
                    should.exist(newFile.relative);
                    should.exist(newFile.contents);
                    newFile.path.should.equal(this.newPath);
                    newFile.relative.should.equal(path.basename(this.newPath));
                    String(newFile.contents).should.equal(this.expected);

                    if (expectedSourceMap) {
                        // check whether the sources from the coffee have been
                        // applied to the files source map
                        newFile.sourceMap.sources
                            .should.containDeep(expectedSourceMap.sources);
                    }

                    if (done && !expected.length) {
                        done.call(this);
                    }
                };
            };
        });

        it('should concat two files', function (done) {
            var filepath = path.resolve(__dirname, '../fixtures/a.rt');
            var contents = new Buffer('<div>Hello</div>');
            var opts = {modules: 'commonjs'};
            var expected = reactTemplates.convertTemplateToReact(String(contents), opts);

            rt(opts)
                .on('error', done)
                .on('data', this.testData(expected, path.resolve(__dirname, '../fixtures/a.rt.js'), done))
                .write(createFile(filepath, contents));
        });

        it('should emit errors correctly', function (done) {
            var filepath = path.resolve(__dirname, '../fixtures/a.rt');
            var contents = new Buffer('<div /><div />');

            rt({bare: true})
                .on('error', function (err) {
                    //console.log('' + err);
                    err.message.should.equal('Document should have no more than a single root element');
                    done();
                })
                .on('data', function (newFile) {
                    throw new Error('no file should have been emitted!');
                })
                .write(createFile(filepath, contents));
        });
    });
});
