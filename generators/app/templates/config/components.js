const merge = require('merge');

module.exports = {
  componentRoot: 'src/components',
  componentManifest: 'component.json',
  plugins: {
    'demo/css': {
      module: require('stromboli-plugin-sass'),
      config: merge.recursive({}, require('./plugin/sass'), {
        sourceMap: true,
        sourceComments: true,
        sourceMapEmbed: true
      }),
      entry: 'demo.scss'
    },
    'demo/index': {
      module: require('stromboli-plugin-twig'),
      entry: 'demo.twig',
      config: merge.recursive({}, require('./plugin/twig'))
    },
    'demo/js': {
      module: require('stromboli-plugin-javascript'),
      entry: 'demo.js',
      config: merge.recursive({}, require('./plugin/javascript'), {
        debug: true
      })
    }
  },
  browserSync: {
    port: 3002,
    open: false,
    notify: true,
    server: 'www',
    logLevel: 'silent',
    ui: {
      port: 3003
    }
  },
  chokidar: {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100
    }
  }
};
