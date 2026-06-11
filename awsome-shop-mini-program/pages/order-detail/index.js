const { getMyOrder, confirmReceipt } = require('../../services/order');
const { statusStyle, statusLabel } = require('../../utils/orderStatus');
const { formatNumber, formatDateTime } = require('../../utils/format');
const { resolveImageUrl } = require('../../utils/image');
const { getUser } = require('../../utils/auth');

// 4 horizontal progress steps (mirrors awsome-shop-frontend OrderDetail).
const STEPS = [
  { key: 'submitted', label: '提交' },
  { key: 'pending', label: '待发货' },
  { key: 'delivering', label: '已发货' },
  { key: 'completed', label: '已完成' },
];

// Map a backend status to how many progress steps are completed.
const STATUS_TO_DONE = {
  PENDING_DELIVERY: 1,
  DELIVERING: 2,
  COMPLETED: 4,
};

const STATUS_GRADIENT = {
  CANCELLED: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
  COMPLETED: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
  DELIVERING: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
  PENDING_DELIVERY: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
};

const STATUS_ICON = {
  CANCELLED: '✕',
  COMPLETED: '✓',
  DELIVERING: '🚚',
  PENDING_DELIVERY: '📦',
};

function timeOfStatus(order, status) {
  if (!order || !order.timeline) return '';
  const log = order.timeline.find((l) => l.status === status);
  return log ? log.time : '';
}

function buildSteps(order) {
  const doneCount = STATUS_TO_DONE[order.status] || 0;
  return STEPS.map((step, idx) => {
    const done = idx < doneCount;
    const current = idx === doneCount;
    let stepTime = '';
    if (step.key === 'submitted') stepTime = order.exchangeTime || order.createdAt;
    else if (step.key === 'pending') stepTime = timeOfStatus(order, 'PENDING_DELIVERY');
    else if (step.key === 'delivering') stepTime = timeOfStatus(order, 'DELIVERING');
    else if (step.key === 'completed') stepTime = timeOfStatus(order, 'COMPLETED');
    return {
      key: step.key,
      label: step.label,
      done,
      current,
      isLast: idx === STEPS.length - 1,
      circleBg: done ? '#DCFCE7' : current ? '#EFF6FF' : '#F1F5F9',
      circleColor: done ? '#16A34A' : current ? '#2563EB' : '#CBD5E1',
      labelColor: done ? '#16A34A' : current ? '#2563EB' : '#94A3B8',
      labelWeight: current ? 700 : 500,
      lineColor: done ? '#16A34A' : '#E2E8F0',
      iconChar: done ? '✓' : (idx === 0 ? '📝' : idx === 1 ? '📦' : idx === 2 ? '🚚' : '🎉'),
      timeFmt: stepTime ? formatDateTime(stepTime).slice(5, 16) : '',
    };
  });
}

function decorateTimeline(timeline) {
  return (timeline || []).map((log, idx, arr) => ({
    ...log,
    statusLabel: statusLabel(log.status),
    timeFmt: formatDateTime(log.time),
    isLast: idx === arr.length - 1,
  }));
}

Page({
  data: {
    id: null,
    order: null,
    steps: [],
    isCancelled: false,
    isDelivering: false,
    statusBg: '#F1F5F9',
    statusColor: '#64748B',
    statusLabel: '',
    statusGradient: STATUS_GRADIENT.PENDING_DELIVERY,
    statusIcon: STATUS_ICON.PENDING_DELIVERY,
    productImageResolved: '',
    pointsCostFmt: '0',
    freightFmt: '',
    balanceAfterFmt: '',
    timeFmt: '—',
    timelineList: [],
    loading: true,
    confirming: false,
  },

  onLoad(query) {
    const id = Number(query.id);
    this.setData({ id });
    this.fetch();
  },

  async fetch() {
    this.setData({ loading: true });
    try {
      const order = await getMyOrder(this.data.id);
      const style = statusStyle(order.status);
      this.setData({
        order,
        steps: buildSteps(order),
        timelineList: decorateTimeline(order.timeline),
        isCancelled: order.status === 'CANCELLED',
        isDelivering: order.status === 'DELIVERING',
        statusBg: style.bgColor,
        statusColor: style.textColor,
        statusLabel: statusLabel(order.status),
        statusGradient: STATUS_GRADIENT[order.status] || STATUS_GRADIENT.PENDING_DELIVERY,
        statusIcon: STATUS_ICON[order.status] || '📦',
        productImageResolved: resolveImageUrl(order.productImageUrl),
        pointsCostFmt: formatNumber(order.pointsCost || 0),
        freightFmt: order.freightPoints != null ? formatNumber(order.freightPoints) : '',
        balanceAfterFmt: order.balanceAfter != null ? formatNumber(order.balanceAfter) : '',
        timeFmt: formatDateTime(order.exchangeTime || order.createdAt),
      });
    } catch (e) {
      wx.showToast({ title: '加载订单失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  async onConfirmReceipt() {
    const { order, confirming } = this.data;
    const user = getUser();
    if (!order || !user || confirming) return;
    this.setData({ confirming: true });
    try {
      const updated = await confirmReceipt(order.id, user.userId);
      const style = statusStyle(updated.status);
      this.setData({
        order: updated,
        steps: buildSteps(updated),
        timelineList: decorateTimeline(updated.timeline),
        isCancelled: updated.status === 'CANCELLED',
        isDelivering: updated.status === 'DELIVERING',
        statusBg: style.bgColor,
        statusColor: style.textColor,
        statusLabel: statusLabel(updated.status),
        statusGradient: STATUS_GRADIENT[updated.status] || STATUS_GRADIENT.PENDING_DELIVERY,
        statusIcon: STATUS_ICON[updated.status] || '📦',
        balanceAfterFmt: updated.balanceAfter != null ? formatNumber(updated.balanceAfter) : '',
      });
      wx.showToast({ title: '确认收货成功', icon: 'success' });
    } catch (err) {
      wx.showToast({ title: err.message || '确认收货失败', icon: 'none' });
    } finally {
      this.setData({ confirming: false });
    }
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },
});
