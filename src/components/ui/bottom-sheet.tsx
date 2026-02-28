'use client';

import React from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

function Handle() {
  return (
    <div className="flex justify-center py-2">
      <div className="h-1.5 w-10 rounded-full bg-gray-300" />
    </div>
  );
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] w-full transform rounded-t-3xl bg-white/80 pb-4 shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <Handle />
        {title && (
          <div className="border-b border-gray-200 px-6 py-2">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
}
