'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

const FinanceApp = dynamic(() => import('@FinanceShell/FinanceApp'), { ssr: false });

export default function UserPage({ params }: { params: Promise<{ view: string[] }> }) {
  const { view } = use(params);
  const initialView = view?.join('-') || 'dashboard';
  return <FinanceApp mode="user" initialView={initialView} />;
}
