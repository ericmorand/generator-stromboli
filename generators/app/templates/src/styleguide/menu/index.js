var Vue = require('vue');

Vue.component('styleguide-menu', {
  template: require('./templates/menu.html'),
  props: {
    items: null
  },
  data: function() {
    return {
      selectedItem: null
    }
  },
  created: function() {
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
    selectedItem: function (val) {
      this.$parent.$emit('styleguide-menu:selectedItemDidChange', val);
    }
  }
});