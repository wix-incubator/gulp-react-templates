[![NPM version][npm-image]][npm-url]

# gulp-react-templates

> Build react-templates

## Installation

Install package with NPM and add it to your development dependencies:

`npm install --save-dev gulp-react-templates`

## Usage

```javascript
var gulp = require('gulp');
var rt = require('gulp-react-templates');

gulp.task('rt', function() {
    gulp.src('src/**/*.rt')
        .pipe(rt({modules: 'amd'}))
        .pipe(gulp.dest('src'));
});
```

## Options

- `modules`

	Select modules system (amd|commonjs|none).

See more [here](https://github.com/wix/react-templates/blob/gh-pages/docs/cli.md)

[npm-image]: https://img.shields.io/npm/v/gulp-react-templates.svg?style=flat-square
[npm-url]: https://npmjs.org/package/gulp-react-templates