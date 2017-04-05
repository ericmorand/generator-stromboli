/**
 *
 * @param renderer {{twig, render}}
 * @returns {{demo: {title: string, class: string}, fixtures: Array}}
 */
module.exports = function (renderer) {
  return {
    demo: {
      title: '<%= componentName %> demo',
      class: '<%= componentCleanName %>--demo'
    },
    fixtures: []
  };
};
