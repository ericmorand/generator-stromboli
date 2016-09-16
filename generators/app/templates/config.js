module.exports = {
  projectName: '<%= projectName %>',
  projectVersion: '<%= projectVersion %>',
  projectDescription: '<%= projectDescription %>',
  plugins: {
    javascript: {
      module: require('stromboli-plugin-javascript'),
      entry: 'demo.js'
    },
    handlebars: {
      module: require('stromboli-plugin-handlebars'),
      entry: 'demo.hbs'
    },
    sass: {
      module: require('stromboli-plugin-sass'),
      config: {
        precision: 8,
        sourceMap: true,
        sourceComments: true
      },
      entry: 'demo.scss'
    }
  },
  browsersync: {}
};