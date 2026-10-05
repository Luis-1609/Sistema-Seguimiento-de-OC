'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
// import { useUser, getInitials, getFirstName } from '@/context/UserContext';

/**
 * Sidebar de navegación principal.
 * Incluye indicador del usuario activo en el footer.
 */

const NAV_ITEMS = [
  {
    section: 'Principal',
    items: [
      {
        label: 'Dashboard',
        href: '/',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
      },
      {
        label: 'Órdenes de Compra',
        href: '/ordenes',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
      },
    ],
  }
  /*
  ,
  {
    section: 'Acciones',
    items: [
      {
        label: 'Nueva Orden',
        href: '/ordenes/nueva',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
      },
    ],
  },
  */
];

export default function Sidebar() {
  const pathname = usePathname();
  //const { activeUser, switchUser } = useUser();

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">OC</div>
        <div>
          <div className="sidebar-title">Seguimiento OC</div>
          <div className="sidebar-subtitle">Sistema de gestión</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((section) => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <span
                  className="sidebar-link-icon"
                  dangerouslySetInnerHTML={{ __html: item.icon }}
                />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      {/* 
      <div className="sidebar-footer">
        {activeUser ? (
          <button
            className="sidebar-user-card"
            onClick={switchUser}
            title="Cambiar usuario"
            aria-label="Cambiar usuario"
          >
            <div className="sidebar-user-avatar" data-role={activeUser.rol}>
              {getInitials(activeUser.nombre_comprador)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {getFirstName(activeUser.nombre_comprador)}
              </div>
              <div className="sidebar-user-role">
                {activeUser.rol} · {activeUser.codigo_comprador}
              </div>
            </div>
            <svg className="sidebar-user-switch" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 11 12 6 17 11" />
              <polyline points="7 17 12 12 17 17" />
            </svg>
          </button>
        ) : (
          <div className="sidebar-footer-info">
            v1.0.0 · Google Sheets Backend
          </div>
        )}
      </div>
      */}
    </aside>
  );
}
