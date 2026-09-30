'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ESTADOS_LIST } from '@/lib/constants';

/**
 * Formulario para crear o editar una orden de compra.
 */
export default function OrdenForm({ orden, onSubmit, onCancel, saving }) {
  const isEditing = !!orden;

  const [formData, setFormData] = useState({
    proveedor: '',
    descripcion: '',
    monto: '',
    estado: 'Pendiente',
    fecha_entrega_estimada: '',
    responsable: '',
    notas: '',
  });

  const [errors, setErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (orden) {
      setFormData({
        proveedor: orden.proveedor || '',
        descripcion: orden.descripcion || '',
        monto: orden.monto || '',
        estado: orden.estado || 'Pendiente',
        fecha_entrega_estimada: orden.fecha_entrega_estimada || '',
        responsable: orden.responsable || '',
        notas: orden.notas || '',
      });
    }
  }, [orden]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.proveedor.trim()) {
      newErrors.proveedor = 'El proveedor es requerido';
    }
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    }
    if (!formData.estado) {
      newErrors.estado = 'El estado es requerido';
    }
    if (!formData.responsable.trim()) {
      newErrors.responsable = 'El responsable es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      monto: parseFloat(formData.monto),
      ...(isEditing && {
        id: orden.id,
        fecha_creacion: orden.fecha_creacion,
      }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="glass-card">
        <div className="glass-card-header">
          <h2 className="glass-card-title">
            {isEditing ? `Editar Orden ${orden.id}` : 'Nueva Orden de Compra'}
          </h2>
        </div>
        <div className="glass-card-body">
          <div className="form-row">
            <Input
              label="Proveedor"
              id="proveedor"
              name="proveedor"
              value={formData.proveedor}
              onChange={handleChange}
              placeholder="Ej: Materiales del Norte S.A."
              required
              error={errors.proveedor}
            />
            <Input
              label="Responsable"
              id="responsable"
              name="responsable"
              value={formData.responsable}
              onChange={handleChange}
              placeholder="Ej: Carlos García"
              required
              error={errors.responsable}
            />
          </div>

          <Input
            label="Descripción"
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Descripción detallada del pedido"
            required
            error={errors.descripcion}
          />

          <div className="form-row">
            <Input
              label="Monto (MXN)"
              id="monto"
              name="monto"
              type="number"
              step="0.01"
              min="0"
              value={formData.monto}
              onChange={handleChange}
              placeholder="0.00"
              required
              error={errors.monto}
            />
            <Select
              label="Estado"
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              options={ESTADOS_LIST}
              required
              error={errors.estado}
            />
          </div>

          <div className="form-row">
            <Input
              label="Fecha de Entrega Estimada"
              id="fecha_entrega_estimada"
              name="fecha_entrega_estimada"
              type="date"
              value={formData.fecha_entrega_estimada}
              onChange={handleChange}
            />
            <div className="form-group">
              <label htmlFor="notas" className="form-label">Notas</label>
              <textarea
                id="notas"
                name="notas"
                className="form-textarea"
                value={formData.notas}
                onChange={handleChange}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 'var(--space-3)',
        marginTop: 'var(--space-6)',
      }}>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={saving}
          icon='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>'
        >
          {isEditing ? 'Guardar Cambios' : 'Crear Orden'}
        </Button>
      </div>
    </form>
  );
}
