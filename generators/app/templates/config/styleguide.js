const fs = require('fs');
const merge = require('merge');
const Promise = require('promise');
const TwigPlugin = require('stromboli-plugin-twig');

let localConfig;

try {
  localConfig = require('./styleguide.local');
}
catch (err) {
  localConfig = {};
}

class StyleguideTwigPlugin extends TwigPlugin {
  getData(file) {
    return Promise.resolve(this.config.data);
  }
}

module.exports = merge.recursive({
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
      module: StyleguideTwigPlugin,
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
}, localConfig);
