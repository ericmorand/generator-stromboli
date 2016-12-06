module.exports = {
  componentManifest: 'component.json',
  plugins: {
    javascript: {
      module: require('stromboli-plugin-javascript'),
      config: {
        transform: [
          ['stringify', {
            appliesTo: {
              includeExtensions: ['html']
            }
          }],
          ['aliasify', {
            aliases: {
              'vue': 'vue/dist/vue'
            }
          }]
        ]
      }
    },
    twig: {
      module: require('stromboli-plugin-twig')
    },
    sass: {
      module: require('stromboli-plugin-sass'),
      config: {
        precision: 8
      }
    }
  }
};