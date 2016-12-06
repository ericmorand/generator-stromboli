'use strict';

const fs = require('fs-extra');
const path = require('path');
const merge = require('merge');
const postcss = require('postcss');
const log = require('log-util');

const Promise = require('promise');
const fsCopy = Promise.denodeify(fs.copy);
const fsEmptyDir = Promise.denodeify(fs.emptyDir);
const fsReadFile = Promise.denodeify(fs.readFile);
const fsOutputFile = Promise.denodeify(fs.outputFile, 2);

const Stromboli = require('stromboli');

let componentsBuilderConfig = merge.recursive(true, require('./config/common'), require('./config/components'));
let styleguideBuilderConfig = merge.recursive(true, require('./config/build'), require('./config/styleguide'));

componentsBuilderConfig.distPath = styleguideBuilderConfig.distPath;

let write = require('./lib/write');
let tmpPath = 'tmp';

let processStylesheet = function (config) {
  let distPath = config.paths.dist;
  let cssFilePath = path.join('tmp/styleguide', 'index.css');

  return fsReadFile(cssFilePath).then(
    function (css) {
      return postcss(config.postcss.plugins).process(css.toString(), {from: cssFilePath}).then(
        function (result) {
          return fsOutputFile(path.join(distPath, 'index.css'), result.css);
        }
      );
    }
  )
};

let processScript = function (config) {
  let distPath = config.paths.dist;

  return fsCopy(path.join('tmp/styleguide', 'index.js'), path.join(distPath, 'index.js'));
};

let processHtml = function (config) {
  let distPath = config.distPath;

  return fsCopy(path.join('tmp/styleguide', 'index.html'), path.join(distPath, 'index.html'));
};

let componentsBuilder = new Stromboli();

fsEmptyDir(styleguideBuilderConfig.distPath).then(
  function () {
    componentsBuilder.start(componentsBuilderConfig).then(
      function (components) {
        // write
        return write.writeComponents(components, styleguideBuilderConfig.distPath).then(
          function () {
            log.info('> COMPONENTS BUILD DONE');

            let appBuilder = new Stromboli();

            components.forEach(function (component) {
              component.url = component.name;
            });

            styleguideBuilderConfig.plugins.twig.config.data = {
              components: components,
            };

            return appBuilder.start(styleguideBuilderConfig).then(
              function (components) {
                return write.writeComponents(components, tmpPath).then(
                  function (files) {
                    let promises = [];

                    promises.push(processScript(styleguideBuilderConfig));
                    promises.push(processStylesheet(styleguideBuilderConfig));
                    promises.push(processHtml(styleguideBuilderConfig));

                    // clean
                    return Promise.all(promises).then(
                      function () {
                        log.info('> APP BUILD DONE');
                      },
                      function (err) {
                        console.log(err);
                      }
                    )
                  }
                );
              }
            )
          }
        );
      },
      function (err) {
        console.log(err);
      }
    )
  }
);
