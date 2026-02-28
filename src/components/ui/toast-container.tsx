'use client';

import React from 'react';
import { useToast } from '@/contexts/toast-context';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => {
        let bgColor = 'bg-slate-900';
        let textColor = 'text-white';
        let icon = <Info className="w-5 h-5" />;

        if (toast.type === 'success') {
          bgColor = 'bg-green-600';
          icon = <CheckCircle className="w-5 h-5" />;
        } else if (toast.type === 'error') {
          bgColor = 'bg-red-600';
          icon = <AlertCircle className="w-5 h-5" />;
        } else if (toast.type === 'warning') {
          bgColor = 'bg-amber-600';
          icon = <AlertTriangle className="w-5 h-5" />;
        }

        return (
          <div
            key={toast.id}
            className={`${bgColor} ${textColor} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            {icon}
            <span className="flex-1 text-sm">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};