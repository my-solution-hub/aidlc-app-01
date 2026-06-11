const { request } = require('../utils/request');

const BASE = '/product/api/wishlist';

// C6: list current user's wishlist products.
function listWishlist(userId) {
  return request.get(BASE, { params: { userId } });
}

// C6: add a product to the wishlist.
function addWishlist(userId, productId) {
  return request.post(BASE, undefined, { params: { userId, productId } });
}

// C6: remove a product from the wishlist.
function removeWishlist(userId, productId) {
  return request.delete(BASE, { params: { userId, productId } });
}

module.exports = { listWishlist, addWishlist, removeWishlist };
