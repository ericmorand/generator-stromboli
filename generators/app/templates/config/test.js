const merge = require('deepmerge');

let localConfig;

try {
  localConfig = require('./test.local');
}
catch (err) {
  localConfig = {};
}

let jsConfig = require('./plugin/javascript');

jsConfig.debug = true;

module.exports = merge({
  componentRoot: '<%= testComponentRoot %>',
  componentManifest: '<%= testComponentManifest %>',
  plugins: {
    css: {
      module: require('stromboli-plugin-sass'),
      config: merge({}, require('./plugin/sass'), {
        sourceMap: true,
        sourceComments: true,
        sourceMapEmbed: true
      }),
      entry: 'index.scss'
    },
    html: {
      module: require('stromboli-plugin-twig'),
      entry: 'index.twig',
      config: merge({}, require('./plugin/twig'))
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
  watcher: {
    debounceDelay: 100
  }
}, localConfig);
