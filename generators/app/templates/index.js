'use strict';

const fs = require('fs-extra');
const log = require('log-util');
const merge = require('merge');
const path = require('path');

const config = merge.recursive(require('./config.js').develop);

const Stromboli = require('stromboli');
const chokidar = require('chokidar');
const write = require('./lib/write');

const wwwPath = 'www';

class Builder extends Stromboli {
  constructor() {
    super();

    this.componentsWatchers = new Map();
    this.browserSync = null;
    this.config = null;
  };

  start(config) {
    var that = this;
    var pkg = require('./package.json');
    var length = Math.max(pkg.description.length, pkg.name.length);

    that.config = config;

    log.info(('=').repeat(length));
    log.info(pkg.name);
    log.info(pkg.version);
    log.info(pkg.description);
    log.info(('=').repeat(length));

    return super.start(config).then(
      function (components) {
        // styleguide index
        var output = '<html><meta name="viewport" content="width=device-width, initial-scale=1"><body><ul>';

        components.forEach(function (component) {
          output += '<li><a href="' + path.join(component.name, component.path) + '">' + component.name + '</a></li>';
        });

        output += '</ul></body></html>';

        fs.writeFile(path.join(wwwPath, 'index.html'), output);

        // browserSync
        var browserSync = require('browser-sync').create();

        var browserSyncConfig = merge(config.browserSync, {
          server: wwwPath
        });

        return browserSync.init(browserSyncConfig, function () {
            that.browserSync = browserSync;
          }
        );
      }
    );
  };

  pluginPreRenderComponent(plugin, component) {
    var that = this;

    var promises = [];

    // close watchers
    var watcher = null;

    if (that.componentsWatchers.has(component.name)) {
      var componentWatchers = that.componentsWatchers.get(component.name);

      if (componentWatchers.has(plugin.name)) {
        console.log('WATCHER FOR COMPONENT', component.name, 'AND PLUGIN', plugin.name, 'WILL BE CLOSED');

        watcher = componentWatchers.get(plugin.name);

        promises.push(watcher.close());
      }
    }

    return Promise.all(promises);
  };

  pluginRenderComponent(plugin, component) {
    var that = this;
    var pluginRenderComponent = super.pluginRenderComponent;

    return that.pluginPreRenderComponent(plugin, component).then(
      function () {
        return pluginRenderComponent.call(that, plugin, component).then(
          function (component) {
            // write plugin render result to wwwPath folder
            var renderResult = component.renderResults.get(plugin.name);

            return write(renderResult, path.join(wwwPath, component.name, component.path)).then(
              function (files) {
                // watch dependencies
                var watcher = null;
                var dependencies = Array.from(renderResult.getDependencies());

                if (!that.componentsWatchers.has(component.name)) {
                  that.componentsWatchers.set(component.name, new Map());
                }

                var componentWatchers = that.componentsWatchers.get(component.name);

                // console.log('WATCHER WILL WATCH', dependencies, 'USING PLUGIN', plugin.name);

                watcher = that.getWatcher(dependencies, function () {
                  that.pluginRenderComponent(plugin, component)
                });

                componentWatchers.set(plugin.name, watcher);

                // reload Browsersync
                if (that.browserSync) {
                  files.binaries.forEach(function (binary) {
                    if (path.extname(binary) != '.map') {
                      that.browserSync.reload(binary);
                    }
                  });
                }

                return component;
              }
            )
          },
          function(err) {
            console.log(err);
          }
        )
      }
    );
  };

  /**
   *
   * @param files {[String]}
   * @param listener {Function}
   * @returns {Promise}
   */
  getWatcher(files, listener) {
    var that = this;

    return chokidar.watch(files, that.config.chokidar).on('all', function (type, file) {
      that.info(file, type);

      listener.apply(that);
    });
  };
}

var stromboli = new Builder();

stromboli.start(config);