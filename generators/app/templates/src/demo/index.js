module.exports = {
  template: require('./templates/demo.html'),
  props: {
    title: null,
    languages: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data: function () {
    return {
      currentLanguage: {
        code: 'en'
      }
    }
  },
  components: {
    'language-selector': {
      props: {
        language: null,
        languages: {
          type: Array,
          default: function() {
            return [];
          }
        }
      },
      template: require('./templates/language-selector.html')
    }
  }
};