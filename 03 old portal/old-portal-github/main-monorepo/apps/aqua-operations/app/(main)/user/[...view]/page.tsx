'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

const OpsHubApp = dynamic(() => import('@OpsHubShell/OpsHubApp'), { ssr: false });

export default function UserPage({ params }: { params: Promise<{ view: string[] }> }) {
  const { view } = use(params);
  const initialView = view?.join('-') || 'dashboard';
  return <OpsHubApp mode="user" initialView={initialView} />;
}
