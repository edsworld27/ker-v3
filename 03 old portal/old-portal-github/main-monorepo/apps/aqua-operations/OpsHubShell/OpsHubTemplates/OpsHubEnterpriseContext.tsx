import React, { createContext, useContext } from 'react';

const EnterpriseContext = createContext<any>(null);

export const EnterpriseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <EnterpriseContext.Provider value={{}}>{children}</EnterpriseContext.Provider>;

export const useEnterpriseContext = () => useContext(EnterpriseContext);
export { EnterpriseContext };
