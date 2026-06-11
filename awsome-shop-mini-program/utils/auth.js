const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function getToken() {
  try {
    return wx.getStorageSync(TOKEN_KEY) || '';
  } catch (e) {
    return '';
  }
}

function setToken(token) {
  wx.setStorageSync(TOKEN_KEY, token);
}

function clearToken() {
  wx.removeStorageSync(TOKEN_KEY);
}

function getUser() {
  try {
    return wx.getStorageSync(USER_KEY) || null;
  } catch (e) {
    return null;
  }
}

function setUser(user) {
  wx.setStorageSync(USER_KEY, user);
  const app = getApp();
  if (app) app.globalData.user = user;
}

function clearUser() {
  wx.removeStorageSync(USER_KEY);
  const app = getApp();
  if (app) app.globalData.user = null;
}

function isAuthenticated() {
  return Boolean(getToken() && getUser());
}

function logoutLocal() {
  clearToken();
  clearUser();
}

module.exports = {
  TOKEN_KEY,
  USER_KEY,
  getToken,
  setToken,
  clearToken,
  getUser,
  setUser,
  clearUser,
  isAuthenticated,
  logoutLocal,
};
