'use strict';

var yeoman = require('yeoman-generator-ahead');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var getSlug = require('speakingurl');
var fs = require('fs-extra');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.red('Stromboli test-case') + ' generator!'
    ));

    var prompts = [
      {
        type: 'input',
        name: 'componentName',
        message: 'Name of the component',
        validate: function (input) {
          return input.length > 0;
        },
        store: true
      },
      {
        type: 'input',
        name: 'testCaseName',
        message: 'Name of the test-case',
        validate: function (input) {
          return input.length > 0;
        }
      },
      {
        type: 'input',
        name: 'testCaseDescription',
        message: 'Description of the test-case'
      },
      {
        type: 'input',
        name: 'testCaseAuthor',
        message: 'Author of the test-case',
        store: true
      }
    ];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    var componentRoot = this.config.get('componentRoot');
    var componentManifest = this.config.get('componentManifest');
    var testComponentRoot = this.config.get('testComponentRoot');
    var testComponentManifest = this.config.get('testComponentManifest');

    var data = {
      testCaseName: [
        this.props.componentName,
        this.props.testCaseName
      ].join('/'),
      testCaseDescription: this.props.testCaseDescription,
      testCaseVersion: '0.1.0',
      testCaseAuthors: this.props.testCaseAuthor,
      testCaseCleanName: getSlug([
        this.props.componentName,
        this.props.testCaseName
      ].join('/'), '--')
    };

    var that = this;
    var extensions = ['twig', 'js', 'scss'];

    that.fs.copyTpl(
      that.templatePath('manifest.json'),
      that.destinationPath(testComponentRoot, data.testCaseName, testComponentManifest),
      data
    );

    extensions.forEach(function (ext) {
      that.fs.copyTpl(
        that.templatePath('index.' + ext),
        that.destinationPath(testComponentRoot, data.testCaseName, 'index.' + ext),
        data
      );
    });

    that.fs.copyTpl(
      that.templatePath('index.twig.data.js'),
      that.destinationPath(testComponentRoot, data.testCaseName, 'index.twig.data.js'),
      data
    );
  }
});
