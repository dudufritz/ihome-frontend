/**
 * Sidebar.js — Navegação lateral do desktop.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React from 'react';
import Icons from './Icons';
import SidebarLogo from './SidebarLogo';

// ── SIDEBAR ───────────────────────────────────────────────────
function Sidebar({ page, setPage, user, onLogout, unreadAlerts = 0 }) {
  const items = [
    { id: 'dashboard',   label: 'Visão Geral',   icon: Icons.dashboard   },
    { id: 'devices',     label: 'Dispositivos',  icon: Icons.devices     },
    { id: 'automations', label: 'Automação',     icon: Icons.automations },
    { id: 'alerts',      label: 'Alertas',       icon: Icons.alerts      },
    { id: 'cameras',     label: 'Câmeras',       icon: Icons.cameras     },
    { id: 'status',      label: 'Status',        icon: Icons.status      },
    { id: 'audit',       label: 'Auditoria',     icon: Icons.audit       },
    { id: 'help',        label: 'Ajuda',         icon: Icons.help        },
    { id: 'downloads',   label: 'Downloads',     icon: Icons.download    },
    { id: 'settings',    label: 'Configurações', icon: Icons.settings    },
  ];
  return (
    <div className="sidebar">
      <SidebarLogo />
      {items.map(i => (
        <button key={i.id} className={`nav-item ${page===i.id?'active':''}`} onClick={() => setPage(i.id)}>
          <span className="nav-icon">{i.icon}</span>{i.label}
          {i.id === 'alerts' && unreadAlerts > 0 && (
            <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '2px 6px', minWidth: 18, textAlign: 'center' }}>{unreadAlerts}</span>
          )}
        </button>
      ))}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', padding: '8px 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </div>
        <button className="nav-item" onClick={onLogout} style={{ color: '#ef4444' }}>
          <span className="nav-icon">{Icons.logout}</span>Sair
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
