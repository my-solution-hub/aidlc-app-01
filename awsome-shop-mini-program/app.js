// AWSome Shop Mini Program — global App entry.
const { isAuthenticated } = require('./utils/auth');
const { CONFIG } = require('./utils/config');

App({
  globalData: {
    apiBaseUrl: CONFIG.apiBaseUrl,
    user: null,
  },

  onLaunch() {
    // Restore persisted user info if any.
    try {
      const cached = wx.getStorageSync('user');
      if (cached) this.globalData.user = cached;
    } catch (e) {
      // ignore
    }
  },

  // Pages call this from onShow to bounce unauthenticated users to /login.
  requireAuth() {
    if (!isAuthenticated()) {
      wx.reLaunch({ url: '/pages/login/index' });
      return false;
    }
    return true;
  },
});
