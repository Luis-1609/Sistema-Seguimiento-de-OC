'use client';

import { usePathname } from 'next/navigation';
import { useUser, getInitials, getFirstName } from '@/context/UserContext';
/**
 * Header con breadcrumb y búsqueda.
 */

const PAGE_TITLES = {
  '/': { title: 'Dashboard', breadcrumb: ['Inicio'] },
  '/ordenes': { title: 'Órdenes de Compra', breadcrumb: ['Inicio', 'Órdenes'] },
  '/ordenes/nueva': { title: 'Nueva Orden', breadcrumb: ['Inicio', 'Órdenes', 'Nueva'] },
};

export default function Header() {
  const pathname = usePathname();
  const pageInfo = PAGE_TITLES[pathname] || { title: 'Página', breadcrumb: ['Inicio'] };
  const { activeUser, setShowPicker } = useUser();

  return (
    <header className="header">
      <div className="header-left">
        <div>
          <div className="header-breadcrumb">
            {pageInfo.breadcrumb.map((item, index) => (
              <span key={item}>
                {index > 0 && <span className="header-breadcrumb-separator"> / </span>}
                <span
                  className={
                    index === pageInfo.breadcrumb.length - 1
                      ? 'header-breadcrumb-current'
                      : ''
                  }
                >
                  {item}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="header-right">
        {activeUser ? (
          <button
            className="header-user-card"
            onClick={() => setShowPicker(true)}
            title="Cambiar usuario"
          >
            <div className="header-user-avatar" data-role={activeUser.rol}>
              {getInitials(activeUser.nombre_comprador)}
            </div>
            <div className="header-user-info">
              <span className="header-user-name">
                {getFirstName(activeUser.nombre_comprador)}
              </span>
              <span className="header-user-role">{activeUser.rol || 'Comprador'}</span>
            </div>
            <svg className="header-user-swap" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </button>
        ) : (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowPicker(true)}
          >
            Seleccionar usuario
          </button>
        )}
      </div>
    </header>
  );
}
