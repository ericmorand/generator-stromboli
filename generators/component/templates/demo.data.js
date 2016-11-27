var path = require('path');
var deps = [];

var dataFilePath = path.resolve(path.join(__dirname, '<%= demoComponentRootRelativePath %>/demo.data.js'));

delete require.cache[dataFilePath];

var data = require(dataFilePath);

deps.push (dataFilePath);

data.content = "<%= componentDescription %>";

module.exports = {
  deps: deps,
  data: data
};
