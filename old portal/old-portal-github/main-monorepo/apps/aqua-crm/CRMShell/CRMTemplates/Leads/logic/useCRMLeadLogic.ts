import { useState, useMemo } from 'react';

export const useCRMLeadLogic = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const leads = useMemo(() => [
    { name: 'Arthur Penhaligon', company: 'Nexus Digital', value: '$45,000', priority: 'High', engagement: 92, status: 'Negotiation' },
    { name: 'Selina Kyle', company: 'Gotham Assets', value: '$12,500', priority: 'Medium', engagement: 45, status: 'Cold Call' },
    { name: 'Victor Von Doom', company: 'Latverian Tech', value: '$850,000', priority: 'High', engagement: 100, status: 'Qualified' },
    { name: 'Bruce Wayne', company: 'Wayne Enterprises', value: '$250,000', priority: 'High', engagement: 78, status: 'Follow-up' },
    { name: 'Diana Prince', company: 'Themyscira Exports', value: '$65,400', priority: 'Medium', engagement: 62, status: 'Discovery' },
    { name: 'Tony Stark', company: 'Stark Industries', value: '$1.2M', priority: 'High', engagement: 98, status: 'Closing' },
  ], []);

  return {
    leads,
    searchQuery,
    setSearchQuery,
    stats: {
      totalLeads: leads.length,
      highPriority: leads.filter(l => l.priority === 'High').length,
    }
  };
};
