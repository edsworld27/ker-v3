import { useMemo } from 'react';
import { PRODUCTION_QUEUE, FULFILLMENT_STATS, PIPELINE_NODES, THROUGHPUT_DATA } from './ClientmockData';

export function useFulfillmentLogic() {
  const queue = useMemo(() => PRODUCTION_QUEUE, []);
  const stats = useMemo(() => FULFILLMENT_STATS, []);
  const pipelines = useMemo(() => PIPELINE_NODES, []);
  const throughput = useMemo(() => THROUGHPUT_DATA, []);

  const handleInitializeSprint = () => {
    console.log('Initializing operational sprint protocol...');
  };

  return {
    queue,
    stats,
    pipelines,
    throughput,
    handleInitializeSprint
  };
}
