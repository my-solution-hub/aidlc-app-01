const { getProduct } = require('../../services/product');
const { getBalance } = require('../../services/point');
const { redeemProduct } = require('../../services/order');
const { getUser } = require('../../utils/auth');
const { categoryStyle } = require('../../utils/orderStatus');
const { formatNumber } = require('../../utils/format');

Page({
  data: {
    productId: null,
    product: null,
    balance: 0,
    cost: 0,
    remaining: 0,
    insufficient: false,
    unavailable: true,
    loading: true,
    redeeming: false,
    categoryBg: '#F1F5F9',
    categoryColor: '#64748B',
    costFmt: '0',
    balanceFmt: '0',
    remainingFmt: '0',
  },

  onLoad(query) {
    const productId = Number(query.productId);
    this.setData({ productId });
    this.fetchData();
  },

  async fetchData() {
    const user = getUser();
    if (!user) {
      wx.reLaunch({ url: '/pages/login/index' });
      return;
    }
    this.setData({ loading: true });
    try {
      const [product, balanceObj] = await Promise.all([
        getProduct(this.data.productId),
        getBalance(user.userId),
      ]);
      const cost = product.pointsPrice || 0;
      const balance = balanceObj.balance || 0;
      const remaining = balance - cost;
      const style = categoryStyle(product.category);
      this.setData({
        product,
        balance,
        cost,
        remaining,
        insufficient: remaining < 0,
        unavailable: product.status !== 1 || (product.stock || 0) <= 0,
        categoryBg: style.bg,
        categoryColor: style.color,
        costFmt: formatNumber(cost),
        balanceFmt: formatNumber(balance),
        remainingFmt: formatNumber(remaining),
      });
    } catch (e) {
      wx.showToast({ title: '加载兑换信息失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async onConfirm() {
    if (this.data.insufficient || this.data.unavailable) return;
    const user = getUser();
    if (!user || !this.data.product) return;

    this.setData({ redeeming: true });
    try {
      const record = await redeemProduct({
        productId: this.data.product.id,
        quantity: 1,
        userId: user.userId,
        employeeName: user.displayName,
      });
      // Stash success payload into globalData for next page.
      const app = getApp();
      app.globalData.lastRedemption = {
        record,
        remaining: this.data.remaining,
      };
      wx.redirectTo({ url: '/pages/redemption-success/index' });
    } catch (err) {
      wx.showToast({ title: err.message || '兑换失败', icon: 'none' });
    } finally {
      this.setData({ redeeming: false });
    }
  },

  onCancel() {
    wx.navigateBack({ delta: 1 });
  },
});
