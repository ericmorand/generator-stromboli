var Vue = require('vue');

Vue.component('styleguide-menu', {
  template: require('./templates/menu.html'),
  props: {
    items: null
  },
  data: function () {
    return {
      selectedItem: null
    }
  },
  created: function () {
    this.refreshItems = function() {
      this.items.forEach(function(item) {
        item.getUrl = function() {
          return '//' + window.location.hostname + ':' + this.port + '/' + this.url;
        };
      });
    };

    this.refreshItems();

    if (this.selectedItem == null) {
      this.selectedItem = this.items[0];
    }
  },
  methods: {
    onItemClick: function (item) {
      this.selectedItem = item;
    }
  },
  watch: {
    items: function(val) {
      this.refreshItems();
    },
    selectedItem: function (val) {
      this.$parent.$emit('styleguide-menu:selectedItemDidChange', val);
    }
  }
});
