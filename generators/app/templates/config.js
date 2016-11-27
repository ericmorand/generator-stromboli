'use strict';

let merge = require('merge');

let common = {
  componentRoot: 'src',
  componentManifest: 'component.json',
  plugins: {
    javascript: {
      module: require('stromboli-plugin-javascript')
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

module.exports = {
  build: merge.recursive(true, common, {
    plugins: {
      javascript: {
        entry: 'index.js',
        config: {
          plugin: [
            function (bundle, opts) {
              return require('minifyify')(bundle, {map: false});
            }
          ]
        }
      },
      twig: {
        entry: 'index.twig'
      },
      sass: {
        config: {
          sourceMap: false,
          sourceComments: false
        },
        entry: 'index.scss'
      }
    }
  }),
  develop: merge.recursive(true, common, {
    plugins: {
      javascript: {
        entry: 'demo.js',
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
        entry: 'demo.twig'
      },
      sass: {
        config: {
          sourceMap: true,
          sourceComments: true
        },
        entry: 'demo.scss'
      }
    },
    browserSync: {
      port: 3000,
      open: false,
      notify: false
    },
    chokidar: {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100
      }
    }
  })
};
