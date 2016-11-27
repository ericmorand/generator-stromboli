'use strict';

var yeoman = require('yeoman-generator');
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
        default: path.basename(process.cwd())
      },
      {
        type: 'input',
        name: 'componentDescription',
        message: 'Description of the component',
        default: path.basename(process.cwd())
      },
      {
        type: 'input',
        name: 'componentAuthor',
        message: 'Author of the component',
        store: true
      },
      {
        type: 'input',
        name: 'demoComponentRoot',
        message: 'Directory where the demo component is located',
        default: 'src/demo',
        store: true
      }
    ];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    var demoComponentRoot = this.config.get('demo');
    var demoComponentRootRelativePath = path.relative(process.cwd(), demoComponentRoot);

    var data = {
      componentName: this.props.componentName,
      componentDescription: this.props.componentDescription,
      componentVersion: '0.1.0',
      componentAuthors: this.props.componentAuthor,
      componentCleanName: getSlug(this.props.componentName),
      demoComponentRootRelativePath: demoComponentRootRelativePath
    };

    this.destinationRoot('.');

    this.fs.copyTpl(
      this.templatePath('component.json'),
      this.destinationPath('component.json'),
      data
    );

    this.fs.copyTpl(
      this.templatePath('demo.data.js'),
      this.destinationPath('demo.data.js'),
      data
    );

    var that = this;

    ['twig', 'js', 'scss'].forEach(function (ext) {
      that.fs.copyTpl(
        that.templatePath('demo.' + ext),
        that.destinationPath('demo.' + ext),
        data
      );
    });

    ['twig', 'js', 'scss'].forEach(function (ext) {
      that.fs.copyTpl(
        that.templatePath('index.' + ext),
        that.destinationPath('index.' + ext),
        data
      );
    });
  }
});
