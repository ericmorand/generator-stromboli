'use strict';
var yeoman = require('yeoman-generator-ahead');
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
      },
      {
        type: 'input',
        name: 'projectAuthor',
        message: 'Author of the project',
        store: true
      }
    ];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  configuring: function () {
    this.fs.copy(this.templatePath('build.js'), this.destinationPath('build.js'));
    this.fs.copy(this.templatePath('index.js'), this.destinationPath('index.js'));
    this.fs.copy(this.templatePath('editorconfig.txt'), this.destinationPath('.editorconfig'));
    this.fs.copy(this.templatePath('gitignore.txt'), this.destinationPath('.gitignore'));
    this.fs.copy(this.templatePath('config/'), this.destinationPath('config/'));
    this.fs.copy(this.templatePath('lib/'), this.destinationPath('lib/'));
    this.fs.copy(this.templatePath('src/'), this.destinationPath('src/'));
  },

  writing: function () {
    var data = {
      projectName: this.props.projectName,
      projectDescription: this.props.projectDescription,
      projectVersion: '0.1.0',
      projectAuthor: this.props.projectAuthor
    };

    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      data
    );

    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('README.md'),
      data
    );
  },

  install: function () {
    this.installDependencies({
      npm: true,
      bower: false
    });
  },

  last: function () {
    this.config.set('demo', 'src/components/demo');
    this.config.save();

    this.log(yosay(
      'Done! Launch ' + chalk.red('npm start') + ' and code!'
    ));
  }
});
