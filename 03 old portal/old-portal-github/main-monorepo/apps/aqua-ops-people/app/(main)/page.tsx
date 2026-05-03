'use client';
import dynamic from 'next/dynamic';

const PeopleApp = dynamic(() => import('../../PeopleShell/PeopleApp'), { ssr: false });

export default function RootPage() {
  return <PeopleApp />;
}
