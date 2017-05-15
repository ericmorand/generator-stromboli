module.exports = {
  transform: [
    ['stringify', {
      appliesTo: {
        includeExtensions: ['html']
      }
    }],
    ['babelify', {
      presets: [require('babel-preset-es2015')]
    }]
  ],
  plugin: []
};
