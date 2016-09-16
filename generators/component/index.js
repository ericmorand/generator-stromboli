'use strict';

var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');

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
        default: 'awesome/component'
      },
      {
        type: 'input',
        name: 'componentDescription',
        message: 'Description of the component',
        default: 'Such an awesome component'
      }
    ];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
      this.props.componentEntry = path.basename(props.componentName);
    }.bind(this));
  },

  writing: function () {
    var data = {
      componentName: this.props.componentName,
      componentVersion: '0.1.0',
      componentAuthors: 'Eric MORAND',
      componentEntry: this.props.componentEntry
    };

    this.destinationRoot(path.join('src', this.props.componentName));

    this.fs.copyTpl(
      this.templatePath('component.json'),
      this.destinationPath('component.json'),
      data
    );

    var that = this;

    ['hbs', 'js', 'scss'].forEach(function (ext) {
      that.fs.copyTpl(
        that.templatePath('demo.' + ext),
        that.destinationPath('demo.' + ext),
        data
      );
    });

    ['hbs', 'js', 'scss'].forEach(function (ext) {
      that.fs.copyTpl(
        that.templatePath('entry.' + ext),
        that.destinationPath(that.props.componentEntry + '.' + ext),
        data
      );
    });
  }
});
