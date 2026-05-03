import '../../OpsHubShell/OpsHubUI.css';
import 'react-grid-layout/css/styles.css';
import { ReactNode } from 'react';
import { ModalProvider } from '@OpsHubShell/bridge/OpsHubModalContext';

export const metadata = {
  title: 'Aqua Portal v9',
  description: 'OpsHub App',
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
