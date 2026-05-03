'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

const ClientApp = dynamic(() => import('@ClientShell/ClientApp'), { ssr: false });

export default function DemoPage({ params }: { params: Promise<{ view: string[] }> }) {
  const { view } = use(params);
  const initialView = view?.join('-') || 'dashboard';
  return <ClientApp mode="demo" initialView={initialView} />;
}
