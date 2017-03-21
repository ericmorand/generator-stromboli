let Riot = require('riot');

let TreeModel = require('tree-model');

class OutlineViewItem {
  constructor(name, url) {
    this.name = name;
    this.url = url;
  }
}

class OutlineView {
  constructor(items) {
    let self = this;

    self.expandedItems = [];
    self.selectedItem = null;
    self.emitter = require('event-emitter')();

    self.setItems(items);
  }

  setItems(items) {
    let self = this;
    let tree = new TreeModel();

    self.node = tree.parse({});
    self.selectedItem = null;

    if (items) {
      items.forEach(function (item) {
        self.processItem(item, self.node, tree);
      });

      self.selectedItem = items[0];
    }
  };

  processItem(item, parentNode, tree) {
    let self = this;

    let url = item.url;
    let path = item.path;

    let components = path.split('/');
    let name = components.shift();

    let found = parentNode.children.find(function (child) {
      return (child.model.name == name);
    });

    if (!found) {
      if (components.length) {
        url = null;
      }

      let outlineViewItem = new OutlineViewItem(name, url);

      let node = tree.parse(outlineViewItem);

      parentNode.addChild(node);

      parentNode = node;
    }
    else {
      parentNode = found;
    }

    if (components.length > 0) {
      item.path = components.join('/');

      self.processItem(item, parentNode, tree);
    }
  };

  getItems() {
    let self = this;

    return self.node.all().map(function (node) {
      return node.parent ? node.model : null;
    }).filter(function (item) {
      return item;
    });
  }

  /**
   *
   * @param item {OutlineViewItem}
   */
  getNodeForItem(item) {
    return this.node.all().find(function (node) {
      return node.model == item;
    });
  };

  /**
   *
   * @param item {OutlineViewItem}
   */
  getLevelForItem(item) {
    let level = 0;
    let node = this.getNodeForItem(item);

    while (node = node.parent) {
      level++;
    }

    return level;
  };

  getNumberOfChildren(item) {
    let node = this.getNodeForItem(item);

    return node.children.length;
  };

  isItemExpanded(item) {
    return (this.expandedItems.indexOf(item) > -1);
  };

  isItemExpandable(item) {
    return this.getNumberOfChildren(item) > 0;
  };

  isItemVisible(item) {
    let self = this;
    let node = self.getNodeForItem(item);

    // root node is never visible
    if (node.isRoot()) {
      return false;
    }

    let walk = function (node) {
      if (node.parent) {
        let parentItem = node.parent.model;

        if (self.isItemExpanded(parentItem)) {
          return self.isItemVisible(parentItem);
        }
        else {
          return false;
        }
      }
      else {
        return self.isItemExpanded(item);
      }
    };

    return (self.getLevelForItem(item) == 1) || walk(node);
  };

  expandItem(item) {
    this.expandedItems.push(item);
  };

  collapseItem(item) {
    let index = this.expandedItems.indexOf(item);

    if (index > -1) {
      this.expandedItems.splice(index, 1);
    }
  };

  selectItem(item) {
    this.selectedItem = item;

    this.emitter.emit('OutlineViewSelectionDidChange');
  };
}

let outlineView = new OutlineView();

Riot.tag('outline-view', require('./templates/outline-view.html'), function (opts) {
  let self = this;

  self.model = opts.model;

  self.on('mount', function () {
    self.update({
      model: self.model
    });
  });

  self.getClassForItem = function (item) {
    let classes = [];

    if (!self.model.isItemVisible(item)) {
      classes.push('hidden');
    }

    if (self.model.isItemExpanded(item)) {
      classes.push('expanded');
    }

    if (self.model.selectedItem == item) {
      classes.push('active');
    }

    if (item.url) {
      classes.push('component');
    }

    return classes.join(' ');
  };

  self.getIndentationForItem = function (item) {
    let level = self.model.getLevelForItem(item) - 1;

    if (!self.model.getNumberOfChildren(item)) {
      level++;
    }

    return new Array(level);
  };

  // event handlers
  self.onItemClick = function (item) {
    return function (e) {
      e.preventDefault();

      if (item.url) {
        self.model.selectItem(item);
        self.update();
      }
    }
  };

  self.onExpanderClick = function (item) {
    return function () {
      if (self.model.isItemExpanded(item)) {
        self.model.collapseItem(item);
      }
      else {
        self.model.expandItem(item);
      }
    }
  };
});

Riot.mount('outline-view');

module.exports = OutlineView;