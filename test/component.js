'use strict';
let path = require('path');
let assert = require('yeoman-assert');
let helpers = require('yeoman-test');
let fs = require('fs-extra');

describe('generator-stromboli:component', function () {
  let files = [
    'demo/demo.json',
    'demo/index.data.js',
    'demo/index.js',
    'demo/index.scss',
    'demo/index.twig',
    'component.json',
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

