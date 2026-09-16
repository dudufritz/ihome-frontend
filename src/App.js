import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, API } from './auth';
import './App.css';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import FloatingAssistant from './components/FloatingAssistant';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Settings from './pages/Settings';
import AuditLog from './pages/AuditLog';
import Automations from './pages/Automations';
import Alerts from './pages/Alerts';
import Cameras from './pages/Cameras';
import Status from './pages/Status';
import Help from './pages/Help';
import Downloads from './pages/Downloads';


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
    auth.getSession().then(({ data: { session } }) => {
      setSession(session); setAuthLoading(false);
    });
    const { data: { subscription } } = auth.onAuthStateChange((_e, session) => setSession(session));
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

  const handleLogout = () => auth.signOut();

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
        {page==='devices'     && <Devices      devices={devices} loading={loading} onToggle={handleToggle} tuyaConfigured={tuyaConfigured} setPage={setPage} session={session} onChanged={() => fetchDevices(session.access_token)} />}
        {page==='automations' && <Automations session={session} devices={devices} />}
        {page==='alerts'      && <Alerts session={session} />}
        {page==='cameras'     && <Cameras devices={devices} />}
        {page==='status'      && <Status   devices={devices} />}
        {page==='audit'       && <AuditLog session={session} />}
        {page==='help'        && <Help />}
        {page==='downloads'   && <Downloads session={session} devices={devices} />}
        {page==='settings'    && <Settings session={session} onLogout={handleLogout} />}
      </div>
      <BottomNav page={page} setPage={setPage} unreadAlerts={unreadAlerts} />
      <FloatingAssistant session={session} />
    </div>
  );
}
