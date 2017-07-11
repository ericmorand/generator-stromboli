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
      },
      {
        type: 'input',
        name: 'componentRoot',
        message: 'Root of the components',
        store: true,
        default: 'src'
      },
      {
        type: 'input',
        name: 'componentManifest',
        message: 'Name of the components manifests',
        store: true,
        default: 'component.json'
      },
      {
        type: 'input',
        name: 'testComponentRoot',
        message: 'Root of the test components',
        store: true,
        default: 'test'
      },
      {
        type: 'input',
        name: 'testComponentManifest',
        message: 'Name of the test components manifest',
        store: true,
        default: 'test.json'
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
    this.fs.copy(this.templatePath('config/plugin'), this.destinationPath('config/plugin'));
    this.fs.copy(this.templatePath('config/styleguide.js'), this.destinationPath('config/styleguide.js'));
    this.fs.copy(this.templatePath('lib/'), this.destinationPath('lib/'));
    this.fs.copy(this.templatePath('src/'), this.destinationPath(this.props.componentRoot));
    this.fs.copy(this.templatePath('styleguide/'), this.destinationPath('styleguide/'));
    this.fs.copy(this.templatePath('test/'), this.destinationPath(this.props.testComponentRoot));

    this.config.set('componentRoot', this.props.componentRoot);
    this.config.set('componentManifest', this.props.componentManifest);
    this.config.set('testComponentRoot', this.props.testComponentRoot);
    this.config.set('testComponentManifest', this.props.testComponentManifest);
  },

  writing: function () {
    var data = {
      projectName: this.props.projectName,
      projectDescription: this.props.projectDescription,
      projectVersion: '0.1.0',
      projectAuthor: this.props.projectAuthor,
      componentRoot: this.props.componentRoot,
      componentManifest: this.props.componentManifest,
      testComponentRoot: this.props.testComponentRoot,
      testComponentManifest: this.props.testComponentManifest
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

    // config
    this.fs.copyTpl(
      this.templatePath('config/test.js'),
      this.destinationPath('config/test.js'),
      data
    );

    // config
    this.fs.copyTpl(
      this.templatePath('config/build.js'),
      this.destinationPath('config/build.js'),
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
    this.log(yosay(
      'Done! Launch ' + chalk.red('npm start') + ' and code!'
    ));
  }
});
