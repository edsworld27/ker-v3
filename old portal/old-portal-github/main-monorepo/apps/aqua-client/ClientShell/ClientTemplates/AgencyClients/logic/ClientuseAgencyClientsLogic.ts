import { useState, useMemo } from 'react';

export const useClientAgencyClientsLogic = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const mockClients = useMemo(() => [
    { id: '1', name: 'Elite Marketing Group', contact: 'Sarah Jenkins', industry: 'E-commerce', modules: 12 },
    { id: '2', name: 'Global Tech Solutions', contact: 'Marcus Chen', industry: 'SaaS', modules: 8 },
    { id: '3', name: 'Creative Pulse Agency', contact: 'Elena Rodriguez', industry: 'Digital Media', modules: 15 },
    { id: '4', name: 'Nexus Finance Corp', contact: 'James Wilson', industry: 'Fintech', modules: 10 },
    { id: '5', name: 'Apex Logistics', contact: 'Hassan Malik', industry: 'Supply Chain', modules: 6 },
    { id: '6', name: 'Serenity Wellness', contact: 'Isabella Ross', industry: 'Health', modules: 4 },
  ], []);

  const filteredClients = useMemo(() => {
    return mockClients.filter(client => 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.industry.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mockClients, searchQuery]);

  const handleImpersonate = (client: any) => {
    console.log(`[AQUA Client] Impersonating workspace for partner: ${client.name}`);
    // Future: Dispatch Bridge Event to Host Shell for IFrame orchestration
  };

  return {
    filteredClients,
    searchQuery,
    setSearchQuery,
    handleImpersonate,
  };
};
