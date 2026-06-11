function formatNumber(n) {
  if (n == null || isNaN(n)) return '0';
  return Number(n).toLocaleString('en-US');
}

function formatDateTime(s) {
  if (!s) return '—';
  return String(s).slice(0, 16).replace('T', ' ');
}

function formatDate(s) {
  if (!s) return '—';
  return String(s).slice(0, 10);
}

module.exports = { formatNumber, formatDateTime, formatDate };
