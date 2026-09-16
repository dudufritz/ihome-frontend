/**
 * SidebarLogo.js — Logo reduzida da barra lateral.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React from 'react';

// Logo compacta para a sidebar
function SidebarLogo() {
  return (
    <div style={{ padding: '4px 8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 12 }}>
      <img src="/logo.png" alt="iHome" style={{ width: 110, display: 'block' }} />
    </div>
  );
}

export default SidebarLogo;
