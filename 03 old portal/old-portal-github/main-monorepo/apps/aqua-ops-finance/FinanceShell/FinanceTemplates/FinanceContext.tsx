import React, { createContext, useContext } from 'react';

const FinanceContext = createContext<any>(null);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <FinanceContext.Provider value={{}}>{children}</FinanceContext.Provider>;

export const useFinanceContext = () => useContext(FinanceContext);
export { FinanceContext };
