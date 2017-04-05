/**
 *
 * @param renderer {{twig, render}}
 * @returns {{demo: {title: string, class: string}, fixtures: Array}}
 */
module.exports = function(renderer) {
  let data = require('../default/index.twig.data')(renderer);

  data.demo.title = '<%= componentName %> test-case demo';

  data.fixtures = [
    require('./fixtures')(renderer)
  ];

  return data;
};
