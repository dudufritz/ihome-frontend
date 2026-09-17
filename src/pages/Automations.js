/**
 * Automations.js — Rotinas: ligar e desligar por horário.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../auth';
import Icons from '../components/Icons';

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

export default Automations;
