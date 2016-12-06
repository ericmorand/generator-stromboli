const path = require('path');

let tmpPath = 'tmp;'
let distPath = 'dist';

module.exports = {
  plugins: {
    javascript: {
      config: {
        plugin: [
          function (bundle, opts) {
            return require('minifyify')(bundle, {map: false});
          }
        ]
      }
    },
    sass: {
      config: {
        sourceMap: false,
        sourceComments: false
      }
    }
  },
  distPath: distPath,
  postcss: {
    plugins: [
      require('cssnano')({
        discardDuplicates: true
      }),
      require('postcss-copy')({
        src: '.',
        dest: distPath,
        template: function (fileMeta) {
          return 'assets/' + fileMeta.hash + '.' + fileMeta.ext;
        },
        relativePath: function (dirname, fileMeta, result, options) {
          return path.relative(fileMeta.src, distPath);
        },
        hashFunction: function (contents) {
          // sha256
          const createSha = require('sha.js');

          return createSha('sha256').update(contents).digest('hex');
        }
      })
    ]
  },
  paths: {
    tmp: tmpPath,
    dist: distPath
  }
};