/**
 * AuditLog.js — Tela de auditoria: filtros, paginação e leitura do registro.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../auth';
import Icons from '../components/Icons';

// ── ALERTAS ───────────────────────────────────────────────────
// ── REGISTRO DE AUDITORIA ─────────────────────────────────────
function AuditLog({ session }) {
  const [entries, setEntries]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [actors, setActors]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [offset, setOffset]     = useState(0);
  const [filters, setFilters]   = useState({ actor: '', result: '', from: '', to: '', q: '' });
  const PAGE = 50;
  const headers = { Authorization: `Bearer ${session.access_token}` };
  const myEmail = session?.user?.email;

  // Monta a query string apenas com os filtros preenchidos
  const buildParams = (off) => {
    const p = new URLSearchParams({ limit: String(PAGE), offset: String(off) });
    Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v); });
    return p.toString();
  };

  const load = (off = 0) => {
    setLoading(true);
    axios.get(`${API}/audit-log?${buildParams(off)}`, { headers })
      .then(r => {
        setEntries(r.data.entries || []);
        setTotal(r.data.total || 0);
        setOffset(off);
      })
      .catch(() => { setEntries([]); setTotal(0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    axios.get(`${API}/audit-log/actors`, { headers })
      .then(r => setActors(r.data || []))
      .catch(() => {});
  }, []); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => load(0), filters.q ? 350 : 0); // debounce só na busca
    return () => clearTimeout(t);
  }, [filters]); // eslint-disable-line

  const resultConfig = {
    success: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  label: 'Executado' },
    error:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Falhou'    },
    denied:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Negado'    },
  };

  // Data e hora completas — em auditoria, "há 5 min" não serve como evidência
  const formatStamp = ts => {
    const d = new Date(ts);
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const clearFilters = () => setFilters({ actor: '', result: '', from: '', to: '', q: '' });
  const hasFilters = Object.values(filters).some(Boolean);

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '9px 12px', color: '#fff', fontSize: 13, outline: 'none',
    fontFamily: 'inherit', minWidth: 0,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Auditoria</div>
          <div className="page-subtitle">
            {total} registro{total !== 1 ? 's' : ''}
            {hasFilters ? ' com os filtros aplicados' : ''}
          </div>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>
            Limpar filtros
          </button>
        )}
      </div>

      {/* ── FILTROS ── */}
      <div className="card" style={{ marginBottom: 16, display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        <input
          style={inputStyle} placeholder="Buscar dispositivo, usuário, ação..."
          value={filters.q}
          onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
        />
        <select style={inputStyle} value={filters.actor} onChange={e => setFilters(f => ({ ...f, actor: e.target.value }))}>
          <option value="">Todos os usuários</option>
          {actors.map(a => <option key={a} value={a}>{a === myEmail ? `${a} (você)` : a}</option>)}
        </select>
        <select style={inputStyle} value={filters.result} onChange={e => setFilters(f => ({ ...f, result: e.target.value }))}>
          <option value="">Todos os resultados</option>
          <option value="success">Executado</option>
          <option value="error">Falhou</option>
          <option value="denied">Negado</option>
        </select>
        <input type="date" style={inputStyle} value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} title="De" />
        <input type="date" style={inputStyle} value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} title="Até" />
      </div>

      {loading ? (
        <div className="loading">Carregando registros...</div>
      ) : entries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ margin: '0 auto 16px', opacity: 0.25, lineHeight: 0, width: 44 }}>{Icons.audit}</div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
            {hasFilters ? 'Nenhum registro para esses filtros' : 'Nenhum registro ainda'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
            {hasFilters
              ? 'Ajuste ou limpe os filtros para ver mais.'
              : 'Toda ação em dispositivos passa a ser registrada aqui com autor, horário e resultado.'}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map(e => {
              const cfg = resultConfig[e.result] || resultConfig.success;
              const summary = e.details?.summary || 'Comando enviado';
              const isMe = e.actor_email === myEmail;
              const inMyHome = e.home_owner_email === myEmail;
              return (
                <div className="card" key={e.id} style={{ padding: 14, borderLeft: `3px solid ${cfg.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                          {summary}
                        </span>
                        {e.device_name && (
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                            &middot; {e.device_name}
                          </span>
                        )}
                        {/*
                          O cômodo veio de um pedido de quem usa o sistema numa
                          empresa de instalação: "como a gente instala vários
                          iguais na mesma casa, 'Interruptor 3' não me diz onde
                          foi". Sem o cômodo, o registro identifica o aparelho
                          mas não o lugar — que é justamente o que se quer saber
                          ao investigar o que aconteceu numa casa de cliente.

                          Vem de details.room, gravado junto com a ação. Ler do
                          cadastro atual seria mais simples, mas mudaria o
                          passado: mover um dispositivo de cômodo reescreveria
                          o histórico inteiro dele. Registro de auditoria conta
                          o que era verdade no momento do fato.
                        */}
                        {e.details?.room && (
                          <span style={{
                            background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)',
                            fontSize: 11, borderRadius: 6, padding: '2px 7px',
                          }}>
                            {e.details.room}
                          </span>
                        )}
                        <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 7px', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                          {cfg.label}
                        </span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12.5 }}>
                        {isMe ? 'Você' : e.actor_email}
                        {!inMyHome && <> &middot; na casa de {e.home_owner_email}</>}
                        {inMyHome && !isMe && <> &middot; convidado na sua casa</>}
                      </div>
                      {e.error_message && (
                        <div style={{ color: cfg.color, fontSize: 12, marginTop: 5 }}>
                          {e.error_message}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12.5, fontVariantNumeric: 'tabular-nums' }}>
                        {formatStamp(e.created_at)}
                      </div>
                      {e.ip_address && (
                        <div style={{ color: 'rgba(255,255,255,0.22)', fontSize: 11, marginTop: 3 }}>
                          {e.ip_address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── PAGINAÇÃO ── */}
          {total > PAGE && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 18 }}>
              <button
                onClick={() => load(Math.max(offset - PAGE, 0))}
                disabled={offset === 0}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', color: offset === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', fontSize: 12, cursor: offset === 0 ? 'default' : 'pointer' }}>
                Anterior
              </button>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                {offset + 1}–{Math.min(offset + PAGE, total)} de {total}
              </span>
              <button
                onClick={() => load(offset + PAGE)}
                disabled={offset + PAGE >= total}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', color: offset + PAGE >= total ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', fontSize: 12, cursor: offset + PAGE >= total ? 'default' : 'pointer' }}>
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AuditLog;
