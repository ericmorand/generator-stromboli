const Riot = require('riot');
const OutlineView = require('./outline-view');

class Styleguide {
  constructor(items) {
    let self = this;

    self.emitter = require('event-emitter')();
    self.outlineView = new OutlineView(items);
    self.selectedItem = items[0];

    self.outlineView.emitter.on('OutlineViewSelectionDidChange', function() {
      self.selectedItem = self.outlineView.selectedItem;

      self.emitter.emit('StyleguideSelectionDidChange');
    });
  }
}

Riot.tag('styleguide', require('./templates/styleguide.html'), function (opts) {
  let self = this;

  let list = document.querySelector(opts.list);
  let items = [];

  if (list) {
    let listItems = list.querySelectorAll(':scope > li > a');

    listItems.forEach(function (listItem) {
      items.push({
        url: '//' + window.location.hostname + ':' + listItem.getAttribute('href'),
        path: listItem.innerHTML
      });
    });
  }

  self.model = new Styleguide(items);

  self.model.emitter.on('StyleguideSelectionDidChange', function() {
    self.update();
  });

  self.onBurgerClick = function() {

  };
});

Riot.mount('styleguide');