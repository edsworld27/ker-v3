import { useState, useMemo } from 'react';
import { Gem, Activity, BarChart4, TrendingUp } from 'lucide-react';

export const useRevenueAnalyticsLogic = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const metrics = useMemo(() => [
    { label: 'Fiscal Velocity', value: '$84.2K', change: '+14.5%', trend: 'up', icon: BarChart4 },
    { label: 'Growth Index', value: '92.4', change: '+2.1%', trend: 'up', icon: TrendingUp },
    { label: 'Token Valuation', value: '$1.24', change: '+0.8%', trend: 'up', icon: Gem },
    { label: 'Silo Health', value: '98.2%', change: '-0.3%', trend: 'down', icon: Activity },
  ], []);

  const revenueData = useMemo(() => [
    { label: 'JAN', value: 45 },
    { label: 'FEB', value: 52 },
    { label: 'MAR', value: 38 },
    { label: 'APR', value: 65 },
    { label: 'MAY', value: 72 },
    { label: 'JUN', value: 58 },
    { label: 'JUL', value: 85 },
    { label: 'AUG', value: 92 },
    { label: 'SEP', value: 78 },
    { label: 'OCT', value: 95 },
  ], []);

  return {
    metrics,
    revenueData,
    searchQuery,
    setSearchQuery,
  };
};
