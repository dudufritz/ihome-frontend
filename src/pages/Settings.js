/**
 * Settings.js — Tela de configurações: credenciais Tuya, dispositivos, compartilhamento
 * e notificações. UninstallCard vem junto porque só é usado aqui.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../auth';
import DeviceIcon from '../components/DeviceIcon';
import PasswordField from '../components/PasswordField';
import { urlBase64ToUint8Array } from '../utils/push';

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
  const [bulkRoom, setBulkRoom] = useState('');   // cômodo aplicado ao lote
  const [editId, setEditId] = useState(null);     // dispositivo em edição
  const [editName, setEditName] = useState('');
  const [editRoom, setEditRoom] = useState('');

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

  /**
   * Adiciona os selecionados, todos no cômodo escolhido no campo ao lado.
   *
   * O cômodo entra aqui, e não depois, por um motivo prático: quem importa 38
   * dispositivos de uma vez não vai abrir 38 telas de edição em seguida. Como
   * a seleção normalmente é feita por ambiente ("agora as luzes da sala"),
   * aplicar um cômodo ao lote resolve a maior parte dos casos numa tacada.
   *
   * A categoria vai junto: é o que faz o app saber depois que um sensor não
   * tem botão de ligar.
   */
  const addSelected = async () => {
    const toAdd = (discovered || []).filter(d => selectedIds.has(d.tuya_id) && !d.already_added);
    if (toAdd.length === 0) { showMsg('Selecione pelo menos um dispositivo novo.', 'error'); return; }
    setAddingBulk(true);
    let added = 0;
    for (const d of toAdd) {
      try {
        const r = await axios.post(`${API}/my-devices`,
          { tuya_id: d.tuya_id, name: d.name, room: bulkRoom.trim(), category: d.category || '' },
          { headers });
        setMyDevices(prev => [...prev, r.data]);
        setDiscovered(prev => prev.map(x => x.tuya_id === d.tuya_id ? { ...x, already_added: true } : x));
        added++;
      } catch { /* ignora erro individual */ }
    }
    setSelectedIds(new Set());
    showMsg(`${added} dispositivo${added !== 1 ? 's' : ''} adicionado${added !== 1 ? 's' : ''}${bulkRoom.trim() ? ` em ${bulkRoom.trim()}` : ''}.`);
    setAddingBulk(false);
  };

  // Mesmo visual dos campos da tela de auditoria, para os formulários do app
  // não parecerem vindos de lugares diferentes.
  const inputStyle = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none',
    fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  };

  /** Abre a edição de um dispositivo, carregando os valores atuais. */
  const startEdit = (d) => {
    setEditId(d.id);
    setEditName(d.name);
    setEditRoom(d.room || '');
  };

  /**
   * Salva nome e cômodo.
   *
   * Antes desta tela, corrigir um nome exigia remover e cadastrar de novo — o
   * que apagava os agendamentos ligados àquele dispositivo. Editar preserva o
   * registro e, com ele, tudo o que aponta para o id.
   */
  const saveEdit = async (id) => {
    if (!editName.trim()) { showMsg('O nome não pode ficar vazio.', 'error'); return; }
    try {
      const r = await axios.put(`${API}/my-devices/${id}`,
        { name: editName.trim(), room: editRoom.trim() }, { headers });
      setMyDevices(prev => prev.map(d => (d.id === id ? r.data : d)));
      setEditId(null);
      showMsg('Dispositivo atualizado.');
    } catch (err) {
      showMsg('Erro ao salvar: ' + (err.response?.data?.error || err.message), 'error');
    }
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
          {/*
            A Tuya mantém SEIS centros de dados, e o Access ID só existe dentro
            daquele onde o projeto foi criado. Perguntar no servidor errado
            devolve `code: 2009 — clientId is invalid`, que parece credencial
            inválida e não é: é endereço errado.

            A lista tinha só quatro opções. Quem criasse o projeto em Eastern
            America ou Western Europe não conseguia acertar de jeito nenhum —
            o app não oferecia o servidor certo.

            Os nomes seguem exatamente os do painel da Tuya (Data Center), para
            a pessoa poder comparar palavra por palavra em vez de adivinhar
            qual "Américas" corresponde a qual.
          */}
          <div className="login-field" style={{ marginBottom: 16 }}>
            <label>Região do servidor</label>
            <select value={baseUrl} onChange={e => setBaseUrl(e.target.value)} className="styled-select">
              <option value="https://openapi.tuyaus.com">Western America (Américas — o mais comum no Brasil)</option>
              <option value="https://openapi-ueaz.tuyaus.com">Eastern America</option>
              <option value="https://openapi.tuyaeu.com">Central Europe</option>
              <option value="https://openapi-weaz.tuyaeu.com">Western Europe</option>
              <option value="https://openapi.tuyacn.com">China</option>
              <option value="https://openapi.tuyain.com">India</option>
            </select>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', marginTop: 6, lineHeight: 1.5 }}>
              Precisa ser o mesmo <strong>Data Center</strong> que aparece em
              platform.tuya.com → Cloud → Development → seu projeto → Overview.
            </div>
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
          <div key={d.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {editId === d.id ? (
              /* ── Edição ─────────────────────────────────────────── */
              <div style={{ display: 'grid', gap: 8 }}>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Nome do dispositivo"
                  style={inputStyle}
                  autoFocus
                />
                <input
                  value={editRoom}
                  onChange={e => setEditRoom(e.target.value)}
                  placeholder="Cômodo (ex.: Sala, Quarto, Cozinha)"
                  list="comodos-existentes"
                  style={inputStyle}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => saveEdit(d.id)}
                    style={{ background: '#3B7EFF', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    Salvar
                  </button>
                  <button onClick={() => setEditId(null)}
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13 }}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* ── Exibição ───────────────────────────────────────── */
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <DeviceIcon category={d.category || 'switch'} size={16} color="rgba(255,255,255,0.4)" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{d.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 }}>
                      {d.room
                        ? <span>{d.room} · </span>
                        : <span style={{ color: 'rgba(245,158,11,0.7)' }}>Sem cômodo · </span>}
                      <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{d.tuya_id}</span>
                      <span className="protocol-badge" style={{ marginLeft: 6 }}>Tuya</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => startEdit(d)}
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
                    Editar
                  </button>
                  <button onClick={() => removeDevice(d.id)}
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
                    Remover
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/*
          Sugere os cômodos que já existem, em vez de exigir que a pessoa
          lembre como escreveu antes. Sem isto, "Sala" e "sala" viram dois
          cômodos diferentes no filtro da tela de dispositivos.
        */}
        <datalist id="comodos-existentes">
          {[...new Set(myDevices.map(d => d.room).filter(Boolean))].map(r => (
            <option key={r} value={r} />
          ))}
        </datalist>

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
                    <>
                      {/*
                        O cômodo do lote. Com dezenas de dispositivos, a
                        seleção costuma ser feita por ambiente — "agora as
                        luzes da sala" — então aplicar o cômodo aqui poupa
                        abrir a edição de cada um depois.
                        Em branco, os dispositivos entram sem cômodo e podem
                        ser ajustados um a um na lista acima.
                      */}
                      <input
                        value={bulkRoom}
                        onChange={e => setBulkRoom(e.target.value)}
                        placeholder="Cômodo destes dispositivos (opcional)"
                        list="comodos-existentes"
                        style={{ ...inputStyle, marginTop: 12 }}
                      />
                      <button type="button" onClick={addSelected} disabled={selectedIds.size === 0 || addingBulk}
                        style={{ marginTop: 8, width: '100%', padding: '10px', background: selectedIds.size > 0 ? '#3B7EFF' : 'rgba(59,126,255,0.15)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: selectedIds.size > 0 ? 'pointer' : 'default', opacity: selectedIds.size === 0 ? 0.5 : 1, transition: 'all .15s' }}>
                        {addingBulk ? 'Adicionando...' : `Adicionar ${selectedIds.size > 0 ? selectedIds.size + ' selecionado' + (selectedIds.size !== 1 ? 's' : '') : 'selecionados'}`}
                        {selectedIds.size > 0 && bulkRoom.trim() ? ` em ${bulkRoom.trim()}` : ''}
                      </button>
                    </>
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

export default Settings;
