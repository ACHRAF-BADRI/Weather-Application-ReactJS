import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Toaster from '@/components/Toaster';

const ToastContext = createContext(null);
const MAX_VISIBLE = 3;
let nextId = 0;

// Usage: const toast = useToast(); toast.success('Saved'); toast.error('Oops'); toast.info('FYI');
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback((type, message) => {
    const id = ++nextId;
    setToasts((list) => [...list.slice(-(MAX_VISIBLE - 1)), { id, type, message }]);
    return id;
  }, []);

  const api = useMemo(
    () => ({
      success: (message) => show('success', message),
      info: (message) => show('info', message),
      error: (message) => show('error', message),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Toaster toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>');
  return context;
}
