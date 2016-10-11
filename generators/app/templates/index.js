'use strict';

var path = require('path');
var merge = require('merge');
var config = require('./config.js');

const Stromboli = require('stromboli');
const chokidar = require('chokidar');

class Builder extends Stromboli {
  constructor() {
    super();

    this.componentsWatchers = new Map();
  };

  start(config) {
    return super.start(config).then (
      function (components) {
        var browserSync = require('browser-sync').create();
        var files = [];

        components.forEach(function (component) {
          files.push(path.join('dist', component.name, 'index.css'));
          files.push(path.join('dist', component.name, 'index.js'));
          files.push(path.join('dist', component.name, 'index.html'));
        });

        var browserSyncConfig = merge(config.browsersync, {
          server: 'dist',
          files: files,
          open: false
        });

        return browserSync.init(browserSyncConfig);
      }
    )
  };

  closeWatchers() {
    var that = this;
    var promises = [];
    var closeWatcher = function (watcher) {
      watcher.close();

      return watcher;
    };

    var keys = that.componentsWatchers.keys();

    for (var key of keys) {
      var componentWatchers = that.componentsWatchers.get(key);

      componentWatchers.forEach(function (watcher) {
        promises.push(closeWatcher(watcher));
      });
    }

    that.info('>', 'CLOSING WATCHERS');

    return Promise.all(promises).then(
      function (watchers) {
        that.info('<', watchers.length, 'WATCHERS CLOSED');
        that.debug(watchers);

        that.watchers = [];
        that.componentsWatchers = new Map();

        return watchers;
      }
    );
  };

  pluginCleanComponent(plugin, component) {
    var that = this;

    return super.pluginCleanComponent(plugin, component).then(
      function () {
        var promises = [];

        // close watchers
        var watcher = null;

        if (that.componentsWatchers.has(component.name)) {
          var componentWatchers = that.componentsWatchers.get(component.name);

          if (componentWatchers.has(plugin.name)) {
            that.debug('WATCHER FOR COMPONENT', component.name, 'AND PLUGIN', plugin.name, 'WILL BE CLOSED');

            watcher = componentWatchers.get(plugin.name);

            promises.push(watcher.close());
          }
        }

        return Promise.all(promises);
      }
    );
  };

  pluginRenderComponent(plugin, component) {
    var that = this;

    return super.pluginRenderComponent(plugin, component).then(
      function (component) {
        var renderResult = component.renderResults.get(plugin.name);

        var watcher = null;
        var dependencies = Array.from(renderResult.getDependencies());

        if (!that.componentsWatchers.has(component.name)) {
          that.componentsWatchers.set(component.name, new Map());
        }

        var componentWatchers = that.componentsWatchers.get(component.name);

        that.debug('WATCHER WILL WATCH', dependencies, 'USING PLUGIN', plugin.name);

        watcher = that.getWatcher(dependencies, function () {
          that.pluginRenderComponent(plugin, component)
        });

        componentWatchers.set(plugin.name, watcher);

        return component;
      }
    )
  };

  /**
   *
   * @param files {[String]}
   * @param listener {Function}
   * @returns {Promise}
   */
  getWatcher(files, listener) {
    var that = this;

    return chokidar.watch(files, {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100
      }
    }).on('all', function (type, file) {
      that.info(file, type);

      listener.apply(that);
    });
  };
}

var stromboli = new Builder();

stromboli.start(config);