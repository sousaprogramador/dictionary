const path = require('path');
const ds = require(
  path.join(__dirname, 'dist', 'src', 'infra', 'database', 'data-source.js'),
);
module.exports = ds.default || ds.dataSource || ds;
