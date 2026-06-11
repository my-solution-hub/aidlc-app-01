const { request } = require('../utils/request');

const PRODUCT_BASE = '/product/api/products';

function listProducts(params) {
  return request.get(PRODUCT_BASE, { params });
}

function getProduct(id) {
  return request.get(`${PRODUCT_BASE}/${id}`);
}

module.exports = { listProducts, getProduct };
