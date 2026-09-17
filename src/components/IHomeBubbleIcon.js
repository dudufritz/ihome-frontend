/**
 * IHomeBubbleIcon.js — Ícone do botão flutuante do assistente.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React from 'react';

// ── LOGO SIMPLIFICADA (para bolha flutuante) ──────────────────
function IHomeBubbleIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Pilar teal */}
      <rect x="8" y="6" width="11" height="38" rx="1" fill="#00C4CC"/>
      {/* Telhado branco em V */}
      <polyline points="4,22 24,6 44,22" stroke="white" strokeWidth="5" fill="none" strokeLinejoin="round" strokeLinecap="round"/>
      {/* Pilar direito branco */}
      <rect x="29" y="22" width="11" height="22" rx="1" fill="white"/>
      {/* Crossbar H branco */}
      <rect x="19" y="30" width="21" height="7" rx="1" fill="white"/>
    </svg>
  );
}

export default IHomeBubbleIcon;
