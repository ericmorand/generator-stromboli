var Vue = require('vue');

require('./menu/index');

new Vue({
  el: '#app',
  components: {
    'styleguide': {
      data: function () {
        return {
          source: null,
          menuExpanded: false
        }
      },
      created: function () {
        this.$on('styleguide-menu:selectedItemDidChange', function (item) {
          this.source = item.url;
          this.menuExpanded = false;
        });
      },
      methods: {
        onBurgerClick: function () {
          this.menuExpanded = !this.menuExpanded;
        }
      },
      components: {
        'styleguide-content': {
          template: require('./templates/styleguide-content.html'),
          props: {
            source: null
          }
        }
      }
    }
  }
});
