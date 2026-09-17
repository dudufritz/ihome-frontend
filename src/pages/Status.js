/**
 * Status.js — Indicadores de saúde da instalação.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 *
 * POR QUE ESTA TELA FOI REESCRITA
 *
 * A versão anterior exibia três notas fixas no código — Segurança 90,
 * Energia 85, Ambiente 90 — e o rótulo "Excelente" independentemente do
 * estado real da casa. Uma instalação com todos os dispositivos offline
 * mostrava a mesma nota de uma instalação perfeita.
 *
 * Pior que impreciso, era indefensável: não havia como responder "de onde
 * vem esse número". E duas das notas mediam coisas que o iHome nem coleta —
 * não há sensor de consumo elétrico nem de qualidade do ar no projeto.
 *
 * A regra desta tela passou a ser: só entra indicador que seja calculado a
 * partir de dado que o sistema realmente possui, e cada nota mostra na tela
 * a fração que a originou. Se o dado não existe, o indicador diz que não há
 * como medir em vez de inventar um número.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API } from '../auth';
import Icons from '../components/Icons';

/**
 * Rótulo derivado da nota — nunca fixo.
 *
 * Os cortes são uma escolha de produto, não uma medida: 90 para "Excelente"
 * porque com 10 dispositivos isso significa no máximo um problema; 50 como
 * piso de "Atenção" porque abaixo da metade o problema deixa de ser pontual.
 */
function classificar(nota) {
  if (nota >= 90) return { texto: 'Excelente', cor: '#22c55e' };
  if (nota >= 75) return { texto: 'Bom',       cor: '#84cc16' };
  if (nota >= 50) return { texto: 'Atenção',   cor: '#eab308' };
  return { texto: 'Crítico', cor: '#ef4444' };
}

function Status({ devices, session }) {
  const [alertas, setAlertas] = useState(null);
  const [rotinas, setRotinas] = useState(null);

  // Alertas e rotinas não vêm no objeto `devices`; são buscados aqui.
  // Falha de rede deixa o estado em lista vazia em vez de travar a tela —
  // o indicador correspondente simplesmente informa que não pôde medir.
  useEffect(() => {
    if (!session) return;
    const cfg = { headers: { Authorization: `Bearer ${session.access_token}` } };
    axios.get(`${API}/alerts`, cfg).then((r) => setAlertas(r.data || [])).catch(() => setAlertas([]));
    axios.get(`${API}/schedules`, cfg).then((r) => setRotinas(r.data || [])).catch(() => setRotinas([]));
  }, [session]);

  const total = devices.length;
  const online = devices.filter((d) => d.online).length;
  const comComodo = devices.filter((d) => d.room && d.room.trim()).length;
  // Sensores não aceitam comando, então não podem ter rotina de horário.
  // Incluí-los no denominador puniria a instalação por um limite do aparelho.
  const controlaveis = devices.filter((d) => d.isControllable);

  // Quedas dos últimos 7 dias. O monitor só grava TRANSIÇÃO (ficou offline /
  // voltou), então cada linha aqui é um evento distinto, não a repetição de
  // um mesmo dispositivo fora do ar.
  const seteDiasAtras = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const quedas = (alertas || []).filter(
    (a) => a.type === 'offline' && new Date(a.created_at).getTime() >= seteDiasAtras
  ).length;

  const idsComRotina = new Set((rotinas || []).filter((r) => r.active).map((r) => r.device_id));
  const comRotina = controlaveis.filter((d) => idsComRotina.has(d.id)).length;

  /**
   * Cada indicador declara: a nota, a fração que a gerou e o que ela mede.
   * `nota: null` significa "não há como medir" — e é diferente de zero.
   */
  const indicadores = [
    {
      nome: 'Conectividade',
      icone: Icons.status,
      cor: 'rgba(59,126,255,0.12)',
      nota: total > 0 ? Math.round((online / total) * 100) : null,
      base: total > 0 ? `${online} de ${total} dispositivos respondendo agora` : 'Nenhum dispositivo cadastrado',
      medida: 'dispositivos online ÷ total',
    },
    {
      nome: 'Estabilidade',
      icone: Icons.alerts,
      cor: 'rgba(34,197,94,0.12)',
      // Cada queda custa 10 pontos: dez quedas em uma semana zeram a nota.
      // O peso é uma escolha declarada, não uma medida — está aqui, na tela,
      // justamente para poder ser discutido em vez de parecer objetivo.
      //
      // Sem dispositivo nenhum a nota é null, e não 100: "nunca caiu" só
      // significa alguma coisa quando existe algo que poderia ter caído.
      nota: alertas === null || total === 0 ? null : Math.max(0, 100 - quedas * 10),
      base: total === 0
        ? 'Nenhum dispositivo para monitorar'
        : alertas === null ? 'Carregando histórico...'
        : quedas === 0 ? 'Nenhuma queda nos últimos 7 dias'
        : `${quedas} queda${quedas > 1 ? 's' : ''} nos últimos 7 dias`,
      medida: '100 − (quedas em 7 dias × 10)',
    },
    {
      nome: 'Organização',
      icone: Icons.devices,
      cor: 'rgba(168,85,247,0.12)',
      nota: total > 0 ? Math.round((comComodo / total) * 100) : null,
      base: total > 0 ? `${comComodo} de ${total} dispositivos com cômodo definido` : 'Nenhum dispositivo cadastrado',
      medida: 'dispositivos com cômodo ÷ total',
    },
    {
      nome: 'Automação',
      icone: Icons.automations,
      cor: 'rgba(234,179,8,0.12)',
      nota: rotinas === null || controlaveis.length === 0
        ? null
        : Math.round((comRotina / controlaveis.length) * 100),
      base: controlaveis.length === 0
        ? 'Nenhum dispositivo aceita comando'
        : rotinas === null ? 'Carregando rotinas...'
        : `${comRotina} de ${controlaveis.length} dispositivos controláveis com rotina ativa`,
      medida: 'controláveis com rotina ÷ controláveis',
    },
  ];

  // A média ignora os indicadores sem dado. Contá-los como zero diria que a
  // casa vai mal quando a verdade é que não sabemos.
  const medidos = indicadores.filter((i) => i.nota !== null);
  const geral = medidos.length > 0
    ? Math.round(medidos.reduce((a, i) => a + i.nota, 0) / medidos.length)
    : null;
  const classe = geral === null ? null : classificar(geral);

  return (
    <div className="page">
      <div className="page-title" style={{ marginBottom: 16 }}>Status da Instalação</div>

      <div className="card score-card" style={{ marginBottom: 14 }}>
        {geral === null ? (
          <>
            <div className="score-num" style={{ fontSize: 28 }}>—</div>
            <div className="score-desc">Cadastre dispositivos para que os indicadores possam ser calculados.</div>
          </>
        ) : (
          <>
            <div className="score-num">{geral}<span className="score-den">/100</span></div>
            <div className="score-label" style={{ color: classe.cor }}>{classe.texto}</div>
            <div className="score-desc">
              Média de {medidos.length} indicador{medidos.length > 1 ? 'es' : ''} medido
              {medidos.length > 1 ? 's' : ''} a partir dos seus dispositivos.
            </div>
          </>
        )}
      </div>

      <div className="card">
        {indicadores.map((i) => (
          <div className="stat-row" key={i.nome}>
            <div className="stat-icon" style={{ background: i.cor }}>
              <div style={{ width: 17, height: 17 }}>{i.icone}</div>
            </div>
            <div className="stat-info">
              <div className="stat-name">{i.nome}</div>
              <div className="stat-sub">{i.base}</div>
              {/* A fórmula fica visível de propósito: um número sem origem
                  declarada não é informação, é decoração. */}
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{i.medida}</div>
            </div>
            <span
              className="stat-score"
              style={i.nota === null ? { color: 'rgba(255,255,255,0.28)' } : { color: classificar(i.nota).cor }}
            >
              {i.nota === null ? 'sem dado' : `${i.nota}/100`}
            </span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 12, lineHeight: 1.6 }}>
        Todos os indicadores são calculados no momento em que esta tela abre, a partir
        dos seus dispositivos, dos alertas do monitor e das rotinas cadastradas.
        Consumo elétrico e qualidade do ar não aparecem aqui porque o iHome não
        coleta esses dados.
      </div>
    </div>
  );
}

export default Status;
