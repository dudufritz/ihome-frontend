/**
 * Toggle.js — Interruptor visual de ligar e desligar.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React from 'react';

// ── TOGGLE ────────────────────────────────────────────────────
function Toggle({ on, onClick }) {
  return (
    <button className={`toggle ${on ? 'on' : 'off'}`} onClick={e => { e.stopPropagation(); onClick(); }}>
      <div className="toggle-dot" />
    </button>
  );
}

export default Toggle;
