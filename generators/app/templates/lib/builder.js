const path = require('path');
const Stromboli = require('stromboli');
const writer = require('../lib/writer');

class Builder extends Stromboli {
  constructor() {
    super();

    this.config = null;
  };

  start(config) {
    let that = this;

    that.config = config;

    return super.start(that.config);
  }

  pluginRenderComponent(plugin, component) {
    let self = this;

    let startDate = new Date();

    self.warn('> ', plugin.name, 'processing of', component.name, 'started');

    return super.pluginRenderComponent(plugin, component).then(
      function (component) {
        return self.writeRenderResults(component, plugin).then(
          function () {
            let endDate = new Date();

            self.warn('< ', plugin.name, 'processing of', component.name, 'done in', endDate.getTime() - startDate.getTime(), 'ms');

            return component;
          }
        );
      },
      function (err) {
        console.log(err);
      }
    )
  };

  writeRenderResults(component, plugin) {
    let self = this;
    let renderResult = component.renderResults.get(plugin.name);

    return writer.writeRenderResult(renderResult, self.getRenderResultWritePath(component, plugin));
  };

  getRenderResultWritePath(component, plugin) {
    return path.join(this.config.browserSync.server, component.name, plugin.name);
  };
}

module.exports = Builder;