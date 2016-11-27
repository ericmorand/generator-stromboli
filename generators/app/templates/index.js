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
    let that = this;
    let pkg = require('./package.json');
    let length = Math.max(pkg.description.length, pkg.name.length);

    that.config = config;

    log.info(('=').repeat(length));
    log.info(pkg.name);
    log.info(pkg.version);
    log.info(pkg.description);
    log.info(('=').repeat(length));

    return super.start(config).then(
      function (components) {
        // styleguide index
        let output = '<html><meta name="viewport" content="width=device-width, initial-scale=1"><body><ul>';

        components.forEach(function (component) {
          output += '<li><a href="' + path.join(component.name, component.path) + '">' + component.name + '</a></li>';
        });

        output += '</ul></body></html>';

        fs.writeFile(path.join(wwwPath, 'index.html'), output);

        // browserSync
        let browserSync = require('browser-sync').create();

        let browserSyncConfig = merge(config.browserSync, {
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
    let that = this;

    let promises = [];

    // close watchers
    let watcher = null;

    if (that.componentsWatchers.has(component.name)) {
      let componentWatchers = that.componentsWatchers.get(component.name);

      if (componentWatchers.has(plugin.name)) {
        console.log('WATCHER FOR COMPONENT', component.name, 'AND PLUGIN', plugin.name, 'WILL BE CLOSED');

        watcher = componentWatchers.get(plugin.name);

        promises.push(watcher.close());
      }
    }

    return Promise.all(promises);
  };

  pluginRenderComponent(plugin, component) {
    let that = this;
    let pluginRenderComponent = super.pluginRenderComponent;

    return that.pluginPreRenderComponent(plugin, component).then(
      function () {
        return pluginRenderComponent.call(that, plugin, component).then(
          function (component) {
            // write plugin render result to wwwPath folder
            let renderResult = component.renderResults.get(plugin.name);

            return write(renderResult, path.join(wwwPath, component.name, component.path)).then(
              function (files) {
                // watch dependencies
                let watcher = null;
                let dependencies = Array.from(renderResult.getDependencies());

                if (!that.componentsWatchers.has(component.name)) {
                  that.componentsWatchers.set(component.name, new Map());
                }

                let componentWatchers = that.componentsWatchers.get(component.name);

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
    let that = this;

    return chokidar.watch(files, that.config.chokidar).on('all', function (type, file) {
      that.info(file, type);

      listener.apply(that);
    });
  };
}

let stromboli = new Builder();

stromboli.start(config);
