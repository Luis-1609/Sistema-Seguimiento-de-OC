'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

/**
 * Formulario para editar una orden de compra.
 * Campos de solo lectura: OC, Num ID, Proveedor, Fecha de Notificación, Fecha de Vencimiento.
 * Campos editables: Estado de Entrega, Documentos Relacionados (KIBA, Ticket, Contrato, Informe CT),
 *                   Lugar Destino, Comentarios, Servicio de Entrega.
 */

const ESTADOS_ENTREGA = [
  'Por Entregar',
  'Entregado',
  'Entrega Parcial',
  'Anulado',
];

const LUGARES_DESTINO = [
  'Almacén de DTI',
  'Local Externo',
  'Unidad en el Campus',
  'Servicios',
];

const TIPOS_DOCUMENTO = [
  {
    id: 'kiba',
    key: 'numero_kiba',
    label: 'KIBA',
    fullLabel: 'N° KIBA',
    placeholder: 'Ej: KB-2024-001',
    hint: 'Número de solicitud KIBA',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    id: 'ticket',
    key: 'numero_ticket',
    label: 'Ticket',
    fullLabel: 'N° Ticket',
    placeholder: 'Ej: TK-89421',
    hint: 'Ticket de mesa de ayuda',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
        <path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
      </svg>
    ),
  },
  {
    id: 'contrato',
    key: 'numero_contrato',
    label: 'Contrato',
    fullLabel: 'N° Contrato',
    placeholder: 'Ej: CTR-2026-08',
    hint: 'Número de contrato',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: 'informe_ct',
    key: 'numero_informe_ct',
    label: 'Informe CT',
    fullLabel: 'N° Informe de CT',
    placeholder: 'Ej: INF-CT-045',
    hint: 'Consideraciones técnicas',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
];

export default function OrdenForm({ orden, onSubmit, onCancel, saving }) {
  const isEditing = !!orden;

  const [selectedDocs, setSelectedDocs] = useState([]);

  const [formData, setFormData] = useState({
    oc: '',
    num_id: '',
    proveedor: '',
    fecha_notificacion: '',
    fecha_vencimiento: '',
    fecha_seguimiento: '',
    estado: '',
    ticket_relacionado: '',
    numero_kiba: '',
    numero_ticket: '',
    numero_contrato: '',
    numero_informe_ct: '',
    lugar_destino: '',
    comentarios: '',
    servicio_entrega: '',
    // Campos originales que se mantienen para el submit
    id: '',
    monto: '',
    descripcion: '',
    comprador: '',
  });

  const [errors, setErrors] = useState({});

  // Pre-fill form when editing
  useEffect(() => {
    if (orden) {
      let kiba = orden.numero_kiba || orden.kiba || '';
      let ticket = orden.numero_ticket || orden.ticket || '';
      let contrato = orden.numero_contrato || orden.contrato || '';
      let informeCt = orden.numero_informe_ct || orden.informe_ct || orden.informe_de_ct || '';

      // Si los campos individuales no existen, intentar extraerlos de ticket_relacionado
      if (!kiba && !ticket && !contrato && !informeCt && orden.ticket_relacionado) {
        const raw = String(orden.ticket_relacionado).trim();
        const kibaMatch = raw.match(/kiba[:\s-]+([^\s,;]+)/i);
        const ticketMatch = raw.match(/(?:tk|ticket)[:\s-]+([^\s,;]+)/i);
        const contratoMatch = raw.match(/(?:ctr|contrato)[:\s-]+([^\s,;]+)/i);
        const ctMatch = raw.match(/(?:ct|informe)[:\s-]+([^\s,;]+)/i);

        if (kibaMatch || ticketMatch || contratoMatch || ctMatch) {
          if (kibaMatch) kiba = kibaMatch[1];
          if (ticketMatch) ticket = ticketMatch[1];
          if (contratoMatch) contrato = contratoMatch[1];
          if (ctMatch) informeCt = ctMatch[1];
        } else {
          ticket = raw;
        }
      }

      const initialSelected = [];
      if (kiba) initialSelected.push('kiba');
      if (ticket) initialSelected.push('ticket');
      if (contrato) initialSelected.push('contrato');
      if (informeCt) initialSelected.push('informe_ct');

      setSelectedDocs(initialSelected);

      setFormData({
        oc: orden.oc || '',
        num_id: orden.id || orden.num_id || '',
        proveedor: orden.proveedor || '',
        fecha_notificacion: orden.fecha_notificacion || '',
        fecha_vencimiento: orden.fecha_vencimiento || '',
        fecha_seguimiento: orden.fecha_seguimiento || '',
        estado: orden.estado || '',
        ticket_relacionado: orden.ticket_relacionado || '',
        numero_kiba: kiba,
        numero_ticket: ticket,
        numero_contrato: contrato,
        numero_informe_ct: informeCt,
        lugar_destino: orden.lugar_destino || '',
        comentarios: orden.comentarios || '',
        servicio_entrega: orden.servicio_entrega || '',
        // Campos originales
        id: orden.id || '',
        monto: orden.monto || '',
        descripcion: orden.descripcion || '',
        comprador: orden.comprador || '',
      });
    }
  }, [orden]);

  const toggleDoc = (docId) => {
    setSelectedDocs((prev) => {
      const exists = prev.includes(docId);
      if (exists) {
        const docObj = TIPOS_DOCUMENTO.find((d) => d.id === docId);
        if (docObj) {
          setFormData((f) => ({ ...f, [docObj.key]: '' }));
        }
        return prev.filter((id) => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };

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

    // Construir resumen combinado para ticket_relacionado (compatibilidad hacia atrás y buscador)
    const parts = [];
    if (selectedDocs.includes('kiba') && formData.numero_kiba?.trim()) {
      parts.push(`KIBA: ${formData.numero_kiba.trim()}`);
    }
    if (selectedDocs.includes('ticket') && formData.numero_ticket?.trim()) {
      parts.push(`TK: ${formData.numero_ticket.trim()}`);
    }
    if (selectedDocs.includes('contrato') && formData.numero_contrato?.trim()) {
      parts.push(`CTR: ${formData.numero_contrato.trim()}`);
    }
    if (selectedDocs.includes('informe_ct') && formData.numero_informe_ct?.trim()) {
      parts.push(`CT: ${formData.numero_informe_ct.trim()}`);
    }

    const combinedTicket = parts.join(', ');

    onSubmit({
      ...formData,
      ticket_relacionado: combinedTicket,
      tiene_ticket: parts.length > 0,
      kiba: formData.numero_kiba || '',
      contrato: formData.numero_contrato || '',
      informe_ct: formData.numero_informe_ct || '',
      monto: parseFloat(formData.monto) || 0,
    });
  };

  const linkedCount = selectedDocs.filter((docId) => {
    const doc = TIPOS_DOCUMENTO.find((d) => d.id === docId);
    return doc && formData[doc.key]?.trim();
  }).length;

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

      {/* Fila 2: Fecha Notificación (readonly), Fecha Vencimiento (readonly), Estado de Entrega */}
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
          label="Fecha de Vencimiento"
          id="fecha_vencimiento"
          name="fecha_vencimiento"
          value={formData.fecha_vencimiento}
          readOnly
          className="form-readonly"
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

      {/* Fila 3: Documentos Relacionados y Lugar Destino */}
      <div className="form-row">
        <div className="form-group doc-selector-container">
          <div className="form-label-row">
            <label className="form-label" style={{ marginBottom: 0 }}>
              Documentos Relacionados
            </label>
            {linkedCount > 0 ? (
              <span className="form-tag form-tag-success">
                {linkedCount} VINCULADO{linkedCount > 1 ? 'S' : ''}
              </span>
            ) : (
              <span className="form-tag form-tag-muted">
                OPCIONAL
              </span>
            )}
          </div>

          {/* Chips interactivos de selección múltiple */}
          <div className="doc-chips-row">
            {TIPOS_DOCUMENTO.map((doc) => {
              const isSelected = selectedDocs.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  className={`doc-chip-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => toggleDoc(doc.id)}
                  title={`Seleccionar ${doc.label}`}
                >
                  <span className="doc-chip-icon">{doc.icon}</span>
                  <span>{doc.label}</span>
                  <span className="doc-chip-indicator">
                    {isSelected ? '✓' : '+'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Entradas según documentos seleccionados */}
          {selectedDocs.length === 0 ? (
            <div className="doc-empty-state">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6, flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Sin documentos vinculados. Selecciona las opciones arriba si aplica KIBA, Ticket, Contrato o Informe de CT.</span>
            </div>
          ) : (
            <div className={`doc-inputs-container ${selectedDocs.length > 1 ? 'multi' : ''}`}>
              {selectedDocs.map((docId) => {
                const doc = TIPOS_DOCUMENTO.find((d) => d.id === docId);
                if (!doc) return null;
                return (
                  <div key={doc.id} className="doc-input-item">
                    <div className="doc-input-header">
                      <span className="doc-input-label">
                        {doc.icon} {doc.fullLabel}
                      </span>
                      <button
                        type="button"
                        className="doc-input-remove"
                        onClick={() => toggleDoc(doc.id)}
                        title={`Quitar ${doc.label}`}
                      >
                        ×
                      </button>
                    </div>
                    <input
                      id={doc.key}
                      name={doc.key}
                      value={formData[doc.key] || ''}
                      onChange={handleChange}
                      placeholder={doc.placeholder}
                      className="form-input"
                      style={{ padding: '7px 10px', fontSize: 'var(--font-size-sm)' }}
                      autoFocus={selectedDocs.length === 1}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="form-group">
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
          <p className="form-hint" style={{ marginTop: 'var(--space-2)' }}>
            Unidad, sede o almacén asignado para la recepción.
          </p>
        </div>
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
