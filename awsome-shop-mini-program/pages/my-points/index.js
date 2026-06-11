const { getBalance, listTransactions } = require('../../services/point');
const { listMyOrders } = require('../../services/order');
const { getUser, logoutLocal } = require('../../utils/auth');
const { logout: apiLogout } = require('../../services/auth');
const { formatNumber, formatDateTime } = require('../../utils/format');

const EARN_WAYS = [
  { key: 'seniority', icon: '👔', bg: '#EFF6FF', color: '#2563EB',
    title: '工龄积分', desc: '每满一年工龄自动发放 1,000 积分', amount: '+1,000/年' },
  { key: 'performance', icon: '🏆', bg: '#FFF7ED', color: '#D97706',
    title: '绩效奖励', desc: '季度绩效 A 级以上额外奖励积分', amount: '+500~2,000' },
  { key: 'holiday', icon: '🎉', bg: '#DCFCE7', color: '#16A34A',
    title: '节日福利', desc: '春节、中秋等节日发放福利积分', amount: '+200~800' },
  { key: 'contribution', icon: '🎖️', bg: '#FEE2E2', color: '#DC2626',
    title: '特别贡献', desc: '重大项目贡献、创新提案等专项奖励', amount: '+500~5,000' },
];

const FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'income', label: '收入' },
  { key: 'expense', label: '支出' },
];

function decorateTxn(txns) {
  return (txns || []).map((t) => {
    const positive = (t.amount || 0) >= 0;
    return {
      ...t,
      positive,
      sign: positive ? '+' : '',
      amountFmt: formatNumber(t.amount || 0),
      balanceFmt: t.balance == null ? '—' : formatNumber(t.balance),
      timeFmt: formatDateTime(t.createdAt),
    };
  });
}

Page({
  data: {
    user: null,
    balance: null,
    balanceFmt: '0',
    totalEarnedFmt: '0',
    totalUsedFmt: '0',
    exchangeCount: 0,
    transactions: [],
    displayTxns: [],
    earnWays: EARN_WAYS,
    filters: FILTERS,
    activeFilter: 'all',
    loading: false,
  },

  onShow() {
    const user = getUser();
    if (!user) {
      wx.reLaunch({ url: '/pages/login/index' });
      return;
    }
    this.setData({ user });
    this.fetchAll();
  },

  onPullDownRefresh() {
    this.fetchAll().finally(() => wx.stopPullDownRefresh());
  },

  async fetchAll() {
    const user = this.data.user || getUser();
    if (!user) return;
    this.setData({ loading: true });
    try {
      const [b, txns, orders] = await Promise.all([
        getBalance(user.userId).catch(() => null),
        listTransactions({ userId: user.userId, page: 1, size: 50 }).catch(() => null),
        listMyOrders({ userId: user.userId, page: 1, size: 1 }).catch(() => null),
      ]);
      const updates = {};
      if (b) {
        updates.balance = b;
        updates.balanceFmt = formatNumber(b.balance || 0);
        updates.totalEarnedFmt = formatNumber(b.totalEarned || 0);
        updates.totalUsedFmt = formatNumber(b.totalUsed || 0);
      }
      if (txns) {
        const decorated = decorateTxn(txns.records);
        updates.transactions = decorated;
        updates.displayTxns = this.applyFilter(decorated);
      }
      if (orders) {
        updates.exchangeCount = orders.total || 0;
      }
      this.setData(updates);
    } finally {
      this.setData({ loading: false });
    }
  },

  applyFilter(records, filterOverride) {
    const filter = filterOverride !== undefined ? filterOverride : this.data.activeFilter;
    if (filter === 'income') return records.filter((r) => (r.amount || 0) >= 0);
    if (filter === 'expense') return records.filter((r) => (r.amount || 0) < 0);
    return records;
  },

  onFilterTap(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.activeFilter) return;
    this.setData({
      activeFilter: key,
      displayTxns: this.applyFilter(this.data.transactions, key),
    });
  },

  goShop() {
    wx.switchTab({ url: '/pages/shop-home/index' });
  },

  goOrders() {
    wx.switchTab({ url: '/pages/my-orders/index' });
  },

  scrollToEarn() {
    wx.pageScrollTo({ selector: '#earn-ways', duration: 300 });
  },

  async onLogout() {
    const res = await new Promise((resolve) => {
      wx.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        success: resolve,
      });
    });
    if (!res.confirm) return;
    try {
      await apiLogout();
    } catch (e) {
      // ignore — proceed with local logout regardless
    }
    logoutLocal();
    wx.reLaunch({ url: '/pages/login/index' });
  },
});
