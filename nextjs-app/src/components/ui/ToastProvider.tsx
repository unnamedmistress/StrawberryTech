import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  shortCode?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  };

  const getTypeClass = (type: ToastType) => {
    return `toast-${type}`;
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast ${getTypeClass(toast.type)}`}
          role="alert"
          aria-live="polite"
        >
          <div className="toast-content">
            <div className="toast-header">
              <div className="toast-icon">
                {getIcon(toast.type)}
              </div>
              <div className="toast-title">
                {toast.title}
                {toast.shortCode && (
                  <span className="toast-short-code">#{toast.shortCode}</span>
                )}
              </div>
              <button
                className="toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
            {toast.message && (
              <div className="toast-message">
                {toast.message}
              </div>
            )}
            {toast.action && (
              <div className="toast-actions">
                <button
                  className="toast-action-button"
                  onClick={toast.action.onClick}
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 1050;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 400px;
          width: 100%;
        }

        .toast {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          transform: translateX(100%);
          animation: slideIn 0.3s ease-out forwards;
          border-left: 4px solid;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .toast-success {
          border-left-color: #28a745;
        }

        .toast-error {
          border-left-color: #dc3545;
        }

        .toast-warning {
          border-left-color: #ffc107;
        }

        .toast-info {
          border-left-color: #17a2b8;
        }

        .toast-content {
          padding: 1rem;
        }

        .toast-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .toast-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: bold;
          color: white;
          flex-shrink: 0;
        }

        .toast-success .toast-icon {
          background: #28a745;
        }

        .toast-error .toast-icon {
          background: #dc3545;
        }

        .toast-warning .toast-icon {
          background: #ffc107;
          color: #212529;
        }

        .toast-info .toast-icon {
          background: #17a2b8;
        }

        .toast-title {
          flex: 1;
          font-weight: 600;
          color: #212529;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .toast-short-code {
          font-family: monospace;
          font-size: 0.75rem;
          background: #e9ecef;
          color: #495057;
          padding: 0.125rem 0.375rem;
          border-radius: 3px;
        }

        .toast-close {
          background: none;
          border: none;
          color: #6c757d;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          flex-shrink: 0;
        }

        .toast-close:hover {
          color: #212529;
        }

        .toast-message {
          margin-top: 0.5rem;
          color: #6c757d;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .toast-actions {
          margin-top: 0.75rem;
          display: flex;
          justify-content: flex-end;
        }

        .toast-action-button {
          background: none;
          border: 1px solid #dee2e6;
          color: #495057;
          padding: 0.375rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .toast-action-button:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .toast-container {
            top: 0.5rem;
            right: 0.5rem;
            left: 0.5rem;
            max-width: none;
          }

          .toast {
            margin: 0;
          }

          .toast-content {
            padding: 0.75rem;
          }

          .toast-header {
            gap: 0.5rem;
          }

          .toast-title {
            font-size: 0.9rem;
          }

          .toast-message {
            font-size: 0.85rem;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .toast {
            background: #2d3748;
            color: #e2e8f0;
          }

          .toast-title {
            color: #f7fafc;
          }

          .toast-message {
            color: #a0aec0;
          }

          .toast-short-code {
            background: #4a5568;
            color: #e2e8f0;
          }

          .toast-close {
            color: #a0aec0;
          }

          .toast-close:hover {
            color: #f7fafc;
          }

          .toast-action-button {
            border-color: #4a5568;
            color: #e2e8f0;
          }

          .toast-action-button:hover {
            background: #4a5568;
            border-color: #718096;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .toast {
            border: 2px solid;
          }

          .toast-success {
            border-color: #28a745;
          }

          .toast-error {
            border-color: #dc3545;
          }

          .toast-warning {
            border-color: #ffc107;
          }

          .toast-info {
            border-color: #17a2b8;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .toast {
            animation: none;
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

// Utility functions for common toast types
export const showSuccessToast = (context: ToastContextType, title: string, message?: string, shortCode?: string) => {
  return context.addToast({
    type: 'success',
    title,
    message,
    shortCode
  });
};

export const showErrorToast = (context: ToastContextType, title: string, message?: string, shortCode?: string) => {
  return context.addToast({
    type: 'error',
    title,
    message,
    shortCode,
    duration: 10000 // Longer duration for errors
  });
};

export const showWarningToast = (context: ToastContextType, title: string, message?: string, shortCode?: string) => {
  return context.addToast({
    type: 'warning',
    title,
    message,
    shortCode,
    duration: 8000
  });
};

export const showInfoToast = (context: ToastContextType, title: string, message?: string, shortCode?: string) => {
  return context.addToast({
    type: 'info',
    title,
    message,
    shortCode
  });
};

export default ToastProvider;