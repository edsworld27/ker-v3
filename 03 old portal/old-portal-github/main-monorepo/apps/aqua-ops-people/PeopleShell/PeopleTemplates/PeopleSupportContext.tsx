import React, { createContext, useContext } from 'react';

const SupportContext = createContext<any>(null);

export const SupportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <SupportContext.Provider value={{}}>{children}</SupportContext.Provider>;

export const useSupportContext = () => useContext(SupportContext);
export { SupportContext };
