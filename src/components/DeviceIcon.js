/**
 * DeviceIcon.js — Escolhe o ícone a partir da categoria do dispositivo.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React from 'react';

// ── ÍCONE DE DISPOSITIVO ──────────────────────────────────────
function DeviceIcon({ category, size = 20, color = 'currentColor' }) {
  const c = (category || '').toLowerCase();
  let icon;
  if (c.includes('interruptor') || c.includes('switch') || c.includes('luz') || c.includes('light')) {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21h6M12 3a6 6 0 016 6c0 3.5-2 5.5-3 6.5H9C8 15.5 6 13.5 6 9a6 6 0 016-6z"/><line x1="9" y1="18" x2="15" y2="18"/></svg>;
  } else if (c.includes('tomada') || c.includes('socket') || c.includes('plug')) {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><line x1="10" y1="6" x2="10" y2="4"/><line x1="14" y1="6" x2="14" y2="4"/></svg>;
  } else if (c.includes('camera') || c.includes('cam') || c.includes('câmera')) {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
  } else if (c.includes('ar') || c.includes('condicionado')) {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="7" rx="2"/><line x1="8" y1="14" x2="8" y2="21"/><line x1="16" y1="14" x2="16" y2="21"/></svg>;
  } else if (c.includes('porta') || c.includes('door')) {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21V5a2 2 0 012-2h14a2 2 0 012 2v16"/><line x1="7" y1="21" x2="17" y2="21"/><circle cx="14" cy="12" r="1"/></svg>;
  } else if (c.includes('sensor') || c.includes('motion') || c.includes('movimento')) {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h2M17 12h2M12 5v2M12 17v2M7.05 7.05l1.41 1.41M15.54 15.54l1.41 1.41M7.05 16.95l1.41-1.41M15.54 8.46l1.41-1.41"/><circle cx="12" cy="12" r="3"/></svg>;
  } else {
    icon = <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="12" cy="12" r="3"/></svg>;
  }
  return <div style={{ width: size, height: size }}>{icon}</div>;
}

export default DeviceIcon;
