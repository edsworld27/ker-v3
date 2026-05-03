import { Activity } from 'lucide-react';
import { FinanceRegistration } from './FinanceRegistration';

/**
 * Suite Metadata Registry
 * 
 * Defines how suites are grouped and displayed in the sidebar.
 * This is now reactive, pulling from the FinanceRegistration.
 */
export const SUITE_METADATA = {
  get all() {
    return FinanceRegistration.getSuites().map(suite => ({
      ...suite,
      defaultView: suite.defaultView || (suite.subItems && suite.subItems.length > 0 ? suite.subItems[0].view : suite.id)
    }));
  },
  
  find(cb: (suite: any) => boolean) {
    return this.all.find(cb);
  },

  forEach(cb: (suite: any) => void) {
    this.all.forEach(cb);
  }
};

export const getSuiteIcon = (id: string) => {
  return SUITE_METADATA.find(s => s.id === id)?.icon || Activity;
};
