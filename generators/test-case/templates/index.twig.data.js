/**
 *
 * @param renderer {{twig, render}}
 * @returns {{demo: {title: string, class: string}, fixtures: Array}}
 */
module.exports = function(renderer) {
  let data = require('../index.twig.data')(renderer);

  data.demo.title = '<%= testCaseName %> demo';
  data.demo.class = '<%= testCaseCleanName %>--demo';

  return data;
};
