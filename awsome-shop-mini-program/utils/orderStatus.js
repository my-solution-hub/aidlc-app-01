// Mirrors awsome-shop-frontend/src/utils/orderStatus.ts.
const STATUS_LABEL = {
  PENDING_DELIVERY: '待发货',
  DELIVERING: '配送中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

const STATUS_STYLES = {
  PENDING_DELIVERY: { textColor: '#D97706', bgColor: '#FFF7ED' },
  DELIVERING: { textColor: '#2563EB', bgColor: '#EFF6FF' },
  COMPLETED: { textColor: '#166534', bgColor: '#DCFCE7' },
  CANCELLED: { textColor: '#991B1B', bgColor: '#FEE2E2' },
};

function statusStyle(status) {
  return STATUS_STYLES[status] || { textColor: '#64748B', bgColor: '#F1F5F9' };
}

function statusLabel(status) {
  return STATUS_LABEL[status] || status || '—';
}

const CATEGORY_STYLES = {
  数码电子: { bg: '#DBEAFE', color: '#2563EB' },
  智能穿戴: { bg: '#EDE9FE', color: '#7C3AED' },
  礼品卡: { bg: '#DCFCE7', color: '#16A34A' },
  生活百货: { bg: '#FEF3C7', color: '#D97706' },
  办公用品: { bg: '#FCE7F3', color: '#DB2777' },
};

function categoryStyle(name) {
  return CATEGORY_STYLES[name] || { bg: '#F1F5F9', color: '#64748B' };
}

module.exports = { statusStyle, statusLabel, categoryStyle };
