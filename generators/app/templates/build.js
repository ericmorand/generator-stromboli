'use strict';

const fs = require('fs-extra');
const path = require('path');
const merge = require('merge');
const postcss = require('postcss');
const log = require('log-util');
const tmp = require('tmp');

const Promise = require('promise');
const fsCopy = Promise.denodeify(fs.copy);
const fsRemove = Promise.denodeify(fs.remove);
const fsEmptyDir = Promise.denodeify(fs.emptyDir);
const fsReadFile = Promise.denodeify(fs.readFile);
const fsOutputFile = Promise.denodeify(fs.outputFile, 3);
const fsMkdirs = Promise.denodeify(fs.mkdirs, 1);
const Stromboli = require('stromboli');

let componentsBuilderConfig = require('./config/build');
let componentsBuilderRoot = componentsBuilderConfig.componentRoot;

let writer = require('./lib/writer');
let componentsBuilder = new Stromboli();

let build = function (namespace) {
  let distPath = componentsBuilderConfig.distPath;

  return new Promise(function(fulfill, reject) {
    tmp.dir({
      unsafeCleanup: true
    }, function (err, tmpPath) {
      if (err) {
        reject(err);
      }

      let output = namespace || process.env.npm_package_name;

      componentsBuilderConfig.componentRoot = path.join(componentsBuilderConfig.componentRoot, namespace || '');

      distPath = path.join(distPath, output);

      let splashComponents = [
        `Build started`,
        `Namespace: ${namespace || 'all of them'}`,
        `Output: ${distPath}`
      ];

      let length = 0;

      splashComponents.forEach(function (splashComponent) {
        length = Math.max(splashComponent.length, length);
      });

      splashComponents.splice(1, 0, '='.repeat(length));
      splashComponents.push('='.repeat(length));

      splashComponents.forEach(function (splashComponent) {
        componentsBuilder.warn(splashComponent);
      });

      return fsEmptyDir(distPath).then(
        function () {
          return Promise.all([
            componentsBuilder.getPlugins(componentsBuilderConfig),
            componentsBuilder.getComponents(componentsBuilderConfig.componentRoot, componentsBuilderConfig.componentManifest)
          ]).then(
            function (results) {
              let plugins = results[0];
              let components = results[1];

              if (components.length) {
                components.forEach(function (component) {
                  plugins.forEach(function (plugin) {
                    let entry = plugin.entry;
                    let entryPath = path.join(component.path, entry);

                    if (!plugin.entries) {
                      plugin.entries = [];
                    }

                    try {
                      fs.statSync(entryPath);

                      plugin.entries.push(entryPath);
                    }
                    catch (err) {
                    }
                  });
                });

                // create the final component
                let promises = [];

                plugins.forEach(function (plugin) {
                  let data = '';

                  plugin.entries.forEach(function (entry) {
                    switch (plugin.name) {
                      case 'js':
                        data += 'require("' + path.relative(tmpPath, entry) + '");';
                        break;
                      case 'css':
                        data += '@import "' + path.relative(tmpPath, entry) + '";';
                        break;
                      case 'html':
                        data += '{% include "' + path.relative(tmpPath, entry) + '" %}';
                    }
                  });

                  promises.push(fsOutputFile(path.join(tmpPath, plugin.entry), data));
                });

                // manifest
                let manifest = {
                  name: 'build'
                };

                promises.push(fsOutputFile(path.join(tmpPath, 'component.json'), JSON.stringify(manifest)));

                return Promise.all(promises).then(
                  function () {
                    // build the final component
                    componentsBuilderConfig.componentRoot = tmpPath;
                    componentsBuilderConfig.componentManifest = 'component.json';

                    return componentsBuilder.start(componentsBuilderConfig).then(
                      function (components) {
                        // write
                        return writer.writeComponents(components, distPath).then(
                          function () {
                            let processStylesheet = function (stylesheet) {
                              return fsReadFile(stylesheet).then(
                                function (css) {
                                  let postCssPlugins = [
                                    require('cssnano')({
                                      discardDuplicates: true,
                                      discardComments: true,
                                      zindex: false // https://github.com/ben-eb/gulp-cssnano/issues/8
                                    }),
                                    require('postcss-copy')({
                                      src: path.resolve('.'),
                                      dest: distPath,
                                      inputPath: function (decl) {
                                        return path.resolve('.');
                                      },
                                      template: function (fileMeta) {
                                        return 'assets/' + fileMeta.hash + '.' + fileMeta.ext;
                                      },
                                      relativePath: function (dirname, fileMeta, result, options) {
                                        return path.dirname(fileMeta.sourceInputFile);
                                      },
                                      hashFunction: function (contents) {
                                        // sha256
                                        const createSha = require('sha.js');

                                        return createSha('sha256').update(contents).digest('hex');
                                      }
                                    })
                                  ];

                                  return postcss(postCssPlugins).process(css.toString(), {
                                    from: stylesheet,
                                    map: false
                                  }).then(
                                    function (result) {
                                      return fsOutputFile(path.join(path.dirname(stylesheet), path.basename(stylesheet)), result.css);
                                    }
                                  );
                                }
                              )
                            };

                            let finalizeStylesheet = function (stylesheet) {
                              let to = path.join(distPath, 'css', path.basename(stylesheet));

                              return fsMkdirs(path.dirname(to)).then(
                                function () {
                                  return fsCopy(stylesheet, to).then(
                                    function () {
                                      return processStylesheet(to);
                                    }
                                  )
                                }
                              )
                            };

                            let finalizeScript = function (script) {
                              let to = path.join(distPath, 'js', path.basename(script));

                              return fsCopy(script, to);
                            };

                            let promises = [];

                            // css
                            components.forEach(function (component) {
                              let stylesheet = path.join(distPath, component.name, 'index.css');

                              promises.push(finalizeStylesheet(stylesheet));
                            });

                            // js
                            components.forEach(function (component) {
                              let script = path.join(distPath, component.name, 'index.js');

                              promises.push(finalizeScript(script));
                            });

                            // html
                            components.forEach(function (component) {
                              let renderResult = component.renderResults.get('html');

                              renderResult.sourceDependencies.forEach(function (dependency) {
                                if (dependency !== renderResult.source) {
                                  let relativeDependencyPath = path.relative(componentsBuilderRoot, dependency);
                                  let to = path.join(distPath, 'templates', relativeDependencyPath);

                                  promises.push(fsMkdirs(path.dirname(to)).then(
                                    function () {
                                      return fsCopy(dependency, to);
                                    }
                                  ));
                                }
                              });
                            });

                            // clean
                            return Promise.all(promises).then(
                              function () {
                                let promises = [];

                                components.forEach(function (component) {
                                  promises.push(fsRemove(path.join(distPath, component.name)));
                                });

                                return Promise.all(promises).then(
                                  function() {
                                    fulfill();
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    )
                  }
                );
              }
            }
          );
        }
      );
    });
  });
};

let namespacePromise;

if (!process.stdout.isTTY) {
  namespacePromise = Promise.resolve(null);
}
else if (process.argv[2]) {
  namespacePromise = Promise.resolve(process.argv[2]);
}
else {
  namespacePromise = new Promise(function (fulfill, reject) {
    const Inquirer = require('inquirer');
    const Finder = require('fs-finder');

    Finder.in(componentsBuilderConfig.componentRoot).findDirectories(function (directories) {
      let choices = directories.map(function (directory) {
        return path.relative(componentsBuilderConfig.componentRoot, directory);
      });

      let questions = [
        {
          name: 'namespace',
          message: 'Which namespace do you want to build?',
          type: 'list',
          pageSize: 10,
          choices: [
            new Inquirer.Separator(),
            {
              name: 'all of them',
              value: null
            },
            new Inquirer.Separator()
          ].concat(choices)
        }
      ];

      Inquirer.prompt(questions).then(function (answers) {
        fulfill(answers.namespace);
      });
    });
  });
}

namespacePromise.then(
  function (namespace) {
    build(namespace).then(
      function () {
        componentsBuilder.warn('Build done!');
      },
      function (err) {
        componentsBuilder.error(err);
      }
    );
  }
);
