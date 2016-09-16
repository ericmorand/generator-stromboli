'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.red('Stromboli') + ' generator!'
    ));

    var prompts = [
      {
        type: 'input',
        name: 'projectName',
        message: 'Name of the project',
        default: path.basename(process.cwd())
      },
      {
        type: 'input',
        name: 'projectDescription',
        message: 'Description of the project',
        default: path.basename(process.cwd())
      }
    ];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  configuring: function () {
    this.fs.copy(this.templatePath('index.js'), this.destinationPath('index.js'));
    this.fs.copy(this.templatePath('.editorconfig'), this.destinationPath('.editorconfig'));
    this.fs.copy(this.templatePath('.gitignore'), this.destinationPath('.gitignore'));
    this.fs.copy(this.templatePath('src/'), this.destinationPath('src/'));
  },

  writing: function () {
    this.fs.copyTpl(
      this.templatePath('config.js'),
      this.destinationPath('config.js'),
      {
        projectName: this.props.projectName,
        projectDescription: this.props.projectDescription,
        projectVersion: '0.1.0',
        projectAuthor: 'Eric MORAND'
      }
    );

    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      {
        projectName: this.props.projectName,
        projectDescription: this.props.projectDescription,
        projectVersion: '0.1.0',
        projectAuthor: 'Eric MORAND'
      }
    );

    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('README.md'),
      {
        projectName: this.props.projectName,
        projectDescription: this.props.projectDescription
      }
    );
  },

  install: function () {
    this.installDependencies({
      npm: true,
      bower: false
    });
  },

  last: function () {
    this.log(yosay(
      'Done! Launch ' + chalk.red('npm start') + ' and code!'
    ));
  }
});
