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
        name: 'testCaseName',
        message: 'Name of the test-case',
        default: path.basename(this.contextRoot)
      },
      {
        type: 'input',
        name: 'testCaseDescription',
        message: 'Description of the test-case',
        default: path.basename(this.contextRoot)
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
    var data = {
      testCaseName: this.props.testCaseName,
      testCaseDescription: this.props.testCaseDescription,
      testCaseVersion: '0.1.0',
      testCaseAuthors: this.props.testCaseAuthor,
      testCaseCleanName: getSlug(this.props.testCaseName, '--')
    };

    var that = this;
    var extensions = ['twig', 'js', 'scss'];

    that.fs.copyTpl(
      that.templatePath('fixtures/index.js'),
      that.destinationPath('fixtures/index.js'),
      data
    );

    that.fs.copyTpl(
      that.templatePath('test.json'),
      that.destinationPath('test.json'),
      data
    );

    extensions.forEach(function (ext) {
      that.fs.copyTpl(
        that.templatePath('index.' + ext),
        that.destinationPath('index.' + ext),
        data
      );
    });

    that.fs.copyTpl(
      that.templatePath('index.twig.data.js'),
      that.destinationPath('index.twig.data.js'),
      data
    );
  }
});
