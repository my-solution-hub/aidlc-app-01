import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <Typography variant="h1" fontWeight="bold" color="text.secondary">
        {t('notFound.title')}
      </Typography>
      <Typography variant="h6" sx={{ mt: 2, mb: 4 }}>
        {t('notFound.message')}
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        {t('notFound.backHome')}
      </Button>
    </Box>
  );
}
