'use strict';

const fs = require('fs-extra');
const path = require('path');

const Promise = require('promise');
const fsCopy = Promise.denodeify(fs.copy, 2);
const fsOutputFile = Promise.denodeify(fs.outputFile, 3);

let writeRenderResult = function (renderResult, output) {
  let promises = [];

  let result = {
    dependencies: [],
    binaries: []
  };

  renderResult.getDependencies().forEach(function (dependency) {
    let from = dependency;
    let to = path.join(output, path.relative(path.resolve('.'), dependency));

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
    let data = binary.data;
    let to = path.join(output, binary.name);

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

let writeComponents = function (components, output) {
  return Promise.all(components.map(function (component) {
    let promises = [];

    component.renderResults.forEach(function (renderResult, pluginName) {
      promises.push(writeRenderResult(renderResult, path.join(output, component.name)));
    });

    return Promise.all(promises);
  }))
};

module.exports = {
  writeRenderResult: writeRenderResult,
  writeComponents: writeComponents
};
