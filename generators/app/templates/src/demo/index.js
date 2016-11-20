module.exports = {
  template: require('./templates/demo.html'),
  props: {
    title: null,
    languages: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  data: function () {
    return {
      language: null
    }
  },
  beforeMount: function() {
      if (!this.language) {
        this.language = this.languages[0];
      }
  },
  created: function () {
    this.$on('language-selector:languageDidChange', function(language) {
      this.language = language;
    });
  },
  components: {
    'language-selector': {
      template: require('./templates/language-selector.html'),
      props: {
        language: null,
        languages: {
          type: Array,
          default: function () {
            return [];
          }
        }
      },
      data: function() {
        return {
          value: null
        }
      },
      created: function () {
        this.value = this.language.code;
      },
      watch: {
        value: function(val) {
          var language = this.languages.find(function(language) {
            return (language.code == val);
          });

          this.$parent.$emit('language-selector:languageDidChange', language);
        }
      }
    }
  }
};