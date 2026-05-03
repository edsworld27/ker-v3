import { BridgeRegistry } from '@aqua/bridge/registry';
import { LineChart, BarChart3 } from 'lucide-react';
import { FinanceDashboardView } from './Dashboard/FinanceDashboardView';
import { FinanceProvider } from './FinanceContext';

export const FinanceSuiteRegistry = {
  id: 'finance-suite',
  section: 'Finance',
  label: 'Finance Hub',
  icon: LineChart,
  defaultView: 'finance-dashboard',
  description: 'Real-time revenue orchestration, ledgers, and partnership settlement.',
  category: 'Finance' as const,
  pricing: 'pro' as const,
  subItems: [
    {
      id: 'finance-dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      view: 'finance-dashboard',
    },
  ],
};

export async function registerFinanceApp() {
  console.log('[AQUA Finance] Registering Standalone Finance App...');

  BridgeRegistry.registerSuite(FinanceSuiteRegistry);
  BridgeRegistry.registerProvider('finance-suite', FinanceProvider);

  BridgeRegistry.registerAll({
    'finance-dashboard': FinanceDashboardView,
    'finance-suite': FinanceDashboardView,
  });
}

export { FinanceDashboardView };
