'use strict';

var config = require('./config.js').build;

const fs = require('fs-extra');
const path = require('path');
const merge = require('merge');
const postcss = require('postcss');
const log = require('log-util');

const Promise = require('promise');
const fsCopy = Promise.denodeify(fs.copy);
const fsEmptyDir = Promise.denodeify(fs.emptyDir);
const fsReadFile = Promise.denodeify(fs.readFile);
const fsRmdir = Promise.denodeify(fs.rmdir);

const Stromboli = require('stromboli');

var stromboli = new Stromboli();

config.componentRoot = 'src/page';

var distPath = 'dist';
var sourcePath = path.join(distPath, '/build');
var targetPath = distPath;
var buildPath = 'tmp/build';

var cleanDistFolder = function () {
  return fsEmptyDir(distPath);
};

var write = require('./lib/write');

stromboli.getPlugins(config).then(
  function (plugins) {
    stromboli.getComponents(config.componentRoot, config.componentManifest).then(
      function (components) {
        // create build component from returned components
        plugins.forEach(function (plugin) {
          var pluginData = '';

          components.forEach(function (component) {
            var sourceFile = path.join(component.path, plugin.entry);

            try {
              var sourceFileStat = fs.statSync(sourceFile);
              if (sourceFileStat.isFile()) {
                sourceFile = path.relative(buildPath, sourceFile);

                if (plugin.name == 'twig') {
                  pluginData += '{% include "' + sourceFile + '" %}';
                }
                else if (plugin.name == 'sass') {
                  pluginData += '@import "' + sourceFile + '";';
                }
                else if (plugin.name == 'javascript') {
                  pluginData += 'require("' + sourceFile + '");';
                }
              }
            }
            catch (err) {
              console.log('Entry', plugin.entry, 'not found');
            }
          });

          if (pluginData) {
            fs.outputFileSync(path.join(buildPath, plugin.entry), pluginData);
          }
        });

        fs.outputFileSync(path.join(buildPath, config.componentManifest), JSON.stringify({
          name: 'build'
        }));

        config.componentRoot = buildPath;

        stromboli.start(config).then(
          function (components) {
            cleanDistFolder('dist').then(
              function () {
                // write components output to 'dist' folder
                return Promise.all(components.map(function (component) {
                  var promises = [];

                  component.renderResults.forEach(function (renderResult, pluginName) {
                    promises.push(write(renderResult, path.join(distPath, component.name)));
                  });

                  return Promise.all(promises);
                })).then(
                  function (files) {
                    var promises = [];

                    // index.css
                    var urlsMangler = postcss.plugin('postcss-urls-mangler', function () {
                      return function (css) {
                        const fs = require('fs-extra');
                        const path = require('path');
                        const valueParser = require('postcss-value-parser');
                        const md5 = require('nodejs-md5');
                        const outputFile = Promise.denodeify(fs.outputFile, 2);

                        var promises = [];

                        css.walkDecls(function (decl) {
                          if (decl.value.indexOf('url') < 0) {
                            return;
                          }

                          var parser = valueParser(decl.value);
                          var parserPromises = [];

                          parser.walk(function (node) {
                            if (node.type !== 'function') {
                              return false;
                            }

                            // @see https://www.npmjs.com/package/postcss-value-parser#function
                            node.nodes.forEach(function (argNode) {
                              var value = argNode.value;
                              var ext = path.extname(value);

                              var promise = new Promise(function (fulfill, reject) {
                                return fsReadFile(value).then(
                                  function (readData) {
                                    md5.file.quiet(value, function (err, md) {
                                      var relPath = path.join('assets', md) + ext;
                                      var absPath = path.join('.', distPath, relPath);

                                      return outputFile(absPath, readData).then(
                                        function () {
                                          argNode.value = relPath;

                                          fulfill(parser.toString());
                                        }
                                      );
                                    });
                                  },
                                  function (err) {
                                    var md = md5.string.quiet(err, value);

                                    argNode.value = path.join('assets', md) + ext;

                                    fulfill(parser.toString());
                                  }
                                );
                              });

                              parserPromises.push(promise);
                            });
                          });

                          promises.push(Promise.all(parserPromises).then(
                            function () {
                              decl.value = parser.toString();
                            }
                          ))
                        });

                        return Promise.all(promises);
                      };
                    });

                    var cssNano = require('cssnano')({
                      discardDuplicates: true
                    });

                    promises.push(
                      fsReadFile(path.join(sourcePath, 'index.css')).then(
                        function (css) {
                          postcss([urlsMangler(), cssNano]).process(css.toString()).then(
                            function (result) {
                              fs.writeFileSync(path.join(targetPath, 'index.css'), result.css);
                            }
                          );
                        }
                      )
                    );

                    // index.js
                    promises.push(
                      fsCopy(path.join(sourcePath, 'index.js'), path.join(targetPath, 'index.js'))
                    );

                    // twig templates
                    var templates = [];

                    promises.push(
                      new Promise(function (fulfill, reject) {
                        var templatesPath = path.join(sourcePath, 'src');

                        fs.walk(path.join(templatesPath))
                          .on('data', function (item) {
                            var ext = path.extname(item.path);

                            if (ext == '.twig') {
                              var relativePath = path.relative(path.resolve(templatesPath), item.path);
                              var destPath = path.join(targetPath, 'templates', relativePath);

                              templates.push(destPath);

                              fs.copySync(item.path, destPath);
                            }
                          })
                          .on('end', function () {
                            fulfill();
                          });
                      })
                    );

                    // README files
                    promises.push(
                      new Promise(function (fulfill, reject) {
                        var sourcePath = path.join('src');

                        fs.walk(path.join(sourcePath))
                          .on('data', function (item) {
                            if (path.basename(item.path) == 'README.md') {
                              var relativePath = path.relative(path.resolve(sourcePath), item.path);
                              var destPath = path.join(targetPath, 'templates', relativePath);

                              fs.copySync(item.path, destPath);
                            }
                          })
                          .on('end', function () {
                            fulfill();
                          });
                      })
                    );

                    // clean
                    return Promise.all(promises).then(
                      function () {
                        return fsEmptyDir(sourcePath).then(
                          function () {
                            return fsRmdir(sourcePath).then(
                              function () {
                                log.info('BUILD DONE');
                              }
                            );
                          }
                        )
                      }
                    )
                  }
                );
              }
            )
          },
          function (err) {
            console.log(err);
          }
        );
      }
    );
  }
);


