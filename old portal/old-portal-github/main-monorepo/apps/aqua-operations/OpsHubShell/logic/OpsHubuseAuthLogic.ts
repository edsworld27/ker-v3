import { useState } from 'react';
import type { AppUser, BridgeSession } from '@OpsHubShell/bridge/types';
import { BridgeAPI } from '@OpsHubShell/bridge/OpsHubapi';

interface AuthLogicDeps {
  users: AppUser[];
  currentUserEmail: string;
  addLog: (action: string, details: string, type?: any) => void;
  sendNotification: (userId: number, title: string, message: string) => void;
  setCurrentUserEmail: (email: string) => void;
  /** Called on successful login to push the full session into app state */
  onSessionEstablished: (session: BridgeSession) => void;
  setStep: (step: any) => void;
  savePersistedState: () => void;
}

export function useAuthLogic(persisted: any, deps: AuthLogicDeps) {
  const { users, currentUserEmail: currentEmailFromCore, addLog, sendNotification, setCurrentUserEmail, onSessionEstablished, setStep, savePersistedState } = deps;

  // ── Auth State ─────────────────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authError, setAuthError] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [loginPortalType, setLoginPortalType] = useState<'agency' | 'client'>(persisted?.loginPortalType ?? 'agency');
  const [mfaVerified, setMfaVerified] = useState<boolean>(false);

  // ── Impersonation State ───────────────────────────────────────────────────
  const [impersonatedUserEmail, setImpersonatedUserEmail] = useState<string | null>(null);
  const [impersonatingClientId, setImpersonatingClientId] = useState<string | null>(null);

  // Computed Identity
  const currentUser = users.find(u => u.email === (impersonatedUserEmail || currentEmailFromCore)) || null;

  // ── Auth Handlers ──────────────────────────────────────────────────────────
  const toggleAuthMode = () => {
    setIsLoginMode(!isLoginMode);
    setAuthError('');
  };
  
  const handleSetCode = (index: number, val: string) => {
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
  };

  const handleLogin = async (email: string, pass: string) => {
    const response = await BridgeAPI.authenticate(email, loginPortalType);

    if (response.success && response.session) {
      const session = response.session;
      const effectiveEmail = session.user.email;

      // Push the full BridgeSession into app state — this drives
      // enabledSuiteIds, productAccess, currentAgency, and currentUser
      onSessionEstablished(session);
      setCurrentUserEmail(effectiveEmail);
      addLog(`Login successful: ${effectiveEmail}`, 'info');

      if (session.isDemo) {
        setMfaVerified(true);
        setStep('portal');
      } else {
        setStep('security');
      }
      setAuthError('');
    } else {
      setAuthError(response.error ?? 'Invalid email or password');
      addLog(`Failed login attempt: ${email}`, 'warning');
    }
  };

  const handleSignup = (name: string, email: string) => {
    addLog(`New signup attempt: ${name} (${email})`, 'info');
    // In a real app, this would trigger the setup wizard
    setStep('setup-wizard');
  };

  const handleVerifyMfa = (pin: string) => {
     if (pin === '123456' || pin === '000000') { // Demo pins
       setMfaVerified(true);
       setStep('portal');
       addLog('MFA Verified', 'Security check passed');
       setTimeout(() => savePersistedState(), 100);
     } else {
       addLog('MFA Failed', `Invalid pin attempt: ${pin}`, 'warning');
     }
  };

  const handleStopImpersonating = () => {
    setImpersonatedUserEmail(null);
    setImpersonatingClientId(null);
    addLog('Auth', 'Stopped impersonating user', 'system');
  };

  return {
    username, setUsername,
    password, setPassword,
    isLoginMode, setIsLoginMode,
    authError, setAuthError,
    toggleAuthMode,
    code, setCode,
    loginPortalType, setLoginPortalType,
    mfaVerified, setMfaVerified,
    handleSetCode,
    handleLogin,
    handleSignup,
    handleVerifyMfa,
    
    // Impersonation
    impersonatedUserEmail, setImpersonatedUserEmail,
    impersonatingClientId, setImpersonatingClientId,
    handleStopImpersonating,
    currentUser
  };
}
