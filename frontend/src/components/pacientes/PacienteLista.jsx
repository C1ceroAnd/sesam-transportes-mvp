import React, { useEffect, useState, useCallback } from 'react';
import { pacientes as api } from '../../services/api';

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}

function IconFile() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
}

const PRIORITY_BADGE = {
  Alta:   { background: '#FDECEC', color: '#DC2626' },
  Normal: { background: '#F1F5F9', color: '#64748B' },
};

export default function PacienteLista({ onEditar, onNovo, refresh }) {
  const [lista, setLista] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [pdfLoading, setPdfLoading] = useState(null);

  const carregar = useCallback(async (q) => {
    setLoading(true);
    setErro('');
    try {
      const resp = await api.listar(q || undefined);
      setLista(resp.data);
    } catch {
      setErro('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(busca); }, [busca, refresh, carregar]);

  async function handlePDF(paciente) {
    setPdfLoading(paciente.id);
    try {
      const resp = await api.relatorio(paciente.id);
      if (resp.status === 204) {
        alert(`${paciente.nome} não possui histórico de viagens.`);
        return;
      }
      const url = URL.createObjectURL(resp.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${paciente.nome.replace(/\s+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Erro ao gerar relatório PDF');
    } finally {
      setPdfLoading(null);
    }
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0F172A' }}>Pacientes</h1>
        <NovoPacienteBtn onClick={onNovo} />
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', marginBottom: 18 }}>
        <div style={{
          position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
          color: '#94A3B8', display: 'flex', pointerEvents: 'none',
        }}>
          <IconSearch />
        </div>
        <input
          placeholder="Buscar por nome ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            width: '100%', height: 42,
            paddingLeft: 40, paddingRight: 14,
            border: '1.5px solid #E2E8F0', borderRadius: 8,
            fontSize: 14, color: '#0F172A',
            outline: 'none', background: '#fff',
          }}
          onFocus={e => e.target.style.borderColor = '#2E5FA3'}
          onBlur={e => e.target.style.borderColor = '#E2E8F0'}
        />
      </div>

      {erro && (
        <div style={{ color: '#DC2626', padding: '10px 0', fontSize: 14 }}>{erro}</div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 14 }}>
          Carregando...
        </div>
      ) : lista.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 14 }}>
          Nenhum paciente encontrado.
        </div>
      ) : (
        <div style={{
          background: '#fff',
          border: '1px solid #E8EDF3',
          borderRadius: 12, overflow: 'hidden',
        }}>
          {/* Head */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.2fr 1.4fr 1fr 1fr 100px',
            padding: '10px 16px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E8EDF3',
            fontSize: 11, fontWeight: 700, color: '#94A3B8',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <div>Nome</div>
            <div>CPF</div>
            <div>Embarque</div>
            <div>Prioridade</div>
            <div>Acompanhante</div>
            <div style={{ textAlign: 'right' }}>Ações</div>
          </div>

          {lista.map((p, i) => (
            <Row
              key={p.id}
              p={p}
              zebra={i % 2 === 1}
              onEditar={onEditar}
              onPDF={() => handlePDF(p)}
              pdfLoading={pdfLoading === p.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ p, zebra, onEditar, onPDF, pdfLoading }) {
  const [hovered, setHovered] = React.useState(false);
  const badge = PRIORITY_BADGE[p.prioridade] || PRIORITY_BADGE.Normal;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1.2fr 1.4fr 1fr 1fr 100px',
        padding: '11px 16px',
        background: hovered ? '#F1F5F9' : zebra ? '#FAFBFC' : '#fff',
        borderBottom: '1px solid #F1F5F9',
        alignItems: 'center',
        transition: 'background 0.1s',
      }}
    >
      <div style={{ fontWeight: 500, color: '#0F172A', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {p.nome}
      </div>
      <div style={{ color: '#64748B', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
        {p.cpf}
      </div>
      <div style={{ color: '#64748B', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {p.ponto_embarque}
      </div>
      <div>
        <span style={{
          display: 'inline-block',
          padding: '2px 9px', borderRadius: 5,
          background: badge.background, color: badge.color,
          fontSize: 12, fontWeight: 600,
        }}>
          {p.prioridade}
        </span>
      </div>
      <div style={{ color: '#94A3B8', fontSize: 12 }}>
        {p.acompanhante ? `${p.acompanhante.nome}${p.acompanhante.ocupa_vaga ? ' (vaga)' : ''}` : '—'}
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <ActionBtn onClick={() => onEditar(p)} title="Editar">
          <IconEdit />
        </ActionBtn>
        <ActionBtn onClick={onPDF} title="PDF" teal disabled={pdfLoading}>
          {pdfLoading ? '…' : <IconFile />}
        </ActionBtn>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, title, teal, disabled, children }) {
  const [hovered, setHovered] = React.useState(false);
  const bg = teal
    ? (disabled ? '#94A3B8' : hovered ? '#0B7A6E' : '#0D9488')
    : (hovered ? '#E2E8F0' : '#F1F5F9');
  const color = teal ? '#fff' : '#475569';
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 30, height: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: bg, color, border: 'none', borderRadius: 7,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.12s', fontSize: 12,
      }}
    >
      {children}
    </button>
  );
}

function NovoPacienteBtn({ onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 40, padding: '0 18px',
        background: hovered ? '#284F88' : '#2E5FA3',
        color: '#fff', border: 'none', borderRadius: 8,
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        transition: 'background 0.12s',
        boxShadow: '0 4px 12px -4px rgba(46,95,163,0.5)',
      }}
    >
      + Novo Paciente
    </button>
  );
}
