import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('home.welcome')}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t('home.description')}
      </Typography>
    </Box>
  );
}
