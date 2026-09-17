/**
 * BottomNav.js — Navegação inferior do celular.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 *
 * QUATRO BOTÕES, NÃO OITO
 *
 * A versão anterior tinha oito destinos lado a lado. Num celular de 360dp,
 * isso dá 45dp por alvo — abaixo dos 48dp que o Material Design define como
 * mínimo para toque, e o rótulo fica ilegível muito antes disso.
 *
 * A diretriz do Material recomenda de 3 a 5 destinos na navegação inferior,
 * justamente porque o polegar não tem a precisão de um cursor. Acima disso,
 * a saída padrão é um item "Mais" que abre o restante.
 *
 * A escolha dos quatro seguiu o uso real do app: as telas em que alguém entra
 * várias vezes por dia ficam à mão; as de configuração e consulta, que se
 * visitam de vez em quando, entram no "Mais". Auditoria é a que mais custou
 * decidir — é a tela mais valiosa do projeto, mas é de investigação, não de
 * rotina: ninguém abre auditoria para acender uma luz.
 *
 * Veio do code review do @pdrollucas no PR #2.
 */
import React, { useState } from 'react';
import Icons from './Icons';

// Destinos de uso diário — ficam sempre visíveis.
const PRINCIPAIS = [
  { id: 'dashboard',   label: 'Início',       icon: Icons.dashboard   },
  { id: 'devices',     label: 'Dispositivos', icon: Icons.devices     },
  { id: 'automations', label: 'Automação',    icon: Icons.automations },
  { id: 'alerts',      label: 'Alertas',      icon: Icons.alerts      },
];

// Consulta e configuração — acessíveis pelo "Mais".
const SECUNDARIOS = [
  { id: 'audit',     label: 'Auditoria',     icon: Icons.audit    },
  { id: 'cameras',   label: 'Câmeras',       icon: Icons.cameras  },
  { id: 'status',    label: 'Status',        icon: Icons.status   },
  { id: 'downloads', label: 'Downloads',     icon: Icons.download },
  { id: 'help',      label: 'Ajuda',         icon: Icons.help     },
  { id: 'settings',  label: 'Configurações', icon: Icons.settings },
];

function BottomNav({ page, setPage, unreadAlerts = 0 }) {
  const [maisAberto, setMaisAberto] = useState(false);

  // O "Mais" fica destacado quando a tela atual está dentro dele — senão a
  // pessoa perde a referência de onde está.
  const emSecundario = SECUNDARIOS.some((s) => s.id === page);

  const ir = (id) => { setPage(id); setMaisAberto(false); };

  return (
    <>
      {maisAberto && (
        <>
          {/* Toque fora fecha. Numa tela pequena, o gesto de sair precisa ser
              maior que um X de 24 pixels no canto. */}
          <div
            onClick={() => setMaisAberto(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 900 }}
          />
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 901,
            background: '#0F1523', borderTop: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px 18px 0 0', padding: '10px 8px 22px',
          }}>
            <div style={{
              width: 38, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.18)',
              margin: '4px auto 12px',
            }} />
            {SECUNDARIOS.map((i) => (
              <button
                key={i.id}
                onClick={() => ir(i.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                  background: page === i.id ? 'rgba(59,126,255,0.12)' : 'transparent',
                  border: 'none', borderRadius: 12, padding: '14px 16px',
                  color: page === i.id ? '#3B7EFF' : 'rgba(255,255,255,0.8)',
                  fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}
              >
                <span style={{ width: 21, height: 21, display: 'inline-flex' }}>{i.icon}</span>
                {i.label}
              </button>
            ))}
          </div>
        </>
      )}

      <nav className="bottom-nav">
        {PRINCIPAIS.map((i) => (
          <button
            key={i.id}
            className={`bottom-nav-item ${page === i.id ? 'active' : ''}`}
            onClick={() => ir(i.id)}
          >
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              {i.icon}
              {i.id === 'alerts' && unreadAlerts > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -6, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: 8, padding: '1px 4px', minWidth: 14, textAlign: 'center', lineHeight: '14px' }}>{unreadAlerts}</span>
              )}
            </span>
            <span>{i.label}</span>
          </button>
        ))}

        <button
          className={`bottom-nav-item ${emSecundario || maisAberto ? 'active' : ''}`}
          onClick={() => setMaisAberto((v) => !v)}
          aria-label="Mais opções"
          aria-expanded={maisAberto}
        >
          <span style={{ display: 'inline-flex' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
            </svg>
          </span>
          <span>Mais</span>
        </button>
      </nav>
    </>
  );
}

export default BottomNav;
