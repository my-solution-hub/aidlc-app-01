const { listProducts } = require('../../services/product');
const { listCategories } = require('../../services/category');
const { getBalance } = require('../../services/point');
const { getUser } = require('../../utils/auth');
const { categoryStyle } = require('../../utils/orderStatus');
const { formatNumber } = require('../../utils/format');

const PAGE_SIZE = 20;

function decorate(records) {
  return (records || []).map((p) => {
    const style = categoryStyle(p.category);
    return {
      ...p,
      pointsPriceFmt: formatNumber(p.pointsPrice || 0),
      categoryBg: style.bg,
      categoryColor: style.color,
      unavailable: p.status !== 1 || (p.stock || 0) <= 0,
    };
  });
}

Page({
  data: {
    user: null,
    balance: 0,
    balanceFmt: '0',
    categories: [{ key: '', label: '全部' }],
    activeCategory: '',
    keyword: '',
    products: [],
    page: 1,
    pages: 1,
    total: 0,
    loading: false,
    loadingMore: false,
  },

  onLoad() {
    const user = getUser();
    if (!user) {
      wx.reLaunch({ url: '/pages/login/index' });
      return;
    }
    this.setData({ user });
    this.loadCategories();
    this.loadFirst();
    this.fetchBalance();
  },

  onShow() {
    if (!getUser()) {
      wx.reLaunch({ url: '/pages/login/index' });
      return;
    }
    this.fetchBalance();
  },

  onPullDownRefresh() {
    Promise.all([this.loadFirst(), this.fetchBalance()]).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    this.loadMore();
  },

  async loadCategories() {
    try {
      const tree = await listCategories();
      const tops = (tree || [])
        .filter((c) => c.status !== 0)
        .map((c) => ({ key: c.name, label: c.name }));
      this.setData({ categories: [{ key: '', label: '全部' }, ...tops] });
    } catch (e) {
      // ignore — keep default "全部"
    }
  },

  async fetchBalance() {
    const user = this.data.user || getUser();
    if (!user) return;
    try {
      const b = await getBalance(user.userId);
      this.setData({
        balance: b.balance,
        balanceFmt: formatNumber(b.balance),
      });
    } catch (e) {
      // ignore
    }
  },

  async loadFirst() {
    this.setData({ loading: true });
    try {
      const res = await listProducts({
        page: 1,
        size: PAGE_SIZE,
        category: this.data.activeCategory || undefined,
        name: this.data.keyword || undefined,
      });
      this.setData({
        products: decorate(res.records),
        page: res.current,
        pages: res.pages,
        total: res.total,
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadMore() {
    const { loading, loadingMore, page, pages } = this.data;
    if (loading || loadingMore || page >= pages) return;
    this.setData({ loadingMore: true });
    try {
      const res = await listProducts({
        page: page + 1,
        size: PAGE_SIZE,
        category: this.data.activeCategory || undefined,
        name: this.data.keyword || undefined,
      });
      this.setData({
        products: this.data.products.concat(decorate(res.records)),
        page: res.current,
        pages: res.pages,
      });
    } finally {
      this.setData({ loadingMore: false });
    }
  },

  onCategoryTap(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.activeCategory) return;
    this.setData({ activeCategory: key });
    this.loadFirst();
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.loadFirst();
  },

  onProductTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/product-detail/index?id=${id}` });
  },

  onRedeemTap(e) {
    e.stopPropagation && e.stopPropagation();
    const { id, unavailable } = e.currentTarget.dataset;
    if (unavailable) return;
    wx.navigateTo({ url: `/pages/confirm-redemption/index?productId=${id}` });
  },

  onBrowse() {
    wx.pageScrollTo({ scrollTop: 360, duration: 300 });
  },
});
