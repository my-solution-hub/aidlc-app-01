const { request } = require('../utils/request');

const POINT_BASE = '/point/api/points';

function getBalance(userId) {
  return request.get(`${POINT_BASE}/balance`, { params: { userId } });
}

function listTransactions(params) {
  return request.get(`${POINT_BASE}/transactions`, { params });
}

module.exports = { getBalance, listTransactions };
