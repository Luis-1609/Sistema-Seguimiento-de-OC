import './globals.css';
import AppShell from '@/components/layout/AppShell';

export const metadata = {
  title: 'Sistema de Seguimiento OC | Gestión de Órdenes de Compra',
  description: 'Sistema de seguimiento y gestión de órdenes de compra. Controla estados, proveedores, montos y fechas de entrega en tiempo real con Google Sheets como backend.',
  keywords: 'órdenes de compra, seguimiento, gestión, compras, proveedores',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
