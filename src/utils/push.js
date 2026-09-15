/**
 * push.js — Conversão da chave VAPID para o formato que o PushManager exige.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */

// ── CONFIGURAÇÕES ─────────────────────────────────────────────
// Converte VAPID key de base64url para Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export { urlBase64ToUint8Array };
