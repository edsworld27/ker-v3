import React, { createContext, useContext, ReactNode } from 'react';
import { useAutoSync } from '@ClientShell/hooks/ClientuseAutoSync';
import { useAppContext } from '@ClientShell/bridge/ClientAppContext';
import { useState } from 'react';
import { Users, TrendingUp, Shield, BookOpen, FileSearch } from 'lucide-react';
import {
  BoardMeeting, RiskAssessment, ApprovalRequest,
  StakeholderStatement, StrategicProjections, StrategicObjective, KnowledgeBaseArticle
} from '@ClientShell/bridge/types';
import {
  initialBoardMeetings, initialStrategicProjections,
  initialStrategicObjectives, initialRiskAssessments, initialApprovalRequests,
  initialKnowledgeBaseArticles, initialStakeholderStatements,
  initialLegalDocuments, initialInsurancePolicies, initialDataProtectionRecords,
  initialInventory, initialSOPs
} from './logic/ClientmockData';


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function useEnterpriseContextInternal() {
  const context = useAppContext();
  const { portalView, handleViewChange, addLog, portalMode } = context;

  const isDemo = portalMode === 'demo';

  // --- Enterprise Suite State ---
  const [boardMeetings, setBoardMeetings] = useState<BoardMeeting[]>(isDemo ? initialBoardMeetings : []);
  const [stakeholderStatements, setStakeholderStatements] = useState<StakeholderStatement[]>(isDemo ? initialStakeholderStatements : []);
  const [strategicProjections, setStrategicProjections] = useState<StrategicProjections[]>(isDemo ? initialStrategicProjections : []);
  const [objectives, setObjectives] = useState<StrategicObjective[]>(isDemo ? initialStrategicObjectives : []);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>(isDemo ? initialRiskAssessments : []);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(isDemo ? initialApprovalRequests : []);
  const [knowledgeBaseArticles, setKnowledgeBaseArticles] = useState<KnowledgeBaseArticle[]>(isDemo ? initialKnowledgeBaseArticles : []);
  const [legalDocuments, setLegalDocuments] = useState<any[]>(isDemo ? initialLegalDocuments : []);
  const [insurancePolicies, setInsurancePolicies] = useState<any[]>(isDemo ? initialInsurancePolicies : []);
  const [dataProtectionRecords, setDataProtectionRecords] = useState<any[]>(isDemo ? initialDataProtectionRecords : []);
  const [inventoryItems, setInventoryItems] = useState<any[]>(isDemo ? initialInventory : []);
  const [inventoryGroup, setInventoryGroup] = useState<any[]>(isDemo ? initialInventory : []);
  const [sops, setSOPs] = useState<any[]>(isDemo ? initialSOPs : []);

  // ── Discovery & Pull Hub ──────────────────────────────────────────────────
  const { 
    deals: bridgeDeals, 
    enabledSuiteIds: bridgeActiveSuites,
    setApprovalRequests: setApprovalRequestsBridge, 
    setRiskAssessments: setRiskAssessmentsBridge, 
    setSops: setSopsBridge, 
    setInventoryGroup: setInventoryGroupBridge, 
    setStrategicProjections: setStrategicProjectionsBridge
  } = context;

  const isSalesActive = bridgeActiveSuites.includes('sales_suite');
  const isEnterpriseActive = bridgeActiveSuites.includes('enterprise_suite') || bridgeActiveSuites.includes('legal-suite');

  // Use discovered deals for 'strategic projections' or similar
  const discoveredDeals = isSalesActive ? bridgeDeals : [];

  // --- Enterprise Handlers ---
  const handleCreateObjective = (objective: Omit<StrategicObjective, 'id'>) => {
    const newObjective: StrategicObjective = {
      ...objective,
      id: `obj-${Date.now()}`
    };
    setObjectives(prev => [newObjective, ...prev]);
    addLog('Enterprise', `Created strategic objective: ${objective.obj}`, 'action');
  };

  const handleUpsertObjective = (objective: StrategicObjective) => {
    setObjectives(prev => {
      const exists = prev.find(o => o.id === objective.id);
      if (exists) return prev.map(o => o.id === objective.id ? { ...o, ...objective } : o);
      return [objective, ...prev];
    });
    addLog('Enterprise', `Upserted strategic objective: ${objective.obj || objective.title}`, 'action');
  };

  const handleDeleteObjective = (id: string) => {
    setObjectives(prev => prev.filter(o => o.id !== id));
    addLog('Enterprise', `Deleted strategic objective: ${id}`, 'action');
  };

  const handleScheduleBoardMeeting = (meeting: Omit<BoardMeeting, 'id' | 'status'>) => {
    const newMeeting: BoardMeeting = {
      ...meeting,
      id: `mtg-${Date.now()}`,
      status: 'scheduled'
    };
    setBoardMeetings(prev => [newMeeting, ...prev]);
    addLog('Enterprise', `Scheduled board meeting: ${meeting.title}`, 'action');
  };

  // ── PUSH LOCAL DATA TO BRIDGE ──────────────────────────────────────────────
  React.useEffect(() => {
    if (isEnterpriseActive) {
      setApprovalRequestsBridge(approvalRequests);
      setRiskAssessmentsBridge(riskAssessments);
      setSopsBridge(sops);
      setInventoryGroupBridge(inventoryGroup);
      setStrategicProjectionsBridge(strategicProjections[0] || {});
    } else {
      setApprovalRequestsBridge([]);
      setRiskAssessmentsBridge([]);
      setSopsBridge([]);
      setInventoryGroupBridge({});
    }
  }, [
    isEnterpriseActive, approvalRequests, riskAssessments, sops, 
    inventoryGroup, strategicProjections, 
    setApprovalRequestsBridge, setRiskAssessmentsBridge, setSopsBridge, 
    setInventoryGroupBridge, setStrategicProjectionsBridge
  ]);

  const navItems = [
    { id: 'enterprise-boardroom', label: 'Boardroom', icon: Users, view: 'enterprise-boardroom', active: portalView === 'enterprise-boardroom' || portalView === 'enterprise-suite', onClick: () => handleViewChange('enterprise-boardroom') },
    { id: 'enterprise-strategy', label: 'Strategy', icon: TrendingUp, view: 'enterprise-strategy', active: portalView === 'enterprise-strategy', onClick: () => handleViewChange('enterprise-strategy') },
    { id: 'enterprise-risk', label: 'Risk Analysis', icon: Shield, view: 'enterprise-risk', active: portalView === 'enterprise-risk', onClick: () => handleViewChange('enterprise-risk') },
    { id: 'enterprise-os', label: 'Business OS', icon: BookOpen, view: 'enterprise-os', active: portalView === 'enterprise-os', onClick: () => handleViewChange('enterprise-os') },
    { id: 'enterprise-audit', label: 'Audit Trail', icon: FileSearch, view: 'enterprise-audit', active: portalView === 'enterprise-audit', onClick: () => handleViewChange('enterprise-audit') },
  ];


  useAutoSync('enterprise_data', {
    boardMeetings,
    stakeholderStatements,
    strategicProjections,
    objectives,
    riskAssessments,
    approvalRequests,
    knowledgeBaseArticles,
    legalDocuments,
    insurancePolicies,
    dataProtectionRecords,
    inventoryItems,
    sops
  });

  return {
    ...context,
    boardMeetings, setBoardMeetings,
    stakeholderStatements, setStakeholderStatements,
    strategicProjections, setStrategicProjections,
    objectives, setObjectives,
    riskAssessments, setRiskAssessments,
    approvalRequests, setApprovalRequests,
    knowledgeBaseArticles, setKnowledgeBaseArticles,
    legalDocuments, setLegalDocuments,
    insurancePolicies, setInsurancePolicies,
    dataProtectionRecords, setDataProtectionRecords,
    inventoryItems, setInventoryItems,
    inventoryGroup, setInventoryGroup,
    sops, setSOPs,
    // Alias for views using boardMeetingsGroup naming
    boardMeetingsGroup: boardMeetings,
    handleCreateObjective,
    handleUpsertObjective,
    handleDeleteObjective,
    handleScheduleBoardMeeting,
    navItems,
    portalView,
    handleViewChange
  };
}


type EnterpriseContextType = ReturnType<typeof useEnterpriseContextInternal>;

const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export const EnterpriseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const existingContext = React.useContext(EnterpriseContext);
  const value = useEnterpriseContextInternal();

  if (existingContext) return <>{children}</>;

  return <EnterpriseContext.Provider value={value}>{children}</EnterpriseContext.Provider>;
};

const noopEnterprise: any = new Proxy({}, {
  get(_t, prop) {
    if (typeof prop === 'string' && (prop.startsWith('handle') || prop.startsWith('set'))) return () => {};
    return undefined;
  },
});

export const useEnterpriseContext = () => {
  const context = useContext(EnterpriseContext);
  return context ?? noopEnterprise;
};
