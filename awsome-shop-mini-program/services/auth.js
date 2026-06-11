const { request } = require('../utils/request');

function login(data) {
  return request.post('/auth/api/auth/login', data);
}

function logout() {
  return request.post('/auth/api/auth/logout');
}

function register(data) {
  return request.post('/auth/api/auth/register', data);
}

function getCurrentUser() {
  return request.get('/auth/api/users/me');
}

module.exports = { login, logout, register, getCurrentUser };
