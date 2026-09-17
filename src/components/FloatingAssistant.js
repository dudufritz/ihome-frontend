/**
 * FloatingAssistant.js — Assistente por texto e voz, em botão flutuante.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API } from '../auth';
import Icons from './Icons';
import IHomeBubbleIcon from './IHomeBubbleIcon';

// ── ASSISTENTE IA (BOLHA FLUTUANTE) ───────────────────────────
function FloatingAssistant({ session }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Olá! Sou o assistente iHome. Diga o que deseja fazer, como "liga a luz da sala" ou "cria rotina para ligar a tomada às 14h e desligar às 20h".' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const bottomRef = useRef(null);
  const headers = { Authorization: `Bearer ${session.access_token}` };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  useEffect(() => {
    if (open) axios.get(`${API}/schedules`, { headers }).then(r => setSchedules(r.data)).catch(() => {});
  }, [open]); // eslint-disable-line

  const sendCommand = async (text) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const r = await axios.post(`${API}/ai-command`, { command: text }, { headers });
      setMessages(prev => [...prev, { role: 'assistant', text: r.data.message || r.data.error }]);
      axios.get(`${API}/schedules`, { headers }).then(r => setSchedules(r.data)).catch(() => {});
    } catch (err) {
      // O backend já devolve o motivo em err.response.data.error — chave
      // inválida, modelo indisponível, cota estourada. Substituí-lo por
      // "tente novamente" transformava uma causa identificável num mistério:
      // repetir o comando não resolveria nenhum desses casos.
      const motivo = err.response?.data?.error;
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: motivo || 'Não consegui falar com o servidor. Verifique sua conexão.',
      }]);
    }
    setLoading(false);
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Reconhecimento de voz não disponível. Use Chrome ou Edge.'); return; }
    const r = new SR();
    r.lang = 'pt-BR';
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = e => { const t = e.results[0][0].transcript; setInput(t); sendCommand(t); };
    r.start();
  };

  const removeSchedule = async id => {
    try {
      await axios.delete(`${API}/schedules/${id}`, { headers });
      setSchedules(schedules.filter(s => s.id !== id));
    } catch {}
  };

  return (
    <>
      {open && (
        <div className="assistant-overlay" onClick={() => setOpen(false)}>
          <div className="assistant-panel" onClick={e => e.stopPropagation()}>
            <div className="assistant-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IHomeBubbleIcon size={28} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Assistente iHome</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Voz ou texto</div>
                </div>
              </div>
              <button className="assistant-close" onClick={() => setOpen(false)}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {schedules.length > 0 && (
              <div className="assistant-schedules">
                <div className="assistant-schedules-title">Rotinas ativas</div>
                {schedules.map(s => (
                  <div key={s.id} className="assistant-schedule-row">
                    <div>
                      <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{s.device_name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                        {s.on_time && `Liga ${s.on_time}`}{s.on_time && s.off_time && ' · '}{s.off_time && `Desliga ${s.off_time}`}
                      </div>
                    </div>
                    <button onClick={() => removeSchedule(s.id)} className="schedule-remove-btn">×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-bubble ${m.role}`}>{m.text}</div>
              ))}
              {loading && <div className="chat-bubble assistant"><span className="chat-dots"><span/><span/><span/></span></div>}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input-row">
              <input
                className="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendCommand(input)}
                placeholder="Digite um comando..."
                disabled={loading}
                autoFocus
              />
              <button className={`chat-mic${listening ? ' listening' : ''}`} onClick={startVoice} disabled={loading} title="Falar">
                {Icons.assistant}
              </button>
              <button className="chat-send" onClick={() => sendCommand(input)} disabled={loading || !input.trim()}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button className={`fab${open ? ' fab-open' : ''}`} onClick={() => setOpen(!open)} title="Assistente iHome">
        {open
          ? <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          : <IHomeBubbleIcon size={30} />
        }
      </button>
    </>
  );
}

export default FloatingAssistant;
