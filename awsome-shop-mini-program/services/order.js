const { request } = require('../utils/request');

const ORDER_BASE = '/order/api/orders';

function redeemProduct(data) {
  return request.post(ORDER_BASE, data);
}

function listMyOrders(params) {
  return request.get(ORDER_BASE, { params });
}

function getMyOrder(id) {
  return request.get(`${ORDER_BASE}/${id}`);
}

module.exports = { redeemProduct, listMyOrders, getMyOrder };
