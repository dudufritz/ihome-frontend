/**
 * DeviceDetail.js — Tela de um dispositivo.
 *
 * Abre sobre a lista quando a pessoa toca num card. Reúne num lugar só o que
 * antes estava espalhado: ligar/desligar ficava na lista, renomear em
 * Configurações, e agendar em Automação.
 *
 * A peça central é a representação do aparelho. Ela é o próprio botão — tocar
 * aciona. É como o app do fabricante funciona, e a razão é boa: num aparelho
 * físico você aperta o aparelho, não um controle ao lado dele.
 */
import React, { useState } from 'react';
import axios from 'axios';
import { API } from '../auth';

/**
 * Desenha o aparelho conforme a categoria da Tuya.
 *
 * Não é um modelo 3D de verdade — é CSS com gradiente, sombra e um brilho
 * interno. A profundidade vem de onde a luz bate: claro em cima, escuro
 * embaixo. Um modelo real exigiria uma biblioteca inteira para um ganho que
 * ninguém notaria numa tela de 6 polegadas.
 */
function Aparelho({ categoria, ligado, controlavel, online, onClick }) {
  const c = (categoria || '').toLowerCase();
  const eLampada = /dj|dd|dc|light|luz/.test(c);
  const eTomada  = /cz|pc|socket|tomada/.test(c);

  // Aceso: azul da marca. Apagado: cinza. Offline: mais apagado ainda.
  const cor = !online ? 'rgba(255,255,255,0.05)'
            : ligado  ? '#3B7EFF'
            : 'rgba(255,255,255,0.10)';
  const brilho = ligado && online
    ? '0 0 60px rgba(59,126,255,0.45), 0 18px 40px rgba(0,0,0,0.45)'
    : '0 18px 40px rgba(0,0,0,0.45)';

  const formato = eLampada
    ? { width: 150, height: 150, borderRadius: '50%' }
    : eTomada
    ? { width: 170, height: 170, borderRadius: 28 }
    : { width: 160, height: 230, borderRadius: 22 };   // placa de interruptor

  return (
    <button
      onClick={controlavel && online ? onClick : undefined}
      disabled={!controlavel || !online}
      aria-label={controlavel ? (ligado ? 'Desligar' : 'Ligar') : 'Dispositivo sem controle'}
      style={{
        ...formato,
        border: 'none',
        padding: 0,
        cursor: controlavel && online ? 'pointer' : 'default',
        background: `linear-gradient(160deg, ${cor} 0%, rgba(255,255,255,0.04) 55%, rgba(0,0,0,0.25) 100%)`,
        boxShadow: brilho,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        transition: 'box-shadow .25s, transform .12s',
        outline: ligado && online ? '1px solid rgba(59,126,255,0.5)' : '1px solid rgba(255,255,255,0.08)',
      }}
      onMouseDown={e => { if (controlavel && online) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {/* Reflexo no topo: é ele que dá a impressão de volume. */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
        borderRadius: `${formato.borderRadius === '50%' ? '50% 50% 0 0' : '22px 22px 0 0'}`,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.13), transparent)',
        pointerEvents: 'none',
      }} />

      {!eLampada && (
        <div style={{
          width: 44, height: 6, borderRadius: 3,
          background: ligado && online ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.22)',
          marginTop: 'auto', marginBottom: 22,
        }} />
      )}
    </button>
  );
}

function DeviceDetail({ device, session, onClose, onToggle, onChanged, setPage }) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(device.name);
  const [comodo, setComodo] = useState(device.room || '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const headers = { Authorization: `Bearer ${session.access_token}` };
  const ligado = device.isControllable ? device.switch_1 === true : device.online === true;

  const salvar = async () => {
    if (!nome.trim()) { setErro('O nome não pode ficar vazio.'); return; }
    setSalvando(true); setErro('');
    try {
      await axios.put(`${API}/my-devices/${device.dbId}`,
        { name: nome.trim(), room: comodo.trim() }, { headers });
      setEditando(false);
      onChanged();          // recarrega a lista com o valor novo
    } catch (e) {
      setErro(e.response?.data?.error || 'Não foi possível salvar.');
    }
    setSalvando(false);
  };

  const excluir = async () => {
    // Confirmação porque a ação não tem desfazer. O texto diz o que NÃO
    // acontece — o aparelho continua na conta Tuya — porque é a dúvida que a
    // palavra "excluir" levanta.
    if (!window.confirm(`Remover "${device.name}" do iHome?\n\nO dispositivo continua na sua conta Tuya e pode ser adicionado de novo.`)) return;
    try {
      await axios.delete(`${API}/my-devices/${device.dbId}`, { headers });
      onChanged();
      onClose();
    } catch {
      setErro('Não foi possível remover.');
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '11px 13px', color: '#fff', fontSize: 15,
    outline: 'none', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'linear-gradient(180deg, #14315e 0%, #1b5d7a 100%)',
        display: 'flex', flexDirection: 'column',
        animation: 'none',
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* ── Cabeçalho ───────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 18px 8px' }}>
          <div style={{ width: 90 }} />
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, textAlign: 'center', flex: 1 }}>
            {device.room || 'Sem cômodo'}
          </div>
          <div style={{ display: 'flex', gap: 4, width: 90, justifyContent: 'flex-end', position: 'relative' }}>
            <button
              onClick={() => setMenuAberto(v => !v)}
              aria-label="Mais opções"
              style={{ background: 'rgba(0,0,0,0.25)', border: 'none', borderRadius: '10px 0 0 10px', color: '#fff', width: 42, height: 34, cursor: 'pointer', fontSize: 17, lineHeight: 1 }}
            >···</button>
            <button
              onClick={onClose}
              aria-label="Fechar"
              style={{ background: 'rgba(0,0,0,0.25)', border: 'none', borderRadius: '0 10px 10px 0', color: '#fff', width: 42, height: 34, cursor: 'pointer', fontSize: 17, lineHeight: 1 }}
            >×</button>

            {menuAberto && (
              <div style={{
                position: 'absolute', top: 40, right: 0, minWidth: 190, zIndex: 10,
                background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12, overflow: 'hidden', boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              }}>
                <button onClick={() => { setEditando(true); setMenuAberto(false); }} style={itemMenu}>
                  Editar nome e cômodo
                </button>
                <button onClick={() => { setMenuAberto(false); setPage('automations'); onClose(); }} style={itemMenu}>
                  Criar rotina
                </button>
                <button onClick={() => { setMenuAberto(false); excluir(); }} style={{ ...itemMenu, color: '#ef4444' }}>
                  Excluir do iHome
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Aviso de estado ─────────────────────────────────── */}
        {!device.online && (
          <div style={{ background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.75)', fontSize: 13, padding: '10px 18px' }}>
            Dispositivo offline. Verifique se está ligado na tomada e conectado ao Wi-Fi.
          </div>
        )}
        {device.online && !device.isControllable && (
          <div style={{ background: 'rgba(0,0,0,0.25)', color: 'rgba(255,255,255,0.75)', fontSize: 13, padding: '10px 18px' }}>
            Este aparelho informa estado, mas não aceita comandos de ligar e desligar.
          </div>
        )}
        {erro && (
          <div style={{ background: 'rgba(239,68,68,0.2)', color: '#fecaca', fontSize: 13, padding: '10px 18px' }}>
            {erro}
          </div>
        )}

        {/* ── O aparelho ──────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: 20 }}>
          {editando ? (
            <div style={{ width: '100%', maxWidth: 340, display: 'grid', gap: 10 }}>
              <label style={rotulo}>Nome</label>
              <input value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} autoFocus />
              <label style={rotulo}>Cômodo</label>
              <input value={comodo} onChange={e => setComodo(e.target.value)} style={inputStyle} placeholder="Ex.: Sala, Quarto, Cozinha" />
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <button onClick={salvar} disabled={salvando}
                  style={{ flex: 1, background: '#3B7EFF', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
                <button onClick={() => { setEditando(false); setNome(device.name); setComodo(device.room || ''); setErro(''); }}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 15, cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <Aparelho
                categoria={device.category_name}
                ligado={ligado}
                controlavel={device.isControllable}
                online={device.online}
                onClick={() => onToggle(device.id, ligado)}
              />
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#fff', fontSize: 17, fontWeight: 600 }}>{device.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
                  {!device.online ? 'Offline'
                    : device.isControllable ? (ligado ? 'Ligado' : 'Desligado')
                    : 'Online'}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Ações ───────────────────────────────────────────── */}
        {!editando && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 60, padding: '20px 0 34px' }}>
            <button onClick={() => { setPage('automations'); onClose(); }} style={acaoRodape}>
              <div style={circuloAcao}>
                <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" />
                </svg>
              </div>
              Rotina
            </button>
            <button onClick={() => { setEditando(true); }} style={acaoRodape}>
              <div style={circuloAcao}>
                <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z" />
                </svg>
              </div>
              Editar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const itemMenu = {
  display: 'block', width: '100%', textAlign: 'left',
  background: 'transparent', border: 'none', color: '#fff',
  padding: '12px 15px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
};

const rotulo = { color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 600 };

const circuloAcao = {
  width: 52, height: 52, borderRadius: '50%',
  background: 'rgba(255,255,255,0.14)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  marginBottom: 7,
};

const acaoRodape = {
  background: 'transparent', border: 'none', color: '#fff',
  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
  display: 'flex', flexDirection: 'column', alignItems: 'center',
};

export default DeviceDetail;
