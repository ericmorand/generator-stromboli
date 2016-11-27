var path = require('path');
var deps = [];

var dataFilePath = path.resolve(path.join(__dirname, '../demo/demo.data.js'));

delete require.cache[dataFilePath];

var data = require(dataFilePath);

deps.push (dataFilePath);

data.content = "Lorem ipsum dolor sit amet";

module.exports = {
  deps: deps,
  data: data
};
