import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Dialog from '../components/ui/Dialog';

const ErrorContext = createContext();

let globalOnError = null;

// eslint-disable-next-line react-refresh/only-export-components
export function emitError(error) {
  if (globalOnError) {
    globalOnError(error);
  }
}

// eslint-disable-next-line react-refresh/only-export-components
export function useError() {
  return useContext(ErrorContext);
}

export function ErrorProvider({ children }) {
  const { t } = useTranslation('common');
  const [error, setError] = useState(null);

  const showError = useCallback((error) => {
    if (typeof error === 'string') {
      setError({ title: t('error.title'), message: error || t('error.unexpected') });
    } else if (error && typeof error === 'object') {
      setError({
        title: error.title || t('error.title'),
        message: error.message || error.detail || t('error.unexpected'),
      });
    } else {
      setError({ title: t('error.title'), message: t('error.unexpected') });
    }
  }, [t]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    globalOnError = showError;
    return () => { globalOnError = null; };
  }, [showError]);

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <Dialog
        isOpen={!!error}
        variant="error"
        title={error?.title}
        onClose={clearError}
      >
        {error?.message}
      </Dialog>
    </ErrorContext.Provider>
  );
}
