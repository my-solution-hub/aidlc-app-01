// Thin wrapper around wx.request that mirrors the React frontend's
// services/request.ts: injects the JWT, unwraps Result<T>, raises BusinessError
// for non-SUCCESS codes, and bounces 401s back to /login.
const { CONFIG } = require('./config');
const { getToken, logoutLocal } = require('./auth');

const SUCCESS_CODE = 'SUCCESS';
const TIMEOUT = 10000;

class BusinessError extends Error {
  constructor(code, message) {
    super(message || '请求失败');
    this.code = code;
    this.name = 'BusinessError';
  }
}

function buildQuery(params) {
  if (!params) return '';
  const parts = [];
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value === undefined || value === null || value === '') return;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  });
  return parts.length ? `?${parts.join('&')}` : '';
}

function handle401() {
  logoutLocal();
  // getCurrentPages() is a global, not on the wx namespace.
  const pages = (typeof getCurrentPages === 'function') ? getCurrentPages() : [];
  const top = pages.length ? pages[pages.length - 1] : null;
  if (!top || top.route !== 'pages/login/index') {
    wx.reLaunch({ url: '/pages/login/index' });
  }
}

function send(method, url, options) {
  const opts = options || {};
  const fullUrl = `${CONFIG.apiBaseUrl}${url}${buildQuery(opts.params)}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    wx.request({
      url: fullUrl,
      method,
      data: opts.data,
      header: headers,
      timeout: opts.timeout || TIMEOUT,
      success: (res) => {
        if (res.statusCode === 401) {
          handle401();
          reject(new BusinessError('UNAUTHORIZED', '登录已过期，请重新登录'));
          return;
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new BusinessError(`HTTP_${res.statusCode}`, `请求失败 (${res.statusCode})`));
          return;
        }

        const body = res.data;
        if (!body || typeof body !== 'object' || body.code === undefined) {
          // Non-Result response — pass through (matches frontend behavior).
          resolve(body);
          return;
        }
        if (body.code === SUCCESS_CODE) {
          resolve(body.data);
          return;
        }
        reject(new BusinessError(body.code, body.message || '请求失败'));
      },
      fail: (err) => {
        reject(new BusinessError('NETWORK_ERROR', err.errMsg || '网络异常'));
      },
    });
  });
}

const request = {
  get(url, options) {
    return send('GET', url, options);
  },
  post(url, data, options) {
    return send('POST', url, { ...(options || {}), data });
  },
  put(url, data, options) {
    return send('PUT', url, { ...(options || {}), data });
  },
  patch(url, data, options) {
    return send('PATCH', url, { ...(options || {}), data });
  },
  delete(url, options) {
    return send('DELETE', url, options);
  },
};

module.exports = { request, BusinessError };
