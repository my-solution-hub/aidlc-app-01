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

// US-016 / C3: employee confirms receipt of a delivered order.
function confirmReceipt(id, userId) {
  return request.post(`${ORDER_BASE}/${id}/confirm-receipt`, undefined, {
    params: { userId },
  });
}

module.exports = { redeemProduct, listMyOrders, getMyOrder, confirmReceipt };
