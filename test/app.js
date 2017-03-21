'use strict';
let path = require('path');
let assert = require('yeoman-assert');
let helpers = require('yeoman-test');

describe('generator-stromboli:app', function () {
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({someAnswer: true})
      .toPromise();
  });

  it('creates files', function () {
    assert.file([
      'build.js',
      'config/plugin/javascript.js',
      'config/plugin/sass.js',
      'config/plugin/twig.js',
      'config/build.js',
      'config/styleguide.js',
      'config/test.js',
      'lib/components-builder.js',
      'lib/styleguide-builder.js',
      'lib/write.js',
      'src/README.md',
      'styleguide',
      '.editorconfig',
      '.gitignore',
      'build.js',
      'index.js',
      'package.json',
      'README.md'
    ]);
  });
});
