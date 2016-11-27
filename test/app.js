'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-stromboli:app', function () {
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/app'))
      .withPrompts({someAnswer: true})
      .toPromise();
  });

  it('creates files', function () {
    assert.file([
      'build.js',
      'config.js',
      '.editorconfig',
      '.gitignore',
      'index.js',
      'package.json',
      'README.md',
      '.yo-rc.json'
    ]);

    assert.jsonFileContent('.yo-rc.json', {
      'generator-stromboli': {
        demo: path.join(process.cwd(), 'src/demo')
      }
    });
  });
});
