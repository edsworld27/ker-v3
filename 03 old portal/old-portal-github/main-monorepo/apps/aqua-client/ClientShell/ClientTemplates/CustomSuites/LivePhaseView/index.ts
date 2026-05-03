import React from 'react';
import type { UIViewConfig } from '@aqua/bridge/ui';
export const LivePhaseView: React.FC = () => React.createElement('div', { className: 'p-8 text-center opacity-50' }, 'Live Phase');
export const LivePhaseViewUI: UIViewConfig = { id: 'live-phase-view', title: 'Live Phase', variables: [] };
