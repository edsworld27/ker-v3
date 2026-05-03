'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PeopleProvider } from '@PeopleShell/bridge/PeopleContext';
import { usePeopleLogic } from '@PeopleShell/logic/PeopleusePeopleLogic';
import { PeopleFrame } from '@PeopleShell/AppFrame/PeopleAppFrame';
import { PeopleBridgeHub } from '@PeopleShell/bridge/PeopleBridgeHub';
import { onBridgeMessage, sendBridgeMessage } from '@aqua/bridge/postMessage';

export default function EmbedPage() {
  const params = useParams();
  const viewId = Array.isArray(params.view) ? params.view[0] : (params.view as string);
  const logic = usePeopleLogic();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    const unsub = onBridgeMessage((msg) => {
      if (msg.type === 'BRIDGE_AUTH') {
        const payload = msg.payload as any;
        const session = {
          user: payload.user,
          agency: payload.activeClient
            ? { id: payload.activeClient.id, name: payload.activeClient.name, isConfigured: true }
            : { id: 'local', name: 'Aqua Portal', isConfigured: true },
          enabledSuiteIds: payload.activeClient?.enabledSuiteIds || ['*'],
          productAccess: ['aqua-ops-people'],
          permissions: payload.permissions,
        };
        logic.onSessionEstablished?.(session as any);
      }
      if (msg.type === 'BRIDGE_THEME') {
        const theme = msg.payload as any;
        const root = document.documentElement;
        Object.entries(theme).forEach(([key, value]) => {
          root.style.setProperty(`--people-widget-${key}`, value as string);
        });
      }
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `logic` identity changes each render; bridge subscription is mount-once
  }, []);

  useEffect(() => {
    if (ready) {
      logic.setStep?.('portal');
      logic.setPortalView?.(viewId);
      if (typeof window !== 'undefined' && window.parent !== window) {
        sendBridgeMessage(window.parent, 'BRIDGE_READY', { viewId }, 'aqua-ops-people');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `logic` identity changes each render; depend only on the trigger keys
  }, [ready, viewId]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0b]">
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PeopleProvider value={{ ...logic }} >
      <PeopleBridgeHub>
        <PeopleFrame portalMode="user" />
      </PeopleBridgeHub>
    </PeopleProvider>
  );
}
