const { request } = require('../utils/request');

const BASE = '/order/api/addresses';

// C1: list current user's saved shipping addresses (default first).
function listAddresses(userId) {
  return request.get(BASE, { params: { userId } });
}

// C1: create a new shipping address.
function createAddress(data) {
  return request.post(BASE, data);
}

// C1: update an existing shipping address.
function updateAddress(id, data) {
  return request.put(`${BASE}/${id}`, data);
}

// C1: delete a shipping address.
function deleteAddress(id) {
  return request.delete(`${BASE}/${id}`);
}

module.exports = { listAddresses, createAddress, updateAddress, deleteAddress };
