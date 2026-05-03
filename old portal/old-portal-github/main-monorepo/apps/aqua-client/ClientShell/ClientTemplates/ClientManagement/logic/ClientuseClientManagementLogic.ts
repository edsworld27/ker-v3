import { useState, useMemo, useEffect } from 'react';
import { useRevenueContext as useSalesContext } from '../../ClientRevenueContext';
import { useModalContext } from '@ClientShell/bridge/ClientModalContext';
import { useDesignAwareData } from '@ClientShell/hooks/ClientuseDesignAwareData';

export function useClientManagementLogic() {
  const sales = useSalesContext();
  const {
    handleViewChange,
    handleImpersonate,
    handleUpdateClientStage,
    handleProvisionClient,
    setClients,
    addLog,
    agencyConfig,
  } = sales;
  const { openModal } = useModalContext();
  const { data: clients = [] } = useDesignAwareData((sales as any).clients ?? [], 'mgmt-clients');
  const { data: users = [] } = useDesignAwareData((sales as any).users ?? [], 'mgmt-users');

  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);
  const [uploadingClientId, setUploadingClientId] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState('');

  const managedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

  const [cmsConfig, setCmsConfig] = useState({
    owner: managedClient?.githubOwner || '',
    repo: managedClient?.githubRepo || ''
  });

  useEffect(() => {
    if (managedClient) {
      setCmsConfig({
        owner: managedClient.githubOwner || '',
        repo: managedClient.githubRepo || ''
      });
    }
  }, [managedClient]);

  const handleSaveCmsConfig = () => {
    if (!managedClient) return;
    setClients((prev: any) => prev.map((c: any) => c.id === managedClient.id ? { 
      ...c, 
      githubOwner: cmsConfig.owner, 
      githubRepo: cmsConfig.repo 
    } : c));
    addLog('Client Update', `Updated CMS configuration for ${managedClient.name}`, 'action', managedClient.id);
  };

  const handleResourceUpload = (clientId: string) => {
    setUploadingClientId(clientId);
    setUploadName('');
  };

  const confirmResourceUpload = () => {
    if (!uploadName.trim() || !managedClient || !uploadingClientId) return;
    const newResource = { name: uploadName.trim(), url: '#', type: 'document' };
    setClients(prev => prev.map(c => c.id === uploadingClientId ? { ...c, resources: [...(c.resources || []), newResource] } : c));
    addLog('Client Update', `Uploaded resource ${uploadName.trim()} for ${managedClient.name}`, 'action', managedClient.id);
    setUploadingClientId(null);
    setUploadName('');
  };

  const handleEmployeeAssignment = (clientId: string, employeeId: number, isChecked: boolean) => {
    if (!managedClient) return;
    const currentAssigned = managedClient.assignedEmployees || [];
    const newAssigned = isChecked
      ? [...currentAssigned, employeeId]
      : currentAssigned.filter(id => id !== employeeId);
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, assignedEmployees: newAssigned } : c));
    const employee = users.find(u => u.id === employeeId);
    if (employee) {
        addLog('Client Update', `${isChecked ? 'Assigned' : 'Unassigned'} ${employee.name} ${isChecked ? 'to' : 'from'} ${managedClient.name}`, 'action', managedClient.id);
    }
  };

  return {
    clients,
    users,
    managedClient,
    selectedClientId,
    setSelectedClientId,
    uploadingClientId,
    setUploadingClientId,
    uploadName,
    setUploadName,
    cmsConfig,
    setCmsConfig,
    handleSaveCmsConfig,
    handleResourceUpload,
    confirmResourceUpload,
    handleEmployeeAssignment,
    handleViewChange,
    handleImpersonate,
    handleUpdateClientStage,
    handleProvisionClient,
    openModal,
    agencyConfig
  };
}
