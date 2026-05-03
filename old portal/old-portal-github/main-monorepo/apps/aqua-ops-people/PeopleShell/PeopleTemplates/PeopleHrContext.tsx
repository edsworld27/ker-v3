import React, { createContext, useContext } from 'react';

const HrContext = createContext<any>(null);

export const HrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => <HrContext.Provider value={{}}>{children}</HrContext.Provider>;

export const useHrContext = () => useContext(HrContext);
export { HrContext };
