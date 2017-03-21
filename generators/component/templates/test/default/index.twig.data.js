module.exports = function (plugin) {
  return {
    demo: {
      title: '<%= componentName %> demo',
      class: '<%= componentCleanName %>--demo'
    },
    fixtures: [
      {
        title: 'Lorem ipsum',
        content: 'Lorem ipsum'
      }
    ]
  };
};
