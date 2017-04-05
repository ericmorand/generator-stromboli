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
      'Welcome to the ' + chalk.red('Stromboli component') + ' generator!'
    ));

    var prompts = [
      {
        type: 'input',
        name: 'componentName',
        message: 'Name of the component',
        default: path.basename(this.contextRoot)
      },
      {
        type: 'input',
        name: 'componentDescription',
        message: 'Description of the component',
        default: path.basename(this.contextRoot)
      },
      {
        type: 'input',
        name: 'componentAuthor',
        message: 'Author of the component',
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
      componentName: this.props.componentName,
      componentDescription: this.props.componentDescription,
      componentVersion: '0.1.0',
      componentAuthors: this.props.componentAuthor,
      componentCleanName: getSlug(this.props.componentName, '--')
    };

    var that = this;
    var extensions = ['twig', 'js', 'scss'];

    // src
    this.fs.copyTpl(
      that.templatePath('src/component.json'),
      that.destinationPath('src/component.json'),
      data
    );

    extensions.forEach(function (ext) {
      that.fs.copyTpl(
        that.templatePath('src/index.' + ext),
        that.destinationPath('src/index.' + ext),
        data
      );
    });

    // test
    ['default', 'test-case'].forEach(function(testName) {
      if (testName === 'test-case') {
        that.fs.copyTpl(
          that.templatePath('test/' + testName + '/test.json'),
          that.destinationPath('test/' + testName + '/test.json'),
          data
        );

        that.fs.copyTpl(
          that.templatePath('test/' + testName + '/fixtures'),
          that.destinationPath('test/' + testName + '/fixtures'),
          data
        );
      }

      that.fs.copyTpl(
        that.templatePath('test/' + testName + '/index.twig.data.js'),
        that.destinationPath('test/' + testName + '/index.twig.data.js'),
        data
      );

      extensions.forEach(function (ext) {
        that.fs.copyTpl(
          that.templatePath('test/' + testName + '/index.' + ext),
          that.destinationPath('test/' + testName + '/index.' + ext),
          data
        );
      });
    });
  }
});
