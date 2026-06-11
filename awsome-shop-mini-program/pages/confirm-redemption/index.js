const { getProduct } = require('../../services/product');
const { getBalance } = require('../../services/point');
const { redeemProduct } = require('../../services/order');
const { listAddresses, createAddress } = require('../../services/address');
const { getUser } = require('../../utils/auth');
const { categoryStyle } = require('../../utils/orderStatus');
const { formatNumber } = require('../../utils/format');
const { resolveImageUrl } = require('../../utils/image');

Page({
  data: {
    productId: null,
    product: null,
    balance: 0,
    cost: 0,
    totalCost: 0,
    remaining: 0,
    quantity: 1,
    color: '',
    insufficient: false,
    unavailable: true,
    loading: true,
    redeeming: false,
    categoryBg: '#F1F5F9',
    categoryColor: '#64748B',
    productImageResolved: '',
    costFmt: '0',
    totalCostFmt: '0',
    balanceFmt: '0',
    remainingFmt: '0',
    addresses: [],
    selectedAddressId: null,
    needAddress: false,
    showAddressForm: false,
    addressForm: {
      receiver: '',
      phone: '',
      region: '',
      detail: '',
      postalCode: '',
      isDefault: 1,
    },
    savingAddress: false,
  },

  onLoad(query) {
    const productId = Number(query.productId);
    const quantity = Math.max(1, Number(query.quantity) || 1);
    const color = query.color ? decodeURIComponent(query.color) : '';
    this.setData({ productId, quantity, color });
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
      const totalCost = cost * this.data.quantity;
      const balance = balanceObj.balance || 0;
      const remaining = balance - totalCost;
      const style = categoryStyle(product.category);
      this.setData({
        product,
        balance,
        cost,
        totalCost,
        remaining,
        insufficient: remaining < 0,
        unavailable: product.status !== 1 || (product.stock || 0) <= 0,
        categoryBg: style.bg,
        categoryColor: style.color,
        productImageResolved: resolveImageUrl(product.imageUrl),
        costFmt: formatNumber(cost),
        totalCostFmt: formatNumber(totalCost),
        balanceFmt: formatNumber(balance),
        remainingFmt: formatNumber(remaining),
      });
      await this.loadAddresses();
    } catch (e) {
      wx.showToast({ title: '加载兑换信息失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadAddresses() {
    const user = getUser();
    if (!user) return;
    try {
      const list = await listAddresses(user.userId);
      const addresses = list || [];
      let selectedAddressId = this.data.selectedAddressId;
      if (!selectedAddressId || !addresses.some((a) => a.id === selectedAddressId)) {
        const def = addresses.find((a) => a.isDefault === 1) || addresses[0];
        selectedAddressId = def ? def.id : null;
      }
      this.setData({
        addresses,
        selectedAddressId,
        needAddress: addresses.length > 0 && selectedAddressId == null,
      });
    } catch (e) {
      // best-effort
    }
  },

  onSelectAddress(e) {
    const id = Number(e.currentTarget.dataset.id);
    this.setData({ selectedAddressId: id, needAddress: false });
  },

  onShowAddressForm() {
    this.setData({ showAddressForm: true });
  },

  onHideAddressForm() {
    this.setData({ showAddressForm: false });
  },

  onAddressInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`addressForm.${field}`]: e.detail.value });
  },

  async onSaveAddress() {
    const user = getUser();
    if (!user) return;
    const f = this.data.addressForm;
    if (!f.receiver || !f.phone || !f.region || !f.detail) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    this.setData({ savingAddress: true });
    try {
      const saved = await createAddress({
        userId: user.userId,
        receiver: f.receiver,
        phone: f.phone,
        region: f.region,
        detail: f.detail,
        postalCode: f.postalCode || undefined,
        isDefault: f.isDefault ? 1 : 0,
      });
      this.setData({
        showAddressForm: false,
        addressForm: { receiver: '', phone: '', region: '', detail: '', postalCode: '', isDefault: 1 },
        selectedAddressId: saved && saved.id,
      });
      await this.loadAddresses();
    } catch (err) {
      wx.showToast({ title: err.message || '保存地址失败', icon: 'none' });
    } finally {
      this.setData({ savingAddress: false });
    }
  },

  async onConfirm() {
    if (this.data.insufficient || this.data.unavailable || this.data.needAddress) return;
    const user = getUser();
    if (!user || !this.data.product) return;

    this.setData({ redeeming: true });
    try {
      const record = await redeemProduct({
        productId: this.data.product.id,
        quantity: this.data.quantity,
        userId: user.userId,
        employeeName: user.displayName,
        addressId: this.data.selectedAddressId || undefined,
      });
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
