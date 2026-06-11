const {
  getProduct,
  getRelatedProducts,
  listReviews,
  createReview,
} = require('../../services/product');
const {
  listWishlist,
  addWishlist,
  removeWishlist,
} = require('../../services/wishlist');
const { categoryStyle } = require('../../utils/orderStatus');
const { formatNumber, formatDateTime } = require('../../utils/format');
const { resolveImageUrl } = require('../../utils/image');
const { getUser } = require('../../utils/auth');

function buildGallery(product) {
  const list = (product.images && product.images.length > 0)
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);
  return list.map((src) => ({ src, resolved: resolveImageUrl(src) }));
}

function parseColors(raw) {
  return (raw || '')
    .split(/[,，]/)
    .map((c) => c.trim())
    .filter(Boolean);
}

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
    gallery: [],
    activeImage: 0,
    activeImageSrc: '',
    colors: [],
    selectedColor: '',
    quantity: 1,
    related: [],
    reviews: [],
    reviewCountLabel: '0',
    wished: false,
    wishBusy: false,
    myRating: 5,
    myReview: '',
    submittingReview: false,
    user: null,
  },

  onLoad(query) {
    const id = Number(query.id);
    const user = getUser();
    this.setData({ id, user });
    this.fetchProduct();
    this.fetchSideData();
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
      const gallery = buildGallery(product);
      const colors = parseColors(product.colors);
      this.setData({
        product,
        categoryBg: style.bg,
        categoryColor: style.color,
        pointsPriceFmt: formatNumber(product.pointsPrice),
        actionLabel,
        unavailable,
        gallery,
        activeImage: 0,
        activeImageSrc: gallery.length ? gallery[0].resolved : '',
        colors,
        selectedColor: colors[0] || '',
        quantity: 1,
      });
    } catch (e) {
      wx.showToast({ title: '加载商品失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // Side data — best-effort, never blocks the page.
  fetchSideData() {
    const id = this.data.id;
    const user = this.data.user;
    getRelatedProducts(id)
      .then((list) => {
        const related = (list || []).slice(0, 6).map((p) => {
          const s = categoryStyle(p.category);
          return {
            ...p,
            imageUrlResolved: resolveImageUrl(p.imageUrl),
            categoryBg: s.bg,
            categoryColor: s.color,
            pointsPriceFmt: formatNumber(p.pointsPrice || 0),
          };
        });
        this.setData({ related });
      })
      .catch(() => {});
    listReviews(id)
      .then((list) => this.setReviews(list))
      .catch(() => {});
    if (user) {
      listWishlist(user.userId)
        .then((list) => {
          this.setData({ wished: (list || []).some((p) => p.id === id) });
        })
        .catch(() => {});
    }
  },

  setReviews(list) {
    const reviews = (list || []).map((r) => ({
      ...r,
      createdAtFmt: formatDateTime(r.createdAt).slice(0, 10),
      ratingStars: '★★★★★☆☆☆☆☆'.slice(5 - r.rating, 10 - r.rating),
    }));
    this.setData({ reviews, reviewCountLabel: String(reviews.length) });
  },

  onSelectImage(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const item = this.data.gallery[idx];
    if (!item) return;
    this.setData({ activeImage: idx, activeImageSrc: item.resolved });
  },

  onSelectColor(e) {
    this.setData({ selectedColor: e.currentTarget.dataset.color });
  },

  onQtyMinus() {
    const q = Math.max(1, this.data.quantity - 1);
    this.setData({ quantity: q });
  },

  onQtyPlus() {
    const max = (this.data.product && this.data.product.stock) || 1;
    const q = Math.min(max, this.data.quantity + 1);
    this.setData({ quantity: q });
  },

  onRedeem() {
    if (this.data.unavailable) return;
    const { id, quantity, selectedColor } = this.data;
    const params = `productId=${id}&quantity=${quantity}` +
      (selectedColor ? `&color=${encodeURIComponent(selectedColor)}` : '');
    wx.navigateTo({ url: `/pages/confirm-redemption/index?${params}` });
  },

  async onToggleWish() {
    const { product, user, wished, wishBusy } = this.data;
    if (!product || !user || wishBusy) return;
    this.setData({ wishBusy: true });
    try {
      if (wished) {
        await removeWishlist(user.userId, product.id);
        this.setData({ wished: false });
      } else {
        await addWishlist(user.userId, product.id);
        this.setData({ wished: true });
      }
    } catch (err) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' });
    } finally {
      this.setData({ wishBusy: false });
    }
  },

  onRatingTap(e) {
    const value = Number(e.currentTarget.dataset.value);
    if (value >= 1 && value <= 5) this.setData({ myRating: value });
  },

  onReviewInput(e) {
    this.setData({ myReview: e.detail.value });
  },

  async onSubmitReview() {
    const { product, user, myRating, myReview, submittingReview } = this.data;
    if (!product || !user || !myRating || !myReview.trim() || submittingReview) return;
    this.setData({ submittingReview: true });
    try {
      await createReview(product.id, {
        productId: product.id,
        userId: user.userId,
        rating: myRating,
        content: myReview.trim(),
      });
      this.setData({ myReview: '', myRating: 5 });
      wx.showToast({ title: '评价提交成功', icon: 'success' });
      const list = await listReviews(product.id);
      this.setReviews(list);
    } catch (err) {
      wx.showToast({ title: err.message || '评价失败', icon: 'none' });
    } finally {
      this.setData({ submittingReview: false });
    }
  },

  onRelatedTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.redirectTo({ url: `/pages/product-detail/index?id=${id}` });
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },
});
