/**
 * Cameras.js — Câmeras da casa.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React from 'react';
import DeviceIcon from '../components/DeviceIcon';

// ── CÂMERAS ───────────────────────────────────────────────────
function Cameras({ devices }) {
  const cams = devices.filter(d => d.category_name?.toLowerCase().includes('camera'));
  const fallback = [{ id:'c1', name:'Câmera Entrada', online:true },{ id:'c2', name:'Câmera Garagem', online:false },{ id:'c3', name:'Câmera Jardim', online:true },{ id:'c4', name:'Câmera Sala', online:true }];
  const list = cams.length > 0 ? cams : fallback;
  return (
    <div className="page">
      <div className="page-title" style={{ marginBottom: 16 }}>Câmeras</div>
      <div className="grid-2">
        {list.map(c => (
          <div className="card" style={{ padding: 12 }} key={c.id}>
            <div className="cam-preview">
              <DeviceIcon category="camera" size={32} color="rgba(255,255,255,0.2)" />
              {c.online && <span className="live-badge">LIVE</span>}
            </div>
            <div className="cam-name">{c.name}</div>
            <div className="cam-status" style={{ color: c.online?'#22c55e':'#ef4444' }}>{c.online?'Online':'Offline'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cameras;
