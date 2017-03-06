'use strict';
let path = require('path');
let assert = require('yeoman-assert');
let helpers = require('yeoman-test');
let fs = require('fs-extra');

describe('generator-stromboli:component', function () {
  let files = [
    'component.json',
    'demo.data.js',
    'demo.js',
    'demo.scss',
    'demo.twig',
    'index.js',
    'index.scss',
    'index.twig'
  ];

  let prompts = {
    componentName: 'lorem-ipsum/dolor',
    componentDescription: 'Lorem ipsum dolor sit amet',
    componentAuthor: 'Lorem IPSUM'
  };

  it('creates files', function () {
    return helpers.run(path.join(__dirname, '../generators/component'))
      .inTmpDir(function (dir) {
        let componentDir = path.join(dir, 'lorem');

        fs.mkdirpSync(componentDir);

        this.cd(componentDir);
      })
      .withPrompts(prompts)
      .toPromise()
      .then(function(dir) {
        assert.file(files);

        files.forEach(function (file) {
          let wanted = fs.readFileSync(path.resolve(path.join(__dirname, 'component/wanted/', file)), 'utf8');

          assert.fileContent(file, wanted.toString());
        });
      });
  });
});

