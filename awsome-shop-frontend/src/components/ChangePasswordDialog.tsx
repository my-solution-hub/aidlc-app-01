import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import ButtonBase from '@mui/material/ButtonBase';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { changePassword } from '../services/api/auth';
import { BusinessError } from '../services/request';
import { useSnackbar, AppSnackbar } from './AppSnackbar';

const MIN_PASSWORD_LENGTH = 6;

const fieldInputSx = {
  height: 44,
  borderRadius: '8px',
  fontFamily: 'Inter, sans-serif',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
  '& input::placeholder': { color: '#CBD5E1', opacity: 1 },
};

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  value: string;
  show: boolean;
  error?: string;
  onChange: (value: string) => void;
  onToggleShow: () => void;
}

function PasswordField({
  label,
  placeholder,
  value,
  show,
  error,
  onChange,
  onToggleShow,
}: PasswordFieldProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Typography
        sx={{ fontSize: 14, fontWeight: 500, color: 'text.primary', fontFamily: 'Inter, sans-serif' }}
      >
        {label}
      </Typography>
      <TextField
        fullWidth
        size="small"
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        error={Boolean(error)}
        helperText={error || ' '}
        onChange={(e) => onChange(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={onToggleShow} edge="end">
                  {show ? (
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
  );
}

interface FormErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function ChangePasswordDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
    setErrors({});
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!oldPassword) {
      next.oldPassword = t('auth.changePassword.errorOldRequired');
    }
    if (!newPassword) {
      next.newPassword = t('auth.changePassword.errorNewRequired');
    } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
      next.newPassword = t('auth.changePassword.errorNewTooShort');
    } else if (newPassword === oldPassword) {
      next.newPassword = t('auth.changePassword.errorSameAsOld');
    }
    if (confirmPassword !== newPassword) {
      next.confirmPassword = t('auth.changePassword.errorConfirmMismatch');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await changePassword({ oldPassword, newPassword });
      snackbar.showSuccess(t('auth.changePassword.success'));
      resetForm();
      onClose();
    } catch (err) {
      if (err instanceof BusinessError) {
        snackbar.showError(err.message);
      } else {
        snackbar.showError(t('auth.changePassword.failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        slotProps={{ paper: { sx: { borderRadius: '12px', width: 420 } } }}
      >
        <DialogTitle
          sx={{ fontSize: 18, fontWeight: 700, color: '#1E293B', fontFamily: 'Inter, sans-serif' }}
        >
          {t('auth.changePassword.title')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 0.5 }}>
            <PasswordField
              label={t('auth.changePassword.oldPassword')}
              placeholder={t('auth.changePassword.oldPasswordPlaceholder')}
              value={oldPassword}
              show={showOld}
              error={errors.oldPassword}
              onChange={(v) => setOldPassword(v)}
              onToggleShow={() => setShowOld((s) => !s)}
            />
            <PasswordField
              label={t('auth.changePassword.newPassword')}
              placeholder={t('auth.changePassword.newPasswordPlaceholder')}
              value={newPassword}
              show={showNew}
              error={errors.newPassword}
              onChange={(v) => setNewPassword(v)}
              onToggleShow={() => setShowNew((s) => !s)}
            />
            <PasswordField
              label={t('auth.changePassword.confirmPassword')}
              placeholder={t('auth.changePassword.confirmPasswordPlaceholder')}
              value={confirmPassword}
              show={showConfirm}
              error={errors.confirmPassword}
              onChange={(v) => setConfirmPassword(v)}
              onToggleShow={() => setShowConfirm((s) => !s)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
          <ButtonBase
            onClick={handleClose}
            disabled={loading}
            sx={{
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              px: '20px',
              py: '8px',
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            <Typography
              sx={{ fontSize: 13, fontWeight: 500, color: '#1E293B', fontFamily: 'Inter, sans-serif' }}
            >
              {t('auth.changePassword.cancel')}
            </Typography>
          </ButtonBase>
          <ButtonBase
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              borderRadius: '8px',
              bgcolor: 'primary.main',
              px: '20px',
              py: '8px',
              minWidth: 96,
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            {loading ? (
              <CircularProgress size={18} sx={{ color: '#fff' }} />
            ) : (
              <Typography
                sx={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'Inter, sans-serif' }}
              >
                {t('auth.changePassword.submit')}
              </Typography>
            )}
          </ButtonBase>
        </DialogActions>
      </Dialog>
      <AppSnackbar state={snackbar.state} onClose={snackbar.close} />
    </>
  );
}
