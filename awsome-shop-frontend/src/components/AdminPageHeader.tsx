import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AvatarMenu from './AvatarMenu';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function AdminPageHeader({ title, subtitle, actions }: AdminPageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: subtitle ? 'flex-start' : 'center',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1E293B',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            sx={{
              fontSize: 13,
              color: '#64748B',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {actions}
        <AvatarMenu />
      </Box>
    </Box>
  );
}
