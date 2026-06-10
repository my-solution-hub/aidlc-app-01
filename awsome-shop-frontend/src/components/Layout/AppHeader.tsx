import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TranslateIcon from '@mui/icons-material/Translate';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';

const DRAWER_WIDTH = 240;

export default function AppHeader() {
  const { t, i18n } = useTranslation();
  const { sidebarOpen, darkMode, toggleSidebar, toggleDarkMode } = useAppStore();

  const handleLanguageToggle = () => {
    i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        ml: sidebarOpen ? `${DRAWER_WIDTH}px` : 0,
        width: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
        transition: (theme) =>
          theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={toggleSidebar} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          {t('app.title')}
        </Typography>
        <Box>
          <Button
            color="inherit"
            startIcon={<TranslateIcon />}
            onClick={handleLanguageToggle}
            size="small"
          >
            {i18n.language === 'zh' ? 'EN' : '中文'}
          </Button>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
