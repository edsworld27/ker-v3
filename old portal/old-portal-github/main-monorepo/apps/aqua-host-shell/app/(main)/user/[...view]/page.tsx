'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

const HostApp = dynamic(() => import('@HostShell/HostApp'), { ssr: false });

export default function UserPage({ params }: { params: Promise<{ view: string[] }> }) {
  const { view } = use(params);
  const initialView = view?.join('-') || 'admin-dashboard';
  return <HostApp mode="user" initialView={initialView} />;
}
