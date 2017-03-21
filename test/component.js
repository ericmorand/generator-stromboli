'use strict';
let path = require('path');
let assert = require('yeoman-assert');
let helpers = require('yeoman-test');
let fs = require('fs-extra');

describe('generator-stromboli:component', function () {
  let files = [
    'test/default/index.js',
    'test/default/index.scss',
    'test/default/index.twig',
    'test/default/index.twig.data.js',
    'test/default/test.json',
    'test/edge-case/index.js',
    'test/edge-case/index.scss',
    'test/edge-case/index.twig',
    'test/edge-case/index.twig.data.js',
    'test/edge-case/test.json',
    'src/component.json',
    'src/index.js',
    'src/index.scss',
    'src/index.twig'
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

