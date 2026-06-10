import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { listMyOrders } from '../../services/api/order';
import type { ExchangeRecordDTO, PageResult } from '../../types/api';
import { useAuthStore } from '../../store/useAuthStore';

const STATUS_STYLES: Record<string, { textColor: string; bgColor: string }> = {
  PENDING_DELIVERY: { textColor: '#D97706', bgColor: '#FFF7ED' },
  DELIVERING: { textColor: '#2563EB', bgColor: '#EFF6FF' },
  PROCESSING: { textColor: '#2563EB', bgColor: '#EFF6FF' },
  COMPLETED: { textColor: '#166534', bgColor: '#DCFCE7' },
  CANCELLED: { textColor: '#991B1B', bgColor: '#FEE2E2' },
};

const STATUS_I18N: Record<string, string> = {
  PENDING_DELIVERY: 'admin.exchangeRecords.statusPending',
  DELIVERING: 'admin.exchangeRecords.statusDelivering',
  PROCESSING: 'admin.exchangeRecords.statusProcessing',
  COMPLETED: 'admin.exchangeRecords.statusCompleted',
  CANCELLED: 'admin.exchangeRecords.statusCancelled',
};

export default function MyOrders() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [data, setData] = useState<PageResult<ExchangeRecordDTO> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    if (!user) return;
    setLoading(true);
    listMyOrders({ userId: user.userId, page: 1, size: 50 })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const records = data?.records ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#1E293B' }}>
          {t('employee.orders.title')}
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#64748B' }}>
          {t('employee.orders.subtitle')}
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : records.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
          <ReceiptLongIcon sx={{ fontSize: 48, color: '#CBD5E1' }} />
          <Typography sx={{ fontSize: 14, color: '#64748B' }}>
            {t('employee.orders.noRecords')}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            borderRadius: '12px',
            border: '1px solid #F1F5F9',
            bgcolor: '#fff',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F8FAFC', px: '20px', py: '14px' }}>
            <Box sx={{ width: 140 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                {t('employee.orders.thOrderNo')}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                {t('employee.orders.thProduct')}
              </Typography>
            </Box>
            <Box sx={{ width: 100 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                {t('employee.orders.thPoints')}
              </Typography>
            </Box>
            <Box sx={{ width: 120 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                {t('employee.orders.thTime')}
              </Typography>
            </Box>
            <Box sx={{ width: 90 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                {t('employee.orders.thStatus')}
              </Typography>
            </Box>
          </Box>

          {/* Rows */}
          {records.map((record) => {
            const style = STATUS_STYLES[record.status] ?? {
              textColor: '#64748B',
              bgColor: '#F1F5F9',
            };
            const label = STATUS_I18N[record.status]
              ? t(STATUS_I18N[record.status])
              : record.status;
            return (
              <Box
                key={record.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: '20px',
                  py: '14px',
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <Box sx={{ width: 140 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#2563EB' }}>
                    {record.orderNo}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 13, color: '#1E293B' }}>
                    {record.productName}
                  </Typography>
                </Box>
                <Box sx={{ width: 100 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>
                    {record.pointsCost?.toLocaleString() ?? '—'}
                  </Typography>
                </Box>
                <Box sx={{ width: 120 }}>
                  <Typography sx={{ fontSize: 12, color: '#64748B' }}>
                    {(record.exchangeTime ?? '').slice(0, 10)}
                  </Typography>
                </Box>
                <Box sx={{ width: 90 }}>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      borderRadius: '12px',
                      bgcolor: style.bgColor,
                      px: '10px',
                      py: '3px',
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: 500, color: style.textColor }}>
                      {label}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
