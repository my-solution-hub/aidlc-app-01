const { listMyOrders, confirmReceipt } = require('../../services/order');
const { getUser } = require('../../utils/auth');
const { statusStyle, statusLabel } = require('../../utils/orderStatus');
const { formatNumber, formatDateTime } = require('../../utils/format');
const { resolveImageUrl } = require('../../utils/image');

const PAGE_SIZE = 10;

const TABS = [
  { key: 'all', label: '全部', status: '' },
  { key: 'pending', label: '待发货', status: 'PENDING_DELIVERY' },
  { key: 'delivering', label: '已发货', status: 'DELIVERING' },
  { key: 'completed', label: '已完成', status: 'COMPLETED' },
  { key: 'cancelled', label: '已取消', status: 'CANCELLED' },
];

function decorate(records) {
  return (records || []).map((r) => {
    const style = statusStyle(r.status);
    return {
      ...r,
      productImageResolved: resolveImageUrl(r.productImageUrl),
      statusBg: style.bgColor,
      statusColor: style.textColor,
      statusLabel: statusLabel(r.status),
      pointsCostFmt: formatNumber(r.pointsCost || 0),
      timeFmt: formatDateTime(r.exchangeTime || r.createdAt),
      canConfirmReceipt: r.status === 'DELIVERING',
    };
  });
}

Page({
  data: {
    tabs: TABS,
    activeTab: 'all',
    activeStatus: '',
    keyword: '',
    records: [],
    displayRecords: [],
    page: 1,
    pages: 1,
    total: 0,
    loading: false,
    loadingMore: false,
    confirmingId: null,
  },

  onShow() {
    if (!getUser()) {
      wx.reLaunch({ url: '/pages/login/index' });
      return;
    }
    this.loadFirst();
  },

  onPullDownRefresh() {
    this.loadFirst().finally(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    this.loadMore();
  },

  async loadFirst() {
    const user = getUser();
    if (!user) return;
    this.setData({ loading: true });
    try {
      const res = await listMyOrders({
        userId: user.userId,
        page: 1,
        size: PAGE_SIZE,
        status: this.data.activeStatus || undefined,
        keyword: this.data.keyword || undefined,
      });
      const records = decorate(res.records);
      this.setData({
        records,
        displayRecords: records,
        page: res.current,
        pages: res.pages,
        total: res.total,
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadMore() {
    const user = getUser();
    const { loading, loadingMore, page, pages } = this.data;
    if (!user || loading || loadingMore || page >= pages) return;
    this.setData({ loadingMore: true });
    try {
      const res = await listMyOrders({
        userId: user.userId,
        page: page + 1,
        size: PAGE_SIZE,
        status: this.data.activeStatus || undefined,
        keyword: this.data.keyword || undefined,
      });
      const records = this.data.records.concat(decorate(res.records));
      this.setData({
        records,
        displayRecords: records,
        page: res.current,
        pages: res.pages,
      });
    } finally {
      this.setData({ loadingMore: false });
    }
  },

  onTabTap(e) {
    const key = e.currentTarget.dataset.key;
    const tab = TABS.find((t) => t.key === key);
    if (!tab || tab.key === this.data.activeTab) return;
    this.setData({ activeTab: tab.key, activeStatus: tab.status, page: 1 });
    this.loadFirst();
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.setData({ page: 1 });
    this.loadFirst();
  },

  onOrderTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/order-detail/index?id=${id}` });
  },

  async onConfirmReceipt(e) {
    e.stopPropagation && e.stopPropagation();
    const id = Number(e.currentTarget.dataset.id);
    const user = getUser();
    if (!user || !id) return;
    this.setData({ confirmingId: id });
    try {
      await confirmReceipt(id, user.userId);
      wx.showToast({ title: '确认收货成功', icon: 'success' });
      this.loadFirst();
    } catch (err) {
      wx.showToast({ title: err.message || '确认收货失败', icon: 'none' });
    } finally {
      this.setData({ confirmingId: null });
    }
  },
});
