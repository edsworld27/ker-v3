'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

const RevenueApp = dynamic(() => import('@RevenueShell/RevenueApp'), { ssr: false });

export default function UserPage({ params }: { params: Promise<{ view: string[] }> }) {
  const { view } = use(params);
  const initialView = view?.join('-') || 'dashboard';
  return <RevenueApp mode="user" initialView={initialView} />;
}
