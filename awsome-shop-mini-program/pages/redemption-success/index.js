const { formatNumber } = require('../../utils/format');

Page({
  data: {
    record: null,
    remaining: 0,
    pointsCostFmt: '0',
    remainingFmt: '0',
  },

  onLoad() {
    const app = getApp();
    const data = app.globalData.lastRedemption;
    if (!data || !data.record) {
      wx.reLaunch({ url: '/pages/my-orders/index' });
      return;
    }
    this.setData({
      record: data.record,
      remaining: data.remaining,
      pointsCostFmt: formatNumber(data.record.pointsCost || 0),
      remainingFmt: formatNumber(data.remaining || 0),
    });
    // Consume to avoid showing stale data on next visit.
    app.globalData.lastRedemption = null;
  },

  onViewOrder() {
    if (!this.data.record) return;
    wx.redirectTo({ url: `/pages/order-detail/index?id=${this.data.record.id}` });
  },

  onContinue() {
    wx.switchTab({ url: '/pages/shop-home/index' });
  },
});
