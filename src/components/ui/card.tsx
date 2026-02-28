'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
        className || ''
      }`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 border-b border-gray-100 pb-4 ${className || ''}`}>
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-4 border-t border-gray-100 pt-4 ${className || ''}`}>
      {children}
    </div>
  );
}
