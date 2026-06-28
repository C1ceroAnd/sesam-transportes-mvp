import React, { useState, useEffect } from 'react';
import { pacientes as pacientesApi, agendamentos as agendamentosApi } from '../../services/api';

const PONTOS_DESEMBARQUE = ['CEIR', 'Hospital Policial', 'H.U.', 'São Marcos'];

const INITIAL = {
  paciente_id: '',
  motivo_deslocamento: '',
  ponto_desembarque_teresina: '',
  destino_consulta: '',
};

const FIELD_STYLE = {
  width: '100%', height: 40,
  padding: '0 12px',
  border: '1.5px solid #E2E8F0', borderRadius: 8,
  fontSize: 14, color: '#0F172A', background: '#fff',
  outline: 'none',
};

const LABEL_STYLE = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#374151', marginBottom: 5,
};

export default function AgendamentoForm({ viagemId, onSalvo, onCancelar }) {
  const [form, setForm] = useState(INITIAL);
  const [listaPacientes, setListaPacientes] = useState([]);
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      pacientesApi.listar(buscaPaciente || undefined)
        .then((r) => setListaPacientes(r.data))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(delay);
  }, [buscaPaciente]);

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
      await agendamentosApi.criar(viagemId, { ...form, paciente_id: Number(form.paciente_id) });
      onSalvo();
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Patient search + select */}
      <div style={{ marginBottom: 14 }}>
        <label style={LABEL_STYLE}>Buscar paciente</label>
        <input
          placeholder="Nome ou CPF..."
          value={buscaPaciente}
          onChange={(e) => setBuscaPaciente(e.target.value)}
          style={{ ...FIELD_STYLE, marginBottom: 6 }}
          onFocus={e => e.target.style.borderColor = '#2E5FA3'}
          onBlur={e => e.target.style.borderColor = '#E2E8F0'}
        />
        <select
          name="paciente_id"
          value={form.paciente_id}
          onChange={handleChange}
          required
          style={{ ...FIELD_STYLE, cursor: 'pointer' }}
        >
          <option value="">Selecione o paciente...</option>
          {listaPacientes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} — {p.cpf} ({p.prioridade === 'Alta' ? '⚡ Alta' : 'Normal'})
            </option>
          ))}
        </select>
      </div>

      {/* Motivo */}
      <div style={{ marginBottom: 14 }}>
        <label style={LABEL_STYLE}>Motivo do deslocamento *</label>
        <textarea
          name="motivo_deslocamento"
          value={form.motivo_deslocamento}
          onChange={handleChange}
          required
          minLength={3}
          rows={2}
          style={{
            ...FIELD_STYLE, height: 'auto',
            padding: '10px 12px', resize: 'vertical', lineHeight: 1.5,
          }}
          onFocus={e => e.target.style.borderColor = '#2E5FA3'}
          onBlur={e => e.target.style.borderColor = '#E2E8F0'}
        />
      </div>

      {/* Ponto desembarque */}
      <div style={{ marginBottom: 14 }}>
        <label style={LABEL_STYLE}>Ponto de desembarque em Teresina *</label>
        <select
          name="ponto_desembarque_teresina"
          value={form.ponto_desembarque_teresina}
          onChange={handleChange}
          required
          style={{ ...FIELD_STYLE, cursor: 'pointer' }}
        >
          <option value="">Selecione...</option>
          {PONTOS_DESEMBARQUE.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Destino */}
      <div style={{ marginBottom: 16 }}>
        <label style={LABEL_STYLE}>Destino real da consulta *</label>
        <input
          name="destino_consulta"
          value={form.destino_consulta}
          onChange={handleChange}
          required
          minLength={3}
          placeholder="Ex: HUPI - Oncologia"
          style={FIELD_STYLE}
          onFocus={e => e.target.style.borderColor = '#2E5FA3'}
          onBlur={e => e.target.style.borderColor = '#E2E8F0'}
        />
      </div>

      {erro && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA',
          borderRadius: 8, padding: '9px 13px',
          color: '#DC2626', fontSize: 13, marginBottom: 14,
        }}>
          {erro}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancelar}
          style={{
            padding: '0 18px', height: 38,
            border: '1.5px solid #E2E8F0', borderRadius: 8,
            background: '#fff', color: '#64748B',
            fontSize: 13, cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0 20px', height: 38,
            background: loading ? '#7FA8D8' : '#2E5FA3',
            color: '#fff', border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Agendando...' : 'Confirmar agendamento'}
        </button>
      </div>
    </form>
  );
}
