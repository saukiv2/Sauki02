'use client';

import React from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
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
          className="fixed inset-0 z-40 bg-black/50 transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] w-full transform rounded-t-2xl bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {title && (
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-brand-black">{title}</h2>
          </div>
        )}
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
}
