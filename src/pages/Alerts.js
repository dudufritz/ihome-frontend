/**
 * Alerts.js — Alertas de dispositivos que saíram ou voltaram do ar.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../auth';
import Icons from '../components/Icons';

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

export default Alerts;
