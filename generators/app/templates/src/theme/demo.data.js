var path = require('path');

var dataFilePath = path.resolve(path.join(__dirname, '../demo/demo.data.js'));

delete require.cache[dataFilePath];

var data = require(dataFilePath);

data.fonts = [
  {
    weight: 100,
    style: 'normal'
  },
  {
    weight: 100,
    style: 'italic'
  },
  {
    weight: 400,
    style: 'normal'
  },
  {
    weight: 400,
    style: 'italic'
  },
  {
    weight: 700,
    style: 'normal'
  },
  {
    weight: 700,
    style: 'italic'
  }
];

module.exports = {
  deps: [dataFilePath],
  data: data
};
