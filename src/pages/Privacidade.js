/**
 * Privacidade.js — Política de Privacidade do iHome.
 *
 * POR QUE EXISTE
 * A LGPD (art. 9º) dá ao titular o direito de saber, de forma clara, QUAIS
 * dados são tratados, PARA QUÊ, COM QUEM são compartilhados, POR QUANTO TEMPO
 * ficam guardados e QUAIS são os seus direitos. Até aqui o app não dizia nada
 * disso em lugar nenhum.
 *
 * POR QUE É UMA PÁGINA PÚBLICA
 * Fica em /privacidade e abre sem login (ver App.js). A pessoa precisa poder
 * ler ANTES de criar a conta — é para isso que o aviso do cadastro aponta
 * para cá. O `navigationFallback` do Static Web App entrega o index.html
 * nesse caminho, e o App decide renderizar esta página.
 *
 * MANUTENÇÃO
 * O texto descreve o que o código faz. Se mudar o que se coleta, com quem se
 * compartilha ou o tempo de retenção, esta página precisa mudar junto — e a
 * data de "última atualização" também.
 */
import React from 'react';

/** Data da última revisão do texto. Atualizar sempre que o conteúdo mudar. */
export const ATUALIZADA_EM = '04/11/2026';

/** Canal do titular para qualquer assunto de privacidade (LGPD art. 41). */
export const CONTATO_PRIVACIDADE = 'ihomeautomacaoresidencial@gmail.com';

const estilo = {
  pagina: { background: '#0B0F19', minHeight: '100vh', color: 'rgba(255,255,255,0.8)', padding: '32px 20px' },
  caixa: { maxWidth: 760, margin: '0 auto', lineHeight: 1.7, fontSize: 14 },
  h1: { color: '#fff', fontSize: 26, margin: '0 0 6px' },
  h2: { color: '#fff', fontSize: 17, margin: '28px 0 8px' },
  sub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 24 },
  tabela: { width: '100%', borderCollapse: 'collapse', fontSize: 13, margin: '8px 0' },
  th: { textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.12)', color: '#fff' },
  td: { padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', verticalAlign: 'top' },
  link: { color: '#3B7EFF' },
};

/** Tabela simples: cabeçalhos + linhas. */
function Tabela({ cabecalho, linhas }) {
  return (
    <table style={estilo.tabela}>
      <thead><tr>{cabecalho.map((c) => <th key={c} style={estilo.th}>{c}</th>)}</tr></thead>
      <tbody>
        {linhas.map((l, i) => (
          <tr key={i}>{l.map((c, j) => <td key={j} style={estilo.td}>{c}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

function Privacidade() {
  return (
    <div style={estilo.pagina}>
      <div style={estilo.caixa}>
        <a href="/" style={estilo.link}>← Voltar ao iHome</a>

        <h1 style={{ ...estilo.h1, marginTop: 20 }}>Política de Privacidade</h1>
        <div style={estilo.sub}>Última atualização: {ATUALIZADA_EM}</div>

        <p>
          Esta política explica, em linguagem direta, quais dados pessoais o iHome trata, para quê,
          com quem eles são compartilhados, por quanto tempo ficam guardados e como você exerce os
          seus direitos, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
        </p>

        <h2 style={estilo.h2}>1. Quem é o responsável</h2>
        <p>
          O controlador dos dados é a <strong>iHome Automação Residencial</strong>. Para qualquer
          assunto de privacidade, inclusive o exercício dos seus direitos, escreva para{' '}
          <a href={`mailto:${CONTATO_PRIVACIDADE}`} style={estilo.link}>{CONTATO_PRIVACIDADE}</a>.
        </p>

        <h2 style={estilo.h2}>2. Quais dados coletamos e para quê</h2>
        <p>Coletamos apenas o necessário para o app funcionar. Não pedimos CPF nem telefone.</p>
        <Tabela
          cabecalho={['Dado', 'Para que serve', 'Base legal (LGPD)']}
          linhas={[
            ['E-mail', 'Identificar sua conta, entrar no app, recuperar a senha, receber convites', 'Execução de contrato (art. 7º, V)'],
            ['Nome', 'Identificar a sua conta para você no app (aparece em Configurações). É opcional', 'Execução de contrato (art. 7º, V)'],
            ['Senha', 'Proteger o acesso. Guardamos apenas um resumo criptográfico (bcrypt), nunca a senha', 'Execução de contrato (art. 7º, V)'],
            ['Credenciais da sua conta Tuya', 'Ligar, desligar e consultar os seus aparelhos. O segredo é guardado cifrado (AES)', 'Execução de contrato (art. 7º, V)'],
            ['Aparelhos, cômodos, rotinas e alertas', 'Montar a sua casa no app, executar rotinas e avisar quando algo cai', 'Execução de contrato (art. 7º, V)'],
            ['Histórico de ações (auditoria), com IP e navegador', 'Mostrar ao dono da casa quem fez o quê, e investigar uso indevido', 'Legítimo interesse — segurança (art. 7º, IX)'],
            ['Inscrição de notificações', 'Enviar avisos ao seu navegador, se você ativar', 'Consentimento (art. 7º, I) — você liga e desliga quando quiser'],
          ]}
        />

        <h2 style={estilo.h2}>3. Com quem compartilhamos</h2>
        <p>
          Não vendemos dados e não usamos ferramentas de publicidade ou rastreamento. Para o app
          funcionar, alguns dados passam por estes serviços — todos com servidores fora do Brasil,
          o que configura transferência internacional (art. 33 da LGPD):
        </p>
        <Tabela
          cabecalho={['Serviço', 'O que recebe', 'Por quê']}
          linhas={[
            ['Microsoft Azure (EUA e Canadá)', 'Todos os dados acima', 'Hospedagem do app e do banco de dados'],
            ['Tuya (conforme o data center da sua conta)', 'Comandos e consultas aos seus aparelhos', 'É a nuvem que controla os aparelhos Smart Life'],
            ['Google Gemini (EUA)', 'Somente o nome e o cômodo dos aparelhos e o comando que você digitou — nunca seu e-mail ou nome', 'Interpretar os comandos do assistente, quando você o usa'],
            ['Google Gmail (EUA)', 'Seu endereço de e-mail e o conteúdo da mensagem', 'Enviar confirmação de cadastro, redefinição de senha e convites'],
          ]}
        />

        <h2 style={estilo.h2}>4. Por quanto tempo guardamos</h2>
        <ul>
          <li><strong>Dados da conta e da casa:</strong> enquanto a conta existir.</li>
          <li><strong>Histórico de ações (auditoria):</strong> 90 dias. Depois disso é apagado automaticamente.</li>
          <li><strong>Sessões de acesso:</strong> expiram em 30 dias sem uso.</li>
          <li>
            <strong>Ao excluir a conta:</strong> tudo é apagado na hora. A única exceção são as ações
            que você fez na casa de outra pessoa, como convidado: elas fazem parte do histórico
            daquela casa, então ficam — mas sem o seu e-mail, IP ou navegador.
          </li>
        </ul>

        <h2 style={estilo.h2}>5. Seus direitos e como exercê-los</h2>
        <Tabela
          cabecalho={['Direito (art. 18)', 'Como fazer']}
          linhas={[
            ['Saber se tratamos seus dados e acessá-los', 'Configurações → Baixar meus dados'],
            ['Portabilidade', 'Configurações → Baixar meus dados (arquivo JSON)'],
            ['Eliminação', 'Configurações → Excluir conta'],
            ['Revogar o consentimento das notificações', 'Configurações → Notificações → Desativar'],
            ['Correção, informação sobre compartilhamento e demais direitos', `E-mail para ${CONTATO_PRIVACIDADE}`],
          ]}
        />
        <p>
          Se não estiver satisfeito com a resposta, você também pode reclamar à Autoridade Nacional
          de Proteção de Dados (ANPD).
        </p>

        <h2 style={estilo.h2}>6. Segurança</h2>
        <p>
          Toda a comunicação usa HTTPS. Senhas são guardadas com bcrypt, o segredo da Tuya é cifrado
          com AES antes de ir ao banco, as sessões guardam só um resumo do token, e as tentativas de
          login têm limite contra força bruta. Nenhum sistema é infalível: se identificarmos um
          incidente que possa trazer risco a você, avisaremos você e a ANPD (art. 48).
        </p>

        <h2 style={estilo.h2}>7. Armazenamento no navegador</h2>
        <p>
          O app guarda a sua sessão no armazenamento local do navegador, apenas para você continuar
          conectado. Não usamos cookies de publicidade nem de análise.
        </p>

        <h2 style={estilo.h2}>8. Mudanças nesta política</h2>
        <p>
          Se esta política mudar, a data no topo da página será atualizada. Mudanças relevantes serão
          avisadas no app.
        </p>
      </div>
    </div>
  );
}

export default Privacidade;
