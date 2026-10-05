'use client';

import { useUser, getInitials, getFirstName } from '@/context/UserContext';

/**
 * Modal de selección de usuario.
 * Aparece la primera vez o cuando el usuario quiere cambiar de identidad.
 * Diseño pill/card siguiendo el tema institucional.
 */
export default function UserPicker() {
  const { usuarios, showPicker, selectUser, activeUser, setShowPicker } = useUser();

  if (!showPicker) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => {
      // Solo cerrar si hay un usuario activo (no es primera vez)
      if (activeUser && e.target === e.currentTarget) {
        setShowPicker(false);
      }
    }}>
      <div className="modal user-picker-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {activeUser ? 'Cambiar usuario' : '¡Bienvenido!'}
          </h2>
          {activeUser && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setShowPicker(false)}
              aria-label="Cerrar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <div className="modal-body">
          {!activeUser && (
            <p className="user-picker-subtitle">
              Selecciona tu perfil para comenzar
            </p>
          )}
          <div className="user-picker-grid">
            {usuarios.map((user) => {
              const isActive = activeUser?.codigo_comprador === user.codigo_comprador;
              return (
                <button
                  key={user.codigo_comprador}
                  className={`user-picker-card ${isActive ? 'active' : ''}`}
                  onClick={() => selectUser(user)}
                  id={`user-${user.codigo_comprador}`}
                >
                  <div className="user-picker-avatar" data-role={user.rol}>
                    {getInitials(user.nombre_comprador)}
                  </div>
                  <div className="user-picker-info">
                    <div className="user-picker-name">
                      {getFirstName(user.nombre_comprador)}
                    </div>
                    <div className="user-picker-role">
                      {user.rol}
                    </div>
                    <div className="user-picker-code">
                      {user.codigo_comprador}
                    </div>
                  </div>
                  {isActive && (
                    <div className="user-picker-check">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
