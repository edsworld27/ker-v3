import '../../FinanceShell/FinanceUI.css';
import 'react-grid-layout/css/styles.css';
import { ReactNode } from 'react';
import { ModalProvider } from '@FinanceShell/bridge/FinanceModalContext';

export const metadata = {
  title: 'Aqua Portal v9',
  description: 'Finance App',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}
