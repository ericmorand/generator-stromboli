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
        validate: function(input) {
          return input.length > 0;
        },
        store: true
      },
      {
        type: 'input',
        name: 'componentDescription',
        message: 'Description of the component'
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
    var componentRoot = this.config.get('componentRoot');
    var componentManifest = this.config.get('componentManifest');
    var testComponentRoot = this.config.get('testComponentRoot');
    var testComponentManifest = this.config.get('testComponentManifest');

    var data = {
      componentName: this.props.componentName,
      componentDescription: this.props.componentDescription,
      componentVersion: '0.1.0',
      componentAuthors: this.props.componentAuthor,
      componentCleanName: getSlug(this.props.componentName, '--'),
    };

    var that = this;
    var extensions = ['twig', 'js', 'scss'];

    // src
    this.fs.copyTpl(
      that.templatePath('src', 'manifest.json'),
      that.destinationPath(componentRoot, data.componentName, componentManifest),
      data
    );

    extensions.forEach(function (ext) {
      that.fs.copyTpl(
        that.templatePath('src', `index.${ext}`),
        that.destinationPath(componentRoot, data.componentName, `index.${ext}`),
        data
      );
    });

    // test
    that.fs.copyTpl(
      that.templatePath('test', 'fixtures/index.js'),
      that.destinationPath(testComponentRoot, data.componentName, 'fixtures/index.js'),
      data
    );

    that.fs.copyTpl(
      that.templatePath('test', 'manifest.json'),
      that.destinationPath(testComponentRoot, data.componentName, testComponentManifest),
      data
    );

    extensions.forEach(function (ext) {
      that.fs.copyTpl(
        that.templatePath('test', 'index.' + ext),
        that.destinationPath(testComponentRoot, data.componentName, 'index.' + ext),
        data
      );
    });

    that.fs.copyTpl(
      that.templatePath('test', 'index.twig.data.js'),
      that.destinationPath(testComponentRoot, data.componentName, 'index.twig.data.js'),
      data
    );
  }
});
