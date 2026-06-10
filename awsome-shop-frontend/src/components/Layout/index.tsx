import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Outlet } from 'react-router';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import { useAppStore } from '../../store/useAppStore';

const DRAWER_WIDTH = 240;

export default function Layout() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppHeader />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: sidebarOpen ? 0 : `-${DRAWER_WIDTH}px`,
          transition: (theme) =>
            theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
