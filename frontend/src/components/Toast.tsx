import { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export type ToastVariant = 'error' | 'success' | 'info';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
}

const variantStyles: Record<ToastVariant, { bg: string; border: string; icon: typeof AlertCircle }> = {
  error: {
    bg: 'bg-red-900/90',
    border: 'border-red-700',
    icon: AlertCircle,
  },
  success: {
    bg: 'bg-green-900/90',
    border: 'border-green-700',
    icon: CheckCircle,
  },
  info: {
    bg: 'bg-blue-900/90',
    border: 'border-blue-700',
    icon: Info,
  },
};

export const Toast = ({ message, variant = 'info', duration = 5000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const { bg, border, icon: Icon } = variantStyles[variant];

  useEffect(() => {
    // Animate in
    const showTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto dismiss
    let dismissTimer: number | undefined;
    if (duration > 0) {
      dismissTimer = window.setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(showTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 max-w-md transition-all duration-300 ${
        isVisible && !isLeaving
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      }`}
    >
      <div
        className={`${bg} ${border} border rounded-lg shadow-xl backdrop-blur-sm px-4 py-3 flex items-start gap-3`}
      >
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-white/80" />
        <p className="text-sm text-white flex-1">{message}</p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
