import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import BadgeIcon from '@mui/icons-material/Badge';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RedeemIcon from '@mui/icons-material/Redeem';
import { register } from '../../services/api/auth';
import { getTheme } from '../../theme';
import { BusinessError } from '../../services/request';

const fieldInputSx = {
  height: 44,
  borderRadius: '8px',
  fontFamily: 'Inter, sans-serif',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
  '& input::placeholder': { color: '#CBD5E1', opacity: 1 },
};

export default function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lightTheme = useMemo(() => getTheme('light'), []);

  useEffect(() => {
    const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
    if (i18n.language !== browserLang) {
      i18n.changeLanguage(browserLang);
    }
  }, [i18n]);

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await register({ username, password, nickname: nickname || undefined });
      setSuccessMsg(t('register.registerSuccess'));
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      if (err instanceof BusinessError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg(t('register.registerFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
        {/* Left Brand Panel */}
        <Box
          sx={{
            width: 640,
            flexShrink: 0,
            bgcolor: 'primary.main',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            p: '60px',
          }}
        >
          <RedeemIcon sx={{ fontSize: 64, color: '#fff' }} />
          <Typography sx={{ color: '#fff', fontSize: 40, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
            {t('login.brand')}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, fontFamily: 'Inter, sans-serif' }}>
            {t('login.brandSubtitle')}
          </Typography>
        </Box>

        {/* Right Register Panel */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#fff',
            p: '80px',
          }}
        >
          <Box sx={{ width: 400, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: 'text.primary', fontFamily: 'Inter, sans-serif' }}>
                {t('register.title')}
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary', fontFamily: 'Inter, sans-serif' }}>
                {t('register.subtitle')}
              </Typography>
            </Box>

            {errorMsg && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {errorMsg}
              </Alert>
            )}
            {successMsg && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                {successMsg}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Username */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary', fontFamily: 'Inter, sans-serif' }}>
                  {t('register.usernameLabel')}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('register.usernamePlaceholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      sx: fieldInputSx,
                    },
                  }}
                />
              </Box>

              {/* Nickname */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary', fontFamily: 'Inter, sans-serif' }}>
                  {t('register.nicknameLabel')}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('register.nicknamePlaceholder')}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      sx: fieldInputSx,
                    },
                  }}
                />
              </Box>

              {/* Password */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary', fontFamily: 'Inter, sans-serif' }}>
                  {t('register.passwordLabel')}
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('register.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? (
                              <VisibilityIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                            ) : (
                              <VisibilityOffIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: fieldInputSx,
                    },
                  }}
                />
              </Box>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleRegister}
              disabled={loading || !username || !password}
              sx={{
                height: 48,
                borderRadius: '8px',
                fontSize: 16,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                textTransform: 'none',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t('register.registerBtn')}
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: 14, color: 'text.secondary', fontFamily: 'Inter, sans-serif' }}>
                {t('register.hasAccount')}
              </Typography>
              <Link
                component="button"
                underline="none"
                onClick={() => navigate('/login')}
                sx={{ fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'primary.main' }}
              >
                {t('register.login')}
              </Link>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
