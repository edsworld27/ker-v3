import { BridgeRegistry } from '@aqua/bridge';
import { BridgeUIRegistry } from '@aqua/bridge/ui';
import { Users2, Compass, Activity, FileText } from 'lucide-react';
import { SuiteTemplate } from '@aqua/bridge/types';

// Import the new structured views and their UI configurations
import { IFrameView, IFrameViewUI } from './IFrameView';
import { OnboardingPhaseView, OnboardingPhaseViewUI } from './OnboardingPhaseView';
import { LivePhaseView, LivePhaseViewUI } from './LivePhaseView';

// Register the new view components and their UI configurations with the Bridge
BridgeRegistry.register('iframe-view', IFrameView);
BridgeUIRegistry.register(IFrameViewUI);

BridgeRegistry.register('onboarding-phase-view', OnboardingPhaseView);
BridgeUIRegistry.register(OnboardingPhaseViewUI);

BridgeRegistry.register('live-phase-view', LivePhaseView);
BridgeUIRegistry.register(LivePhaseViewUI);

// Fallback registration to fix stuck local storage state
BridgeRegistry.register('clients-hub-suite', OnboardingPhaseView);

export const customSuites: SuiteTemplate[] = [
  {
    id: 'clients-hub-suite',
    section: 'Clients Hub',
    label: 'My Clients',
    icon: Users2,
    defaultView: 'onboarding-phase-view',
    subItems: [
      {
        id: 'onboarding-phase',
        label: 'Onboarding',
        icon: Compass,
        view: 'onboarding-phase-view',
      },
      {
        id: 'live-phase',
        label: 'Live',
        icon: Activity,
        view: 'live-phase-view',
      },
    ],
  },
  {
    id: 'cms-suite',
    section: 'CMS',
    label: 'Payload',
    icon: FileText,
    defaultView: 'iframe-view',
  },
];

export async function registerCustomSuites() {
  console.log('[Templates] Registering Custom Suites...');
  customSuites.forEach(suite => BridgeRegistry.registerSuite(suite));
  console.log('[Templates] Custom Suites registered.');
}
