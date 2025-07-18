import { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 1000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`fixed top-6 right-2 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-900' : 'bg-red-400'}`}>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};
