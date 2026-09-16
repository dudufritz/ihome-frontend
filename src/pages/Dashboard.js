/**
 * Dashboard.js — Visão geral: resumo dos dispositivos e alertas recentes.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../auth';
import DeviceIcon from '../components/DeviceIcon';

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

export default Dashboard;
