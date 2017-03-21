var path = require('path');

var dataFilePath = path.resolve(path.join(__dirname, '../demo/demo.data.js'));

delete require.cache[dataFilePath];

var data = require(dataFilePath);

data.content = "icon";

data.icons = [
  {
    title: 'account',
    name: 'account_box'
  },
  {
    title: 'chevron left',
    name: 'chevron_left'
  },
  {
    title: 'chevron right',
    name: 'chevron_right'
  },
  {
    title: 'language',
    name: 'language'
  },
  {
    title: 'search',
    name: 'search'
  },
  {
    title: 'share',
    name: 'share'
  }
];

module.exports = {
  deps: [dataFilePath],
  data: data
};
