'use client';
import dynamic from 'next/dynamic';

const RevenueApp = dynamic(() => import('../../RevenueShell/RevenueApp'), { ssr: false });

export default function RootPage() {
  return <RevenueApp />;
}
