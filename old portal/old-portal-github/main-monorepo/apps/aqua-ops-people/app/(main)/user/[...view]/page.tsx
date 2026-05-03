'use client';

import dynamic from 'next/dynamic';
import { use } from 'react';

const PeopleApp = dynamic(() => import('@PeopleShell/PeopleApp'), { ssr: false });

export default function UserPage({ params }: { params: Promise<{ view: string[] }> }) {
  const { view } = use(params);
  const initialView = view?.join('-') || 'dashboard';
  return <PeopleApp mode="user" initialView={initialView} />;
}
