import React, { createContext, useContext } from 'react';

const RevenueContext = createContext<any>(null);

export const RevenueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <RevenueContext.Provider value={{}}>{children}</RevenueContext.Provider>;

export const useRevenueContext = () => useContext(RevenueContext);
export { RevenueContext };
