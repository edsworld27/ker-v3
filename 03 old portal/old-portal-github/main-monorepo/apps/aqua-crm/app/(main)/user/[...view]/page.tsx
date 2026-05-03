'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

const CRMApp = dynamic(() => import('@CRMShell/CRMApp'), { ssr: false });

export default function UserPage({ params }: { params: Promise<{ view: string[] }> }) {
  const { view } = use(params);
  const initialView = view?.join('-') || 'dashboard';
  return <CRMApp mode="user" initialView={initialView} />;
}
