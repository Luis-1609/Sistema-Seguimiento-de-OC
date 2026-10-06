'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

/**
 * Formulario para editar una orden de compra.
 * Campos de solo lectura: OC, Num ID, Proveedor, Fecha de Notificación.
 * Campos editables: Fecha de Seguimiento, Estado de Entrega, Ticket Relacionado,
 *                   Lugar Destino, Comentarios, Servicio de Entrega.
 */

const ESTADOS_ENTREGA = [
  'Por Entregar',
  'Entregado',
  'Entrega Parcial',
  'Rechazado',
];

const LUGARES_DESTINO = [
  'Almacén de DTI',
  'Local Externo',
  'Unidad en el Campus',
  'Servicios',
];

export default function OrdenForm({ orden, onSubmit, onCancel, saving }) {
  const isEditing = !!orden;

  const [formData, setFormData] = useState({
    oc: '',
    num_id: '',
    proveedor: '',
    fecha_notificacion: '',
    fecha_seguimiento: '',
    estado: '',
    ticket_relacionado: '',
    tiene_ticket: false,
    lugar_destino: '',
    comentarios: '',
    servicio_entrega: '',
    // Campos originales que se mantienen para el submit
    id: '',
    monto: '',
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
        num_id: orden.id || orden.num_id || '',
        proveedor: orden.proveedor || '',
        fecha_notificacion: orden.fecha_notificacion || orden.fecha_vencimiento || '',
        fecha_seguimiento: orden.fecha_seguimiento || '',
        estado: orden.estado || '',
        ticket_relacionado: orden.ticket_relacionado || '',
        tiene_ticket: !!(orden.ticket_relacionado),
        lugar_destino: orden.lugar_destino || '',
        comentarios: orden.comentarios || '',
        servicio_entrega: orden.servicio_entrega || '',
        // Campos originales
        id: orden.id || '',
        monto: orden.monto || '',
        descripcion: orden.descripcion || '',
        fecha_vencimiento: orden.fecha_vencimiento || '',
        comprador: orden.comprador || '',
      });
    }
  }, [orden]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.estado) {
      newErrors.estado = 'El estado de entrega es requerido';
    }
    if (!formData.lugar_destino) {
      newErrors.lugar_destino = 'El lugar de destino es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      monto: parseFloat(formData.monto) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Fila 1: OC, Num ID, Proveedor (solo lectura) */}
      <div className="form-row form-row-3">
        <Input
          label="Num. OC"
          id="oc"
          name="oc"
          value={formData.oc}
          readOnly
          className="form-readonly"
          required
        />
        <Input
          label="Num. ID (Solicitud)"
          id="num_id"
          name="num_id"
          value={formData.num_id}
          readOnly
          className="form-readonly"
        />
        <Input
          label="Nombre del Proveedor"
          id="proveedor"
          name="proveedor"
          value={formData.proveedor}
          readOnly
          className="form-readonly"
          required
        />
      </div>

      {/* Fila 2: Fecha Notificación (readonly), Fecha Seguimiento, Estado de Entrega */}
      <div className="form-row form-row-3">
        <Input
          label="Fecha de Notificación"
          id="fecha_notificacion"
          name="fecha_notificacion"
          value={formData.fecha_notificacion}
          readOnly
          className="form-readonly"
        />
        <Input
          label="Fecha de Seguimiento"
          id="fecha_seguimiento"
          name="fecha_seguimiento"
          value={formData.fecha_seguimiento}
          onChange={handleChange}
          type="date"
        />
        <Select
          label="Estado de Entrega"
          id="estado"
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          options={ESTADOS_ENTREGA}
          placeholder="Seleccionar estado..."
          required
          error={errors.estado}
        />
      </div>

      {/* Fila 3: Ticket Relacionado y Lugar Destino */}
      <div className="form-row">
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                name="tiene_ticket"
                checked={formData.tiene_ticket}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span>Ticket Relacionado</span>
            </label>
            {formData.tiene_ticket && formData.ticket_relacionado && (
              <span className="form-tag form-tag-success">VINCULADO</span>
            )}
          </div>
          <input
            id="ticket_relacionado"
            name="ticket_relacionado"
            value={formData.ticket_relacionado}
            onChange={handleChange}
            placeholder="Ej: TK-89421"
            disabled={!formData.tiene_ticket}
            className={`form-input ${!formData.tiene_ticket ? 'form-input-disabled' : ''}`}
          />
          {!formData.tiene_ticket && (
            <p className="form-hint">Desmarque la casilla para registrar sin ticket de mesa de ayuda asociado.</p>
          )}
        </div>

        <Select
          label="Lugar Destino"
          id="lugar_destino"
          name="lugar_destino"
          value={formData.lugar_destino}
          onChange={handleChange}
          options={LUGARES_DESTINO}
          placeholder="Seleccionar destino..."
          required
          error={errors.lugar_destino}
        />
      </div>

      {/* Fila 4: Comentarios y Servicio de Entrega */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="comentarios" className="form-label">Comentarios</label>
          <textarea
            id="comentarios"
            name="comentarios"
            value={formData.comentarios}
            onChange={handleChange}
            placeholder="Ingrese observaciones, notas de recepción o comentarios adicionales sobre la orden..."
            className="form-input form-textarea"
            maxLength={500}
          />
          <p className="form-hint">Máximo 500 caracteres</p>
        </div>

        <div className="form-group">
          <label htmlFor="servicio_entrega" className="form-label">Servicio de Entrega</label>
          <textarea
            id="servicio_entrega"
            name="servicio_entrega"
            value={formData.servicio_entrega}
            onChange={handleChange}
            placeholder="Ingrese detalles, instrucciones o requerimientos del servicio de entrega..."
            className="form-input form-textarea"
            maxLength={500}
          />
          <p className="form-hint">Máximo 500 caracteres</p>
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
          Guardar
        </Button>
      </div>
    </form>
  );
}
