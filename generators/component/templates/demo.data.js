var path = require('path');

var dataFilePath = path.resolve(path.join(__dirname, '../demo/demo.data.js'));

delete require.cache[dataFilePath];

var data = require(dataFilePath);

data.content = "<%= componentDescription %>";

module.exports = {
  deps: [dataFilePath],
  data: data
};
