/**
 * Status.js — Indicadores de saúde da casa.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React from 'react';
import Icons from '../components/Icons';

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

export default Status;
