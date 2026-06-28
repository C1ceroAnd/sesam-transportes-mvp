import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import ViagemLista from '../components/viagens/ViagemLista';
import ViagemForm from '../components/viagens/ViagemForm';
import ViagemDetalhe from '../components/viagens/ViagemDetalhe';

function ViagensListaView() {
  const [showForm, setShowForm] = useState(false);
  const [refresh, setRefresh] = useState(0);

  function onSalvo() {
    setShowForm(false);
    setRefresh((r) => r + 1);
  }

  return (
    <AppShell>
      {showForm ? (
        <div style={{ maxWidth: 520 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
            <button
              onClick={() => setShowForm(false)}
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
              Nova Viagem
            </h1>
          </div>
          <ViagemForm onSalvo={onSalvo} onCancelar={() => setShowForm(false)} />
        </div>
      ) : (
        <ViagemLista onNova={() => setShowForm(true)} refresh={refresh} />
      )}
    </AppShell>
  );
}

export default function ViagensPage() {
  return (
    <Routes>
      <Route index element={<ViagensListaView />} />
      <Route path=":id" element={
        <AppShell>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <ViagemDetalhe />
          </div>
        </AppShell>
      } />
    </Routes>
  );
}
