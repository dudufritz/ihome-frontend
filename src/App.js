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
function Sidebar({ page, setPage, user, onLogout }) {
  const items = [
    { id: 'dashboard',   label: 'Visão Geral',   icon: Icons.dashboard   },
    { id: 'devices',     label: 'Dispositivos',  icon: Icons.devices     },
    { id: 'automations', label: 'Automação',     icon: Icons.automations },
    { id: 'alerts',      label: 'Alertas',       icon: Icons.alerts      },
    { id: 'cameras',     label: 'Câmeras',       icon: Icons.cameras     },
    { id: 'status',      label: 'Status',        icon: Icons.status      },
    { id: 'settings',    label: 'Configurações', icon: Icons.settings    },
  ];
  return (
    <div className="sidebar">
      <SidebarLogo />
      {items.map(i => (
        <button key={i.id} className={`nav-item ${page===i.id?'active':''}`} onClick={() => setPage(i.id)}>
          <span className="nav-icon">{i.icon}</span>{i.label}
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
function BottomNav({ page, setPage }) {
  const items = [
    { id: 'dashboard',   label: 'Início',       icon: Icons.dashboard   },
    { id: 'devices',     label: 'Dispositivos', icon: Icons.devices     },
    { id: 'automations', label: 'Automação',    icon: Icons.automations },
    { id: 'alerts',      label: 'Alertas',      icon: Icons.alerts      },
    { id: 'settings',    label: 'Config.',      icon: Icons.settings    },
  ];
  return (
    <nav className="bottom-nav">
      {items.map(i => (
        <button key={i.id} className={`bottom-nav-item ${page===i.id?'active':''}`} onClick={() => setPage(i.id)}>
          {i.icon}
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
function Dashboard({ devices, setPage }) {
  const [scenes, setScenes] = useState([
    { key: 'casa',   name: 'Casa',   label: 'Em casa'  },
    { key: 'dormir', name: 'Dormir', label: 'Descanso' },
    { key: 'fora',   name: 'Fora',   label: 'Ausente'  },
    { key: 'cinema', name: 'Cinema', label: 'Cinema'   },
  ]);
  const [activeScene, setActiveScene] = useState('casa');
  const online = devices.filter(d => d.online).length;
  const favs = devices.filter(d => d.online).slice(0, 3);
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Painel Principal</div>
          <div className="page-subtitle">Tudo seguro e funcionando.</div>
        </div>
      </div>

      {/* Status geral */}
      <div className="house-status" style={{ marginBottom: 20 }}>
        <div className="house-status-text">
          <h3>Tudo seguro</h3>
          <p>Nenhum risco detectado no momento.</p>
        </div>
        <div className="shield" style={{ background: 'rgba(34,197,94,0.12)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
      </div>

      {/* Cenários */}
      <div className="section-hd"><span className="section-title">Cenários</span><button className="section-link">Editar</button></div>
      <div className="scene-grid" style={{ marginBottom: 20 }}>
        {scenes.map(s => (
          <div key={s.key} className={`scene-card ${activeScene===s.key?'active':''}`} onClick={() => setActiveScene(s.key)}>
            <div className="scene-name" style={{ color: activeScene===s.key?'#fff':'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 700 }}>{s.name}</div>
            <div className="scene-status" style={{ color: activeScene===s.key?'#3B7EFF':'rgba(255,255,255,0.22)', fontSize: 10, marginTop: 4 }}>{activeScene===s.key?'Ativo':s.label}</div>
          </div>
        ))}
      </div>

      {/* Favoritos */}
      <div className="section-hd">
        <span className="section-title">Dispositivos Online</span>
        <button className="section-link" onClick={() => setPage('devices')}>Ver todos</button>
      </div>
      <div className="grid-3" style={{ marginBottom: 20 }}>
        {favs.map(d => (
          <div className="card" key={d.id} style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <DeviceIcon category={d.category_name} size={22} color="#3B7EFF" />
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
            <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, marginTop: 3 }}>Online</div>
          </div>
        ))}
        {favs.length === 0 && (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13, padding: 20 }}>
            Nenhum dispositivo online no momento.
          </div>
        )}
      </div>

      {/* Métricas */}
      <div className="grid-4">
        <div className="card"><div className="card-label">Dispositivos</div><div className="card-value">{devices.length}</div><div className="card-sub">{online} online</div></div>
        <div className="card"><div className="card-label">Consumo hoje</div><div className="card-value" style={{fontSize:18}}>12,4 kWh</div><div className="card-sub">15% abaixo da média</div></div>
        <div className="card"><div className="card-label">Temperatura</div><div className="card-value">23°C</div><div className="card-sub">Confortável</div></div>
        <div className="card"><div className="card-label">Segurança</div><div className="badge-safe">Ativa</div></div>
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

  if (loading) return <div className="loading">Carregando dispositivos...</div>;

  if (!tuyaConfigured) {
    return (
      <div className="page">
        <div className="page-header"><div className="page-title">Dispositivos</div></div>
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, opacity: 0.3 }}>
            {Icons.settings}
          </div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Credenciais não configuradas</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 24 }}>
            Para ver e controlar seus dispositivos, configure suas credenciais em Configurações.
          </div>
          <button className="login-btn" onClick={() => setPage('settings')} style={{ maxWidth: 200, margin: '0 auto' }}>
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
        <button onClick={() => setPage('settings')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(59,126,255,0.12)', border: '1px solid rgba(59,126,255,0.25)', borderRadius: 10, padding: '8px 14px', color: '#3B7EFF', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adicionar
        </button>
      </div>
      <div className="tabs">{tabs.map(t => <button key={t} className={`tab ${filter===t?'active':''}`} onClick={() => setFilter(t)}>{t}</button>)}</div>
      {filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 28, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
          Nenhum dispositivo encontrado. Adicione em Configurações.
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

// ── CONFIGURAÇÕES ─────────────────────────────────────────────
function Settings({ session }) {
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

  const headers = { Authorization: `Bearer ${session.access_token}` };

  const showMsg = (text, type = 'success') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 4000); };

  useEffect(() => {
    axios.get(`${API}/tuya-credentials`, { headers })
      .then(r => {
        setConfigured(r.data.configured);
        if (r.data.configured) setAccessId(r.data.tuya_access_id || '');
      }).catch(console.error);
    axios.get(`${API}/my-devices`, { headers })
      .then(r => setMyDevices(r.data)).catch(console.error);
  }, []); // eslint-disable-line

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

        {/* Adicionar dispositivo */}
        <form onSubmit={addDevice} style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Adicionar dispositivo</div>

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
    </div>
  );
}

// ── AUTOMAÇÕES ────────────────────────────────────────────────
function Automations() {
  const [items, setItems] = useState([
    { key: 'sunset',   name: 'Luzes ao anoitecer', desc: 'Liga as luzes externas quando escurece.',             color: '#a78bfa', enabled: true  },
    { key: 'sleep',    name: 'Modo Descanso',       desc: 'Desliga luzes e ativa sensores de segurança.',        color: '#818cf8', enabled: true  },
    { key: 'smoke',    name: 'Alerta de Fumaça',    desc: 'Envia notificação ao detectar fumaça.',               color: '#ef4444', enabled: true  },
    { key: 'presence', name: 'Simular Presença',    desc: 'Liga e desliga luzes para simular presença em casa.', color: '#94a3b8', enabled: false },
  ]);
  const toggle = key => setItems(items.map(i => i.key===key ? {...i, enabled:!i.enabled} : i));
  return (
    <div className="page">
      <div className="page-header"><div className="page-title">Automação</div></div>
      <div className="tabs"><button className="tab active">Todas</button><button className="tab">Ativas</button><button className="tab">Inativas</button></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(a => (
          <div className="auto-card" key={a.key}>
            <div className="auto-icon-wrap" style={{ background: `${a.color}18` }}>
              <div style={{ width: 22, height: 22 }}>{Icons.automations}</div>
            </div>
            <div className="auto-info">
              <div className="auto-name">{a.name}</div>
              <div className="auto-desc">{a.desc}</div>
            </div>
            <Toggle on={a.enabled} onClick={() => toggle(a.key)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ALERTAS ───────────────────────────────────────────────────
function Alerts() {
  const today = [
    { id:1, type:'Fumaça detectada',  where:'Cozinha', time:'10:32', color:'#ef4444', bg:'rgba(239,68,68,0.1)'   },
    { id:2, type:'Consumo elevado',   where:'Sala',    time:'08:15', color:'#eab308', bg:'rgba(234,179,8,0.1)'   },
    { id:3, type:'Porta aberta',      where:'Entrada', time:'07:45', color:'#3B7EFF', bg:'rgba(59,126,255,0.1)'  },
  ];
  const yesterday = [
    { id:4, type:'Dispositivo offline', where:'Garagem', time:'22:15', color:'rgba(255,255,255,0.3)', bg:'rgba(255,255,255,0.05)' },
  ];
  const Card = ({ a }) => (
    <div className="alert-card" style={{ marginBottom: 8 }}>
      <div className="alert-icon-wrap" style={{ background: a.bg }}>
        <div style={{ width: 17, height: 17, color: a.color }}>{Icons.alerts}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div className="alert-title" style={{ color: a.color }}>{a.type}</div>
        <div className="alert-loc">{a.where}</div>
      </div>
      <span className="alert-time">{a.time}</span>
    </div>
  );
  return (
    <div className="page">
      <div className="page-header"><div className="page-title">Alertas</div></div>
      <div className="tabs"><button className="tab active">Todos</button><button className="tab">Críticos</button><button className="tab">Informativos</button></div>
      <div className="day-label">Hoje</div>
      {today.map(a => <Card key={a.id} a={a} />)}
      <div className="day-label">Ontem</div>
      {yesterday.map(a => <Card key={a.id} a={a} />)}
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
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
    return () => clearInterval(interval);
  }, [session]);

  const handleToggle = async (id, currentlyOn) => {
    try {
      await axios.post(`${API}/devices/${id}/command`,
        { commands: [{ code: 'switch_1', value: !currentlyOn }] },
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
      <Sidebar page={page} setPage={setPage} user={session.user} onLogout={handleLogout} />
      <div className="main">
        {page==='dashboard'   && <Dashboard    devices={devices} setPage={setPage} />}
        {page==='devices'     && <Devices      devices={devices} loading={loading} onToggle={handleToggle} tuyaConfigured={tuyaConfigured} setPage={setPage} />}
        {page==='automations' && <Automations />}
        {page==='alerts'      && <Alerts />}
        {page==='cameras'     && <Cameras devices={devices} />}
        {page==='status'      && <Status   devices={devices} />}
        {page==='settings'    && <Settings session={session} />}
      </div>
      <BottomNav page={page} setPage={setPage} />
      <FloatingAssistant session={session} />
    </div>
  );
}
