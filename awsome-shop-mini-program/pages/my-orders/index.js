const { listMyOrders } = require('../../services/order');
const { getUser } = require('../../utils/auth');
const { statusStyle, statusLabel } = require('../../utils/orderStatus');
const { formatNumber, formatDateTime } = require('../../utils/format');

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
      statusBg: style.bgColor,
      statusColor: style.textColor,
      statusLabel: statusLabel(r.status),
      pointsCostFmt: formatNumber(r.pointsCost || 0),
      timeFmt: formatDateTime(r.exchangeTime || r.createdAt),
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
      });
      const records = decorate(res.records);
      this.setData({
        records,
        displayRecords: this.applyFilter(records),
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
      });
      const records = this.data.records.concat(decorate(res.records));
      this.setData({
        records,
        displayRecords: this.applyFilter(records),
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
    const keyword = e.detail.value;
    this.setData({
      keyword,
      displayRecords: this.applyFilter(this.data.records, keyword),
    });
  },

  onOrderTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/order-detail/index?id=${id}` });
  },

  // Client-side keyword filter — backend list endpoint has no keyword param.
  applyFilter(records, keywordOverride) {
    const raw = keywordOverride !== undefined ? keywordOverride : this.data.keyword;
    const kw = (raw || '').trim().toLowerCase();
    if (!kw) return records;
    return records.filter(
      (r) =>
        (r.orderNo || '').toLowerCase().includes(kw) ||
        (r.productName || '').toLowerCase().includes(kw),
    );
  },
});
