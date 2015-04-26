/*eslint-env mocha*/
'use strict';
var rt = require('../');
var should = require('should');
var reactTemplates = require('react-templates');
var gutil = require('gulp-util');
var path = require('path');
var merge = require('merge');
require('mocha');

var fixtures = path.resolve(__dirname, './fixtures');

function createFile(filepath, contents) {
    var base = path.dirname(filepath);
    return new gutil.File({
        path: filepath,
        base: base,
        cwd: path.dirname(base),
        contents: contents
    });
}

describe('gulp-react-templates', function () {
    describe('rt()', function () {
        before(function () {
            this.testData = function (expected, newPath, done) {
                //console.log('' + expected + ' ' + newPath);

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
            var filepath = path.resolve(fixtures, 'a.rt');
            var contents = new Buffer('<div>Hello</div>');
            var opts = {modules: 'commonjs'};
            var expected = reactTemplates.convertTemplateToReact(String(contents), opts);

            rt(opts)
                .on('error', done)
                .on('data', this.testData(expected, path.resolve(fixtures, 'a.rt.js'), done))
                .write(createFile(filepath, contents));
        });

        it('should emit errors correctly', function (done) {
            var filepath = path.resolve(fixtures, 'a.rt');
            var contents = new Buffer('<div /><div />');

            rt({bare: true})
                .on('error', function (err) {
                    err.message.should.equal('Document should have no more than a single root element');
                    done();
                })
                .on('data', function (/*newFile*/) {
                    throw new Error('no file should have been emitted!');
                })
                .write(createFile(filepath, contents));
        });

        it('should correctly handle modules:none2', function (done) {
            var filepath = path.resolve(fixtures, 'err2.rt');
            var fs = require('fs');
            var contents = fs.readFileSync(filepath);
            //var contents = new Buffer('<div>Hello</div>');
            var opts = {modules: 'amd'};
            var expected = reactTemplates.convertTemplateToReact(String(contents),
                merge(opts, {name: 'bRT'}));

            rt(opts)
                .on('error', done)
                .on('data', this.testData(expected, path.resolve(fixtures, 'err2.rt.js'), done))
                .write(createFile(filepath, contents));
        });

        it('should correctly handle modules:none', function (done) {
            var filepath = path.resolve(fixtures, 'b.rt');
            var contents = new Buffer('<div>Hello</div>');
            var opts = {modules: 'none'};
            var expected = reactTemplates.convertTemplateToReact(String(contents),
                merge(opts, {name: 'bRT'}));

            rt(opts)
                .on('error', done)
                .on('data', this.testData(expected, path.resolve(fixtures, 'b.rt.js'), done))
                .write(createFile(filepath, contents));
        });
    });
});
