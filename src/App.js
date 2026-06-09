import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { supabase } from './supabase';
import './App.css';

const API = 'https://dudufritzs-projects-production.up.railway.app';

// ── LOGO ─────────────────────────────────────────────────────
// Logo completa para a tela de login
function LoginLogo() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 32 }}>
      <img src="/logo.png" alt="iHome" style={{ width: 240, display: 'block', margin: '0 auto' }} />
    </div>
  );
}

// Logo compacta para a sidebar
function SidebarLogo() {
  return (
    <div style={{ padding: '4px 8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 12 }}>
      <img src="/logo.png" alt="iHome" style={{ width: 110, display: 'block' }} />
    </div>
  );
}

// ── ÍCONES SVG ────────────────────────────────────────────────
const Icons = {
  dashboard:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  devices:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  automations: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
  alerts:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
  assistant:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  cameras:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  status:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  settings:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  logout:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  eyeOn:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeOff:      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  help:        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5"/></svg>,
};

// ── ÍCONE DE DISPOSITIVO ──────────────────────────────────────
function DeviceIcon({ category, size = 20, color = 'currentColor' }) {
  const c = (category || '').toLowerCase();
  let icon;
  if (c.includes('interruptor') || c.includes('switch') || c.includes('luz') || c.includes('light')) {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21h6M12 3a6 6 0 016 6c0 3.5-2 5.5-3 6.5H9C8 15.5 6 13.5 6 9a6 6 0 016-6z"/><line x1="9" y1="18" x2="15" y2="18"/></svg>;
  } else if (c.includes('tomada') || c.includes('socket') || c.includes('plug')) {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><line x1="10" y1="6" x2="10" y2="4"/><line x1="14" y1="6" x2="14" y2="4"/></svg>;
  } else if (c.includes('camera') || c.includes('cam') || c.includes('câmera')) {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
  } else if (c.includes('ar') || c.includes('condicionado')) {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="7" rx="2"/><line x1="8" y1="14" x2="8" y2="21"/><line x1="16" y1="14" x2="16" y2="21"/></svg>;
  } else if (c.includes('porta') || c.includes('door')) {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V5a2 2 0 012-2h14a2 2 0 012 2v16"/><line x1="7" y1="21" x2="17" y2="21"/><circle cx="14" cy="12" r="1"/></svg>;
  } else if (c.includes('sensor') || c.includes('motion') || c.includes('movimento')) {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h2M17 12h2M12 5v2M12 17v2M7.05 7.05l1.41 1.41M15.54 15.54l1.41 1.41M7.05 16.95l1.41-1.41M15.54 8.46l1.41-1.41"/><circle cx="12" cy="12" r="3"/></svg>;
  } else {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="12" r="3"/></svg>;
  }
  return <div style={{ width: size, height: size }}>{icon}</div>;
}

// ── CAMPO DE SENHA COM OLHINHO ────────────────────────────────
function PasswordField({ value, onChange, placeholder, required, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
      />
      <button type="button" className="pw-eye" onClick={() => setShow(s => !s)} tabIndex={-1}>
        {show ? Icons.eyeOff : Icons.eyeOn}
      </button>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────
function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formatCpf = v => {
    v = v.replace(/\D/g, '');
    if (v.length <= 3) return v;
    if (v.length <= 6) return v.slice(0,3)+'.'+v.slice(3);
    if (v.length <= 9) return v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6);
    return v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6,9)+'-'+v.slice(9,11);
  };
  const formatPhone = v => {
    v = v.replace(/\D/g, '');
    if (v.length <= 2) return v;
    if (v.length <= 7) return '('+v.slice(0,2)+') '+v.slice(2);
    return '('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7,11);
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('E-mail ou senha incorretos.');
    setLoading(false);
  };

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    if (cpf.replace(/\D/g,'').length !== 11) { setError('CPF inválido.'); setLoading(false); return; }
    if (phone.replace(/\D/g,'').length < 10) { setError('Telefone inválido.'); setLoading(false); return; }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone: phone.replace(/\D/g,''), cpf: cpf.replace(/\D/g,'') } }
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
    setLoading(false);
  };

  const handleForgot = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) setError(error.message);
    else setSuccess('E-mail de redefinição enviado! Verifique sua caixa de entrada.');
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <LoginLogo />
        <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleForgot} className="login-form">
          {mode === 'register' && (
            <div className="login-field">
              <label>Nome completo</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome completo" required />
            </div>
          )}
          <div className="login-field">
            <label>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>
          {mode === 'register' && <>
            <div className="login-field">
              <label>CPF</label>
              <input type="text" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} required />
            </div>
            <div className="login-field">
              <label>Telefone</label>
              <input type="text" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} required />
            </div>
          </>}
          {mode !== 'forgot' && (
            <div className="login-field">
              <label>Senha</label>
              <PasswordField value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} />
            </div>
          )}
          {error   && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Enviar link'}
          </button>
        </form>

        <div className="login-links">
          {mode === 'login' && <>
            <button onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}>Esqueci minha senha</button>
            <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>Criar conta</button>
          </>}
          {mode === 'register' && <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Já tenho conta</button>}
          {mode === 'forgot'   && <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Voltar ao login</button>}
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────
function Sidebar({ page, setPage, user, onLogout, unreadAlerts = 0 }) {
  const items = [
    { id: 'dashboard',   label: 'Visão Geral',   icon: Icons.dashboard   },
    { id: 'devices',     label: 'Dispositivos',  icon: Icons.devices     },
    { id: 'automations', label: 'Automação',     icon: Icons.automations },
    { id: 'alerts',      label: 'Alertas',       icon: Icons.alerts      },
    { id: 'cameras',     label: 'Câmeras',       icon: Icons.cameras     },
    { id: 'status',      label: 'Status',        icon: Icons.status      },
    { id: 'help',        label: 'Ajuda',         icon: Icons.help        },
    { id: 'settings',    label: 'Configurações', icon: Icons.settings    },
  ];
  return (
    <div className="sidebar">
      <SidebarLogo />
      {items.map(i => (
        <button key={i.id} className={`nav-item ${page===i.id?'active':''}`} onClick={() => setPage(i.id)}>
          <span className="nav-icon">{i.icon}</span>{i.label}
          {i.id === 'alerts' && unreadAlerts > 0 && (
            <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '2px 6px', minWidth: 18, textAlign: 'center' }}>{unreadAlerts}</span>
          )}
        </button>
      ))}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', padding: '8px 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </div>
        <button className="nav-item" onClick={onLogout} style={{ color: '#ef4444' }}>
          <span className="nav-icon">{Icons.logout}</span>Sair
        </button>
      </div>
    </div>
  );
}

// ── NAVEGAÇÃO INFERIOR (mobile) ──────────────────────────────
function BottomNav({ page, setPage, unreadAlerts = 0 }) {
  const items = [
    { id: 'dashboard',   label: 'Início',       icon: Icons.dashboard   },
    { id: 'devices',     label: 'Dispositivos', icon: Icons.devices     },
    { id: 'automations', label: 'Automação',    icon: Icons.automations },
    { id: 'alerts',      label: 'Alertas',      icon: Icons.alerts      },
    { id: 'help',        label: 'Ajuda',        icon: Icons.help        },
    { id: 'settings',    label: 'Config.',      icon: Icons.settings    },
  ];
  return (
    <nav className="bottom-nav">
      {items.map(i => (
        <button key={i.id} className={`bottom-nav-item ${page===i.id?'active':''}`} onClick={() => setPage(i.id)}>
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            {i.icon}
            {i.id === 'alerts' && unreadAlerts > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -6, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 8, padding: '1px 4px', minWidth: 14, textAlign: 'center', lineHeight: '14px' }}>{unreadAlerts}</span>
            )}
          </span>
          <span>{i.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ── TOGGLE ────────────────────────────────────────────────────
function Toggle({ on, onClick }) {
  return (
    <button className={`toggle ${on ? 'on' : 'off'}`} onClick={e => { e.stopPropagation(); onClick(); }}>
      <div className="toggle-dot" />
    </button>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────
function Dashboard({ devices, setPage, session }) {
  const [recentAlerts, setRecentAlerts]     = useState([]);
  const [scheduleCount, setScheduleCount]   = useState(null);
  const [loadingStats, setLoadingStats]     = useState(true);
  const headers = session ? { Authorization: `Bearer ${session.access_token}` } : {};

  useEffect(() => {
    if (!session) return;
    Promise.all([
      axios.get(`${API}/alerts`, { headers }).catch(() => ({ data: [] })),
      axios.get(`${API}/schedules`, { headers }).catch(() => ({ data: [] })),
    ]).then(([alertsRes, schedRes]) => {
      setRecentAlerts((alertsRes.data || []).slice(0, 4));
      setScheduleCount((schedRes.data || []).length);
    }).finally(() => setLoadingStats(false));
  }, []); // eslint-disable-line

  const online  = devices.filter(d => d.online).length;
  const offline = devices.length - online;
  const hasOffline = offline > 0;

  const formatTime = ts => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Painel Principal</div>
          <div className="page-subtitle">{online} de {devices.length} dispositivos online.</div>
        </div>
      </div>

      {/* Status geral */}
      <div className="house-status" style={{ marginBottom: 20, background: hasOffline ? 'rgba(239,68,68,0.07)' : 'rgba(34,197,94,0.07)', border: `1px solid ${hasOffline ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.18)'}` }}>
        <div className="house-status-text">
          <h3 style={{ color: hasOffline ? '#ef4444' : '#22c55e' }}>
            {hasOffline ? `${offline} dispositivo${offline > 1 ? 's' : ''} offline` : 'Tudo seguro'}
          </h3>
          <p>{hasOffline ? 'Verifique a conexão dos dispositivos.' : 'Todos os dispositivos estão respondendo.'}</p>
        </div>
        <div className="shield" style={{ background: hasOffline ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)' }}>
          {hasOffline
            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          }
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => setPage('devices')}>
          <div className="card-label">Dispositivos</div>
          <div className="card-value">{devices.length}</div>
          <div className="card-sub" style={{ color: online > 0 ? '#22c55e' : 'rgba(255,255,255,0.3)' }}>{online} online</div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => setPage('devices')}>
          <div className="card-label">Offline</div>
          <div className="card-value" style={{ color: offline > 0 ? '#ef4444' : '#22c55e' }}>{offline}</div>
          <div className="card-sub">{offline > 0 ? 'Verificar' : 'Nenhum'}</div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => setPage('automations')}>
          <div className="card-label">Automações</div>
          <div className="card-value">{loadingStats ? '…' : (scheduleCount ?? 0)}</div>
          <div className="card-sub">{scheduleCount === 1 ? 'rotina ativa' : 'rotinas ativas'}</div>
        </div>
        <div className="card" style={{ cursor: 'pointer' }} onClick={() => setPage('alerts')}>
          <div className="card-label">Alertas</div>
          <div className="card-value">{loadingStats ? '…' : recentAlerts.filter(a => !a.read).length}</div>
          <div className="card-sub">não lidos</div>
        </div>
      </div>

      {/* Dispositivos online */}
      <div className="section-hd">
        <span className="section-title">Dispositivos Online</span>
        <button className="section-link" onClick={() => setPage('devices')}>Ver todos</button>
      </div>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {devices.filter(d => d.online).slice(0, 3).map(d => (
          <div className="card" key={d.id} style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <DeviceIcon category={d.category_name} size={22} color="#3B7EFF" />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
            <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, marginTop: 3 }}>Online</div>
          </div>
        ))}
        {devices.filter(d => d.online).length === 0 && (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, padding: 20 }}>
            Nenhum dispositivo online no momento.
          </div>
        )}
      </div>

      {/* Atividade recente */}
      <div className="section-hd">
        <span className="section-title">Atividade Recente</span>
        <button className="section-link" onClick={() => setPage('alerts')}>Ver tudo</button>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        {loadingStats && (
          <div style={{ padding: 20, color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center' }}>Carregando...</div>
        )}
        {!loadingStats && recentAlerts.length === 0 && (
          <div style={{ padding: 20, color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center' }}>Nenhuma atividade recente.</div>
        )}
        {recentAlerts.map((alert, i) => (
          <div key={alert.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderBottom: i < recentAlerts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: alert.type === 'offline' ? '#ef4444' : '#22c55e',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: alert.read ? 'rgba(255,255,255,0.5)' : '#fff', fontWeight: alert.read ? 400 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {alert.message}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{formatTime(alert.created_at)}</div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, flexShrink: 0,
              background: alert.type === 'offline' ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
              color: alert.type === 'offline' ? '#ef4444' : '#22c55e',
            }}>{alert.type === 'offline' ? 'Offline' : 'Online'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DISPOSITIVOS ──────────────────────────────────────────────
function Devices({ devices, loading, onToggle, tuyaConfigured, setPage }) {
  const [filter, setFilter] = useState('Todos');
  const tabs = ['Todos','Sala','Quarto','Cozinha','Externa'];
  const filtered = filter === 'Todos'
    ? devices
    : devices.filter(d => d.room?.toLowerCase().includes(filter.toLowerCase()));

  const AddBtn = () => (
    <button
      onClick={() => setPage('settings')}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#3B7EFF', border: 'none',
        borderRadius: 10, padding: '9px 16px',
        color: '#fff', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', flexShrink: 0,
        boxShadow: '0 2px 10px rgba(59,126,255,0.35)',
      }}
    >
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Adicionar
    </button>
  );

  if (loading) return <div className="loading">Carregando dispositivos...</div>;

  if (!tuyaConfigured) {
    return (
      <div className="page">
        <div className="page-header">
          <div><div className="page-title">Dispositivos</div></div>
          <AddBtn />
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '60px 20px', gap: 16,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(59,126,255,0.1)',
            border: '1.5px solid rgba(59,126,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(59,126,255,0.7)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="3"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Nenhum dispositivo conectado</div>
          <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, textAlign: 'center', maxWidth: 280 }}>
            Configure suas credenciais Tuya em Configurações para visualizar e controlar seus dispositivos.
          </div>
          <button
            onClick={() => setPage('settings')}
            style={{
              marginTop: 8, background: '#3B7EFF', border: 'none',
              borderRadius: 10, padding: '10px 24px',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 2px 10px rgba(59,126,255,0.35)',
            }}
          >
            Ir para Configurações
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Dispositivos</div>
          <div className="page-subtitle">{devices.filter(d=>d.online).length} de {devices.length} online</div>
        </div>
        <AddBtn />
      </div>
      <div className="tabs">{tabs.map(t => <button key={t} className={`tab ${filter===t?'active':''}`} onClick={() => setFilter(t)}>{t}</button>)}</div>
      {filtered.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '48px 20px', gap: 12,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(255,255,255,0.04)',
            border: '1.5px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="3"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            Nenhum dispositivo encontrado nesta categoria.
          </div>
        </div>
      )}
      <div className="grid-3">
        {filtered.map(d => {
          const on = d.isControllable ? d.switch_1 === true : d.online === true;
          const color = on ? '#3B7EFF' : 'rgba(255,255,255,0.15)';
          return (
            <div className="device-card" key={d.id}>
              <div className="dev-icon-wrap" style={{ background: on ? 'rgba(59,126,255,0.15)' : 'rgba(255,255,255,0.04)' }}>
                <DeviceIcon category={d.category_name} size={20} color={color} />
              </div>
              <div className="dev-name">{d.name}</div>
              <div className="dev-category">{d.room || d.category_name}</div>
              <div className="dev-footer">
                <span className={`status-badge ${on?'on':'off'}`}>{on?'Ligado':'Desligado'}</span>
                {d.isControllable && <Toggle on={on} onClick={() => onToggle(d.id, on)} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── AJUDA / FAQ ───────────────────────────────────────────────
const FAQ_SECTIONS = [
  {
    title: '🚀 Primeiros passos',
    items: [
      {
        q: 'Como criar uma conta no iHome?',
        a: 'Na tela de login, toque em "Criar conta". Informe seu e-mail e uma senha com pelo menos 6 caracteres. Você receberá um e-mail de confirmação — clique no link para ativar sua conta. Depois é só fazer login normalmente.',
      },
      {
        q: 'Como instalar o app no celular (iPhone)?',
        a: 'Abra o Safari e acesse ihomeauto.com. Toque no ícone de compartilhar (quadrado com seta para cima) na barra inferior. Role a lista e toque em "Adicionar à Tela de Início". Confirme tocando em "Adicionar". O ícone do iHome aparecerá na sua tela inicial.',
      },
      {
        q: 'Como instalar o app no celular (Android)?',
        a: 'Abra o Chrome e acesse ihomeauto.com. Toque nos 3 pontinhos no canto superior direito. Selecione "Adicionar à tela inicial" ou "Instalar app". Confirme. O iHome ficará disponível como qualquer outro app instalado.',
      },
      {
        q: 'O app funciona sem internet?',
        a: 'O iHome precisa de conexão com a internet para controlar seus dispositivos, pois os comandos são enviados via nuvem Tuya. Sem internet, os dispositivos não respondem. Alertas e histórico podem ser visualizados com conexão limitada.',
      },
    ],
  },
  {
    title: '⚙️ Configurando a Tuya',
    items: [
      {
        q: 'O que é a Tuya IoT Platform e por que preciso dela?',
        a: 'A Tuya é a plataforma de nuvem que conecta a maioria dos dispositivos inteligentes do mercado (lâmpadas, tomadas, sensores, etc). Para o iHome controlar seus dispositivos, ele precisa de uma "chave de acesso" gerada pela Tuya. É gratuito criar uma conta de desenvolvedor.',
      },
      {
        q: 'Como obter o Access ID e o Access Secret?',
        a: '1. Acesse platform.tuya.com e crie uma conta gratuita.\n2. Vá em "Cloud" → "Development" → clique em "Create Cloud Project".\n3. Escolha um nome, selecione "Smart Home" como tipo e escolha a região mais próxima.\n4. Na aba "Overview" do projeto, você encontra o "Access ID" e o "Access Secret".\n5. Vá em "Devices" → "Link Tuya App Account" e vincule sua conta do app Tuya/Smart Life.\n6. Cole essas credenciais em Configurações → Credenciais Tuya IoT.',
      },
      {
        q: 'Qual região de servidor devo escolher?',
        a: 'Escolha a região onde seus dispositivos foram configurados:\n• Américas (EUA): para usuários do Brasil e Américas\n• Europa: para usuários europeus\n• Ásia (China): para dispositivos configurados na China\nSe não souber, comece com "Américas (EUA)" — é a mais comum no Brasil.',
      },
      {
        q: 'Minha conta Tuya gratuita tem limites?',
        a: 'A conta gratuita da Tuya permite controlar até 5 dispositivos e tem limite de requisições por mês (suficiente para uso pessoal). Para uso intenso ou mais dispositivos, a Tuya oferece planos pagos. O iHome funciona normalmente dentro dos limites gratuitos.',
      },
    ],
  },
  {
    title: '📱 Dispositivos compatíveis',
    items: [
      {
        q: 'Quais dispositivos funcionam com o iHome?',
        a: 'O iHome é compatível com qualquer dispositivo que use o protocolo Tuya, incluindo:\n• Lâmpadas inteligentes (qualquer marca com Tuya)\n• Tomadas inteligentes\n• Interruptores Wi-Fi\n• Ar-condicionado com controle inteligente\n• Sensores de movimento, temperatura e umidade\n• Câmeras IP Tuya\n• Fechaduras inteligentes\n• Cortinas e persianas motorizadas\n\nMarcas comuns: Intelbras, Positivo Casa Inteligente, Multilaser, Sonoff (modo Tuya), e qualquer produto com app "Smart Life" ou "Tuya Smart".',
      },
      {
        q: 'Como encontrar o ID do meu dispositivo?',
        a: 'Método 1 (Tuya Platform): Acesse platform.tuya.com → seu projeto → "Devices". A lista mostra todos os dispositivos vinculados com o ID (Device ID).\n\nMétodo 2 (App Tuya Smart): Abra o app Tuya Smart ou Smart Life → toque no dispositivo → toque nos 3 pontinhos (⋮) → "Informações do dispositivo" → o ID aparece como "Device ID" ou "ID do dispositivo".',
      },
      {
        q: 'Meu dispositivo aparece como offline. O que fazer?',
        a: '1. Verifique se o dispositivo está ligado na tomada e com Wi-Fi funcionando.\n2. Tente reiniciar o dispositivo (desligue e ligue).\n3. Confirme que o Wi-Fi do dispositivo é 2.4 GHz (a maioria não suporta 5 GHz).\n4. Abra o app Tuya Smart e veja se o dispositivo aparece online lá — se não aparecer, o problema é com a conexão do dispositivo, não com o iHome.\n5. Se o problema persistir, tente desvincular e vincular novamente o dispositivo no app Tuya.',
      },
      {
        q: 'Posso usar dispositivos Zigbee ou Matter?',
        a: 'No momento, o iHome suporta apenas dispositivos Tuya Wi-Fi. Suporte a Zigbee e Matter está em desenvolvimento e será lançado em breve. Para usar Zigbee, o dispositivo precisaria de um hub Zigbee compatível.',
      },
    ],
  },
  {
    title: '🤖 Assistente IA e Automações',
    items: [
      {
        q: 'Quais comandos posso falar ou digitar para o assistente?',
        a: 'O assistente entende linguagem natural. Exemplos:\n• "Apaga a luz da sala"\n• "Liga o ar-condicionado"\n• "Desliga todos os dispositivos"\n• "Liga tudo"\n• "Agenda a luz do quarto para ligar às 18h e desligar à meia-noite"\n• "Que dispositivos tenho?"\n• "Mostra minhas rotinas"\n\nO assistente usa IA (Google Gemini) e interpreta o contexto, então você pode falar de forma natural.',
      },
      {
        q: 'Como criar uma automação (rotina automática)?',
        a: 'Opção 1 — pelo Assistente IA:\nDiga ou escreva: "Agenda a [nome do dispositivo] para ligar às [horário] e desligar às [horário]".\nExemplo: "Agenda a luz da sala para ligar às 19h e desligar às 23h".\n\nOpção 2 — pela página Automação:\nVá em Automação → toque em "+ Nova Rotina" → selecione o dispositivo e os horários de ligar/desligar → salve.',
      },
      {
        q: 'O assistente funciona por voz?',
        a: 'Sim! Toque no ícone do microfone na janela do assistente. O app pedirá permissão para usar o microfone na primeira vez. Fale o comando claramente — o assistente transcreve e processa automaticamente. Funciona melhor no Chrome e Safari.',
      },
      {
        q: 'Posso controlar vários dispositivos de uma vez?',
        a: 'Sim. Use comandos como:\n• "Liga tudo" — liga todos os dispositivos cadastrados\n• "Desliga tudo" — desliga todos\n• "Apaga todas as luzes" — o assistente filtra por tipo\nPara controle individual, basta mencionar o nome do dispositivo.',
      },
    ],
  },
  {
    title: '🔔 Notificações',
    items: [
      {
        q: 'Como ativar notificações no iPhone?',
        a: '1. Primeiro, instale o iHome na tela inicial do iPhone (veja "Como instalar no iPhone").\n2. Abra o app pela tela inicial (não pelo Safari).\n3. Vá em Configurações → toque em "Ativar" em Notificações.\n4. Quando o iPhone perguntar, toque em "Permitir".\n\nImportante: notificações push em iPhone só funcionam quando o app está instalado na tela inicial E você está usando iOS 16.4 ou superior.',
      },
      {
        q: 'Como ativar notificações no Android?',
        a: '1. Acesse ihomeauto.com no Chrome.\n2. Instale o app (3 pontinhos → "Instalar app").\n3. Vá em Configurações → toque em "Ativar" em Notificações.\n4. Quando o Chrome perguntar, toque em "Permitir".\nVocê receberá notificações quando dispositivos ficarem offline ou voltarem online.',
      },
      {
        q: 'Por que não estou recebendo notificações?',
        a: 'Verifique:\n1. O app está instalado na tela inicial (não apenas aberto no navegador).\n2. As notificações estão ativadas nas configurações do próprio iHome.\n3. As notificações do navegador (Chrome/Safari) não estão bloqueadas — confira em Configurações do celular → Notificações.\n4. No iPhone: somente iOS 16.4+ suporta notificações em PWA.',
      },
    ],
  },
  {
    title: '🔧 Problemas comuns',
    items: [
      {
        q: 'Esqueci minha senha. Como recuperar?',
        a: 'Na tela de login, toque em "Esqueci minha senha". Informe seu e-mail cadastrado. Você receberá um link de redefinição de senha por e-mail (verifique também a pasta de spam). Clique no link, crie uma nova senha e faça login normalmente.',
      },
      {
        q: 'O app está lento ou travado. O que fazer?',
        a: '1. Feche e abra o app novamente.\n2. Se instalado como PWA, remova da tela inicial e reinstale para limpar o cache.\n3. Verifique sua conexão com a internet.\n4. Se o problema persistir, acesse ihomeauto.com diretamente pelo navegador e veja se o problema continua.',
      },
      {
        q: 'Adicionei um dispositivo errado. Como remover?',
        a: 'Vá em Configurações → Meus Dispositivos → toque em "Remover" ao lado do dispositivo que deseja excluir. A remoção é imediata e não afeta o dispositivo físico — ele continua funcionando normalmente pelo app Tuya.',
      },
      {
        q: 'Meus dados estão seguros?',
        a: 'Sim. O iHome usa autenticação segura via Supabase com tokens JWT. Suas credenciais Tuya são armazenadas com criptografia. Os dados trafegam sempre via HTTPS. Nunca compartilhamos suas informações com terceiros.',
      },
    ],
  },
];

function Help() {
  const [openItem, setOpenItem] = useState(null);

  const toggle = key => setOpenItem(openItem === key ? null : key);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Central de Ajuda</div>
      </div>

      <div style={{ padding: '0 0 8px', marginBottom: 8 }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
          Encontre respostas rápidas para as dúvidas mais comuns sobre o iHome.
        </p>
      </div>

      {FAQ_SECTIONS.map(section => (
        <div key={section.title} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 2 }}>
            {section.title}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {section.items.map((item, idx) => {
              const key = section.title + idx;
              const isOpen = openItem === key;
              return (
                <div key={key} style={{ borderBottom: idx < section.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <button
                    onClick={() => toggle(key)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
                      textAlign: 'left', gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: isOpen ? '#3B7EFF' : '#fff', lineHeight: 1.4, flex: 1 }}>
                      {item.q}
                    </span>
                    <span style={{ color: isOpen ? '#3B7EFF' : 'rgba(255,255,255,0.3)', fontSize: 18, flexShrink: 0, lineHeight: 1, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      ›
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(59,126,255,0.1)' }}>
                      {item.a.split('\n').map((line, i) => (
                        <p key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: i === 0 ? '12px 0 0' : '4px 0 0' }}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
          Ainda com dúvidas? Entre em contato:{' '}
          <a href="mailto:eduardosolifritz@gmail.com" style={{ color: '#3B7EFF' }}>
            suporte@ihomeauto.com
          </a>
        </p>
      </div>
    </div>
  );
}

// ── CONFIGURAÇÕES ─────────────────────────────────────────────
// Converte VAPID key de base64url para Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

function Settings({ session, onLogout }) {
  const [accessId, setAccessId] = useState('');
  const [accessSecret, setAccessSecret] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://openapi.tuyaus.com');
  const [configured, setConfigured] = useState(false);
  const [myDevices, setMyDevices] = useState([]);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceRoom, setNewDeviceRoom] = useState('');
  const [newProtocol, setNewProtocol] = useState('tuya');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [shares, setShares] = useState([]);
  const [sharedWithMe, setSharedWithMe] = useState([]);
  const [guestEmail, setGuestEmail] = useState('');
  const [sharingLoading, setSharingLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState(null); // null = não buscado, [] = vazio
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [addingBulk, setAddingBulk] = useState(false);

  const headers = { Authorization: `Bearer ${session.access_token}` };

  const showMsg = (text, type = 'success') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), type === 'error' ? 8000 : 4000); };

  useEffect(() => {
    axios.get(`${API}/tuya-credentials`, { headers })
      .then(r => {
        setConfigured(r.data.configured);
        if (r.data.configured) setAccessId(r.data.tuya_access_id || '');
      }).catch(console.error);
    axios.get(`${API}/my-devices`, { headers })
      .then(r => setMyDevices(r.data.filter(d => d.access_type === 'own' || !d.access_type))).catch(console.error);
    axios.get(`${API}/shares`, { headers }).then(r => setShares(r.data)).catch(console.error);
    axios.get(`${API}/shared-with-me`, { headers }).then(r => setSharedWithMe(r.data)).catch(console.error);
    // Verifica se já tem notificações ativas
    if ('Notification' in window && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) setPushEnabled(true);
        });
      }).catch(() => {});
    }
  }, []); // eslint-disable-line

  const toggleNotifications = async () => {
    if (!('serviceWorker' in navigator)) {
      showMsg('❌ Service Worker não suportado neste navegador.', 'error'); return;
    }
    if (!('PushManager' in window)) {
      showMsg('❌ Push notifications não suportadas. Use Chrome ou Edge.', 'error'); return;
    }
    if (!('Notification' in window)) {
      showMsg('❌ API de Notificação não disponível.', 'error'); return;
    }
    setPushLoading(true);
    try {
      if (pushEnabled) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          await axios.delete(`${API}/push-subscribe`, { data: { endpoint: sub.endpoint }, headers });
        }
        setPushEnabled(false);
        showMsg('Notificações desativadas.');
      } else {
        // Passo 1: permissão
        showMsg('Solicitando permissão...');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          showMsg('❌ Permissão negada. Vá em Configurações do navegador e libere notificações para ihomeauto.com.', 'error');
          setPushLoading(false); return;
        }
        // Passo 2: registrar SW
        showMsg('Registrando service worker...');
        let reg;
        try {
          reg = await navigator.serviceWorker.register('/sw.js');
          await navigator.serviceWorker.ready;
        } catch (swErr) {
          showMsg('❌ Erro no service worker: ' + swErr.message, 'error');
          setPushLoading(false); return;
        }
        // Passo 3: chave VAPID
        showMsg('Buscando chave do servidor...');
        let key;
        try {
          const r = await axios.get(`${API}/vapid-public-key`);
          key = r.data.key;
        } catch {
          showMsg('❌ Não foi possível conectar ao servidor. Tente novamente.', 'error');
          setPushLoading(false); return;
        }
        if (!key) {
          showMsg('❌ Servidor ainda não configurado para notificações. Aguarde alguns minutos.', 'error');
          setPushLoading(false); return;
        }
        // Passo 4: assinar push
        showMsg('Criando assinatura...');
        let sub;
        try {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(key),
          });
        } catch (subErr) {
          showMsg('❌ Erro ao assinar push: ' + subErr.message, 'error');
          setPushLoading(false); return;
        }
        // Passo 5: salvar no backend
        await axios.post(`${API}/push-subscribe`, { subscription: sub.toJSON() }, { headers });
        setPushEnabled(true);
        showMsg('✅ Notificações ativadas! Você será avisado quando dispositivos ficarem offline.');
      }
    } catch (err) {
      showMsg('❌ Erro inesperado: ' + err.message, 'error');
    }
    setPushLoading(false);
  };

  const saveCredentials = async e => {
    e.preventDefault();
    if (!accessSecret && !configured) { showMsg('Informe o Access Secret.', 'error'); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/tuya-credentials`, { tuya_access_id: accessId, tuya_secret: accessSecret, tuya_base_url: baseUrl }, { headers });
      setConfigured(true); setAccessSecret('');
      showMsg('Credenciais salvas com sucesso.');
    } catch (err) {
      showMsg('Erro ao salvar: ' + (err.response?.data?.error || err.message), 'error');
    }
    setLoading(false);
  };

  const inviteGuest = async e => {
    e.preventDefault();
    if (!guestEmail.trim()) return;
    setSharingLoading(true);
    try {
      const r = await axios.post(`${API}/shares`, { guest_email: guestEmail.trim(), permission: 'control' }, { headers });
      setShares(prev => [r.data, ...prev.filter(s => s.guest_email !== guestEmail.trim())]);
      setGuestEmail('');
      showMsg(`Acesso concedido para ${guestEmail.trim()}.`);
    } catch (err) {
      showMsg('Erro: ' + (err.response?.data?.error || err.message), 'error');
    }
    setSharingLoading(false);
  };

  const removeShare = async id => {
    try {
      await axios.delete(`${API}/shares/${id}`, { headers });
      setShares(prev => prev.filter(s => s.id !== id));
      showMsg('Acesso removido.');
    } catch { showMsg('Erro ao remover.', 'error'); }
  };

  const leaveSharedHome = async id => {
    try {
      await axios.delete(`${API}/shared-with-me/${id}`, { headers });
      setSharedWithMe(prev => prev.filter(s => s.id !== id));
      showMsg('Você saiu da casa compartilhada.');
    } catch { showMsg('Erro.', 'error'); }
  };

  const discoverDevices = async () => {
    if (!configured) { showMsg('Configure suas credenciais Tuya primeiro.', 'error'); return; }
    setDiscovering(true);
    setDiscovered(null);
    setSelectedIds(new Set());
    try {
      const r = await axios.get(`${API}/discover-devices`, { headers });
      setDiscovered(r.data.devices || []);
    } catch (err) {
      showMsg('Erro ao buscar dispositivos: ' + (err.response?.data?.error || err.message), 'error');
    }
    setDiscovering(false);
  };

  const toggleSelect = id => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addSelected = async () => {
    const toAdd = (discovered || []).filter(d => selectedIds.has(d.tuya_id) && !d.already_added);
    if (toAdd.length === 0) { showMsg('Selecione pelo menos um dispositivo novo.', 'error'); return; }
    setAddingBulk(true);
    let added = 0;
    for (const d of toAdd) {
      try {
        const r = await axios.post(`${API}/my-devices`, { tuya_id: d.tuya_id, name: d.name, room: '' }, { headers });
        setMyDevices(prev => [...prev, r.data]);
        setDiscovered(prev => prev.map(x => x.tuya_id === d.tuya_id ? { ...x, already_added: true } : x));
        added++;
      } catch { /* ignora erro individual */ }
    }
    setSelectedIds(new Set());
    showMsg(`${added} dispositivo${added !== 1 ? 's' : ''} adicionado${added !== 1 ? 's' : ''} com sucesso!`);
    setAddingBulk(false);
  };

  const addDevice = async e => {
    e.preventDefault();
    if (newProtocol !== 'tuya') { showMsg('Integração com ' + newProtocol + ' em desenvolvimento. Em breve disponível.', 'error'); return; }
    try {
      const r = await axios.post(`${API}/my-devices`, { tuya_id: newDeviceId.trim(), name: newDeviceName.trim(), room: newDeviceRoom.trim() }, { headers });
      setMyDevices([...myDevices, r.data]);
      setNewDeviceId(''); setNewDeviceName(''); setNewDeviceRoom(''); setNewProtocol('tuya');
      showMsg('Dispositivo adicionado.');
    } catch (err) {
      showMsg('Erro: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const removeDevice = async id => {
    try {
      await axios.delete(`${API}/my-devices/${id}`, { headers });
      setMyDevices(myDevices.filter(d => d.id !== id));
    } catch { showMsg('Erro ao remover.', 'error'); }
  };

  const protocolLabel = { tuya: 'Tuya', zigbee: 'Zigbee', matter: 'Matter', zwave: 'Z-Wave' };

  return (
    <div className="page">
      <div className="page-header"><div className="page-title">Configurações</div></div>

      {msg && <div className={msgType === 'success' ? 'login-success' : 'login-error'} style={{ marginBottom: 14 }}>{msg}</div>}

      {/* Credenciais Tuya */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 6, color: '#fff', fontSize: 14 }}>Credenciais Tuya IoT</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16, lineHeight: 1.6 }}>
          Encontre seu Access ID e Secret no{' '}
          <a href="https://platform.tuya.com" target="_blank" rel="noreferrer" style={{ color: '#3B7EFF' }}>Tuya IoT Platform</a>.
          {configured && <span style={{ color: '#22c55e', display: 'block', marginTop: 4 }}>Credenciais configuradas.</span>}
        </div>
        <form onSubmit={saveCredentials}>
          <div className="login-field" style={{ marginBottom: 12 }}>
            <label>Access ID</label>
            <input type="text" value={accessId} onChange={e => setAccessId(e.target.value)} placeholder="Seu Access ID" required />
          </div>
          <div className="login-field" style={{ marginBottom: 12 }}>
            <label>Access Secret {configured && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>(deixe em branco para manter)</span>}</label>
            <PasswordField value={accessSecret} onChange={e => setAccessSecret(e.target.value)} placeholder={configured ? '(não alterado)' : 'Seu Access Secret'} />
          </div>
          <div className="login-field" style={{ marginBottom: 16 }}>
            <label>Região do servidor</label>
            <select value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="styled-select">
              <option value="https://openapi.tuyaus.com">Américas (EUA)</option>
              <option value="https://openapi.tuyaeu.com">Europa</option>
              <option value="https://openapi.tuyacn.com">Ásia (China)</option>
              <option value="https://openapi.tuyain.com">Índia</option>
            </select>
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Salvando...' : configured ? 'Atualizar Credenciais' : 'Salvar Credenciais'}
          </button>
        </form>
      </div>

      {/* Meus Dispositivos */}
      <div className="card">
        <div style={{ fontWeight: 700, marginBottom: 14, color: '#fff', fontSize: 14 }}>Meus Dispositivos</div>

        {myDevices.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 13, padding: '8px 0', marginBottom: 16 }}>
            Nenhum dispositivo cadastrado.
          </div>
        )}
        {myDevices.map(d => (
          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <DeviceIcon category="switch" size={16} color="rgba(255,255,255,0.4)" />
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 }}>
                  {d.room && <span>{d.room} · </span>}
                  <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{d.tuya_id}</span>
                  <span className="protocol-badge" style={{ marginLeft: 6 }}>Tuya</span>
                </div>
              </div>
            </div>
            <button onClick={() => removeDevice(d.id)}
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>
              Remover
            </button>
          </div>
        ))}

        {/* Detectar dispositivos automaticamente */}
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Detectar da conta Tuya</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>Importa automaticamente todos os dispositivos da sua conta</div>
            </div>
            <button type="button" onClick={discoverDevices} disabled={discovering || !configured}
              style={{ background: 'rgba(59,126,255,0.15)', color: '#3B7EFF', border: '1px solid rgba(59,126,255,0.25)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, flexShrink: 0, opacity: !configured ? 0.4 : 1 }}>
              {discovering ? 'Buscando...' : 'Detectar'}
            </button>
          </div>

          {/* Lista de dispositivos descobertos */}
          {discovered !== null && (
            <div>
              {discovered.length === 0 && (
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: '8px 0' }}>
                  Nenhum dispositivo encontrado na conta Tuya. Verifique se os dispositivos estão vinculados ao seu projeto.
                </div>
              )}
              {discovered.length > 0 && (
                <>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                    {discovered.length} dispositivo{discovered.length !== 1 ? 's' : ''} encontrado{discovered.length !== 1 ? 's' : ''} — selecione os que deseja adicionar:
                  </div>
                  {discovered.map(d => (
                    <div key={d.tuya_id} onClick={() => !d.already_added && toggleSelect(d.tuya_id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: d.already_added ? 'default' : 'pointer', opacity: d.already_added ? 0.45 : 1 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${selectedIds.has(d.tuya_id) ? '#3B7EFF' : 'rgba(255,255,255,0.2)'}`, background: selectedIds.has(d.tuya_id) ? '#3B7EFF' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                        {selectedIds.has(d.tuya_id) && <svg viewBox="0 0 12 12" width="12" height="12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <DeviceIcon category={d.category} size={16} color={d.online ? '#3B7EFF' : 'rgba(255,255,255,0.3)'} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
                          {d.product_name && <span>{d.product_name} · </span>}
                          <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{d.tuya_id}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, flexShrink: 0,
                        background: d.already_added ? 'rgba(255,255,255,0.06)' : d.online ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                        color: d.already_added ? 'rgba(255,255,255,0.3)' : d.online ? '#22c55e' : '#ef4444',
                      }}>
                        {d.already_added ? 'Adicionado' : d.online ? 'Online' : 'Offline'}
                      </div>
                    </div>
                  ))}
                  {discovered.some(d => !d.already_added) && (
                    <button type="button" onClick={addSelected} disabled={selectedIds.size === 0 || addingBulk}
                      style={{ marginTop: 12, width: '100%', padding: '10px', background: selectedIds.size > 0 ? '#3B7EFF' : 'rgba(59,126,255,0.15)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: selectedIds.size > 0 ? 'pointer' : 'default', opacity: selectedIds.size === 0 ? 0.5 : 1, transition: 'all .15s' }}>
                      {addingBulk ? 'Adicionando...' : `Adicionar ${selectedIds.size > 0 ? selectedIds.size + ' selecionado' + (selectedIds.size !== 1 ? 's' : '') : 'selecionados'}`}
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Adicionar dispositivo manualmente */}
        <form onSubmit={addDevice} style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Adicionar manualmente</div>

          <div className="login-field" style={{ marginBottom: 10 }}>
            <label>Protocolo</label>
            <select value={newProtocol} onChange={e => setNewProtocol(e.target.value)} className="styled-select">
              <option value="tuya">Tuya</option>
              <option value="zigbee">Zigbee (em breve)</option>
              <option value="matter">Matter (em breve)</option>
              <option value="zwave">Z-Wave (em breve)</option>
            </select>
          </div>
          <div className="login-field" style={{ marginBottom: 10 }}>
            <label>ID do dispositivo</label>
            <input type="text" value={newDeviceId} onChange={e => setNewDeviceId(e.target.value)} placeholder="ex: 710151318cce4e127075" required />
          </div>
          <div className="login-field" style={{ marginBottom: 10 }}>
            <label>Nome</label>
            <input type="text" value={newDeviceName} onChange={e => setNewDeviceName(e.target.value)} placeholder="ex: Interruptor Sala" required />
          </div>
          <div className="login-field" style={{ marginBottom: 16 }}>
            <label>Cômodo (opcional)</label>
            <input type="text" value={newDeviceRoom} onChange={e => setNewDeviceRoom(e.target.value)} placeholder="ex: Sala, Quarto, Cozinha..." />
          </div>
          <button type="submit" className="login-btn">Adicionar Dispositivo</button>
        </form>
      </div>

      {/* Compartilhar casa */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>Compartilhar casa</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 16, lineHeight: 1.5 }}>
          Convide familiares para controlar seus dispositivos. Eles precisam ter uma conta no iHome.
        </div>

        {/* Pessoas com acesso */}
        {shares.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {shares.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{s.guest_email}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>Controle total</div>
                </div>
                <button onClick={() => removeShare(s.id)}
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Formulário de convite */}
        <form onSubmit={inviteGuest} style={{ display: 'flex', gap: 8 }}>
          <input
            type="email"
            value={guestEmail}
            onChange={e => setGuestEmail(e.target.value)}
            placeholder="E-mail do familiar"
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 13, outline: 'none' }}
          />
          <button type="submit" disabled={sharingLoading || !guestEmail.trim()}
            style={{ background: '#3B7EFF', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, flexShrink: 0, opacity: !guestEmail.trim() ? 0.5 : 1 }}>
            {sharingLoading ? '...' : 'Convidar'}
          </button>
        </form>
      </div>

      {/* Casas compartilhadas comigo */}
      {sharedWithMe.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 12 }}>Casas compartilhadas comigo</div>
          {sharedWithMe.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{s.owner_email}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{s.device_count} dispositivo{s.device_count !== 1 ? 's' : ''}</div>
              </div>
              <button onClick={() => leaveSharedHome(s.id)}
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
                Sair
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Notificações Push */}
      {'Notification' in window && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 3 }}>Notificações</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                {pushEnabled
                  ? 'Ativo — você será avisado quando dispositivos ficarem offline.'
                  : 'Receba alertas quando seus dispositivos ficarem offline ou voltarem a funcionar.'}
              </div>
            </div>
            <button
              onClick={toggleNotifications}
              disabled={pushLoading}
              style={{
                background: pushEnabled ? 'rgba(239,68,68,0.12)' : 'rgba(59,126,255,0.15)',
                color: pushEnabled ? '#ef4444' : '#3B7EFF',
                border: `1px solid ${pushEnabled ? 'rgba(239,68,68,0.25)' : 'rgba(59,126,255,0.25)'}`,
                borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontSize: 13,
                fontWeight: 600, flexShrink: 0, minWidth: 90, textAlign: 'center',
              }}>
              {pushLoading ? '...' : pushEnabled ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        </div>
      )}

      {/* Desinstalar app */}
      <UninstallCard />

      {/* Sair da conta */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 3 }}>Conta</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {session?.user?.email}
            </div>
          </div>
          <button onClick={onLogout}
            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sair
          </button>
        </div>
      </div>

      {/* Rodapé com versão */}
      <div style={{ textAlign: 'center', marginTop: 24, paddingBottom: 8 }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.05em' }}>
          iHome Residencial · v0.8.0
        </div>
      </div>
    </div>
  );
}

function UninstallCard() {
  const [show, setShow] = useState(false);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  const steps = isIOS
    ? ['Pressione o botão de compartilhar (quadrado com seta) na barra do Safari.', 'Role para baixo e toque em "Remover da Tela de Início".', 'Confirme tocando em "Remover".']
    : isAndroid
    ? ['Pressione e segure o ícone do iHome na tela inicial.', 'Arraste até "Desinstalar" ou toque em "Remover app".', 'Confirme a remoção.']
    : ['Clique nos 3 pontinhos no canto superior direito do Chrome/Edge.', 'Selecione "iHome Automação Residencial" → "Desinstalar".', 'Confirme clicando em "Remover".'];

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 3 }}>Desinstalar app</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            {isStandalone ? 'App instalado no seu dispositivo.' : 'Remover o atalho instalado.'}
          </div>
        </div>
        <button onClick={() => setShow(!show)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
          {show ? 'Fechar' : 'Como desinstalar'}
        </button>
      </div>
      {show && (
        <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{step}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── AUTOMAÇÕES ────────────────────────────────────────────────
function Automations({ session, devices }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [onTime, setOnTime] = useState('');
  const [offTime, setOffTime] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const headers = { Authorization: `Bearer ${session.access_token}` };

  const load = () => {
    setLoading(true);
    axios.get(`${API}/schedules`, { headers })
      .then(r => setSchedules(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const remove = async id => {
    try {
      await axios.delete(`${API}/schedules/${id}`, { headers });
      setSchedules(s => s.filter(x => x.id !== id));
    } catch { setMsg('Erro ao remover.'); }
  };

  const save = async e => {
    e.preventDefault();
    if (!deviceId) { setMsg('Selecione um dispositivo.'); return; }
    if (!onTime && !offTime) { setMsg('Informe pelo menos um horário.'); return; }
    setSaving(true);
    try {
      const dev = devices.find(d => d.id === deviceId);
      await axios.post(`${API}/ai-command`, {
        command: `cria rotina para ${dev?.name || deviceId}${onTime ? ` ligar às ${onTime}` : ''}${offTime ? ` e desligar às ${offTime}` : ''}`
      }, { headers });
      setShowForm(false); setDeviceId(''); setOnTime(''); setOffTime('');
      load();
    } catch { setMsg('Erro ao criar rotina.'); }
    setSaving(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Automação</div>
          <div className="page-subtitle">{schedules.length} rotina{schedules.length !== 1 ? 's' : ''} ativa{schedules.length !== 1 ? 's' : ''}</div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(59,126,255,0.12)', border: '1px solid rgba(59,126,255,0.25)', borderRadius: 10, padding: '8px 14px', color: '#3B7EFF', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nova rotina
        </button>
      </div>

      {msg && <div className="login-error" style={{ marginBottom: 12 }} onClick={() => setMsg('')}>{msg}</div>}

      {/* Formulário nova rotina */}
      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 14 }}>Nova rotina de agendamento</div>
          <form onSubmit={save}>
            <div className="login-field" style={{ marginBottom: 10 }}>
              <label>Dispositivo</label>
              <select value={deviceId} onChange={e => setDeviceId(e.target.value)} className="styled-select" required>
                <option value="">Selecione um dispositivo...</option>
                {devices.map(d => <option key={d.id} value={d.id}>{d.name}{d.room ? ` — ${d.room}` : ''}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div className="login-field">
                <label>Ligar às</label>
                <input type="time" value={onTime} onChange={e => setOnTime(e.target.value)} style={{ background: '#141929', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none', width: '100%' }} />
              </div>
              <div className="login-field">
                <label>Desligar às</label>
                <input type="time" value={offTime} onChange={e => setOffTime(e.target.value)} style={{ background: '#141929', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14, outline: 'none', width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="login-btn" style={{ flex: 1, marginTop: 0 }} disabled={saving}>{saving ? 'Salvando...' : 'Criar rotina'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de rotinas */}
      {loading ? (
        <div className="loading">Carregando rotinas...</div>
      ) : schedules.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ margin: '0 auto 16px', opacity: 0.25, lineHeight: 0, width: 'fit-content' }}>
            <svg viewBox="0 0 24 24" style={{ width: 44, height: 44, display: 'block', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Nenhuma rotina criada</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 24 }}>Crie uma rotina acima ou use o assistente para criar por voz.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {schedules.map(s => (
            <div className="auto-card" key={s.id}>
              <div className="auto-icon-wrap" style={{ background: 'rgba(59,126,255,0.12)' }}>
                <div style={{ width: 22, height: 22, color: '#3B7EFF' }}>{Icons.automations}</div>
              </div>
              <div className="auto-info">
                <div className="auto-name">{s.device_name}</div>
                <div className="auto-desc">
                  {s.on_time && `Liga às ${s.on_time}`}
                  {s.on_time && s.off_time && ' · '}
                  {s.off_time && `Desliga às ${s.off_time}`}
                </div>
              </div>
              <button onClick={() => remove(s.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ALERTAS ───────────────────────────────────────────────────
function Alerts({ session }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${session.access_token}` };

  const load = () => {
    setLoading(true);
    axios.get(`${API}/alerts`, { headers })
      .then(r => setAlerts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    axios.put(`${API}/alerts/read-all`, {}, { headers }).catch(() => {});
  }, []); // eslint-disable-line

  const clearAll = async () => {
    await axios.delete(`${API}/alerts`, { headers }).catch(() => {});
    setAlerts([]);
  };

  const typeConfig = {
    offline: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  label: 'Dispositivo offline' },
    online:  { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  label: 'Dispositivo online'  },
  };

  const formatTime = ts => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'agora';
    if (diff < 3600000) return `${Math.floor(diff/60000)}min`;
    if (diff < 86400000) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Alertas</div>
          <div className="page-subtitle">{alerts.length} registro{alerts.length !== 1 ? 's' : ''}</div>
        </div>
        {alerts.length > 0 && (
          <button onClick={clearAll} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
            Limpar tudo
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Carregando alertas...</div>
      ) : alerts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ margin: '0 auto 16px', opacity: 0.25, lineHeight: 0, width: 'fit-content' }}>
            <svg viewBox="0 0 24 24" style={{ width: 44, height: 44, display: 'block', flexShrink: 0 }} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Nenhum alerta</div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Os dispositivos estão sendo monitorados. Alertas de conexão aparecerão aqui.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alerts.map(a => {
            const cfg = typeConfig[a.type] || { color: '#3B7EFF', bg: 'rgba(59,126,255,0.1)', label: a.type };
            return (
              <div className="alert-card" key={a.id} style={{ opacity: a.read ? 0.6 : 1 }}>
                <div className="alert-icon-wrap" style={{ background: cfg.bg }}>
                  <div style={{ width: 17, height: 17, color: cfg.color }}>{Icons.alerts}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="alert-title" style={{ color: cfg.color }}>{cfg.label}</div>
                  <div className="alert-loc">{a.device_name}</div>
                </div>
                <span className="alert-time">{formatTime(a.created_at)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── CÂMERAS ───────────────────────────────────────────────────
function Cameras({ devices }) {
  const cams = devices.filter(d => d.category_name?.toLowerCase().includes('camera'));
  const fallback = [{ id:'c1', name:'Câmera Entrada', online:true },{ id:'c2', name:'Câmera Garagem', online:false },{ id:'c3', name:'Câmera Jardim', online:true },{ id:'c4', name:'Câmera Sala', online:true }];
  const list = cams.length > 0 ? cams : fallback;
  return (
    <div className="page">
      <div className="page-title" style={{ marginBottom: 16 }}>Câmeras</div>
      <div className="grid-2">
        {list.map(c => (
          <div className="card" style={{ padding: 12 }} key={c.id}>
            <div className="cam-preview">
              <DeviceIcon category="camera" size={32} color="rgba(255,255,255,0.2)" />
              {c.online && <span className="live-badge">LIVE</span>}
            </div>
            <div className="cam-name">{c.name}</div>
            <div className="cam-status" style={{ color: c.online?'#22c55e':'#ef4444' }}>{c.online?'Online':'Offline'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STATUS ────────────────────────────────────────────────────
function Status({ devices }) {
  const online = devices.filter(d => d.online).length;
  const total = devices.length;
  const devScore = total > 0 ? Math.round((online/total)*100) : 0;
  const stats = [
    { icon: Icons.alerts,  color: 'rgba(34,197,94,0.12)',   name: 'Segurança',    sub: 'Todos os sistemas normais.',                        score: 90        },
    { icon: Icons.devices, color: 'rgba(234,179,8,0.12)',   name: 'Energia',      sub: 'Consumo dentro da média.',                          score: 85        },
    { icon: Icons.status,  color: 'rgba(59,126,255,0.12)',  name: 'Dispositivos', sub: `${online} de ${total} dispositivos online.`,         score: devScore  },
    { icon: Icons.status,  color: 'rgba(20,220,160,0.10)',  name: 'Ambiente',     sub: 'Temperatura e qualidade do ar adequadas.',           score: 90        },
  ];
  const geral = Math.round(stats.reduce((a,s) => a+s.score,0)/stats.length);
  return (
    <div className="page">
      <div className="page-title" style={{ marginBottom: 16 }}>Status da Instalação</div>
      <div className="card score-card" style={{ marginBottom: 14 }}>
        <div className="score-num">{geral}<span className="score-den">/100</span></div>
        <div className="score-label">Excelente</div>
        <div className="score-desc">Sua instalação está em ótimo estado.</div>
      </div>
      <div className="card">
        {stats.map(s => (
          <div className="stat-row" key={s.name}>
            <div className="stat-icon" style={{ background: s.color }}>
              <div style={{ width: 17, height: 17 }}>{s.icon}</div>
            </div>
            <div className="stat-info"><div className="stat-name">{s.name}</div><div className="stat-sub">{s.sub}</div></div>
            <span className="stat-score">{s.score}/100</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── LOGO SIMPLIFICADA (para bolha flutuante) ──────────────────
function IHomeBubbleIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Pilar teal */}
      <rect x="8" y="6" width="11" height="38" rx="1" fill="#00C4CC"/>
      {/* Telhado branco em V */}
      <polyline points="4,22 24,6 44,22" stroke="white" strokeWidth="5" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      {/* Pilar direito branco */}
      <rect x="29" y="22" width="11" height="22" rx="1" fill="white"/>
      {/* Crossbar H branco */}
      <rect x="19" y="30" width="21" height="7" rx="1" fill="white"/>
    </svg>
  );
}

// ── ASSISTENTE IA (BOLHA FLUTUANTE) ───────────────────────────
function FloatingAssistant({ session }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Olá! Sou o assistente iHome. Diga o que deseja fazer, como "liga a luz da sala" ou "cria rotina para ligar a tomada às 14h e desligar às 20h".' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const bottomRef = useRef(null);
  const headers = { Authorization: `Bearer ${session.access_token}` };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  useEffect(() => {
    if (open) axios.get(`${API}/schedules`, { headers }).then(r => setSchedules(r.data)).catch(() => {});
  }, [open]); // eslint-disable-line

  const sendCommand = async (text) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const r = await axios.post(`${API}/ai-command`, { command: text }, { headers });
      setMessages(prev => [...prev, { role: 'assistant', text: r.data.message || r.data.error }]);
      axios.get(`${API}/schedules`, { headers }).then(r => setSchedules(r.data)).catch(() => {});
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Não consegui processar o comando. Tente novamente.' }]);
    }
    setLoading(false);
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Reconhecimento de voz não disponível. Use Chrome ou Edge.'); return; }
    const r = new SR();
    r.lang = 'pt-BR';
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = e => { const t = e.results[0][0].transcript; setInput(t); sendCommand(t); };
    r.start();
  };

  const removeSchedule = async id => {
    try {
      await axios.delete(`${API}/schedules/${id}`, { headers });
      setSchedules(schedules.filter(s => s.id !== id));
    } catch {}
  };

  return (
    <>
      {open && (
        <div className="assistant-overlay" onClick={() => setOpen(false)}>
          <div className="assistant-panel" onClick={e => e.stopPropagation()}>
            <div className="assistant-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IHomeBubbleIcon size={28} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Assistente iHome</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Voz ou texto</div>
                </div>
              </div>
              <button className="assistant-close" onClick={() => setOpen(false)}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {schedules.length > 0 && (
              <div className="assistant-schedules">
                <div className="assistant-schedules-title">Rotinas ativas</div>
                {schedules.map(s => (
                  <div key={s.id} className="assistant-schedule-row">
                    <div>
                      <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{s.device_name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                        {s.on_time && `Liga ${s.on_time}`}{s.on_time && s.off_time && ' · '}{s.off_time && `Desliga ${s.off_time}`}
                      </div>
                    </div>
                    <button onClick={() => removeSchedule(s.id)} className="schedule-remove-btn">×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
              ))}
              {loading && <div className="chat-bubble assistant"><span className="chat-dots"><span/><span/><span/></span></div>}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-row">
              <input
                className="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendCommand(input)}
                placeholder="Digite um comando..."
                disabled={loading}
                autoFocus
              />
              <button className={`chat-mic${listening ? ' listening' : ''}`} onClick={startVoice} disabled={loading} title="Falar">
                {Icons.assistant}
              </button>
              <button className="chat-send" onClick={() => sendCommand(input)} disabled={loading || !input.trim()}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button className={`fab${open ? ' fab-open' : ''}`} onClick={() => setOpen(!open)} title="Assistente iHome">
        {open
          ? <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <IHomeBubbleIcon size={30} />
        }
      </button>
    </>
  );
}

// ── APP PRINCIPAL ─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tuyaConfigured, setTuyaConfigured] = useState(true);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [inviteToast, setInviteToast] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    // Verifica parâmetro ?invite= na URL (vindo do e-mail de convite)
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite === 'accepted') {
      setInviteToast({ type: 'success', msg: '✅ Convite aceito! Você agora tem acesso à casa.' });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (invite === 'declined') {
      setInviteToast({ type: 'info', msg: 'Convite recusado.' });
      window.history.replaceState({}, '', window.location.pathname);
    } else if (invite === 'invalid') {
      setInviteToast({ type: 'error', msg: 'Este convite já foi usado ou expirou.' });
      window.history.replaceState({}, '', window.location.pathname);
    }
    return () => subscription.unsubscribe();
  }, []);

  const fetchDevices = (token) => {
    axios.get(`${API}/devices`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setDevices(r.data?.result?.list || []); setTuyaConfigured(true); })
      .catch(err => {
        if (err.response?.status === 400) { setTuyaConfigured(false); setDevices([]); }
        else console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!session) return;
    const token = session.access_token;
    fetchDevices(token);
    const interval = setInterval(() => fetchDevices(token), 30000);
    // Verifica alertas não lidos a cada 2 minutos
    const checkAlerts = () => {
      axios.get(`${API}/alerts`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setUnreadAlerts(r.data.filter(a => !a.read).length))
        .catch(() => {});
    };
    checkAlerts();
    const alertInterval = setInterval(checkAlerts, 2 * 60 * 1000);
    return () => { clearInterval(interval); clearInterval(alertInterval); };
  }, [session]);

  const handleToggle = async (id, currentlyOn, ownerEmail) => {
    try {
      const body = { commands: [{ code: 'switch_1', value: !currentlyOn }] };
      if (ownerEmail && ownerEmail !== session.user.email) body.owner_email = ownerEmail;
      await axios.post(`${API}/devices/${id}/command`, body,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      setTimeout(() => fetchDevices(session.access_token), 1500);
    } catch(e) { console.error(e); }
  };

  const handleLogout = () => supabase.auth.signOut();

  if (authLoading) return (
    <div style={{ background: '#0B0F19', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
      Carregando...
    </div>
  );
  if (!session) return <Login />;

  return (
    <div className="app">
      {inviteToast && (
        <div style={{
          position:'fixed', top:20, left:'50%', transform:'translateX(-50%)',
          background: inviteToast.type==='success' ? '#166534' : inviteToast.type==='error' ? '#7f1d1d' : '#1e3a5f',
          color:'#fff', padding:'12px 24px', borderRadius:12, zIndex:9999,
          boxShadow:'0 4px 20px rgba(0,0,0,0.4)', fontSize:14, maxWidth:340, textAlign:'center'
        }}>
          {inviteToast.msg}
          <button onClick={() => setInviteToast(null)} style={{ marginLeft:12, background:'none', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:16 }}>✕</button>
        </div>
      )}
      <Sidebar page={page} setPage={setPage} user={session.user} onLogout={handleLogout} unreadAlerts={unreadAlerts} />
      <div className="main">
        {page==='dashboard'   && <Dashboard    devices={devices} setPage={setPage} session={session} />}
        {page==='devices'     && <Devices      devices={devices} loading={loading} onToggle={handleToggle} tuyaConfigured={tuyaConfigured} setPage={setPage} />}
        {page==='automations' && <Automations session={session} devices={devices} />}
        {page==='alerts'      && <Alerts session={session} />}
        {page==='cameras'     && <Cameras devices={devices} />}
        {page==='status'      && <Status   devices={devices} />}
        {page==='help'        && <Help />}
        {page==='settings'    && <Settings session={session} onLogout={handleLogout} />}
      </div>
      <BottomNav page={page} setPage={setPage} unreadAlerts={unreadAlerts} />
      <FloatingAssistant session={session} />
    </div>
  );
}
