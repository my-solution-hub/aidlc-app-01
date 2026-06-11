const { getMyOrder } = require('../../services/order');
const { statusStyle, statusLabel } = require('../../utils/orderStatus');
const { formatNumber, formatDateTime } = require('../../utils/format');

const TIMELINE_DEF = [
  { key: 'submitted', label: '订单提交成功', activeFor: ['PENDING_DELIVERY', 'DELIVERING', 'COMPLETED'] },
  { key: 'pending', label: '商家处理中', activeFor: ['PENDING_DELIVERY', 'DELIVERING', 'COMPLETED'] },
  { key: 'delivering', label: '已发货', activeFor: ['DELIVERING', 'COMPLETED'] },
  { key: 'completed', label: '已完成', activeFor: ['COMPLETED'] },
];

function buildTimeline(status) {
  return TIMELINE_DEF.map((step, idx) => {
    const active = step.activeFor.includes(status);
    let isCurrent = false;
    if (step.key === 'submitted' && status === 'PENDING_DELIVERY') isCurrent = true;
    if (step.key === 'pending' && status === 'PENDING_DELIVERY') isCurrent = true;
    if (step.key === 'delivering' && status === 'DELIVERING') isCurrent = true;
    if (step.key === 'completed' && status === 'COMPLETED') isCurrent = true;
    return {
      key: step.key,
      label: step.label,
      active,
      isCurrent,
      isLast: idx === TIMELINE_DEF.length - 1,
      dotColor: active ? (isCurrent ? '#2563EB' : '#16A34A') : '#E2E8F0',
      lineColor: active ? '#16A34A' : '#E2E8F0',
      textColor: active ? (isCurrent ? '#2563EB' : '#1E293B') : '#94A3B8',
      fontWeight: active ? 600 : 400,
    };
  });
}

Page({
  data: {
    id: null,
    order: null,
    timeline: [],
    isCancelled: false,
    statusBg: '#F1F5F9',
    statusColor: '#64748B',
    statusLabel: '',
    pointsCostFmt: '0',
    timeFmt: '—',
    loading: true,
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
        timeline: buildTimeline(order.status),
        isCancelled: order.status === 'CANCELLED',
        statusBg: style.bgColor,
        statusColor: style.textColor,
        statusLabel: statusLabel(order.status),
        pointsCostFmt: formatNumber(order.pointsCost || 0),
        timeFmt: formatDateTime(order.exchangeTime || order.createdAt),
      });
    } catch (e) {
      wx.showToast({ title: '加载订单失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onBack() {
    wx.navigateBack({ delta: 1 });
  },
});
