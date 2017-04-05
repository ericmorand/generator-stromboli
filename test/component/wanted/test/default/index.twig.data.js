/**
 *
 * @param renderer {{twig, render}}
 * @returns {{demo: {title: string, class: string}, fixtures: Array}}
 */
module.exports = function (renderer) {
  return {
    demo: {
      title: 'lorem-ipsum/dolor demo',
      class: 'lorem-ipsum--dolor--demo'
    },
    fixtures: []
  };
};
