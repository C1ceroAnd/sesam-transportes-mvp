import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { viagens as viagensApi, agendamentos as agendamentosApi } from '../../services/api';
import AgendamentoForm from '../agendamentos/AgendamentoForm';

const STATUS_PRESENCA_OPTIONS = ['Presente', 'Faltou'];
const STATUS_RETORNO_OPTIONS = ['Voltou no Dia', 'Ficou em Teresina', 'Voltou por Conta Própria'];

const PRIORIDADE_BADGE = {
  Alta:   { background: '#FDECEC', color: '#DC2626', label: '⚡ Alta' },
  Normal: { background: '#F1F5F9', color: '#64748B', label: 'Normal' },
};

const PRESENCA_BADGE = {
  Presente: { bg: '#F0FDF4', color: '#15803D' },
  Faltou:   { bg: '#FEF2F2', color: '#DC2626' },
  Pendente: { bg: '#F1F5F9', color: '#94A3B8' },
};

const RETORNO_BADGE = {
  'Voltou no Dia':             { bg: '#F0FDF4', color: '#15803D' },
  'Ficou em Teresina':         { bg: '#FFFBEB', color: '#D97706' },
  'Voltou por Conta Própria':  { bg: '#F5F3FF', color: '#7C3AED' },
  'Pendente':                  { bg: '#F1F5F9', color: '#94A3B8' },
};

function isViagemPassada(dataViagem) {
  const hoje = new Date().toISOString().slice(0, 10);
  return dataViagem < hoje;
}

function vagasColor(ocupadas, maxima) {
  const pct = ocupadas / maxima;
  if (pct >= 1) return '#DC2626';
  if (pct >= 0.85) return '#D97706';
  return '#0D9488';
}

export default function ViagemDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [viagem, setViagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [showAgendamentoForm, setShowAgendamentoForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionErro, setActionErro] = useState({});

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const resp = await viagensApi.buscar(id);
      setViagem(resp.data);
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao carregar viagem');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  async function handlePresenca(agendamentoId, status) {
    setActionLoading(`presenca-${agendamentoId}`);
    setActionErro((e) => ({ ...e, [agendamentoId]: '' }));
    try {
      await agendamentosApi.marcarPresenca(agendamentoId, status);
      await carregar();
    } catch (err) {
      setActionErro((e) => ({ ...e, [agendamentoId]: err.response?.data?.error || 'Erro' }));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRetorno(agendamentoId, status) {
    if (!status) return;
    setActionLoading(`retorno-${agendamentoId}`);
    setActionErro((e) => ({ ...e, [agendamentoId]: '' }));
    try {
      await agendamentosApi.marcarRetorno(agendamentoId, status);
      await carregar();
    } catch (err) {
      setActionErro((e) => ({ ...e, [agendamentoId]: err.response?.data?.error || 'Erro' }));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancelar(agendamento) {
    const nome = agendamento.paciente.nome;
    if (!confirm(`Cancelar agendamento de ${nome}? Esta ação não pode ser desfeita.`)) return;
    setActionLoading(`cancel-${agendamento.id}`);
    setActionErro((e) => ({ ...e, [agendamento.id]: '' }));
    try {
      await agendamentosApi.cancelar(agendamento.id);
      await carregar();
    } catch (err) {
      setActionErro((e) => ({ ...e, [agendamento.id]: err.response?.data?.error || 'Erro ao cancelar' }));
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <div style={{ padding: '40px 0', textAlign: 'center', color: '#94A3B8', fontSize: 14 }}>Carregando...</div>;
  }
  if (erro) {
    return <div style={{ padding: '40px 0', color: '#DC2626', fontSize: 14 }}>{erro}</div>;
  }
  if (!viagem) return null;

  const passada = isViagemPassada(viagem.data);
  const dataFormatada = new Date(viagem.data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const barColor = vagasColor(viagem.vagas_ocupadas, viagem.capacidade_maxima);
  const pct = Math.min(100, Math.round((viagem.vagas_ocupadas / viagem.capacidade_maxima) * 100));

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/viagens')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', marginBottom: 18,
          border: '1px solid #E2E8F0', borderRadius: 8,
          background: '#fff', color: '#64748B',
          fontSize: 13, cursor: 'pointer',
        }}
      >
        ← Viagens
      </button>

      {/* Header card */}
      <div style={{
        background: '#fff', border: '1px solid #E8EDF3',
        borderRadius: 12, padding: '20px 24px', marginBottom: 18,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>
              {dataFormatada}
            </h2>
            {passada && (
              <span style={{
                padding: '2px 9px', borderRadius: 5,
                background: '#F1F5F9', color: '#94A3B8',
                fontSize: 11, fontWeight: 700,
              }}>
                Realizada
              </span>
            )}
          </div>
          <div style={{ fontSize: 14, color: '#64748B' }}>
            Motorista: <strong style={{ color: '#0F172A' }}>{viagem.motorista.nome}</strong>
            {viagem.placa && <> &nbsp;·&nbsp; Placa: <strong style={{ color: '#0F172A' }}>{viagem.placa}</strong></>}
            {viagem.modelo_veiculo && <> &nbsp;·&nbsp; {viagem.modelo_veiculo}</>}
          </div>
        </div>

        {/* Vagas counter */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: barColor, lineHeight: 1 }}>
            {viagem.vagas_ocupadas}/{viagem.capacidade_maxima}
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>vagas ocupadas</div>
          <div style={{ width: 120, height: 6, background: '#E8EDF3', borderRadius: 3, overflow: 'hidden', marginLeft: 'auto' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 3 }} />
          </div>
        </div>
      </div>

      {/* Add passenger button */}
      {!passada && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowAgendamentoForm((v) => !v)}
            style={{
              height: 40, padding: '0 18px',
              background: showAgendamentoForm ? '#475569' : '#2E5FA3',
              color: '#fff', border: 'none', borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {showAgendamentoForm ? '✕ Fechar formulário' : '+ Agendar Paciente'}
          </button>
        </div>
      )}

      {/* Agendamento form — floating card */}
      {showAgendamentoForm && (
        <div style={{
          background: '#fff',
          border: '1px solid #D0DCF0',
          borderRadius: 12, padding: '20px 24px',
          marginBottom: 18, maxWidth: 560,
          boxShadow: '0 16px 48px -12px rgba(15,23,42,0.16)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 16 }}>
            Novo Agendamento
          </div>
          <AgendamentoForm
            viagemId={viagem.id}
            onSalvo={() => { setShowAgendamentoForm(false); carregar(); }}
            onCancelar={() => setShowAgendamentoForm(false)}
          />
        </div>
      )}

      {/* Passenger table */}
      <div style={{
        fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 12,
      }}>
        Passageiros ({viagem.agendamentos.length})
      </div>

      {viagem.agendamentos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: 14 }}>
          Nenhum paciente agendado nesta viagem.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ background: '#fff', border: '1px solid #E8EDF3', borderRadius: 12, overflow: 'hidden', minWidth: 800 }}>
            {/* Table head */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.8fr 1fr 0.8fr 1.6fr 1fr 1.2fr 90px',
              padding: '10px 16px',
              background: '#F8FAFC', borderBottom: '1px solid #E8EDF3',
              fontSize: 11, fontWeight: 700, color: '#94A3B8',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              <div>Paciente</div>
              <div>Embarque</div>
              <div>Prioridade</div>
              <div>Motivo / Destino</div>
              <div>Presença</div>
              <div>Retorno</div>
              <div style={{ textAlign: 'right' }}>Ações</div>
            </div>

            {viagem.agendamentos.map((ag, i) => {
              const isLoadingPresenca = actionLoading === `presenca-${ag.id}`;
              const isLoadingRetorno  = actionLoading === `retorno-${ag.id}`;
              const isLoadingCancel   = actionLoading === `cancel-${ag.id}`;
              const agErro = actionErro[ag.id];
              const prio = PRIORIDADE_BADGE[ag.paciente.prioridade] || PRIORIDADE_BADGE.Normal;
              const retornoDisabled = ag.status_presenca !== 'Presente' || ag.status_retorno !== 'Pendente';
              const presencaBadge = PRESENCA_BADGE[ag.status_presenca] || PRESENCA_BADGE.Pendente;
              const retornoBadge  = RETORNO_BADGE[ag.status_retorno]   || RETORNO_BADGE.Pendente;

              return (
                <React.Fragment key={ag.id}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.8fr 1fr 0.8fr 1.6fr 1fr 1.2fr 90px',
                    padding: '12px 16px',
                    background: i % 2 === 0 ? '#fff' : '#FAFBFC',
                    borderBottom: '1px solid #F1F5F9',
                    alignItems: 'start',
                  }}>
                    {/* Paciente */}
                    <div>
                      <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 13 }}>
                        {ag.paciente.nome}
                      </div>
                      {ag.acompanhante && (
                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>
                          + {ag.acompanhante.nome}{ag.acompanhante.ocupa_vaga ? ' (vaga)' : ''}
                        </div>
                      )}
                    </div>

                    {/* Embarque */}
                    <div style={{ fontSize: 12, color: '#64748B', paddingTop: 2 }}>
                      {ag.paciente.ponto_embarque}
                    </div>

                    {/* Prioridade */}
                    <div style={{ paddingTop: 2 }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 5,
                        background: prio.background, color: prio.color,
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {prio.label}
                      </span>
                    </div>

                    {/* Motivo / Destino */}
                    <div style={{ fontSize: 12, paddingTop: 2 }}>
                      <div style={{ color: '#475569', marginBottom: 2 }}>{ag.motivo_deslocamento}</div>
                      <div style={{ color: '#94A3B8' }}>
                        {ag.ponto_desembarque_teresina} · {ag.destino_consulta}
                      </div>
                    </div>

                    {/* Presença */}
                    <div style={{ paddingTop: 2 }}>
                      {ag.status_presenca !== 'Pendente' ? (
                        <span style={{
                          padding: '2px 8px', borderRadius: 5,
                          background: presencaBadge.bg, color: presencaBadge.color,
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {ag.status_presenca}
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {STATUS_PRESENCA_OPTIONS.map((op) => (
                            <label key={op} style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              fontSize: 12, cursor: isLoadingPresenca ? 'not-allowed' : 'pointer',
                              color: '#475569',
                            }}>
                              <input
                                type="radio"
                                name={`presenca-${ag.id}`}
                                value={op}
                                onChange={() => handlePresenca(ag.id, op)}
                                disabled={isLoadingPresenca || passada}
                                style={{ cursor: 'pointer', accentColor: '#2E5FA3' }}
                              />
                              {op}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Retorno */}
                    <div style={{ paddingTop: 2 }}>
                      {ag.status_retorno !== 'Pendente' ? (
                        <span style={{
                          padding: '2px 8px', borderRadius: 5,
                          background: retornoBadge.bg, color: retornoBadge.color,
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {ag.status_retorno}
                        </span>
                      ) : (
                        <select
                          defaultValue=""
                          onChange={(e) => handleRetorno(ag.id, e.target.value)}
                          disabled={retornoDisabled || isLoadingRetorno}
                          style={{
                            height: 32, padding: '0 8px',
                            border: '1.5px solid #E2E8F0', borderRadius: 7,
                            fontSize: 12, color: '#475569',
                            cursor: retornoDisabled ? 'not-allowed' : 'pointer',
                            opacity: retornoDisabled ? 0.5 : 1,
                            maxWidth: 150, outline: 'none',
                          }}
                        >
                          <option value="" disabled>
                            {ag.status_presenca === 'Faltou'
                              ? 'N/A (Faltou)'
                              : ag.status_presenca === 'Pendente'
                              ? 'Aguard. presença'
                              : 'Selecionar...'}
                          </option>
                          {STATUS_RETORNO_OPTIONS.map((op) => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Ações */}
                    <div style={{ textAlign: 'right', paddingTop: 2 }}>
                      {!passada && (
                        <button
                          onClick={() => handleCancelar(ag)}
                          disabled={isLoadingCancel}
                          style={{
                            height: 30, padding: '0 12px',
                            background: '#fff', color: '#DC2626',
                            border: '1.5px solid #FECACA', borderRadius: 7,
                            cursor: isLoadingCancel ? 'not-allowed' : 'pointer',
                            fontSize: 12, opacity: isLoadingCancel ? 0.5 : 1,
                          }}
                        >
                          {isLoadingCancel ? '...' : 'Cancelar'}
                        </button>
                      )}
                    </div>
                  </div>

                  {agErro && (
                    <div style={{
                      padding: '8px 16px',
                      background: '#FEF2F2', borderBottom: '1px solid #F1F5F9',
                      color: '#DC2626', fontSize: 12,
                    }}>
                      ⚠ {agErro}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
