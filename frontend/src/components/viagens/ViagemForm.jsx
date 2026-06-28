import React, { useState, useEffect } from 'react';
import { motoristas as motoristasApi, viagens as viagensApi } from '../../services/api';

const INITIAL = { data: '', motorista_id: '', placa: '', modelo_veiculo: '' };

function IconRotate() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6"/><path d="M21 13a9 9 0 1 1-3-7.7L21 8"/>
    </svg>
  );
}

const FIELD_STYLE = {
  width: '100%', height: 42,
  padding: '0 12px',
  border: '1.5px solid #E2E8F0', borderRadius: 8,
  fontSize: 14, color: '#0F172A', background: '#fff',
  outline: 'none',
};

const LABEL_STYLE = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#374151', marginBottom: 6,
};

export default function ViagemForm({ onSalvo, onCancelar }) {
  const [form, setForm] = useState(INITIAL);
  const [motoristas, setMotoristas] = useState([]);
  const [sugestaoId, setSugestaoId] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    motoristasApi.listar().then((r) => {
      setMotoristas(r.data.motoristas);
      const sugestao = r.data.sugestao_escala_id;
      setSugestaoId(sugestao);
      setForm((f) => ({ ...f, motorista_id: sugestao ? String(sugestao) : '' }));
    }).catch(() => {});
  }, []);

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
      await viagensApi.criar({
        data: form.data,
        motorista_id: Number(form.motorista_id),
        placa: form.placa || undefined,
        modelo_veiculo: form.modelo_veiculo || undefined,
      });
      onSalvo();
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao criar viagem');
    } finally {
      setLoading(false);
    }
  }

  const sugestaoNome = sugestaoId ? motoristas.find((m) => m.id === sugestaoId)?.nome : null;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E8EDF3',
      borderRadius: 12,
      padding: '24px',
      boxShadow: '0 4px 20px -8px rgba(15,23,42,0.10)',
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={LABEL_STYLE}>Data da viagem *</label>
          <input
            type="date"
            name="data"
            value={form.data}
            onChange={handleChange}
            required
            style={FIELD_STYLE}
            onFocus={e => e.target.style.borderColor = '#2E5FA3'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={LABEL_STYLE}>Motorista *</label>
          <select
            name="motorista_id"
            value={form.motorista_id}
            onChange={handleChange}
            required
            style={{ ...FIELD_STYLE, cursor: 'pointer' }}
          >
            <option value="">Selecione...</option>
            {motoristas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}{m.id === sugestaoId ? ' ✓ sugerido' : ''}
              </option>
            ))}
          </select>
          {sugestaoNome && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#EAF1FB', color: '#2E5FA3',
              padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              marginTop: 8,
            }}>
              <IconRotate />
              Escala sugere: {sugestaoNome}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={LABEL_STYLE}>Placa do veículo</label>
          <input
            name="placa"
            value={form.placa}
            onChange={handleChange}
            placeholder="ABC-1234"
            style={FIELD_STYLE}
            onFocus={e => e.target.style.borderColor = '#2E5FA3'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={LABEL_STYLE}>Modelo do veículo</label>
          <input
            name="modelo_veiculo"
            value={form.modelo_veiculo}
            onChange={handleChange}
            placeholder="Sprinter 415"
            style={FIELD_STYLE}
            onFocus={e => e.target.style.borderColor = '#2E5FA3'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
          />
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
              padding: '0 20px', height: 40,
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
              padding: '0 22px', height: 40,
              background: loading ? '#7FA8D8' : '#2E5FA3',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Criando...' : 'Criar viagem'}
          </button>
        </div>
      </form>
    </div>
  );
}
