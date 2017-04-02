const Builder = require('./builder');

class MasterBuilder extends Builder {
  start(config) {
    let self = this;
    let pkg = require('../package.json');
    let splash = `Welcome to ${pkg.name}`;

    self.warn(('=').repeat(splash.length));
    self.warn(splash);
    self.warn(('=').repeat(splash.length));

    return super.start(config);
  }
}

module.exports = MasterBuilder;
