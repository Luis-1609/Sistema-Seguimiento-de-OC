'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { ESTADOS_LIST } from '@/lib/constants';

/**
 * Formulario para crear o editar una orden de compra.
 * Adaptado a la estructura real del Google Sheet.
 */
export default function OrdenForm({ orden, onSubmit, onCancel, saving }) {
  const isEditing = !!orden;

  const [formData, setFormData] = useState({
    oc: '',
    proveedor: '',
    linea_de_oc: '',
    monto: '',
    estado: 'Pendiente',
    descripcion: '',
    fecha_vencimiento: '',
    comprador: '',
  });

  const [errors, setErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (orden) {
      setFormData({
        oc: orden.oc || '',
        proveedor: orden.proveedor || '',
        linea_de_oc: orden.linea_de_oc || '',
        monto: orden.monto || '',
        estado: orden.estado || 'Pendiente',
        descripcion: orden.descripcion || '',
        fecha_vencimiento: orden.fecha_vencimiento || '',
        comprador: orden.comprador || '',
      });
    }
  }, [orden]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.oc.toString().trim()) {
      newErrors.oc = 'El N° de OC es requerido';
    }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      monto: parseFloat(formData.monto),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="glass-card">
        <div className="glass-card-header">
          <h2 className="glass-card-title">
            {isEditing ? `Editar OC ${orden.oc} — Línea ${orden.linea_de_oc}` : 'Nueva Orden de Compra'}
          </h2>
        </div>
        <div className="glass-card-body">
          <div className="form-row">
            <Input
              label="N° de OC"
              id="oc"
              name="oc"
              value={formData.oc}
              onChange={handleChange}
              placeholder="Ej: 642323"
              required
              error={errors.oc}
            />
            <Input
              label="Línea de OC"
              id="linea_de_oc"
              name="linea_de_oc"
              value={formData.linea_de_oc}
              onChange={handleChange}
              placeholder="Ej: 1"
              hint="Número de línea dentro de la OC"
            />
          </div>

          <div className="form-row">
            <Input
              label="Proveedor"
              id="proveedor"
              name="proveedor"
              value={formData.proveedor}
              onChange={handleChange}
              placeholder="Ej: Multimport"
              required
              error={errors.proveedor}
            />
            <Input
              label="Comprador"
              id="comprador"
              name="comprador"
              value={formData.comprador}
              onChange={handleChange}
              placeholder="Ej: 20222227"
            />
          </div>

          <Input
            label="Descripción"
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Descripción del artículo o servicio"
            required
            error={errors.descripcion}
          />

          <div className="form-row">
            <Input
              label="Monto"
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

          <Input
            label="Fecha de Vencimiento"
            id="fecha_vencimiento"
            name="fecha_vencimiento"
            type="date"
            value={formData.fecha_vencimiento}
            onChange={handleChange}
          />
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
