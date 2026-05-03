import { useAppContext } from '@ClientShell/bridge/ClientAppContext';

export function usePortalLogic() {
  const context = useAppContext();
  const { 
    currentUser, 
    clients, 
    impersonatingClientId, 
    handleStopImpersonating,
    addLog,
    projects = [],
    projectTasks = []
  } = context;

  // 1. Identify Client Identity (Pull from Hub)
  const isImpersonating = !!impersonatingClientId;
  const clientId = impersonatingClientId ?? currentUser?.clientId;
  const activeClient = clients.find(c => c.id === clientId) || clients[0];

  const project = projects.find(p => p.clientId === activeClient?.id);
  const clientTasks = projectTasks.filter(t => t.projectId === project?.id);

  // 2. Derive Onboarding Phases from Client Stage
  const STAGES = ['discovery', 'onboarding', 'design', 'development', 'live'];
  const currentStageIndex = STAGES.indexOf(activeClient?.stage || 'discovery');

  const phases = [
    { id: 'discovery', label: 'Discovery', status: currentStageIndex >= 0 ? 'Completed' : 'Pending', date: 'Done' },
    { id: 'setup', label: 'Setup', status: currentStageIndex >= 1 ? 'Completed' : 'In Progress', date: currentStageIndex >= 1 ? 'Done' : 'Current' },
    { id: 'live', label: 'Go-Live', status: currentStageIndex >= 4 ? 'Completed' : 'Pending', date: currentStageIndex >= 4 ? 'Done' : 'TBD' },
    { id: 'growth', label: 'Growth', status: currentStageIndex >= 5 ? 'Completed' : 'Locked', date: 'TBD' }
  ];

  // 3. Onboarding Checklist (Derived from actual tasks)
  const onboardingTasks = clientTasks.slice(0, 4).map(t => ({
    task: t.title,
    status: t.status === 'Done' ? 'Completed' : 'Next',
    icon: t.status === 'Done' ? 'check' : 'clock'
  }));

  if (onboardingTasks.length === 0) {
    onboardingTasks.push(
      { task: 'Complete Discovery Form', status: activeClient?.discoveryAnswers ? 'Completed' : 'Next', icon: 'zap' },
      { task: 'Upload Brand Assets', status: activeClient?.resources?.length ? 'Completed' : 'Next', icon: 'zap' }
    );
  }

  // 4. Client Stats (Derived)
  const clientStats = [
    { label: 'Project Progress', value: `${clientTasks.length > 0 ? Math.round((clientTasks.filter(t => t.status === 'Done').length / clientTasks.length) * 100) : 0}%`, trend: 'Live Status' },
    { label: 'Active Tasks', value: clientTasks.filter(t => t.status !== 'Done').length.toString(), trend: 'Action Required' },
    { label: 'Resources', value: (activeClient?.resources?.length || 0).toString(), trend: 'Shared Files' }
  ];

  const handleStopView = () => {
    handleStopImpersonating();
    if (activeClient) {
      addLog('System', `Stopped viewing as client: ${activeClient.name}`, 'info');
    }
  };

  return {
    currentUser,
    activeClient,
    isImpersonating,
    phases,
    currentPhaseIndex: currentStageIndex,
    onboardingTasks,
    clientStats,
    handleStopView
  };
}
