require('.');

var Vue = require('vue');

new Vue({
  el: '#app',
  components: {
    demo: require('<%= demoComponentRootRelativePath %>')
  }
});
