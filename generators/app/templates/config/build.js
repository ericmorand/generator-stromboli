const merge = require('deepmerge');
const path = require('path');

let localConfig;

try {
  localConfig = require('./build.local');
}
catch (err) {
  localConfig = {};
}

let jsConfig = require('./plugin/javascript');

jsConfig.transform.push(['uglifyify', {
  global: true,
  compress: {
    drop_console: true
  }
}]);

jsConfig.plugin.push(['bundle-collapser/plugin']);

class TwigDepsPlugin {
  render(entry, output) {
    return new Promise(function (fulfill, reject) {
      const TwigDeps = require('twig-deps');

      let renderResult = {
        sourceDependencies: []
      };

      let depper = new TwigDeps();

      depper.on('data', function (dep) {
        renderResult.sourceDependencies.push(dep);
      });

      depper.on('error', function (err) {
        console.log('ERR', err);
      });

      depper.on('finish', function (dep) {
        fulfill(renderResult);
      });

      depper.end(entry);
    });
  }
}

module.exports = merge({
  componentRoot: '<%= componentRoot %>',
  componentManifest: '<%= componentManifest %>',
  plugins: {
    js: {
      module: require('stromboli-plugin-javascript'),
      config: jsConfig,
      entry: 'index.js'
    },
    css: {
      module: require('stromboli-plugin-sass'),
            config: merge({}, require('./plugin/sass'), {
        sourceMap: false,
        sourceComments: false
      }),
      entry: 'index.scss'
    },
    html: {
      module: TwigDepsPlugin,
      entry: 'index.twig'
    }
  },
  distPath: 'dist'
}, localConfig);
