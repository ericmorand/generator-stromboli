const merge = require('deepmerge');
const path = require('path');

let jsConfig = require('./plugin/javascript');

jsConfig.transform.push(['babelify', {
  presets: ['es2015']
}]);

jsConfig.transform.push(['uglifyify', {
  global: true
}]);

class TwigDepsPlugin {
  render(entry, output) {
    return new Promise(function (fulfill, reject) {
      const TwigDeps = require('twig-deps');

      let renderResult = {
        sourceDependencies: []
      };

      let depper = new TwigDeps();

      require('../src/drupal/twig-extend')(depper.twig);

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

module.exports = {
  componentRoot: 'src',
  componentManifest: 'component.json',
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
  }
};
