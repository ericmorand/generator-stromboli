const ComponentsBuilder = require('./components-builder');
const path = require('path');
const log = require('log-util');

class Builder extends ComponentsBuilder {
  start(config) {
    let that = this;
    let title = 'Styleguide';

    log.info(('=').repeat(title.length));
    log.info(title);
    log.info(('=').repeat(title.length));

    that.config = config;

    return super.start(config).then(
      function(components) {
        // browser-sync
        let browserSync = require('browser-sync').create();

        browserSync.init(config.browserSync, function () {
            that.browserSync = browserSync;
          }
        );

        return components;
      }
    );
  };

  getRenderResultWritePath(component) {
    return path.join(this.config.browserSync.server);
  };
}

module.exports = Builder;