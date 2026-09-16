/**
 * Devices.js — Tela de dispositivos: filtro por cômodo, estado e acionamento.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React, { useState } from 'react';
import DeviceIcon from '../components/DeviceIcon';
import Toggle from '../components/Toggle';
import DeviceDetail from '../components/DeviceDetail';

// ── DISPOSITIVOS ──────────────────────────────────────────────
function Devices({ devices, loading, onToggle, tuyaConfigured, setPage, session, onChanged }) {
  // Guardamos o id, não o objeto: a lista se atualiza a cada 30 segundos, e
  // guardar uma cópia congelaria a tela aberta no estado de quando abriu.
  const [abertoId, setAbertoId] = useState(null);
  const aberto = devices.find(d => d.id === abertoId) || null;
  const [filter, setFilter] = useState('Todos');
  const tabs = ['Todos','Sala','Quarto','Cozinha','Externa'];
  const filtered = filter === 'Todos'
    ? devices
    : devices.filter(d => d.room?.toLowerCase().includes(filter.toLowerCase()));

  const AddBtn = () => (
    <button
      onClick={() => setPage('settings')}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#3B7EFF', border: 'none',
        borderRadius: 10, padding: '9px 16px',
        color: '#fff', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', flexShrink: 0,
        boxShadow: '0 2px 10px rgba(59,126,255,0.35)',
      }}
    >
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      Adicionar
    </button>
  );

  if (loading) return <div className="loading">Carregando dispositivos...</div>;

  if (!tuyaConfigured) {
    return (
      <div className="page">
        <div className="page-header">
          <div><div className="page-title">Dispositivos</div></div>
          <AddBtn />
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '60px 20px', gap: 16,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'rgba(59,126,255,0.1)',
            border: '1.5px solid rgba(59,126,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(59,126,255,0.7)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="3"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Nenhum dispositivo conectado</div>
          <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, textAlign: 'center', maxWidth: 280 }}>
            Configure suas credenciais Tuya em Configurações para visualizar e controlar seus dispositivos.
          </div>
          <button
            onClick={() => setPage('settings')}
            style={{
              marginTop: 8, background: '#3B7EFF', border: 'none',
              borderRadius: 10, padding: '10px 24px',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 2px 10px rgba(59,126,255,0.35)',
            }}
          >
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
        <AddBtn />
      </div>
      <div className="tabs">{tabs.map(t => <button key={t} className={`tab ${filter===t?'active':''}`} onClick={() => setFilter(t)}>{t}</button>)}</div>
      {filtered.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '48px 20px', gap: 12,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'rgba(255,255,255,0.04)',
            border: '1.5px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="3"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            Nenhum dispositivo encontrado nesta categoria.
          </div>
        </div>
      )}
      <div className="grid-3">
        {filtered.map(d => {
          const on = d.isControllable ? d.switch_1 === true : d.online === true;
          const color = on ? '#3B7EFF' : 'rgba(255,255,255,0.15)';
          // Um sensor não liga nem desliga: ele informa. Dizer "Ligado" para
          // um sensor de presença online sugere um estado que ele não tem —
          // e a pessoa fica esperando um botão que não existe.
          const rotulo = d.isControllable
            ? (on ? 'Ligado' : 'Desligado')
            : (d.online ? 'Online' : 'Offline');
          return (
            <div className="device-card" key={d.id}
              onClick={() => setAbertoId(d.id)}
              style={{ cursor: 'pointer' }}>
              <div className="dev-icon-wrap" style={{ background: on ? 'rgba(59,126,255,0.15)' : 'rgba(255,255,255,0.04)' }}>
                <DeviceIcon category={d.category_name} size={20} color={color} />
              </div>
              <div className="dev-name">{d.name}</div>
              <div className="dev-category">{d.room || d.category_name || 'Sem cômodo'}</div>
              <div className="dev-footer">
                <span className={`status-badge ${on?'on':'off'}`}>{rotulo}</span>
                {d.isControllable && (
                  <span onClick={e => e.stopPropagation()}>
                    <Toggle on={on} onClick={() => onToggle(d.id, on)} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {aberto && (
        <DeviceDetail
          device={aberto}
          session={session}
          onClose={() => setAbertoId(null)}
          onToggle={onToggle}
          onChanged={onChanged}
          setPage={setPage}
        />
      )}
    </div>
  );
}

export default Devices;
