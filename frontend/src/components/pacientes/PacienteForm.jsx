import React, { useState, useEffect } from 'react';
import { pacientes as api } from '../../services/api';

const PONTOS_EMBARQUE = [
  'SESAM', 'Praça da Bandeira', 'Sorveteria Cremosa', 'Memorial Espedito Resende',
  'Vida Animal', 'Posto São Francisco', 'Posto Piripiri', 'Posto Petrolina',
  'M. Sales', 'ELECNOR', 'Chico Jovem', 'Lili Doces', 'Entrada da Malhadinha', 'Capela da Várzea',
];

const INITIAL = { nome: '', cpf: '', telefone: '', ponto_embarque: '', prioridade: 'Normal' };

const FIELD_STYLE = {
  width: '100%', height: 42,
  padding: '0 12px',
  border: '1.5px solid #E2E8F0', borderRadius: 8,
  fontSize: 14, color: '#0F172A', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};

const LABEL_STYLE = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#374151', marginBottom: 6,
};

export default function PacienteForm({ paciente, onSalvo, onCancelar }) {
  const [form, setForm] = useState(INITIAL);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(paciente);

  useEffect(() => {
    if (paciente) {
      setForm({
        nome: paciente.nome || '',
        cpf: paciente.cpf || '',
        telefone: paciente.telefone || '',
        ponto_embarque: paciente.ponto_embarque || '',
        prioridade: paciente.prioridade || 'Normal',
      });
    } else {
      setForm(INITIAL);
    }
    setErro('');
  }, [paciente]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErro('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      if (isEdit) {
        const { nome, telefone, ponto_embarque, prioridade } = form;
        await api.atualizar(paciente.id, { nome, telefone, ponto_embarque, prioridade });
      } else {
        await api.criar(form);
      }
      onSalvo();
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao salvar paciente');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Row 1: Nome + CPF */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={LABEL_STYLE}>Nome completo *</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            minLength={3}
            style={FIELD_STYLE}
            onFocus={e => e.target.style.borderColor = '#2E5FA3'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
          />
        </div>
        <div>
          <label style={LABEL_STYLE}>CPF *</label>
          <input
            name="cpf"
            value={form.cpf}
            onChange={handleChange}
            required
            disabled={isEdit}
            placeholder="000.000.000-00"
            style={{
              ...FIELD_STYLE,
              background: isEdit ? '#F8FAFC' : '#fff',
              color: isEdit ? '#94A3B8' : '#0F172A',
              cursor: isEdit ? 'not-allowed' : 'text',
            }}
            onFocus={e => !isEdit && (e.target.style.borderColor = '#2E5FA3')}
            onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
          />
          {isEdit && (
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
              CPF não pode ser alterado após o cadastro.
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Telefone + Embarque */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        <div>
          <label style={LABEL_STYLE}>Telefone *</label>
          <input
            name="telefone"
            value={form.telefone}
            onChange={handleChange}
            required
            placeholder="(86) 99999-9999"
            style={FIELD_STYLE}
            onFocus={e => e.target.style.borderColor = '#2E5FA3'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
          />
        </div>
        <div>
          <label style={LABEL_STYLE}>Ponto de embarque *</label>
          <select
            name="ponto_embarque"
            value={form.ponto_embarque}
            onChange={handleChange}
            required
            style={{ ...FIELD_STYLE, cursor: 'pointer' }}
          >
            <option value="">Selecione...</option>
            {PONTOS_EMBARQUE.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Prioridade — toggle buttons */}
      <div style={{ marginBottom: 20 }}>
        <label style={LABEL_STYLE}>Prioridade *</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Normal', 'Alta'].map((op) => {
            const active = form.prioridade === op;
            const isAlta = op === 'Alta';
            return (
              <label
                key={op}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '9px 0', borderRadius: 8, cursor: 'pointer',
                  border: `1.5px solid ${active ? (isAlta ? '#DC2626' : '#2E5FA3') : '#E2E8F0'}`,
                  background: active ? (isAlta ? '#FDECEC' : '#EAF1FB') : '#fff',
                  color: active ? (isAlta ? '#DC2626' : '#2E5FA3') : '#64748B',
                  fontWeight: active ? 600 : 400,
                  fontSize: 14, transition: 'all 0.12s',
                  userSelect: 'none',
                }}
              >
                <input
                  type="radio"
                  name="prioridade"
                  value={op}
                  checked={active}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                {op === 'Alta' ? '⚡ Alta (oncológico)' : 'Normal'}
              </label>
            );
          })}
        </div>
      </div>

      {erro && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA',
          borderRadius: 8, padding: '10px 14px',
          color: '#DC2626', fontSize: 13, marginBottom: 16,
        }}>
          {erro}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancelar}
          style={{
            padding: '0 20px', height: 42,
            border: '1.5px solid #E2E8F0', borderRadius: 8,
            background: '#fff', color: '#64748B',
            fontSize: 14, cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0 24px', height: 42,
            background: loading ? '#7FA8D8' : '#2E5FA3',
            color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 12px -4px rgba(46,95,163,0.5)',
          }}
        >
          {loading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Cadastrar paciente'}
        </button>
      </div>
    </form>
  );
}
