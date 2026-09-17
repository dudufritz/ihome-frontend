/**
 * Help.js — Perguntas frequentes. FAQ_SECTIONS vem junto: só é usado aqui.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React, { useState } from 'react';

// ── AJUDA / FAQ ───────────────────────────────────────────────
const FAQ_SECTIONS = [
  {
    title: '🚀 Primeiros passos',
    items: [
      {
        q: 'Como criar uma conta no iHome?',
        a: 'Na tela de login, toque em "Criar conta". Informe seu e-mail e uma senha com pelo menos 6 caracteres. Você receberá um e-mail de confirmação — clique no link para ativar sua conta. Depois é só fazer login normalmente.',
      },
      {
        q: 'Como instalar o app no celular (iPhone)?',
        a: 'Abra o Safari e acesse ihomeauto.com. Toque no ícone de compartilhar (quadrado com seta para cima) na barra inferior. Role a lista e toque em "Adicionar à Tela de Início". Confirme tocando em "Adicionar". O ícone do iHome aparecerá na sua tela inicial.',
      },
      {
        q: 'Como instalar o app no celular (Android)?',
        a: 'Abra o Chrome e acesse ihomeauto.com. Toque nos 3 pontinhos no canto superior direito. Selecione "Adicionar à tela inicial" ou "Instalar app". Confirme. O iHome ficará disponível como qualquer outro app instalado.',
      },
      {
        q: 'O app funciona sem internet?',
        a: 'O iHome precisa de conexão com a internet para controlar seus dispositivos, pois os comandos são enviados via nuvem Tuya. Sem internet, os dispositivos não respondem. Alertas e histórico podem ser visualizados com conexão limitada.',
      },
    ],
  },
  {
    title: '⚙️ Configurando a Tuya',
    items: [
      {
        q: 'O que é a Tuya IoT Platform e por que preciso dela?',
        a: 'A Tuya é a plataforma de nuvem que conecta a maioria dos dispositivos inteligentes do mercado (lâmpadas, tomadas, sensores, etc). Para o iHome controlar seus dispositivos, ele precisa de uma "chave de acesso" gerada pela Tuya. É gratuito criar uma conta de desenvolvedor.',
      },
      {
        q: 'Como obter o Access ID e o Access Secret?',
        a: '1. Acesse platform.tuya.com e crie uma conta gratuita.\n2. Vá em "Cloud" → "Development" → clique em "Create Cloud Project".\n3. Escolha um nome, selecione "Smart Home" como tipo e escolha a região mais próxima.\n4. Na aba "Overview" do projeto, você encontra o "Access ID" e o "Access Secret".\n5. Vá em "Devices" → "Link Tuya App Account" e vincule sua conta do app Tuya/Smart Life.\n6. Cole essas credenciais em Configurações → Credenciais Tuya IoT.',
      },
      {
        q: 'Qual região de servidor devo escolher?',
        a: 'Escolha a região onde seus dispositivos foram configurados:\n• Américas (EUA): para usuários do Brasil e Américas\n• Europa: para usuários europeus\n• Ásia (China): para dispositivos configurados na China\nSe não souber, comece com "Américas (EUA)" — é a mais comum no Brasil.',
      },
      {
        q: 'Minha conta Tuya gratuita tem limites?',
        a: 'A conta gratuita da Tuya permite controlar até 5 dispositivos e tem limite de requisições por mês (suficiente para uso pessoal). Para uso intenso ou mais dispositivos, a Tuya oferece planos pagos. O iHome funciona normalmente dentro dos limites gratuitos.',
      },
    ],
  },
  {
    title: '📱 Dispositivos compatíveis',
    items: [
      {
        q: 'Quais dispositivos funcionam com o iHome?',
        a: 'O iHome é compatível com qualquer dispositivo que use o protocolo Tuya, incluindo:\n• Lâmpadas inteligentes (qualquer marca com Tuya)\n• Tomadas inteligentes\n• Interruptores Wi-Fi\n• Ar-condicionado com controle inteligente\n• Sensores de movimento, temperatura e umidade\n• Câmeras IP Tuya\n• Fechaduras inteligentes\n• Cortinas e persianas motorizadas\n\nMarcas comuns: Intelbras, Positivo Casa Inteligente, Multilaser, Sonoff (modo Tuya), e qualquer produto com app "Smart Life" ou "Tuya Smart".',
      },
      {
        q: 'Como encontrar o ID do meu dispositivo?',
        a: 'Método 1 (Tuya Platform): Acesse platform.tuya.com → seu projeto → "Devices". A lista mostra todos os dispositivos vinculados com o ID (Device ID).\n\nMétodo 2 (App Tuya Smart): Abra o app Tuya Smart ou Smart Life → toque no dispositivo → toque nos 3 pontinhos (⋮) → "Informações do dispositivo" → o ID aparece como "Device ID" ou "ID do dispositivo".',
      },
      {
        q: 'Meu dispositivo aparece como offline. O que fazer?',
        a: '1. Verifique se o dispositivo está ligado na tomada e com Wi-Fi funcionando.\n2. Tente reiniciar o dispositivo (desligue e ligue).\n3. Confirme que o Wi-Fi do dispositivo é 2.4 GHz (a maioria não suporta 5 GHz).\n4. Abra o app Tuya Smart e veja se o dispositivo aparece online lá — se não aparecer, o problema é com a conexão do dispositivo, não com o iHome.\n5. Se o problema persistir, tente desvincular e vincular novamente o dispositivo no app Tuya.',
      },
      {
        q: 'Posso usar dispositivos Zigbee ou Matter?',
        a: 'No momento, o iHome suporta apenas dispositivos Tuya Wi-Fi. Suporte a Zigbee e Matter está em desenvolvimento e será lançado em breve. Para usar Zigbee, o dispositivo precisaria de um hub Zigbee compatível.',
      },
    ],
  },
  {
    title: '🤖 Assistente IA e Automações',
    items: [
      {
        q: 'Quais comandos posso falar ou digitar para o assistente?',
        a: 'O assistente entende linguagem natural. Exemplos:\n• "Apaga a luz da sala"\n• "Liga o ar-condicionado"\n• "Desliga todos os dispositivos"\n• "Liga tudo"\n• "Agenda a luz do quarto para ligar às 18h e desligar à meia-noite"\n• "Que dispositivos tenho?"\n• "Mostra minhas rotinas"\n\nO assistente usa IA (Google Gemini) e interpreta o contexto, então você pode falar de forma natural.',
      },
      {
        q: 'Como criar uma automação (rotina automática)?',
        a: 'Opção 1 — pelo Assistente IA:\nDiga ou escreva: "Agenda a [nome do dispositivo] para ligar às [horário] e desligar às [horário]".\nExemplo: "Agenda a luz da sala para ligar às 19h e desligar às 23h".\n\nOpção 2 — pela página Automação:\nVá em Automação → toque em "+ Nova Rotina" → selecione o dispositivo e os horários de ligar/desligar → salve.',
      },
      {
        q: 'O assistente funciona por voz?',
        a: 'Sim! Toque no ícone do microfone na janela do assistente. O app pedirá permissão para usar o microfone na primeira vez. Fale o comando claramente — o assistente transcreve e processa automaticamente. Funciona melhor no Chrome e Safari.',
      },
      {
        q: 'Posso controlar vários dispositivos de uma vez?',
        a: 'Sim. Use comandos como:\n• "Liga tudo" — liga todos os dispositivos cadastrados\n• "Desliga tudo" — desliga todos\n• "Apaga todas as luzes" — o assistente filtra por tipo\nPara controle individual, basta mencionar o nome do dispositivo.',
      },
    ],
  },
  {
    title: '🔔 Notificações',
    items: [
      {
        q: 'Como ativar notificações no iPhone?',
        a: '1. Primeiro, instale o iHome na tela inicial do iPhone (veja "Como instalar no iPhone").\n2. Abra o app pela tela inicial (não pelo Safari).\n3. Vá em Configurações → toque em "Ativar" em Notificações.\n4. Quando o iPhone perguntar, toque em "Permitir".\n\nImportante: notificações push em iPhone só funcionam quando o app está instalado na tela inicial E você está usando iOS 16.4 ou superior.',
      },
      {
        q: 'Como ativar notificações no Android?',
        a: '1. Acesse ihomeauto.com no Chrome.\n2. Instale o app (3 pontinhos → "Instalar app").\n3. Vá em Configurações → toque em "Ativar" em Notificações.\n4. Quando o Chrome perguntar, toque em "Permitir".\nVocê receberá notificações quando dispositivos ficarem offline ou voltarem online.',
      },
      {
        q: 'Por que não estou recebendo notificações?',
        a: 'Verifique:\n1. O app está instalado na tela inicial (não apenas aberto no navegador).\n2. As notificações estão ativadas nas configurações do próprio iHome.\n3. As notificações do navegador (Chrome/Safari) não estão bloqueadas — confira em Configurações do celular → Notificações.\n4. No iPhone: somente iOS 16.4+ suporta notificações em PWA.',
      },
    ],
  },
  {
    title: '🔧 Problemas comuns',
    items: [
      {
        q: 'Esqueci minha senha. Como recuperar?',
        a: 'Na tela de login, toque em "Esqueci minha senha". Informe seu e-mail cadastrado. Você receberá um link de redefinição de senha por e-mail (verifique também a pasta de spam). Clique no link, crie uma nova senha e faça login normalmente.',
      },
      {
        q: 'O app está lento ou travado. O que fazer?',
        a: '1. Feche e abra o app novamente.\n2. Se instalado como PWA, remova da tela inicial e reinstale para limpar o cache.\n3. Verifique sua conexão com a internet.\n4. Se o problema persistir, acesse ihomeauto.com diretamente pelo navegador e veja se o problema continua.',
      },
      {
        q: 'Adicionei um dispositivo errado. Como remover?',
        a: 'Vá em Configurações → Meus Dispositivos → toque em "Remover" ao lado do dispositivo que deseja excluir. A remoção é imediata e não afeta o dispositivo físico — ele continua funcionando normalmente pelo app Tuya.',
      },
      {
        q: 'Meus dados estão seguros?',
        a: 'Sim. Sua senha nunca é armazenada — guardamos apenas um hash irreversível (bcrypt). O acesso usa tokens de curta duração, renovados automaticamente. As credenciais da sua conta Tuya ficam cifradas com AES-256-GCM no banco, e todo o tráfego é por HTTPS. Nunca compartilhamos suas informações com terceiros.',
      },
    ],
  },
];

function Help() {
  const [openItem, setOpenItem] = useState(null);

  const toggle = key => setOpenItem(openItem === key ? null : key);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Central de Ajuda</div>
      </div>

      <div style={{ padding: '0 0 8px', marginBottom: 8 }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
          Encontre respostas rápidas para as dúvidas mais comuns sobre o iHome.
        </p>
      </div>

      {FAQ_SECTIONS.map(section => (
        <div key={section.title} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 2 }}>
            {section.title}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {section.items.map((item, idx) => {
              const key = section.title + idx;
              const isOpen = openItem === key;
              return (
                <div key={key} style={{ borderBottom: idx < section.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <button
                    onClick={() => toggle(key)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
                      textAlign: 'left', gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: isOpen ? '#3B7EFF' : '#fff', lineHeight: 1.4, flex: 1 }}>
                      {item.q}
                    </span>
                    <span style={{ color: isOpen ? '#3B7EFF' : 'rgba(255,255,255,0.3)', fontSize: 18, flexShrink: 0, lineHeight: 1, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      ›
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(59,126,255,0.1)' }}>
                      {item.a.split('\n').map((line, i) => (
                        <p key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, margin: i === 0 ? '12px 0 0' : '4px 0 0' }}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
          Ainda com dúvidas? Entre em contato:{' '}
          <a href="mailto:eduardosolifritz@gmail.com" style={{ color: '#3B7EFF' }}>
            suporte@ihomeauto.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default Help;
