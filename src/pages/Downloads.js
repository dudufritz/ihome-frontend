/**
 * Downloads.js — Instalação do PWA e exportação de dados.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../auth';
import Icons from '../components/Icons';

// ── DOWNLOADS ────────────────────────────────────────────────
function Downloads({ session, devices }) {
  const [alerts, setAlerts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const headers = { Authorization: `Bearer ${session.access_token}` };

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/alerts`, { headers }).catch(() => ({ data: [] })),
      axios.get(`${API}/schedules`, { headers }).catch(() => ({ data: [] })),
    ]).then(([alertsRes, schedRes]) => {
      setAlerts(alertsRes.data || []);
      setSchedules(schedRes.data || []);
    }).finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const downloadCSV = (filename, rows, headers_row) => {
    const BOM = '﻿';
    const csvContent = BOM + [headers_row, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    setMsg(`✅ ${filename} baixado com sucesso!`);
    setTimeout(() => setMsg(''), 3000);
  };

  const downloadDevices = () => {
    const rows = devices.map(d =>
      [d.name, d.category_name || '', d.room || '', d.online ? 'Online' : 'Offline', d.id || ''].map(v => `"${v}"`).join(',')
    );
    downloadCSV('dispositivos_ihome.csv', rows, '"Nome","Categoria","Cômodo","Status","ID"');
  };

  const downloadAlerts = () => {
    const rows = alerts.map(a => {
      const date = new Date(a.created_at).toLocaleString('pt-BR');
      return [a.device_name || '', a.type || '', a.message || '', date].map(v => `"${v}"`).join(',');
    });
    downloadCSV('alertas_ihome.csv', rows, '"Dispositivo","Tipo","Mensagem","Data/Hora"');
  };

  const downloadSchedules = () => {
    const rows = schedules.map(s =>
      [s.device_name || '', s.on_time || '-', s.off_time || '-'].map(v => `"${v}"`).join(',')
    );
    downloadCSV('automacoes_ihome.csv', rows, '"Dispositivo","Ligar às","Desligar às"');
  };

  const options = [
    {
      label: 'Dispositivos',
      desc: `${devices.length} dispositivo${devices.length !== 1 ? 's' : ''} cadastrado${devices.length !== 1 ? 's' : ''}`,
      icon: Icons.devices,
      color: '#3B7EFF',
      bg: 'rgba(59,126,255,0.12)',
      onClick: downloadDevices,
      disabled: devices.length === 0,
    },
    {
      label: 'Histórico de Alertas',
      desc: `${alerts.length} registro${alerts.length !== 1 ? 's' : ''}`,
      icon: Icons.alerts,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.12)',
      onClick: downloadAlerts,
      disabled: alerts.length === 0,
    },
    {
      label: 'Automações',
      desc: `${schedules.length} rotina${schedules.length !== 1 ? 's' : ''} ativa${schedules.length !== 1 ? 's' : ''}`,
      icon: Icons.automations,
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.12)',
      onClick: downloadSchedules,
      disabled: schedules.length === 0,
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Downloads</div>
          <div className="page-subtitle">Exporte seus dados em CSV</div>
        </div>
      </div>

      {msg && <div className="login-success" style={{ marginBottom: 14 }}>{msg}</div>}

      {loading ? (
        <div className="loading">Carregando dados...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map(opt => (
            <div key={opt.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 20, height: 20, color: opt.color }}>{opt.icon}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{opt.desc}</div>
              </div>
              <button
                onClick={opt.onClick}
                disabled={opt.disabled}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: opt.disabled ? 'rgba(255,255,255,0.04)' : opt.bg,
                  color: opt.disabled ? 'rgba(255,255,255,0.2)' : opt.color,
                  border: `1px solid ${opt.disabled ? 'rgba(255,255,255,0.06)' : opt.color + '44'}`,
                  borderRadius: 10, padding: '8px 14px',
                  cursor: opt.disabled ? 'default' : 'pointer',
                  fontSize: 13, fontWeight: 600, flexShrink: 0,
                }}
              >
                <div style={{ width: 15, height: 15 }}>{Icons.download}</div>
                Baixar
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
          Os arquivos são exportados no formato CSV e podem ser abertos no Excel, Google Sheets ou qualquer editor de planilhas.
        </div>
      </div>
    </div>
  );
}

export default Downloads;
