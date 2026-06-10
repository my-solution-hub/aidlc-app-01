import { useState, useCallback } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

/**
 * Lightweight snackbar hook matching the look used in CreateProduct:
 * top-center toast with success/error severity.
 */
export function useSnackbar() {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSuccess = useCallback((message: string) => {
    setState({ open: true, message, severity: 'success' });
  }, []);

  const showError = useCallback((message: string) => {
    setState({ open: true, message, severity: 'error' });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return { state, showSuccess, showError, close };
}

export function AppSnackbar({
  state,
  onClose,
}: {
  state: SnackbarState;
  onClose: () => void;
}) {
  return (
    <Snackbar
      open={state.open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity={state.severity} onClose={onClose} sx={{ borderRadius: '8px' }}>
        {state.message}
      </Alert>
    </Snackbar>
  );
}
