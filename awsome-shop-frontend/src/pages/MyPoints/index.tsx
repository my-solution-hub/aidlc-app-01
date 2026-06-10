import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import TollIcon from '@mui/icons-material/Toll';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { getBalance, listTransactions } from '../../services/api/point';
import type {
  PointBalanceDTO,
  PointTransactionDTO,
  PageResult,
} from '../../types/api';
import { useAuthStore } from '../../store/useAuthStore';

function StatCard({
  icon,
  iconBg,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        bgcolor: '#fff',
        borderRadius: '12px',
        border: '1px solid #F1F5F9',
        padding: '18px 20px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '8px',
            bgcolor: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#64748B' }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontSize: 28, fontWeight: 700, color: valueColor ?? '#1E293B' }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function MyPoints() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [balance, setBalance] = useState<PointBalanceDTO | null>(null);
  const [data, setData] = useState<PageResult<PointTransactionDTO> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getBalance(user.userId).catch(() => null),
      listTransactions({ userId: user.userId, page: 1, size: 50 }).catch(() => null),
    ])
      .then(([b, txns]) => {
        if (b) setBalance(b);
        if (txns) setData(txns);
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const transactions = data?.records ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      <Box>
        <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#1E293B' }}>
          {t('employee.pointsCenter.title')}
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#64748B' }}>
          {t('employee.pointsCenter.subtitle')}
        </Typography>
      </Box>

      {/* Balance cards */}
      <Box sx={{ display: 'flex', gap: '16px' }}>
        <StatCard
          icon={<TollIcon sx={{ fontSize: 18, color: '#D97706' }} />}
          iconBg="#FFF7ED"
          label={t('employee.pointsCenter.balance')}
          value={(balance?.balance ?? 0).toLocaleString()}
          valueColor="#D97706"
        />
        <StatCard
          icon={<TrendingUpIcon sx={{ fontSize: 18, color: '#10B981' }} />}
          iconBg="#ECFDF5"
          label={t('employee.pointsCenter.totalEarned')}
          value={(balance?.totalEarned ?? 0).toLocaleString()}
          valueColor="#10B981"
        />
        <StatCard
          icon={<TrendingDownIcon sx={{ fontSize: 18, color: '#2563EB' }} />}
          iconBg="#EFF6FF"
          label={t('employee.pointsCenter.totalUsed')}
          value={(balance?.totalUsed ?? 0).toLocaleString()}
        />
      </Box>

      {/* Transactions */}
      <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1E293B' }}>
        {t('employee.pointsCenter.transactions')}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : transactions.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 2 }}>
          <TollIcon sx={{ fontSize: 48, color: '#CBD5E1' }} />
          <Typography sx={{ fontSize: 14, color: '#64748B' }}>
            {t('employee.pointsCenter.noTransactions')}
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
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#F8FAFC', px: '20px', py: '14px' }}>
            <Box sx={{ width: 100 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                {t('employee.pointsCenter.thType')}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                {t('employee.pointsCenter.thDescription')}
              </Typography>
            </Box>
            <Box sx={{ width: 100 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                {t('employee.pointsCenter.thAmount')}
              </Typography>
            </Box>
            <Box sx={{ width: 100 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                {t('employee.pointsCenter.thBalance')}
              </Typography>
            </Box>
            <Box sx={{ width: 120 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                {t('employee.pointsCenter.thTime')}
              </Typography>
            </Box>
          </Box>

          {transactions.map((txn) => {
            const positive = txn.amount >= 0;
            return (
              <Box
                key={txn.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: '20px',
                  py: '14px',
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <Box sx={{ width: 100 }}>
                  <Typography sx={{ fontSize: 12, color: '#64748B' }}>{txn.type}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 13, color: '#1E293B' }}>{txn.description}</Typography>
                </Box>
                <Box sx={{ width: 100 }}>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 600, color: positive ? '#10B981' : '#DC2626' }}
                  >
                    {positive ? '+' : ''}
                    {txn.amount.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ width: 100 }}>
                  <Typography sx={{ fontSize: 13, color: '#1E293B' }}>
                    {txn.balance?.toLocaleString() ?? '—'}
                  </Typography>
                </Box>
                <Box sx={{ width: 120 }}>
                  <Typography sx={{ fontSize: 12, color: '#64748B' }}>
                    {(txn.createdAt ?? '').slice(0, 10)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
