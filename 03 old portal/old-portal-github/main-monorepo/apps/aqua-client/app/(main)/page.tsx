'use client';
import dynamic from 'next/dynamic';

const ClientApp = dynamic(() => import('../../ClientShell/ClientApp'), { ssr: false });

export default function RootPage() {
  return <ClientApp />;
}
