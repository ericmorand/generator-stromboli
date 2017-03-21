const merge = require('merge');
const Promise = require('promise');
const TwigPlugin = require('stromboli-plugin-twig');

class MyTwigPlugin extends TwigPlugin {
  getData(template) {
    let result = {
      files: [],
      data: this.config.data
    };

    return Promise.resolve(result);
  }
}

module.exports = {
  componentRoot: 'styleguide',
  componentManifest: 'component.json',
  plugins: {
    js: {
      module: require('stromboli-plugin-javascript'),
      entry: 'index.js',
      config: {
        transform: [
          ['stringify', {
            appliesTo: {
              includeExtensions: ['html']
            }
          }]
        ]
      }
    },
    index: {
      module: MyTwigPlugin,
      entry: 'index.twig',
      config: {}
    },
    css: {
      module: require('stromboli-plugin-sass'),
      entry: 'index.scss',
      config: {
        precision: 8
      }
    }
  },
  chokidar: {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100
    }
  },
  browserSync: {
    port: 3000,
    open: false,
    notify: false,
    server: 'www/styleguide',
    logPrefix: 'Styleguide',
    ui: {
      port: 3001
    }
  }
};
