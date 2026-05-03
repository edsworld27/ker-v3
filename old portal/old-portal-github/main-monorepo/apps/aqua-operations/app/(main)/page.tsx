'use client';
import dynamic from 'next/dynamic';

const OpsHubApp = dynamic(() => import('../../OpsHubShell/OpsHubApp'), { ssr: false });

export default function RootPage() {
  return <OpsHubApp />;
}
