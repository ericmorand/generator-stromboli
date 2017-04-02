const Builder = require('./builder');
const path = require('path');
const log = require('log-util');

class StyleguideBuilder extends Builder {
  start(config) {
    let that = this;
    let title = 'Styleguide';

    that.warn(('=').repeat(title.length));
    that.warn(title);
    that.warn(('=').repeat(title.length));

    return super.start(config).then(
      function (components) {
        // browser-sync
        let browserSync = require('browser-sync').create();

        browserSync.init(config.browserSync, function (err, bs) {
            that.browserSync = bs;
          }
        );

        return components;
      },
      function (err) {
        console.log(err);
      }
    );
  };

  getRenderResultWritePath(component, plugin) {
    return path.join(this.config.browserSync.server);
  };
}

module.exports = StyleguideBuilder;