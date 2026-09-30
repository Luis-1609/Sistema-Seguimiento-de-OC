'use client';

import { useState, useEffect, useCallback } from 'react';
import { MOCK_ORDENES } from '@/lib/constants';

/**
 * Hook para operaciones CRUD de órdenes de compra.
 * 
 * En desarrollo (sin Google Sheets configurado), usa mock data.
 * En producción, conecta con las API Routes.
 */
export function useOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch all orders
  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ordenes');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al obtener las órdenes');
      }

      setOrdenes(data.ordenes || []);
    } catch (err) {
      console.warn('API no disponible, usando datos mock:', err.message);
      // Fallback a mock data en desarrollo
      setOrdenes(MOCK_ORDENES);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new order
  const crearOrden = useCallback(async (ordenData) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ordenData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la orden');
      }

      // Refresh the list
      await fetchOrdenes();
      return data;
    } catch (err) {
      // Fallback: add locally with mock
      const newOrden = {
        ...ordenData,
        id: `OC-${String(ordenes.length + 1).padStart(3, '0')}`,
        fecha_creacion: new Date().toISOString().split('T')[0],
        fecha_actualizacion: new Date().toISOString().split('T')[0],
      };
      setOrdenes((prev) => [...prev, newOrden]);
      return { orden: newOrden, mock: true };
    } finally {
      setSaving(false);
    }
  }, [fetchOrdenes, ordenes.length]);

  // Update an existing order
  const actualizarOrden = useCallback(async (id, ordenData) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/ordenes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ordenData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar la orden');
      }

      await fetchOrdenes();
      return data;
    } catch (err) {
      // Fallback: update locally
      setOrdenes((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, ...ordenData, fecha_actualizacion: new Date().toISOString().split('T')[0] }
            : o
        )
      );
      return { mock: true };
    } finally {
      setSaving(false);
    }
  }, [fetchOrdenes]);

  // Delete an order
  const eliminarOrden = useCallback(async (id) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/ordenes/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar la orden');
      }

      await fetchOrdenes();
      return data;
    } catch (err) {
      // Fallback: remove locally
      setOrdenes((prev) => prev.filter((o) => o.id !== id));
      return { mock: true };
    } finally {
      setSaving(false);
    }
  }, [fetchOrdenes]);

  // Load orders on mount
  useEffect(() => {
    fetchOrdenes();
  }, [fetchOrdenes]);

  return {
    ordenes,
    loading,
    error,
    saving,
    fetchOrdenes,
    crearOrden,
    actualizarOrden,
    eliminarOrden,
  };
}
