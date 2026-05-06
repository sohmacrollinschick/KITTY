require('dotenv').config();

const app = require('../src/app');

module.exports = async (req, res) => {
  return app(req, res);
};
