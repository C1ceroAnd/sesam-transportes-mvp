import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { useAuth } from '../main';

export default function LoginPage() {
  const [form, setForm] = useState({ login: '', senha: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErro('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.login(form.login, form.senha);
      login();
      navigate('/viagens');
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(120% 120% at 0% 0%, #EAF1FB 0%, #F8FAFC 45%, #F0FBF8 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: [
          'linear-gradient(rgba(46,95,163,0.055) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(46,95,163,0.055) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '36px 36px',
        opacity: 0.5,
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 420,
        background: '#fff',
        borderRadius: 18,
        boxShadow: '0 24px 60px -18px rgba(15,23,42,0.22), 0 4px 16px -4px rgba(15,23,42,0.08)',
        padding: '36px 40px 32px',
        margin: '0 16px',
      }}>
        {/* Logo / header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #2E5FA3 0%, #0D9488 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="5" width="18" height="14" rx="2"/>
              <path d="M3 10h18"/>
              <circle cx="8" cy="15" r="1.3" fill="#fff" stroke="none"/>
              <circle cx="16" cy="15" r="1.3" fill="#fff" stroke="none"/>
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
            SESAM Transportes
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#64748B' }}>
            Secretaria de Saúde · Piauí
          </p>
        </div>

        <div style={{ height: 1, background: '#E2E8F0', margin: '0 0 24px' }} />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Usuário
            </label>
            <input
              name="login"
              value={form.login}
              onChange={handleChange}
              autoComplete="username"
              required
              style={{
                width: '100%', height: 44,
                padding: '0 14px',
                border: '1.5px solid #E2E8F0', borderRadius: 8,
                fontSize: 14, color: '#0F172A',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#2E5FA3'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Senha
            </label>
            <input
              name="senha"
              type="password"
              value={form.senha}
              onChange={handleChange}
              autoComplete="current-password"
              required
              style={{
                width: '100%', height: 44,
                padding: '0 14px',
                border: '1.5px solid #E2E8F0', borderRadius: 8,
                fontSize: 14, color: '#0F172A',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
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

          <SubmitButton loading={loading} />
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8', marginTop: 22, marginBottom: 0 }}>
          Acesso restrito · Setor de Transportes
        </p>
      </div>
    </div>
  );
}

function SubmitButton({ loading }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', height: 46,
        background: loading ? '#7FA8D8' : hovered ? '#284F88' : '#2E5FA3',
        color: '#fff', border: 'none', borderRadius: 8,
        fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: loading ? 'none' : '0 6px 16px -6px rgba(46,95,163,0.6)',
        transition: 'background 0.15s, box-shadow 0.15s',
      }}
    >
      {loading ? 'Entrando...' : 'Entrar'}
    </button>
  );
}
