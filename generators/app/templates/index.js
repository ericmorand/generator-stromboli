'use strict';

const cluster = require('cluster');

const log = require('log-util');
const merge = require('merge');
const path = require('path');

const chokidar = require('chokidar');
const Builder = require('./lib/builder');
const MasterBuilder = require('./lib/master-builder');
const StyleguideBuilder = require('./lib/styleguide-builder');
const BrowserSync = require('browser-sync');

const builderConfig = require('./config/test');
const styleguideBuilderConfig = require('./config/styleguide');

if (cluster.isMaster) {
  let builder = new MasterBuilder();
  let watchers = new Map();

  let initWatcher = function (component, plugin, files, worker) {
    let watcher = chokidar.watch(files, builderConfig.chokidar).on('all', function (type, file) {
      builder.info(file, type);

      worker.send({
        plugin: plugin
      });
    });

    // store the watcher
    if (!watchers.has(component.name)) {
      watchers.set(component.name, new Map());
    }

    let componentWatchers = watchers.get(component.name);

    componentWatchers.set(plugin.name, watcher);

    return watcher;
  };

  let closeWatcher = function (component, plugin) {
    let watcher = null;

    if (watchers.has(component.name)) {
      let componentWatchers = watchers.get(component.name);

      if (componentWatchers.has(plugin.name)) {
        watcher = componentWatchers.get(plugin.name);

        watcher.close();
      }
    }
  };

  let initBrowserSync = function(components, config) {
    if (components.length) {
      return new Promise(function (fulfill, reject) {
        let processComponentAtIndex = function (index) {
          let component = components[index];
          let browserSync = require('browser-sync').create(component.name);
          let browserSyncConfig = merge({}, config);

          browserSyncConfig.server = browserSyncConfig.server + '/' + component.name;

          browserSync.init(browserSyncConfig, function (err, bs) {
            component.url = '/html';
            component.port = bs.options.get('port');

            index++;

            if (index < components.length) {
              processComponentAtIndex(index);
            }
            else {
              fulfill(components);
            }
          });
        };

        processComponentAtIndex(0);
      });
    }
    else {
      return Promise.resolve(components);
    }
  };

  let reloadBrowserSync = function (component) {
    let bs = BrowserSync.has(component.name) ? BrowserSync.get(component.name) : null;

    if (bs) {
      let renderResult = component.renderResult;

      renderResult.binaries.forEach(function (binary) {
        if (path.extname(binary.name) !== '.map') {
          bs.reload(binary.name);
        }
      });
    }
  };

  cluster.on('message', function (worker, message, handle) {
    let component = message.component;
    let plugin = message.plugin;

    // close watcher
    closeWatcher(component, plugin);

    // reload BS
    reloadBrowserSync(component);

    // watch again
    let renderResult = component.renderResult;
    let files = renderResult.sourceDependencies.concat(renderResult.binaryDependencies);

    initWatcher(component, plugin, files, worker);
  });

  cluster.on('exit', function (worker, code, signal) {
    console.log(`worker ${worker.process.pid} died`);
  });

  builder.start(builderConfig).then(
    function (components) {
      // browser-sync
      initBrowserSync(components, builder.config.browserSync).then(
        function () {
          builder.warn('Spawning workers, please be patient...');

          components.forEach(function (component) {
            let worker = cluster.fork({
              component: JSON.stringify({
                name: component.name,
                path: component.path
              })
            });

            let renderResults = component.renderResults;

            renderResults.forEach(function (renderResult, pluginName) {
              // watch
              let files = renderResult.sourceDependencies.concat(renderResult.binaryDependencies);

              let plugin = {
                name: pluginName
              };

              initWatcher(component, plugin, files, worker);
            });
          });

          builder.warn('...done!');

          // styleguide builder
          let styleguideBuilder = new StyleguideBuilder();
          let componentsData = components.map(function (component) {
            return {
              name: component.name,
              url: component.url,
              port: component.port
            }
          });

          styleguideBuilderConfig.plugins.index.config.data = {
            components: componentsData
          };

          styleguideBuilder.start(styleguideBuilderConfig);
        }
      );
    }
  );
}
else {
  let component = JSON.parse(process.env.component);
  let builder = new Builder();

  process.on('message', function (message) {
    let plugin = message.plugin;
    let pluginsConfig = {};

    pluginsConfig[plugin.name] = builderConfig.plugins[plugin.name];

    let config = {
      componentRoot: component.path,
      componentManifest: builderConfig.componentManifest,
      plugins: pluginsConfig,
      browserSync: builderConfig.browserSync
    };

    builder.start(config).then(
      function (components) {
        let component = components[0];
        let renderResult = component.renderResults.get(plugin.name);

        process.send({
          component: {
            name: component.name,
            renderResult: renderResult
          },
          plugin: {
            name: plugin.name
          }
        });
      }
    );
  });
}
