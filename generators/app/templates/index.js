'use strict';

var path = require('path');
var merge = require('merge');
var config = require('./config.js');

var Stromboli = require('stromboli');
var stromboli = new Stromboli();

stromboli.start(config).then(
  function (components) {
    var browserSync = require('browser-sync').create();
    var files = [];

    components.forEach(function (component) {
      files.push(path.join('dist', component.name, 'index.css'));
      files.push(path.join('dist', component.name, 'index.js'));
      files.push(path.join('dist', component.name, 'index.html'));
    });

    var browserSyncConfig = merge(config.browsersync, {
      server: 'dist',
      files: files,
      open: false
    });

    return browserSync.init(browserSyncConfig);
  }
);

