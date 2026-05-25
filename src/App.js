import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from './supabase';
import './App.css';

const API = 'https://dudufritzs-projects-production.up.railway.app';

const ICON_MAP = {
  'detector de inundação': '💧', 'flooding': '💧', 'vazamento': '💧',
  'interruptor': '💡', 'switch': '💡', 'luz': '💡', 'light': '💡',
  'tomada': '🔌', 'socket': '🔌', 'plug': '🔌',
  'câmera': '📷', 'camera': '📷',
  'ar condicionado': '❄️', 'air condition': '❄️',
  'sensor de porta': '🚪', 'door': '🚪', 'contact': '🚪',
  'fumaça': '🔥', 'smoke': '🔥',
  'movimento': '👁️', 'motion': '👁️',
  'infravermelho': '📺', 'infrared': '📺', 'decodificador': '📺', 'tv': '📺',
  'temperatura': '🌡️', 'thermostat': '🌡️',
  'gateway': '🌐', 'portal': '🌐',
  'disjuntor': '⚡', 'breaker': '⚡',
  'portão': '🚗',
  'controle remoto': '🎮', 'universal': '🎮',
};

const COLOR_MAP = {
  'detector de inundação': '#3B7EFF', 'flooding': '#3B7EFF',
  'interruptor': '#eab308', 'luz': '#eab308', 'switch': '#eab308',
  'tomada': '#fb923c', 'socket': '#fb923c',
  'câmera': '#a78bfa', 'camera': '#a78bfa',
  'ar condicionado': '#38bdf8',
  'sensor de porta': '#22c55e', 'door': '#22c55e', 'contact': '#22c55e',
  'fumaça': '#ef4444', 'smoke': '#ef4444',
  'infravermelho': '#94a3b8', 'decodificador': '#94a3b8',
  'portão': '#f97316', 'breaker': '#f97316',
};

function getIcon(cat) {
  if (!cat) return '📱';
  const c = cat.toLowerCase();
  for (const [key, val] of Object.entries(ICON_MAP)) if (c.includes(key)) return val;
  return '📱';
}
function getColor(cat) {
  if (!cat) return '#3B7EFF';
  const c = cat.toLowerCase();
  for (const [key, val] of Object.entries(COLOR_MAP)) if (c.includes(key)) return val;
  return '#3B7EFF';
}
function isTogglable(cat) {
  if (!cat) return false;
  const c = cat.toLowerCase();
  return ['interruptor','switch','tomada','socket','luz','light','ar condicionado','disjuntor','breaker'].some(k => c.includes(k));
}

function Toggle({ on, onClick }) {
  return (
    <button className={`toggle ${on ? 'on' : 'off'}`} onClick={e => { e.stopPropagation(); onClick(); }}>
      <div className="toggle-dot" />
    </button>
  );
}

// ── LOGIN ─────────────────────────────────────────────────
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
    v = v.replace(/\D/g,'');
    if (v.length <= 3) return v;
    if (v.length <= 6) return v.slice(0,3)+'.'+v.slice(3);
    if (v.length <= 9) return v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6);
    return v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6,9)+'-'+v.slice(9,11);
  };

  const formatPhone = v => {
    v = v.replace(/\D/g,'');
    if (v.length <= 2) return v;
    if (v.length <= 7) return '('+v.slice(0,2)+') '+v.slice(2);
    return '('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7,11);
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Email ou senha incorretos.');
    setLoading(false);
  };

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    if (cpf.replace(/\D/g,'').length !== 11) { setError('CPF inválido.'); setLoading(false); return; }
    if (phone.replace(/\D/g,'').length < 10) { setError('Telefone inválido.'); setLoading(false); return; }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone.replace(/\D/g,''),
          cpf: cpf.replace(/\D/g,''),
        }
      }
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess('Conta criada! Verifique seu email para confirmar o cadastro.');
    setLoading(false);
  };

  const handleForgot = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) setError(error.message);
    else setSuccess('Email de redefinição enviado! Verifique sua caixa de entrada.');
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <div className="logo-icon">🏠</div>
          <span className="logo-text">iHome</span>
        </div>
        <div className="login-subtitle">
          {mode === 'login'    && 'Sua casa inteligente. Sua vida mais segura.'}
          {mode === 'register' && 'Crie sua conta para começar.'}
          {mode === 'forgot'   && 'Informe seu email para redefinir a senha.'}
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleForgot} className="login-form">
          {mode === 'register' && (
            <div className="login-field">
              <label>Nome completo</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome completo" required />
            </div>
          )}
          <div className="login-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>
          {mode === 'register' && (
            <>
              <div className="login-field">
                <label>CPF</label>
                <input type="text" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} required />
              </div>
              <div className="login-field">
                <label>Telefone</label>
                <input type="text" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} required />
              </div>
            </>
          )}
          {mode !== 'forgot' && (
            <div className="login-field">
              <label>Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
          )}
          {error   && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Enviar email'}
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

// ── SIDEBAR ───────────────────────────────────────────────
function Sidebar({ page, setPage, user, onLogout }) {
  const items = [
    { id: 'dashboard',   label: 'Visão Geral',  icon: '⊞' },
    { id: 'devices',     label: 'Dispositivos', icon: '⚡' },
    { id: 'automations', label: 'Automação',    icon: '⚙️' },
    { id: 'alerts',      label: 'Alertas',      icon: '🔔' },
    { id: 'cameras',     label: 'Câmeras',      icon: '📷' },
    { id: 'status',      label: 'Status',       icon: '📊' },
    { id: 'settings',    label: 'Configurações',icon: '🔑' },
  ];
  return (
    <div className="sidebar">
      <div className="logo">
        <div className="logo-icon">🏠</div>
        <span className="logo-text">iHome</span>
      </div>
      {items.map(i => (
        <button key={i.id} className={`nav-item ${page===i.id?'active':''}`} onClick={() => setPage(i.id)}>
          <span className="nav-icon">{i.icon}</span>{i.label}
        </button>
      ))}
      <div style={{marginTop:'auto'}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.25)',padding:'8px 12px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</div>
        <button className="nav-item" onClick={onLogout} style={{color:'#ef4444'}}>
          <span className="nav-icon">🚪</span>Sair
        </button>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ devices, setPage }) {
  const [scenes, setScenes] = useState([
    { key:'casa',   name:'Casa',   icon:'🏠', active:true  },
    { key:'dormir', name:'Dormir', icon:'🌙', active:false },
    { key:'fora',   name:'Fora',   icon:'💼', active:false },
    { key:'cinema', name:'Cinema', icon:'📺', active:false },
  ]);
  const online = devices.filter(d => d.online).length;
  const favs = devices.filter(d => d.online).slice(0, 3);
  const activateScene = key => setScenes(s => s.map(x => ({...x, active: x.key===key})));
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Olá, Dudu! 👋</div>
          <div className="page-subtitle">Tudo seguro e funcionando bem.</div>
        </div>
        <div className="icon-btn">🔔</div>
      </div>
      <div className="house-status">
        <div className="house-status-text"><h3>Tudo seguro</h3><p>Nenhum risco detectado no momento.</p></div>
        <div className="shield">✅</div>
      </div>
      <div className="section-hd"><span className="section-title">Cenários</span><button className="section-link">Editar</button></div>
      <div className="scene-grid">
        {scenes.map(s => (
          <div key={s.key} className={`scene-card ${s.active?'active':''}`} onClick={() => activateScene(s.key)}>
            <span className="scene-icon">{s.icon}</span>
            <div className="scene-name" style={{color:s.active?'#fff':'rgba(255,255,255,0.4)'}}>{s.name}</div>
            <div className="scene-status" style={{color:s.active?'#3B7EFF':'rgba(255,255,255,0.25)'}}>{s.active?'Ativo':'Inativo'}</div>
          </div>
        ))}
      </div>
      <div className="section-hd"><span className="section-title">Dispositivos Favoritos</span><button className="section-link" onClick={() => setPage('devices')}>Ver todos</button></div>
      <div className="grid-3" style={{marginBottom:16}}>
        {favs.map(d => (
          <div className="card" key={d.id} style={{textAlign:'center',padding:14}}>
            <div style={{fontSize:26,marginBottom:6}}>{getIcon(d.category_name)}</div>
            <div style={{fontSize:12,fontWeight:600,color:'#fff',marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</div>
            <div style={{fontSize:11,color:getColor(d.category_name),fontWeight:600}}>Online</div>
          </div>
        ))}
      </div>
      <div className="grid-4">
        <div className="card"><div className="card-label">Dispositivos</div><div className="card-value">{devices.length}</div><div className="card-sub">{online} online</div></div>
        <div className="card"><div className="card-label">Consumo hoje</div><div className="card-value" style={{fontSize:18}}>12,4 kWh</div><div className="card-sub">15% abaixo da média</div></div>
        <div className="card"><div className="card-label">Temperatura</div><div className="card-value">23°C</div><div className="card-sub">Confortável</div></div>
        <div className="card"><div className="card-label">Segurança</div><div className="badge-safe">Ativa</div></div>
      </div>
    </div>
  );
}

// ── DEVICES ───────────────────────────────────────────────
function Devices({ devices, loading, onToggle, tuyaConfigured, setPage }) {
  const [filter, setFilter] = useState('Todos');
  const tabs = ['Todos','Sala','Quarto','Cozinha','Externa'];
  const filtered = filter === 'Todos' ? devices : devices.filter(d => d.name?.toLowerCase().includes(filter.toLowerCase()) || d.room?.toLowerCase().includes(filter.toLowerCase()));

  if (loading) return <div className="loading">⏳ Carregando dispositivos...</div>;

  if (!tuyaConfigured) {
    return (
      <div className="page">
        <div className="page-header"><div className="page-title">Dispositivos</div></div>
        <div className="card" style={{textAlign:'center',padding:32}}>
          <div style={{fontSize:40,marginBottom:12}}>🔑</div>
          <div style={{color:'#fff',fontWeight:700,fontSize:16,marginBottom:8}}>Credenciais Tuya não configuradas</div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:13,marginBottom:20}}>
            Para ver e controlar seus dispositivos, você precisa cadastrar suas credenciais Tuya primeiro.
          </div>
          <button className="login-btn" onClick={() => setPage('settings')} style={{maxWidth:200,margin:'0 auto'}}>
            Ir para Configurações
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Dispositivos</div><div className="page-subtitle">{devices.filter(d=>d.online).length} de {devices.length} online</div></div>
        <div className="header-actions"><div className="icon-btn">🔍</div></div>
      </div>
      <div className="tabs">{tabs.map(t => <button key={t} className={`tab ${filter===t?'active':''}`} onClick={() => setFilter(t)}>{t}</button>)}</div>
      {filtered.length === 0 && (
        <div className="card" style={{textAlign:'center',padding:24,color:'rgba(255,255,255,0.4)'}}>
          Nenhum dispositivo encontrado. Adicione dispositivos em Configurações.
        </div>
      )}
      <div className="grid-3">
        {filtered.map(d => {
          const color = getColor(d.category_name);
          const on = d.isControllable ? d.switch_1 === true : d.online===true;
          const canToggle = isTogglable(d.category_name) || d.isControllable;
          return (
            <div className="device-card" key={d.id}>
              <div className="dev-icon-wrap" style={{background: on ? `${color}22` : 'rgba(255,255,255,0.05)'}}>
                <span style={{fontSize:20}}>{getIcon(d.category_name)}</span>
              </div>
              <div className="dev-name">{d.name}</div>
              <div className="dev-category">{d.category_name}</div>
              <div className="dev-footer">
                <span className={`status-badge ${on?'on':'off'}`}>{on?'Ligado':'Desligado'}</span>
                {canToggle && <Toggle on={on} onClick={() => onToggle(d.id, on)} />}
                {!canToggle && <span className={`status-badge ${d.online?'on':'off'}`}>{d.online?'Online':'Offline'}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── CONFIGURAÇÕES ─────────────────────────────────────────
function Settings({ session }) {
  const [accessId, setAccessId] = useState('');
  const [accessSecret, setAccessSecret] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://openapi.tuyaus.com');
  const [configured, setConfigured] = useState(false);
  const [myDevices, setMyDevices] = useState([]);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceRoom, setNewDeviceRoom] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  const headers = { Authorization: `Bearer ${session.access_token}` };

  useEffect(() => {
    // Verifica se já tem credenciais salvas
    axios.get(`${API}/tuya-credentials`, { headers })
      .then(r => {
        setConfigured(r.data.configured);
        if (r.data.configured) {
          setAccessId(r.data.tuya_access_id || '');
          setBaseUrl(r.data.tuya_base_url || 'https://openapi.tuyaus.com');
        }
      })
      .catch(console.error);

    // Carrega os dispositivos cadastrados
    axios.get(`${API}/my-devices`, { headers })
      .then(r => setMyDevices(r.data))
      .catch(console.error);
  }, []); // eslint-disable-line

  const showMsg = (text, type = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const saveCredentials = async e => {
    e.preventDefault();
    if (!accessSecret && !configured) {
      showMsg('Por favor, informe o Access Secret.', 'error');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/tuya-credentials`, {
        tuya_access_id: accessId,
        tuya_secret: accessSecret,
        tuya_base_url: baseUrl
      }, { headers });
      setConfigured(true);
      setAccessSecret('');
      showMsg('✅ Credenciais salvas com sucesso!');
    } catch (err) {
      showMsg('❌ Erro ao salvar: ' + (err.response?.data?.error || err.message), 'error');
    }
    setLoading(false);
  };

  const addDevice = async e => {
    e.preventDefault();
    try {
      const r = await axios.post(`${API}/my-devices`, {
        tuya_id: newDeviceId.trim(),
        name: newDeviceName.trim(),
        room: newDeviceRoom.trim()
      }, { headers });
      setMyDevices([...myDevices, r.data]);
      setNewDeviceId(''); setNewDeviceName(''); setNewDeviceRoom('');
      showMsg('✅ Dispositivo adicionado!');
    } catch (err) {
      showMsg('❌ Erro ao adicionar: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const removeDevice = async id => {
    try {
      await axios.delete(`${API}/my-devices/${id}`, { headers });
      setMyDevices(myDevices.filter(d => d.id !== id));
      showMsg('✅ Dispositivo removido.');
    } catch (err) {
      showMsg('❌ Erro ao remover dispositivo.', 'error');
    }
  };

  return (
    <div className="page">
      <div className="page-header"><div className="page-title">Configurações</div></div>

      {/* Mensagem de feedback */}
      {msg && (
        <div className={msgType === 'success' ? 'login-success' : 'login-error'} style={{marginBottom:12}}>
          {msg}
        </div>
      )}

      {/* Card de credenciais Tuya */}
      <div className="card" style={{marginBottom:16}}>
        <div style={{fontWeight:700, marginBottom:8, color:'#fff', fontSize:15}}>🔑 Credenciais Tuya</div>
        <div style={{fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:14, lineHeight:1.5}}>
          Encontre seu <strong style={{color:'rgba(255,255,255,0.7)'}}>Access ID</strong> e <strong style={{color:'rgba(255,255,255,0.7)'}}>Secret</strong> no painel do{' '}
          <a href="https://iot.tuya.com" target="_blank" rel="noreferrer" style={{color:'#3B7EFF'}}>Tuya IoT Platform</a>.
          {configured && <span style={{color:'#22c55e',display:'block',marginTop:4}}>✅ Credenciais já configuradas.</span>}
        </div>
        <form onSubmit={saveCredentials}>
          <div className="login-field">
            <label>Access ID</label>
            <input
              type="text"
              value={accessId}
              onChange={e => setAccessId(e.target.value)}
              placeholder="ex: a1b2c3d4e5f6..."
              required
            />
          </div>
          <div className="login-field">
            <label>Access Secret {configured && <span style={{color:'rgba(255,255,255,0.4)',fontSize:11}}>(deixe em branco para manter o atual)</span>}</label>
            <input
              type="password"
              value={accessSecret}
              onChange={e => setAccessSecret(e.target.value)}
              placeholder={configured ? '(não alterado)' : '••••••••••••'}
            />
          </div>
          <div className="login-field">
            <label>Região do servidor</label>
            <select
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              style={{width:'100%',padding:'10px 12px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#fff',fontSize:14,outline:'none'}}
            >
              <option value="https://openapi.tuyaus.com">🌎 Américas (EUA)</option>
              <option value="https://openapi.tuyaeu.com">🌍 Europa</option>
              <option value="https://openapi.tuyacn.com">🌏 Ásia (China)</option>
              <option value="https://openapi.tuyain.com">🇮🇳 Índia</option>
            </select>
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Salvando...' : configured ? 'Atualizar Credenciais' : 'Salvar Credenciais'}
          </button>
        </form>
      </div>

      {/* Card de dispositivos */}
      <div className="card">
        <div style={{fontWeight:700, marginBottom:12, color:'#fff', fontSize:15}}>📱 Meus Dispositivos</div>

        {/* Lista de dispositivos já cadastrados */}
        {myDevices.length === 0 && (
          <div style={{color:'rgba(255,255,255,0.35)',fontSize:13,marginBottom:16,padding:'8px 0'}}>
            Nenhum dispositivo cadastrado ainda.
          </div>
        )}
        {myDevices.map(d => (
          <div key={d.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            <div>
              <div style={{color:'#fff',fontWeight:600,fontSize:13}}>{d.name}</div>
              <div style={{color:'rgba(255,255,255,0.35)',fontSize:11,marginTop:2}}>
                {d.room && <span>{d.room} • </span>}
                <span style={{fontFamily:'monospace'}}>{d.tuya_id}</span>
              </div>
            </div>
            <button
              onClick={() => removeDevice(d.id)}
              style={{background:'rgba(239,68,68,0.12)',color:'#ef4444',border:'1px solid rgba(239,68,68,0.2)',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:12,flexShrink:0}}
            >
              Remover
            </button>
          </div>
        ))}

        {/* Formulário para adicionar dispositivo */}
        <form onSubmit={addDevice} style={{marginTop:20}}>
          <div style={{fontWeight:600,fontSize:13,color:'rgba(255,255,255,0.55)',marginBottom:10}}>Adicionar novo dispositivo</div>
          <div className="login-field">
            <label>ID do Dispositivo (Tuya ID)</label>
            <input
              type="text"
              value={newDeviceId}
              onChange={e => setNewDeviceId(e.target.value)}
              placeholder="ex: 710151318cce4e127075"
              required
            />
          </div>
          <div className="login-field">
            <label>Nome do dispositivo</label>
            <input
              type="text"
              value={newDeviceName}
              onChange={e => setNewDeviceName(e.target.value)}
              placeholder="ex: Interruptor Sala"
              required
            />
          </div>
          <div className="login-field">
            <label>Cômodo (opcional)</label>
            <input
              type="text"
              value={newDeviceRoom}
              onChange={e => setNewDeviceRoom(e.target.value)}
              placeholder="ex: Sala, Quarto, Cozinha..."
            />
          </div>
          <button type="submit" className="login-btn">
            + Adicionar Dispositivo
          </button>
        </form>
      </div>
    </div>
  );
}

// ── AUTOMAÇÕES, ALERTAS, CÂMERAS, STATUS ──────────────────
function Automations() {
  const [items, setItems] = useState([
    {key:'sunset',   name:'Luzes ao anoitecer', desc:'Liga as luzes externas quando escurece.',            icon:'🌅', color:'#a78bfa', enabled:true },
    {key:'sleep',    name:'Modo Dormir',         desc:'Desliga luzes e ativa sensores de segurança.',       icon:'🌙', color:'#818cf8', enabled:true },
    {key:'smoke',    name:'Alerta de Fumaça',    desc:'Envia notificação se detectar fumaça.',              icon:'🔥', color:'#ef4444', enabled:true },
    {key:'presence', name:'Simular Presença',    desc:'Liga e desliga luzes para simular presença em casa.',icon:'🏠', color:'#94a3b8', enabled:false},
  ]);
  const toggle = key => setItems(items.map(i => i.key===key ? {...i, enabled:!i.enabled} : i));
  return (
    <div className="page">
      <div className="page-header"><div className="page-title">Automação</div><div className="icon-btn">＋</div></div>
      <div className="tabs"><button className="tab active">Todas</button><button className="tab">Ativas</button><button className="tab">Inativas</button></div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {items.map(a => (
          <div className="auto-card" key={a.key}>
            <div className="auto-icon-wrap" style={{background:`${a.color}22`}}><span>{a.icon}</span></div>
            <div className="auto-info"><div className="auto-name">{a.name}</div><div className="auto-desc">{a.desc}</div></div>
            <Toggle on={a.enabled} onClick={() => toggle(a.key)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Alerts() {
  const today = [
    {id:1,type:'Fumaça detectada', where:'Cozinha', time:'10:32',color:'#ef4444',bg:'rgba(239,68,68,0.15)',icon:'🔥'},
    {id:2,type:'Consumo elevado',  where:'Sala',    time:'08:15',color:'#eab308',bg:'rgba(234,179,8,0.15)',icon:'⚡'},
    {id:3,type:'Porta aberta',     where:'Entrada', time:'07:45',color:'#3B7EFF',bg:'rgba(59,126,255,0.15)',icon:'🚪'},
  ];
  const yesterday = [
    {id:4,type:'Dispositivo desconectado',where:'Garagem',time:'22:15',color:'rgba(255,255,255,0.4)',bg:'rgba(255,255,255,0.07)',icon:'📡'},
  ];
  const Card = ({a}) => (
    <div className="alert-card" style={{marginBottom:8}}>
      <div className="alert-icon-wrap" style={{background:a.bg}}><span>{a.icon}</span></div>
      <div style={{flex:1}}><div className="alert-title" style={{color:a.color}}>{a.type}</div><div className="alert-loc">{a.where}</div></div>
      <span className="alert-time">{a.time}</span>
    </div>
  );
  return (
    <div className="page">
      <div className="page-header"><div className="page-title">Alertas</div><div className="icon-btn">⚙️</div></div>
      <div className="tabs"><button className="tab active">Todos</button><button className="tab">Críticos</button><button className="tab">Informativos</button></div>
      <div className="day-label">Hoje</div>
      {today.map(a => <Card key={a.id} a={a} />)}
      <div className="day-label">Ontem</div>
      {yesterday.map(a => <Card key={a.id} a={a} />)}
    </div>
  );
}

function Cameras({ devices }) {
  const cams = devices.filter(d => d.category_name?.toLowerCase().includes('camera') || d.category_name?.toLowerCase().includes('cam'));
  const fallback = [{id:'c1',name:'Câmera Entrada',online:true},{id:'c2',name:'Câmera Garagem',online:false},{id:'c3',name:'Câmera Jardim',online:true},{id:'c4',name:'Câmera Sala',online:true}];
  const list = cams.length > 0 ? cams : fallback;
  return (
    <div className="page">
      <div className="page-title" style={{marginBottom:16}}>Câmeras</div>
      <div className="grid-2">
        {list.map(c => (
          <div className="card" style={{padding:12}} key={c.id}>
            <div className="cam-preview"><span>📷</span>{c.online && <span className="live-badge">● LIVE</span>}</div>
            <div className="cam-name">{c.name}</div>
            <div className="cam-status" style={{color:c.online?'#22c55e':'#ef4444'}}>{c.online?'Online':'Offline'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Status({ devices }) {
  const online = devices.filter(d => d.online).length;
  const total = devices.length;
  const devScore = total > 0 ? Math.round((online/total)*100) : 0;
  const stats = [
    {icon:'🛡️',color:'rgba(34,197,94,0.15)',  name:'Segurança',    sub:'Todos os sistemas funcionando normalmente.',score:90},
    {icon:'⚡',color:'rgba(234,179,8,0.15)',   name:'Energia',      sub:'Consumo dentro da média recomendada.',     score:85},
    {icon:'📱',color:'rgba(59,126,255,0.15)',  name:'Dispositivos', sub:`${online} de ${total} dispositivos online.`,score:devScore},
    {icon:'🌿',color:'rgba(20,220,160,0.12)',  name:'Ambiente',     sub:'Temperatura e qualidade do ar estão boas.',score:90},
  ];
  const geral = Math.round(stats.reduce((a,s) => a+s.score,0)/stats.length);
  return (
    <div className="page">
      <div className="page-title" style={{marginBottom:16}}>Status da Casa</div>
      <div className="card score-card" style={{marginBottom:14}}>
        <div className="score-num">{geral}<span className="score-den">/100</span></div>
        <div className="score-label">Excelente</div>
        <div className="score-desc">Sua casa está em excelente estado!</div>
      </div>
      <div className="card">
        {stats.map(s => (
          <div className="stat-row" key={s.name}>
            <div className="stat-icon" style={{background:s.color}}>{s.icon}</div>
            <div className="stat-info"><div className="stat-name">{s.name}</div><div className="stat-sub">{s.sub}</div></div>
            <span className="stat-score">{s.score}/100</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── APP PRINCIPAL ─────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tuyaConfigured, setTuyaConfigured] = useState(true);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Busca os dispositivos do usuário (usando o token para autenticar)
  const fetchDevices = (token) => {
    axios.get(`${API}/devices`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        setDevices(r.data?.result?.list || []);
        setTuyaConfigured(true);
      })
      .catch(err => {
        if (err.response?.status === 400) {
          // Tuya não configurado ainda
          setTuyaConfigured(false);
          setDevices([]);
        } else {
          console.error(err);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!session) return;
    const token = session.access_token;
    fetchDevices(token);
    // Atualiza os dispositivos a cada 30 segundos automaticamente
    const interval = setInterval(() => fetchDevices(token), 30000);
    return () => clearInterval(interval);
  }, [session]);

  // Liga ou desliga um dispositivo
  const handleToggle = async (id, currentlyOn) => {
    try {
      await axios.post(
        `${API}/devices/${id}/command`,
        { commands: [{ code: 'switch_1', value: !currentlyOn }] },
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      // Aguarda 1,5s e atualiza a lista para refletir o novo estado
      setTimeout(() => fetchDevices(session.access_token), 1500);
    } catch(e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) return (
    <div style={{background:'#0B0F19',height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(255,255,255,0.3)'}}>
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
    </div>
  );
}
