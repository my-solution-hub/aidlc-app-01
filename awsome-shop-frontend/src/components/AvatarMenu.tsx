import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import TranslateIcon from '@mui/icons-material/Translate';
import PaletteIcon from '@mui/icons-material/Palette';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';

export default function AvatarMenu() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const darkMode = useAppStore((s) => s.darkMode);
  const toggleDarkMode = useAppStore((s) => s.toggleDarkMode);
  const storedLanguage = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Restore user's language preference when entering authenticated pages
  useEffect(() => {
    if (storedLanguage && i18n.language !== storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
  }, [storedLanguage, i18n]);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSwitchLang = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
    handleClose();
  };

  const handleSwitchTheme = () => {
    toggleDarkMode();
    handleClose();
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    navigate('/login');
  };

  const currentLang = i18n.language === 'zh' ? t('menu.langZh') : t('menu.langEn');
  const currentTheme = darkMode ? t('menu.themeDark') : t('menu.themeLight');
  const roleLabel =
    user?.role === 'admin' ? t('menu.roleAdmin') : t('menu.roleEmployee');

  return (
    <>
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: 'primary.main',
          fontSize: 16,
          fontWeight: 600,
          cursor: 'pointer',
        }}
        onClick={handleOpen}
      >
        {user?.displayName?.charAt(0) ?? ''}
      </Avatar>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              width: 220,
              borderRadius: '12px',
              mt: 1,
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              border: '1px solid',
              borderColor: '#F1F5F9',
            },
          },
        }}
      >
        {/* User Info */}
        <Box sx={{ px: '16px', py: '12px' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
            {user?.displayName}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#64748B' }}>
            {roleLabel}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: '#F1F5F9' }} />

        {/* Switch Language */}
        <MenuItem
          onClick={handleSwitchLang}
          sx={{
            py: '10px',
            px: '12px',
            mx: '6px',
            my: '2px',
            borderRadius: '8px',
            gap: '12px',
          }}
        >
          <TranslateIcon sx={{ fontSize: 20, color: '#64748B' }} />
          <Typography sx={{ fontSize: 14, color: '#1E293B', flex: 1 }}>
            {t('menu.switchLang')}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#64748B' }}>
            {currentLang}
          </Typography>
        </MenuItem>

        {/* Switch Theme */}
        <MenuItem
          onClick={handleSwitchTheme}
          sx={{
            py: '10px',
            px: '12px',
            mx: '6px',
            my: '2px',
            borderRadius: '8px',
            gap: '12px',
          }}
        >
          <PaletteIcon sx={{ fontSize: 20, color: '#64748B' }} />
          <Typography sx={{ fontSize: 14, color: '#1E293B', flex: 1 }}>
            {t('menu.switchTheme')}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#64748B' }}>
            {currentTheme}
          </Typography>
        </MenuItem>

        <Divider sx={{ borderColor: '#F1F5F9' }} />

        {/* Logout */}
        <MenuItem
          onClick={handleLogout}
          sx={{
            py: '10px',
            px: '12px',
            mx: '6px',
            my: '2px',
            borderRadius: '8px',
            gap: '12px',
          }}
        >
          <LogoutIcon sx={{ fontSize: 20, color: '#DC2626' }} />
          <Typography sx={{ fontSize: 14, color: '#DC2626' }}>
            {t('menu.logout')}
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
