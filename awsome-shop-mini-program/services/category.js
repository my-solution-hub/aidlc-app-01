const { request } = require('../utils/request');

function listCategories(params) {
  return request.get('/product/api/categories/tree', { params });
}

module.exports = { listCategories };
