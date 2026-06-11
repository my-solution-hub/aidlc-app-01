const { getProduct } = require('../../services/product');
const { categoryStyle } = require('../../utils/orderStatus');
const { formatNumber } = require('../../utils/format');

Page({
  data: {
    id: null,
    product: null,
    loading: true,
    categoryBg: '#F1F5F9',
    categoryColor: '#64748B',
    pointsPriceFmt: '0',
    actionLabel: '立即兑换',
    unavailable: true,
  },

  onLoad(query) {
    const id = Number(query.id);
    this.setData({ id });
    this.fetchProduct();
  },

  async fetchProduct() {
    this.setData({ loading: true });
    try {
      const product = await getProduct(this.data.id);
      const style = categoryStyle(product.category);
      const unavailable = product.status !== 1 || (product.stock || 0) <= 0;
      let actionLabel = '立即兑换';
      if (product.status !== 1) actionLabel = '已下架';
      else if ((product.stock || 0) <= 0) actionLabel = '已售罄';
      this.setData({
        product,
        categoryBg: style.bg,
        categoryColor: style.color,
        pointsPriceFmt: formatNumber(product.pointsPrice),
        actionLabel,
        unavailable,
      });
    } catch (e) {
      wx.showToast({ title: '加载商品失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onRedeem() {
    if (this.data.unavailable) return;
    wx.navigateTo({ url: `/pages/confirm-redemption/index?productId=${this.data.id}` });
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },
});
