import React, { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import PacienteLista from '../components/pacientes/PacienteLista';
import PacienteForm from '../components/pacientes/PacienteForm';
import AcompanhanteForm from '../components/pacientes/AcompanhanteForm';
import { pacientes as api } from '../services/api';

export default function PacientesPage() {
  const [modo, setModo] = useState('lista'); // 'lista' | 'novo' | 'editar'
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  const [refresh, setRefresh] = useState(0);

  function abrirNovo() {
    setPacienteSelecionado(null);
    setModo('novo');
  }

  async function abrirEditar(p) {
    try {
      const resp = await api.buscar(p.id);
      setPacienteSelecionado(resp.data);
    } catch {
      setPacienteSelecionado(p);
    }
    setModo('editar');
  }

  function voltarLista() {
    setPacienteSelecionado(null);
    setModo('lista');
  }

  function onSalvo() {
    setRefresh((r) => r + 1);
    voltarLista();
  }

  function onAcompanhanteChange() {
    if (pacienteSelecionado) {
      api.buscar(pacienteSelecionado.id)
        .then((r) => setPacienteSelecionado(r.data))
        .catch(() => {});
    }
  }

  return (
    <AppShell>
      {modo === 'lista' ? (
        <PacienteLista
          onEditar={abrirEditar}
          onNovo={abrirNovo}
          refresh={refresh}
        />
      ) : (
        <div style={{ maxWidth: 580 }}>
          {/* Form header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <button
              onClick={voltarLista}
              style={{
                height: 34, padding: '0 14px',
                border: '1px solid #E2E8F0', borderRadius: 8,
                background: '#fff', color: '#64748B',
                fontSize: 13, cursor: 'pointer',
              }}
            >
              ← Voltar
            </button>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F172A' }}>
              {modo === 'novo' ? 'Novo Paciente' : `Editar: ${pacienteSelecionado?.nome}`}
            </h1>
          </div>

          {/* Patient form card */}
          <div style={{
            background: '#fff', border: '1px solid #E8EDF3',
            borderRadius: 12, padding: '24px',
            boxShadow: '0 2px 12px -4px rgba(15,23,42,0.08)',
            marginBottom: modo === 'editar' ? 18 : 0,
          }}>
            <PacienteForm
              paciente={pacienteSelecionado}
              onSalvo={onSalvo}
              onCancelar={voltarLista}
            />
          </div>

          {/* Companion section — only in edit mode */}
          {modo === 'editar' && pacienteSelecionado && (
            <AcompanhanteForm
              pacienteId={pacienteSelecionado.id}
              acompanhanteAtual={pacienteSelecionado.acompanhante}
              onChange={onAcompanhanteChange}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
