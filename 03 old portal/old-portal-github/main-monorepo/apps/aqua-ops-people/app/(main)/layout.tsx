import '../../PeopleShell/PeopleUI.css';
import 'react-grid-layout/css/styles.css';
import { ReactNode } from 'react';
import { ModalProvider } from '@PeopleShell/bridge/PeopleModalContext';

export const metadata = {
  title: 'Aqua Portal v9',
  description: 'People App',
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
