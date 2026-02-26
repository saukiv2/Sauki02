import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SaukiMart',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
