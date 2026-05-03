'use client';
import dynamic from 'next/dynamic';

const FinanceApp = dynamic(() => import('../../FinanceShell/FinanceApp'), { ssr: false });

export default function RootPage() {
  return <FinanceApp />;
}
