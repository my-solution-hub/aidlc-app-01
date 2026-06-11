const auth = require('../../services/auth');
const { setToken, setUser } = require('../../utils/auth');

Page({
  data: {
    username: '',
    password: '',
    showPassword: false,
    loading: false,
    errorMsg: '',
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value });
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  toggleShowPassword() {
    this.setData({ showPassword: !this.data.showPassword });
  },

  async onLogin() {
    const { username, password } = this.data;
    if (!username || !password) return;

    this.setData({ loading: true, errorMsg: '' });
    try {
      const res = await auth.login({ username, password });
      setToken(res.token);
      setUser({
        userId: res.userId,
        username: res.username,
        displayName: res.nickname,
        role: (res.role || '').toLowerCase(),
      });
      wx.reLaunch({ url: '/pages/shop-home/index' });
    } catch (err) {
      this.setData({ errorMsg: err.message || '用户名或密码错误' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goRegister() {
    wx.navigateTo({ url: '/pages/register/index' });
  },
});
