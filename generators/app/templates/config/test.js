const merge = require('merge');

let localConfig;

try {
  localConfig = require('./test.local');
}
catch (err) {
  localConfig = {};
}

let jsConfig = require('./plugin/javascript');

jsConfig.debug = true;

module.exports = merge.recursive({
  componentRoot: 'test',
  componentManifest: 'test.json',
  plugins: {
    css: {
      module: require('stromboli-plugin-sass'),
      config: merge.recursive({}, require('./plugin/sass'), {
        sourceMap: true,
        sourceComments: true,
        sourceMapEmbed: true
      }),
      entry: 'index.scss'
    },
    html: {
      module: require('stromboli-plugin-twig'),
      entry: 'index.twig',
      config: merge.recursive({}, require('./plugin/twig'))
    },
    js: {
      module: require('stromboli-plugin-javascript'),
      entry: 'index.js',
      config: jsConfig
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
}, localConfig);
