"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Toast = { id: number; message: string };

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string) => {
    const id = nextId.current++;

    setToasts((prev) => [...prev.slice(-2), { id, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-24 left-1/2 z-[200] flex -translate-x-1/2 flex-col items-center gap-2 lg:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-xl bg-[#28313d] px-4 py-2.5 text-sm font-medium text-white shadow-lg"
            style={{ animation: "toastIn 0.2s ease-out both" }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}