/**
 * BottomNav.js — Navegação inferior do celular.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React from 'react';
import Icons from './Icons';

// ── NAVEGAÇÃO INFERIOR (mobile) ──────────────────────────────
function BottomNav({ page, setPage, unreadAlerts = 0 }) {
  const items = [
    { id: 'dashboard',   label: 'Início',       icon: Icons.dashboard   },
    { id: 'devices',     label: 'Dispositivos', icon: Icons.devices     },
    { id: 'automations', label: 'Automação',    icon: Icons.automations },
    { id: 'alerts',      label: 'Alertas',      icon: Icons.alerts      },
    { id: 'audit',       label: 'Auditoria',    icon: Icons.audit       },
    { id: 'help',        label: 'Ajuda',        icon: Icons.help        },
    { id: 'downloads',   label: 'Download',     icon: Icons.download    },
    { id: 'settings',    label: 'Config.',      icon: Icons.settings    },
  ];
  return (
    <nav className="bottom-nav">
      {items.map(i => (
        <button key={i.id} className={`bottom-nav-item ${page===i.id?'active':''}`} onClick={() => setPage(i.id)}>
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            {i.icon}
            {i.id === 'alerts' && unreadAlerts > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -6, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 8, padding: '1px 4px', minWidth: 14, textAlign: 'center', lineHeight: '14px' }}>{unreadAlerts}</span>
            )}
          </span>
          <span>{i.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
