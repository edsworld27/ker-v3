import '../../RevenueShell/RevenueUI.css';
import 'react-grid-layout/css/styles.css';
import { ReactNode } from 'react';
import { ModalProvider } from '@RevenueShell/bridge/RevenueModalContext';

export const metadata = {
  title: 'Aqua Portal v9',
  description: 'Revenue App',
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
