'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const push = useCallback((type, message) => {
    const id = ++idRef.current;
    setToasts((list) => [...list, { id, type, message }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3800);
  }, []);

  return (
    <ToastContext.Provider
      value={{ success: (m) => push('success', m), error: (m) => push('error', m), info: (m) => push('info', m) }}
    >
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-80 flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className={`glass-strong pointer-events-auto px-4 py-3 text-sm shadow-lift ${
                toast.type === 'error'
                  ? 'border-rose-400/30 text-rose-200'
                  : toast.type === 'success'
                  ? 'border-emerald-400/30 text-emerald-200'
                  : 'text-slate-200'
              }`}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
