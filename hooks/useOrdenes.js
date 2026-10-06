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

      await fetchOrdenes();
      return data;
    } catch (err) {
      // Fallback: add locally
      const newOrden = { ...ordenData };
      setOrdenes((prev) => [...prev, newOrden]);
      return { orden: newOrden, mock: true };
    } finally {
      setSaving(false);
    }
  }, [fetchOrdenes]);

  // Update an existing order (using composite ID: "OC-LINEA")
  const actualizarOrden = useCallback(async (compositeId, ordenData) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/ordenes/${compositeId}`, {
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
      const [oc, linea] = compositeId.split('-');
      setOrdenes((prev) =>
        prev.map((o) =>
          o.oc === oc && (o.id === linea || o.linea_de_oc === linea)
            ? { ...o, ...ordenData }
            : o
        )
      );
      return { mock: true };
    } finally {
      setSaving(false);
    }
  }, [fetchOrdenes]);

  // Delete an order (using composite ID: "OC-LINEA")
  const eliminarOrden = useCallback(async (compositeId) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/ordenes/${compositeId}`, {
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
      const [oc, linea] = compositeId.split('-');
      setOrdenes((prev) => prev.filter((o) => !(o.oc === oc && (o.id === linea || o.linea_de_oc === linea))));
      return { mock: true };
    } finally {
      setSaving(false);
    }
  }, [fetchOrdenes]);

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
