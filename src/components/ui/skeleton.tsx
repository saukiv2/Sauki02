'use client';

export function Skeleton({ className, width, height }: { className?: string; width?: string; height?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className || ''}`}
      style={{ width, height }}
    />
  );
}
