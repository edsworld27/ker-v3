'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

const FinanceApp = dynamic(() => import('@FinanceShell/FinanceApp'), { ssr: false });

export default function DemoPage({ params }: { params: Promise<{ view: string[] }> }) {
  const { view } = use(params);
  const initialView = view?.join('-') || 'dashboard';
  return <FinanceApp mode="demo" initialView={initialView} />;
}
