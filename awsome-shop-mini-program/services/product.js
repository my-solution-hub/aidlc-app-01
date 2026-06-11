const { request } = require('../utils/request');

const PRODUCT_BASE = '/product/api/products';

function listProducts(params) {
  return request.get(PRODUCT_BASE, { params });
}

function getProduct(id) {
  return request.get(`${PRODUCT_BASE}/${id}`);
}

// D3: related products in the same category (max 6, excludes current).
function getRelatedProducts(id) {
  return request.get(`${PRODUCT_BASE}/${id}/related`);
}

// C5: list reviews for a product.
function listReviews(id) {
  return request.get(`${PRODUCT_BASE}/${id}/reviews`);
}

// C5: submit a review for a product (requires login).
function createReview(id, data) {
  return request.post(`${PRODUCT_BASE}/${id}/reviews`, data);
}

module.exports = { listProducts, getProduct, getRelatedProducts, listReviews, createReview };
