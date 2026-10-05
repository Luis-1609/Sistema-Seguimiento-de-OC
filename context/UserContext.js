'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext(null);

/**
 * Mock de usuarios para desarrollo sin Google Sheets.
 * Estos deben coincidir con la pestaña CONFIG del Sheet real.
 */
const MOCK_USUARIOS = [
  {
    codigo_comprador: '20222227',
    nombre_comprador: 'IZARRA LIMACHE, LUIS MARIO',
    correo_comprador: 'a20222227@pucp.edu.pe',
    rol: 'Comprador',
  },
  {
    codigo_comprador: '20191582',
    nombre_comprador: 'RUIZ FIGUEROA, NAYELI ALEXANDRA',
    correo_comprador: 'nruizf@pucp.edu.pe',
    rol: 'Comprador',
  },
  {
    codigo_comprador: 'H0004274',
    nombre_comprador: 'CURI NAVARRO, JORGE RUBÉN',
    correo_comprador: 'jcurin@pucp.edu.pe',
    rol: 'Comprador',
  },
  {
    codigo_comprador: '19950071',
    nombre_comprador: 'ESPINOZA ROJAS, JOSE RAUL',
    correo_comprador: 'espinoza.jr@pucp.edu.pe',
    rol: 'Supervisor',
  },
];

const STORAGE_KEY = 'oc_active_user';

/**
 * Obtiene el primer nombre legible desde el formato "APELLIDO, NOMBRES".
 */
export function getFirstName(fullName) {
  if (!fullName) return '';
  const parts = fullName.split(',');
  if (parts.length > 1) {
    // "IZARRA LIMACHE, LUIS MARIO" → "Luis"
    const nombres = parts[1].trim().split(' ');
    return nombres[0].charAt(0) + nombres[0].slice(1).toLowerCase();
  }
  return fullName.split(' ')[0];
}

/**
 * Obtiene las iniciales del nombre para el avatar.
 */
export function getInitials(fullName) {
  if (!fullName) return '??';
  const parts = fullName.split(',');
  if (parts.length > 1) {
    const apellido = parts[0].trim();
    const nombre = parts[1].trim();
    return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
  }
  return fullName.substring(0, 2).toUpperCase();
}

export function UserProvider({ children }) {
  const [activeUser, setActiveUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  // Fetch users from API (or use mock)
  const fetchUsuarios = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/usuarios');
      const data = await res.json();
      if (res.ok && data.usuarios?.length > 0) {
        setUsuarios(data.usuarios);
        return data.usuarios;
      }
    } catch (err) {
      console.warn('API usuarios no disponible, usando mock:', err.message);
    }
    setUsuarios(MOCK_USUARIOS);
    return MOCK_USUARIOS;
  }, []);

  // Initialize: load saved user or show picker
  useEffect(() => {
    const init = async () => {
      const userList = await fetchUsuarios();
      
      // Try to restore saved user
      const savedCode = localStorage.getItem(STORAGE_KEY);
      if (savedCode) {
        const found = userList.find((u) => u.codigo_comprador === savedCode);
        if (found) {
          setActiveUser(found);
          setLoadingUsers(false);
          return;
        }
      }

      // No saved user → show picker
      setLoadingUsers(false);
      setShowPicker(true);
    };
    init();
  }, [fetchUsuarios]);

  // Select a user
  const selectUser = useCallback((user) => {
    setActiveUser(user);
    localStorage.setItem(STORAGE_KEY, user.codigo_comprador);
    setShowPicker(false);
  }, []);

  // Switch user (opens picker)
  const switchUser = useCallback(() => {
    setShowPicker(true);
  }, []);

  // Logout (clear user)
  const logout = useCallback(() => {
    setActiveUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setShowPicker(true);
  }, []);

  return (
    <UserContext.Provider
      value={{
        activeUser,
        usuarios,
        loadingUsers,
        showPicker,
        selectUser,
        switchUser,
        logout,
        setShowPicker,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de un UserProvider');
  }
  return context;
}

export default UserContext;
