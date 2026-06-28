import React, { useState, useEffect } from 'react';
import { pacientes as api } from '../../services/api';

export default function AcompanhanteForm({ pacienteId, acompanhanteAtual, onChange }) {
  const [form, setForm] = useState({ nome: '', ocupa_vaga: true });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (acompanhanteAtual) {
      setForm({ nome: acompanhanteAtual.nome, ocupa_vaga: acompanhanteAtual.ocupa_vaga });
    } else {
      setForm({ nome: '', ocupa_vaga: true });
    }
    setErro('');
  }, [acompanhanteAtual]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErro('');
  }

  async function handleSalvar(e) {
    e.preventDefault();
    setLoading(true);
    setErro('');
    try {
      await api.salvarAcompanhante(pacienteId, form);
      onChange();
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao salvar acompanhante');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemover() {
    if (!confirm('Remover acompanhante?')) return;
    setLoading(true);
    setErro('');
    try {
      await api.removerAcompanhante(pacienteId);
      onChange();
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao remover acompanhante');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      border: '1px solid #E8EDF3',
      borderRadius: 12, padding: '18px 20px',
      background: '#F8FAFC',
    }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: '#64748B',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: 14,
      }}>
        Acompanhante
      </div>

      <form onSubmit={handleSalvar}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Nome *
          </label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
            minLength={3}
            style={{
              width: '100%', height: 40, padding: '0 12px',
              border: '1.5px solid #E2E8F0', borderRadius: 8,
              fontSize: 14, color: '#0F172A', background: '#fff',
              outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = '#2E5FA3'}
            onBlur={e => e.target.style.borderColor = '#E2E8F0'}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', fontSize: 13, color: '#374151',
          }}>
            <input
              type="checkbox"
              name="ocupa_vaga"
              checked={form.ocupa_vaga}
              onChange={handleChange}
              style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#2E5FA3' }}
            />
            <span>Ocupa vaga <span style={{ color: '#94A3B8' }}>(conta nas 28 vagas)</span></span>
          </label>
        </div>

        {erro && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA',
            borderRadius: 8, padding: '8px 12px',
            color: '#DC2626', fontSize: 12, marginBottom: 12,
          }}>
            {erro}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0 18px', height: 36,
              background: loading ? '#94A3B8' : '#0D9488',
              color: '#fff', border: 'none', borderRadius: 7,
              fontSize: 13, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '...' : acompanhanteAtual ? 'Atualizar' : 'Adicionar'}
          </button>

          {acompanhanteAtual && (
            <button
              type="button"
              onClick={handleRemover}
              disabled={loading}
              style={{
                padding: '0 18px', height: 36,
                background: '#fff',
                color: '#DC2626',
                border: '1.5px solid #FECACA',
                borderRadius: 7, fontSize: 13,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Remover
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
