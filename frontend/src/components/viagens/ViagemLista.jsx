import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { viagens as api } from '../../services/api';

function getPeriodo(data) {
  const hoje = new Date().toISOString().slice(0, 10);
  if (data === hoje) return { label: 'Hoje', bg: '#EAF1FB', color: '#2E5FA3' };
  if (data > hoje)  return { label: 'Futura', bg: '#F0FDF4', color: '#15803D' };
  return { label: 'Passada', bg: '#F1F5F9', color: '#64748B' };
}

function vagasColor(ocupadas, maxima) {
  const pct = ocupadas / maxima;
  if (pct >= 1) return '#DC2626';
  if (pct >= 0.85) return '#D97706';
  return '#0D9488';
}

export default function ViagemLista({ onNova, refresh }) {
  const [lista, setLista] = useState([]);
  const [filtroData, setFiltroData] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const carregar = useCallback(async (data) => {
    setLoading(true);
    setErro('');
    try {
      const resp = await api.listar(data || undefined);
      setLista(resp.data);
    } catch {
      setErro('Erro ao carregar viagens');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregar(filtroData); }, [filtroData, refresh, carregar]);

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0F172A' }}>Viagens</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Date filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' }}>
              Filtrar:
            </label>
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              style={{
                height: 38, padding: '0 10px',
                border: '1.5px solid #E2E8F0', borderRadius: 8,
                fontSize: 13, color: '#0F172A', background: '#fff',
                outline: 'none', cursor: 'pointer',
              }}
              onFocus={e => e.target.style.borderColor = '#2E5FA3'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
            {filtroData && (
              <button
                onClick={() => setFiltroData('')}
                style={{
                  height: 34, padding: '0 10px',
                  border: '1px solid #E2E8F0', borderRadius: 7,
                  background: '#fff', color: '#64748B',
                  fontSize: 12, cursor: 'pointer',
                }}
              >
                ✕ Limpar
              </button>
            )}
          </div>
          {/* New trip button */}
          <NovaBotao onClick={onNova} />
        </div>
      </div>

      {erro && (
        <div style={{ color: '#DC2626', padding: '10px 0', fontSize: 14 }}>{erro}</div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94A3B8', fontSize: 14 }}>
          Carregando...
        </div>
      ) : lista.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 0', color: '#94A3B8', fontSize: 14 }}>
          {filtroData ? `Nenhuma viagem encontrada para ${filtroData}.` : 'Nenhuma viagem cadastrada.'}
        </div>
      ) : (
        <div>
          {lista.map((v) => (
            <ViagemCard key={v.id} v={v} onClick={() => navigate(`/viagens/${v.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ViagemCard({ v, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const periodo = getPeriodo(v.data);
  const barColor = vagasColor(v.vagas_ocupadas, v.capacidade_maxima);
  const pct = Math.min(100, Math.round((v.vagas_ocupadas / v.capacidade_maxima) * 100));
  const dataFormatada = new Date(v.data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: '1px solid #E8EDF3',
        borderRadius: 12, padding: '16px 20px',
        marginBottom: 10, cursor: 'pointer',
        boxShadow: hovered ? '0 4px 20px -8px rgba(15,23,42,0.14)' : '0 1px 4px -2px rgba(15,23,42,0.06)',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        borderColor: hovered ? '#C7D8EE' : '#E8EDF3',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        {/* Left: date + motorista */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>
              {dataFormatada}
            </span>
            <span style={{
              padding: '2px 9px', borderRadius: 5,
              background: periodo.bg, color: periodo.color,
              fontSize: 11, fontWeight: 700,
            }}>
              {periodo.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              background: '#EAF1FB', color: '#2E5FA3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 12,
            }}>
              {v.motorista.nome[0]}
            </div>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
              {v.motorista.nome}
            </span>
            {v.placa && (
              <span style={{ fontSize: 12, color: '#94A3B8' }}>
                · {v.placa}
              </span>
            )}
            {v.modelo_veiculo && (
              <span style={{ fontSize: 12, color: '#94A3B8' }}>
                · {v.modelo_veiculo}
              </span>
            )}
          </div>
        </div>

        {/* Right: vagas counter + progress */}
        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 100 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: barColor, lineHeight: 1.2 }}>
            {v.vagas_ocupadas}/{v.capacidade_maxima}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>vagas</div>
          {/* Progress bar */}
          <div style={{
            width: 100, height: 5, background: '#E8EDF3', borderRadius: 3, overflow: 'hidden',
          }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: barColor, borderRadius: 3,
              transition: 'width 0.3s',
            }} />
          </div>
        </div>
      </div>

      {/* Footer: booking count */}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>
          {v.agendamentos?.length ?? 0} agendamento(s) confirmado(s)
        </span>
      </div>
    </div>
  );
}

function NovaBotao({ onClick }) {
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
        whiteSpace: 'nowrap',
      }}
    >
      + Nova Viagem
    </button>
  );
}
