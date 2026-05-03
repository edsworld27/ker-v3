'use client';
import dynamic from 'next/dynamic';

const CRMApp = dynamic(() => import('../../CRMShell/CRMApp'), { ssr: false });

export default function RootPage() {
  return <CRMApp />;
}
