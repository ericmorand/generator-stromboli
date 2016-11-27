'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');
var fs = require('fs-extra');

describe('generator-stromboli:component', function () {
  var files = [
    'component.json',
    'demo.data.js',
    'demo.js',
    'demo.scss',
    'demo.twig',
    'index.js',
    'index.scss',
    'index.twig'
  ];

  var prompts = {
    componentName: 'lorem/ipsum',
    componentDescription: 'Lorem ipsum dolor sit amet',
    componentAuthor: 'Lorem IPSUM'
  };

  it('creates files', function () {
    return helpers.run(path.join(__dirname, '../generators/component'))
      .inTmpDir(function (dir) {
        var componentDir = path.join(dir, 'lorem');

        fs.mkdirpSync(componentDir);

        this.cd(componentDir);

        this.localConfig = {
          demo: path.join(dir, 'demo')
        };
      })
      .withPrompts(prompts)
      .toPromise()
      .then(function(dir) {
        assert.file(files);

        files.forEach(function (file) {
          let expected = fs.readFileSync(path.resolve(path.join(__dirname, 'component/root/expected/', file)), 'utf8');

          assert.fileContent(file, expected.toString());
        });
      });
  });

  it('creates files in subdirectory', function () {
    return helpers.run(path.join(__dirname, '../generators/component'))
      .inTmpDir(function (dir) {
        var componentDir = path.join(dir, 'lorem/ipsum');

        fs.mkdirpSync(componentDir);

        this.cd(componentDir);

        this.localConfig = {
          demo: path.join(dir, 'demo')
        };
      })
      .withPrompts(prompts)
      .toPromise()
      .then(function (dir) {
        assert.file(files);

        files.forEach(function (file) {
          let expected = fs.readFileSync(path.resolve(path.join(__dirname, 'component/subdirectory/expected/', file)), 'utf8');

          assert.fileContent(file, expected.toString());
        });
      });
  });
});

