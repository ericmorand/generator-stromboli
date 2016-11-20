const fs = require('fs-extra');
const path = require('path');

const Promise = require('promise');
const fsCopy = Promise.denodeify(fs.copy, 2);
const fsOutputFile = Promise.denodeify(fs.outputFile, 3);

var exports = function (renderResult, output) {
  var promises = [];

  var result = {
    dependencies: [],
    binaries: []
  };

  renderResult.getDependencies().forEach(function (dependency) {
    var from = dependency;
    var to = path.join(output, path.relative(path.resolve('.'), dependency));

    promises.push(fsCopy(from, to).then(
      function() {
        result.dependencies.push(to);

        return to;
      },
      function(err) {
        console.log(err);
      }
    ));

     // console.log('WILL COPY DEPENDENCY FROM', from, 'TO', to);
  });

  renderResult.getBinaries().forEach(function (binary) {
    var data = binary.data;
    var to = path.join(output, binary.name);

    promises.push(fsOutputFile(to, data).then(
      function() {
        result.binaries.push(to);

        return to;
      },
      function(err) {
        console.log(err);
      }
    ));

    //console.log('WILL WRITE BINARY FROM', data, 'TO', to);
  });

  return Promise.all(promises).then(
    function() {
      return result;
    }
  );
};

module.exports = exports;