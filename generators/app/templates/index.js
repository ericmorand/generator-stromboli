'use strict';

const log = require('log-util');
const merge = require('merge');

const ComponentsBuilder = require('./lib/components-builder');
const StyleguideBuilder = require('./lib/styleguide-builder');

let componentsBuilderConfig = merge.recursive({}, require('./config/common'), require('./config/components'));

class Builder extends ComponentsBuilder {
  start(config) {
    let that = this;
    let pkg = require('./package.json');
    let length = Math.max(pkg.description.length, pkg.name.length);

    log.info(('=').repeat(length));
    log.info(pkg.name);
    log.info(pkg.version);
    log.info(pkg.description);
    log.info(('=').repeat(length));

    that.config = config;

    return super.start(config).then(
      function (components) {
        // browser-sync
        let browserSync = require('browser-sync').create();

        browserSync.init(config.browserSync, function () {
            that.browserSync = browserSync;
          }
        );

        components.forEach(function(component) {
          component.url = '//localhost:' + browserSync.instance.getOptions().get('port') + '/' + component.name
        });

        // styleguide build
        let styleguideBuilder = new StyleguideBuilder();
        let styleguideBuilderConfig = require('./config/styleguide');

        styleguideBuilderConfig.plugins.twig.config.data = {
          components: components,
        };

        return styleguideBuilder.start(styleguideBuilderConfig);
      }
    );
  };
}

let stromboli = new Builder();

stromboli.start(componentsBuilderConfig);
