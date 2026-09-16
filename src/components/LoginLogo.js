/**
 * LoginLogo.js — Logo completa da tela de login.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React from 'react';

// ── LOGO ─────────────────────────────────────────────────────
// Logo completa para a tela de login
function LoginLogo() {
  return (
    <div style={{ textAlign: 'center', marginBottom: 32 }}>
      <img src="/logo.png" alt="iHome" style={{ width: 240, display: 'block', margin: '0 auto' }} />
    </div>
  );
}

export default LoginLogo;
