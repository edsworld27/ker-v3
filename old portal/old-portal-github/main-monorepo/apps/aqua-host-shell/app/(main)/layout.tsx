import '../../HostShell/HostUI.css';
import 'react-grid-layout/css/styles.css';
import { ReactNode } from 'react';
import { ModalProvider } from '@HostShell/bridge/HostModalContext';

export const metadata = {
  title: 'HostAqua HostPortal v9',
  description: 'Next.js Powered Agency HostPortal',
};

export default function MainLayout({ children }: { children: ReactNode }) {
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
