// Mirrors awsome-shop-frontend/src/utils/image.ts.
//
// Product service stores/returns image URLs as service-internal relative
// paths like `/api/files/xxx.jpg`, but they are exposed through the gateway
// under the `/product` prefix (`/product/api/files/xxx.jpg`).
const { CONFIG } = require('./config');

const API_BASE = (CONFIG.apiBaseUrl || '').replace(/\/+$/, '');

function resolveImageUrl(url) {
  if (!url) return '';
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  let path = url;
  if (path.startsWith('/api/')) {
    path = '/product' + path;
  } else if (!path.startsWith('/')) {
    path = '/product/api/files/' + path;
  }
  return `${API_BASE}${path}`;
}

module.exports = { resolveImageUrl };
