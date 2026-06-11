const auth = require('../../services/auth');

Page({
  data: {
    username: '',
    password: '',
    nickname: '',
    employeeId: '',
    showPassword: false,
    loading: false,
    errorMsg: '',
    successMsg: '',
  },

  onUsernameInput(e) { this.setData({ username: e.detail.value }); },
  onPasswordInput(e) { this.setData({ password: e.detail.value }); },
  onNicknameInput(e) { this.setData({ nickname: e.detail.value }); },
  onEmployeeIdInput(e) { this.setData({ employeeId: e.detail.value }); },
  toggleShowPassword() { this.setData({ showPassword: !this.data.showPassword }); },

  async onRegister() {
    this.setData({ errorMsg: '' });
    const username = this.data.username.trim();
    const { password, nickname, employeeId } = this.data;

    if (username.length < 3 || username.length > 20) {
      this.setData({ errorMsg: '用户名长度需为 3-20 个字符' });
      return;
    }
    if (password.length < 6) {
      this.setData({ errorMsg: '密码长度至少 6 个字符' });
      return;
    }

    this.setData({ loading: true });
    try {
      await auth.register({
        username,
        password,
        nickname: nickname || undefined,
        employeeId: employeeId.trim() || undefined,
      });
      this.setData({ successMsg: '注册成功，请登录' });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/login/index' });
      }, 1200);
    } catch (err) {
      this.setData({ errorMsg: err.message || '注册失败' });
    } finally {
      this.setData({ loading: false });
    }
  },

  goLogin() {
    wx.redirectTo({ url: '/pages/login/index' });
  },
});
