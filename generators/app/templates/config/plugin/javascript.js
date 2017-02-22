module.exports = {
  transform: [
    ['stringify', {
      appliesTo: {
        includeExtensions: ['html']
      }
    }]
  ],
  plugin: [
    ['tsify']
  ]
};
