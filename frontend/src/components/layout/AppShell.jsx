import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../services/api';
import { useAuth } from '../../main';

function IconBus() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="M3 10h18M8 19v2M16 19v2"/>
      <circle cx="8" cy="15" r="1.2" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="15" r="1.2" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Viagens',   path: '/viagens',   Icon: IconBus },
  { label: 'Pacientes', path: '/pacientes', Icon: IconUsers },
];

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  async function handleLogout() {
    try { await auth.logout(); } finally { logout(); navigate('/login'); }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 240,
        background: '#FFFFFF',
        borderRight: '1px solid #E8EDF3',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 14, flexShrink: 0,
              background: 'linear-gradient(135deg, #2E5FA3 0%, #0D9488 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <rect x="3" y="5" width="18" height="14" rx="2"/>
                <path d="M3 10h18"/>
                <circle cx="8" cy="15" r="1.2" fill="#fff" stroke="none"/>
                <circle cx="16" cy="15" r="1.2" fill="#fff" stroke="none"/>
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A', lineHeight: '1.15' }}>SESAM</div>
              <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: '1.2' }}>Transportes</div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: '#E8EDF3', margin: '0 20px 10px' }} />

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '4px 10px 0' }}>
          {NAV_ITEMS.map(({ label, path, Icon }) => {
            const active = location.pathname.startsWith(path);
            return (
              <NavItem key={path} to={path} active={active} Icon={Icon} label={label} />
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 16px 16px', borderTop: '1px solid #E8EDF3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2E5FA3 0%, #0D9488 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 12,
            }}>
              AD
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Administrativo</div>
            </div>
          </div>
          <LogoutButton onClick={handleLogout} />
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{
        flex: 1,
        marginLeft: 240,
        padding: '28px 36px',
        minHeight: '100vh',
        overflowY: 'auto',
      }}>
        {children}
      </main>
    </div>
  );
}

function NavItem({ to, active, Icon, label }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <Link to={to}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '9px 12px', borderRadius: 8, marginBottom: 2,
          background: active ? '#EAEFF5' : hovered ? '#F8FAFC' : 'transparent',
          color: active ? '#2E5FA3' : hovered ? '#0F172A' : '#64748B',
          fontWeight: active ? 600 : 400,
          fontSize: 14, cursor: 'pointer',
          transition: 'background 0.12s, color 0.12s',
        }}
      >
        <Icon />
        {label}
        {active && (
          <div style={{
            marginLeft: 'auto',
            width: 6, height: 6, borderRadius: '50%',
            background: '#2E5FA3',
          }} />
        )}
      </div>
    </Link>
  );
}

function LogoutButton({ onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', padding: '7px 12px',
        border: '1px solid #E2E8F0', borderRadius: 8,
        background: hovered ? '#F8FAFC' : '#fff',
        color: '#64748B', fontSize: 13, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        transition: 'background 0.12s',
      }}
    >
      <IconLogout />
      Sair
    </button>
  );
}
