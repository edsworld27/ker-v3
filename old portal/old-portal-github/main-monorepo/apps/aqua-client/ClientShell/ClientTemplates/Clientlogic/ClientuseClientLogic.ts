import { Client, ClientStage } from '@ClientShell/bridge/types';

export const useClientLogic = (
  clients: Client[],
  setClients: React.Dispatch<React.SetStateAction<Client[]>>,
  addLog: (action: string, details: string, type?: any, clientId?: string) => void
) => {
  const handleUpdateClientStage = (clientId: string, stage: ClientStage) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, stage } : c));
    addLog('Client', `Updated client ${clientId} stage to ${stage}`, 'action', clientId);
  };

  const handleEditClient = (client: Client) => {
    setClients(prev => prev.map(c => c.id === client.id ? client : c));
    addLog('Client', `Edited client details for ${client.name}`, 'action', client.id);
  };

  const handleUploadClientResource = (clientId: string, resource: any) => {
    addLog('Client', `Uploaded resource to client ${clientId}`, 'action', clientId);
  };

  const handleUpdateClientSettings = (clientId: string, settings: any) => {
    addLog('Client', `Updated settings for client ${clientId}`, 'action', clientId);
  };

  const handleAddClientUser = (clientId: string, user: any) => {
    addLog('Client', `Added user to client ${clientId}`, 'action', clientId);
  };

  const handleRemoveClientUser = (clientId: string, userId: number) => {
    addLog('Client', `Removed user ${userId} from client ${clientId}`, 'action', clientId);
  };

  return {
    handleUpdateClientStage,
    handleEditClient,
    handleUploadClientResource,
    handleUpdateClientSettings,
    handleAddClientUser,
    handleRemoveClientUser,
  };
};
