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
import Privacidade from './pages/Privacidade';


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
    // AVISOS VINDOS DE LINK DE E-MAIL.
    //
    // Duas rotas do backend terminam redirecionando o navegador para cá com um
    // parâmetro na URL, porque quem chega nelas é uma pessoa saindo do cliente
    // de e-mail, não o app fazendo uma chamada:
    //
    //   /shares/accept|decline/:token  ->  ?invite=accepted|declined|invalid
    //   /auth/verify-email/:token      ->  ?verify=success|invalid
    //
    // O `verify` estava faltando: quem clicava em "Confirmar e-mail" era
    // redirecionado para cá e não via absolutamente nada. A conta era marcada
    // como confirmada no banco, mas, da perspectiva da pessoa, o botão do
    // e-mail não tinha feito nada — e o passo natural era clicar de novo, aí
    // com o token já consumido.
    const params = new URLSearchParams(window.location.search);
    const avisos = {
      invite: {
        accepted: { type: 'success', msg: '✅ Convite aceito! Você agora tem acesso à casa.' },
        declined: { type: 'info',    msg: 'Convite recusado.' },
        invalid:  { type: 'error',   msg: 'Este convite já foi usado ou expirou.' },
      },
      verify: {
        success:  { type: 'success', msg: '✅ E-mail confirmado! Sua conta está completa.' },
        invalid:  { type: 'error',   msg: 'Este link de confirmação já foi usado ou expirou.' },
      },
    };
    for (const [parametro, porValor] of Object.entries(avisos)) {
      const aviso = porValor[params.get(parametro)];
      if (aviso) {
        setInviteToast(aviso);
        // Limpa a URL para que um F5 não reexiba o aviso de uma ação antiga.
        window.history.replaceState({}, '', window.location.pathname);
        break;
      }
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

    // ATUALIZAÇÃO AUTOMÁTICA, SÓ COM A TELA À VISTA.
    //
    // Cada ciclo destes vira uma consulta à nuvem Tuya, e a avaliação
    // gratuita dela trabalha com uma COTA MENSAL de chamadas. Uma aba
    // esquecida aberta a noite inteira fazia 2.880 pedidos até o dia seguinte,
    // atualizando uma tela que ninguém estava olhando — e consumia a cota do
    // mês em poucas horas. Quando ela acabava, a API parava de responder e o
    // app inteiro parecia quebrado.
    //
    // `document.hidden` é verdadeiro com a aba em segundo plano ou o celular
    // bloqueado. Nesses momentos não há o que mostrar, então não há o que
    // perguntar. Ao voltar, buscamos na hora: quem reabre o app quer o estado
    // de agora, não o de meia hora atrás.
    const visivel = () => !document.hidden;

    const atualizarSeVisivel = () => { if (visivel()) fetchDevices(token); };

    const checkAlerts = () => {
      if (!visivel()) return;
      axios.get(`${API}/alerts`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setUnreadAlerts(r.data.filter(a => !a.read).length))
        .catch(() => {});
    };

    const aoVoltar = () => { if (visivel()) { fetchDevices(token); checkAlerts(); } };

    fetchDevices(token);
    checkAlerts();

    const interval = setInterval(atualizarSeVisivel, 30000);
    const alertInterval = setInterval(checkAlerts, 2 * 60 * 1000);
    document.addEventListener('visibilitychange', aoVoltar);

    return () => {
      clearInterval(interval);
      clearInterval(alertInterval);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
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

  // O AVISO PRECISA APARECER TAMBÉM NA TELA DE LOGIN.
  //
  // Antes ele só era montado no return de baixo, que só roda com sessão ativa
  // — e quem chega por link de e-mail quase nunca está logado. Confirmar o
  // e-mail ou aceitar um convite levava a pessoa para a tela de login sem
  // nenhum sinal de que a ação tinha funcionado.
  const toast = inviteToast && (
    <div style={{
      position:'fixed', top:20, left:'50%', transform:'translateX(-50%)',
      background: inviteToast.type==='success' ? '#166534' : inviteToast.type==='error' ? '#7f1d1d' : '#1e3a5f',
      color:'#fff', padding:'12px 24px', borderRadius:12, zIndex:9999,
      boxShadow:'0 4px 20px rgba(0,0,0,0.4)', fontSize:14, maxWidth:340, textAlign:'center'
    }}>
      {inviteToast.msg}
      <button onClick={() => setInviteToast(null)} style={{ marginLeft:12, background:'none', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:16 }}>✕</button>
    </div>
  );

  // A Política de Privacidade é pública: abre com ou sem sessão, antes de
  // qualquer outra decisão. A pessoa precisa poder lê-la ANTES de criar a
  // conta (LGPD art. 9º). O Static Web App entrega o index.html para
  // /privacidade pelo navigationFallback, e aqui o App escolhe a página.
  if (window.location.pathname === '/privacidade') return <Privacidade />;

  if (authLoading) return (
    <div style={{ background: '#0B0F19', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
      Carregando...
    </div>
  );
  if (!session) return <>{toast}<Login /></>;

  return (
    <div className="app">
      {toast}
      <Sidebar page={page} setPage={setPage} user={session.user} onLogout={handleLogout} unreadAlerts={unreadAlerts} />
      <div className="main">
        {page==='dashboard'   && <Dashboard    devices={devices} setPage={setPage} session={session} />}
        {page==='devices'     && <Devices      devices={devices} loading={loading} onToggle={handleToggle} tuyaConfigured={tuyaConfigured} setPage={setPage} session={session} onChanged={() => fetchDevices(session.access_token)} />}
        {page==='automations' && <Automations session={session} devices={devices} />}
        {page==='alerts'      && <Alerts session={session} />}
        {page==='cameras'     && <Cameras devices={devices} />}
        {page==='status'      && <Status   devices={devices} session={session} />}
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
