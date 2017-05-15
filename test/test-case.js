'use strict';
let path = require('path');
let assert = require('yeoman-assert');
let helpers = require('yeoman-test');
let fs = require('fs-extra');

describe('generator-stromboli:test-case', function () {
  let files = [
    'fixtures/index.js',
    'index.js',
    'index.scss',
    'index.twig',
    'index.twig.data.js',
    'test.json'
  ];

  let prompts = {
    testCaseName: 'dolor/sit-amet',
    testCaseDescription: 'Sit amet',
    testCaseAuthor: 'Lorem IPSUM'
  };

  it('creates files', function () {
    return helpers.run(path.join(__dirname, '../generators/test-case'))
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
          let wanted = fs.readFileSync(path.resolve(path.join(__dirname, 'test-case/wanted/', file)), 'utf8');

          assert.fileContent(file, wanted.toString());
        });
      });
  });
});

