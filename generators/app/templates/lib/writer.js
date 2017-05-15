'use strict';

const fs = require('fs-extra');
const path = require('path');
const url = require('url');

const Promise = require('promise');
const fsOutputFile = Promise.denodeify(fs.outputFile);
const fsReadFile = Promise.denodeify(fs.readFile);

let writeRenderResult = function (renderResult, output) {
  let promises = [];

  let result = {
    dependencies: [],
    binaries: []
  };

  let dependencies = renderResult.binaryDependencies.concat(renderResult.sourceDependencies);

  dependencies.forEach(function (dependency) {
    if (dependency !== renderResult.source) {
      let dependencyUrl = url.parse(dependency);
      let from = dependencyUrl.search ? dependencyUrl.pathname : dependency;
      let to = path.join(output, path.relative(path.resolve('.'), dependency));

      promises.push(fsReadFile(from).then(
        function (data) {
          return fsOutputFile(to, data).then(
            function () {
              result.dependencies.push(to);

              return to;
            }
          )
        },
        function (err) {
          return true;
        })
      );
    }
  });

  renderResult.binaries.forEach(function (binary) {
    let data = binary.data;
    let to = path.join(output, binary.name);

    promises.push(fsOutputFile(to, data).then(
      function () {
        result.binaries.push(to);

        return to;
      },
      function (err) {
        return true;
      }
    ));
  });

  return Promise.all(promises).then(
    function () {
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
