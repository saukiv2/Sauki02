'use client';

import React from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const icons = {
  success: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
  error: <XCircleIcon className="h-6 w-6 text-red-400" />,
  info: <InformationCircleIcon className="h-6 w-6 text-blue-400" />,
  warning: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />,
};

function CloseButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full p-1 text-gray-400 hover:bg-gray-700"
    >
      <XMarkIcon className="h-5 w-5" />
    </button>
  );
}

export function Toast({
  type,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}: ToastProps) {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoClose, duration, onClose]);

  const Icon = icons[type];

  return (
    <div
      className="pointer-events-auto flex w-full max-w-sm items-center space-x-4 rounded-xl bg-gray-900/90 p-4 font-inter text-white shadow-lg backdrop-blur-sm"
      role="alert"
    >
      <div className="flex-shrink-0">{Icon}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      {onClose && <CloseButton onClick={onClose} />}
    </div>
  );
}
