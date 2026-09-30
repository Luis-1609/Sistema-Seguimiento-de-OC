'use client';

import { usePathname } from 'next/navigation';

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
        <div className="header-search">
          <svg className="header-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="header-search-input"
            placeholder="Buscar órdenes..."
            id="global-search"
          />
        </div>
      </div>
    </header>
  );
}
