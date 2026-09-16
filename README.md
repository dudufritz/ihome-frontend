# iHome — Frontend

Progressive Web App do iHome, sistema de automação residencial. Instala no celular direto pelo navegador, funciona offline e controla dispositivos Tuya IoT por toque ou por comando em português.

**Autor:** Eduardo Fritz · eduardosolifritz@gmail.com
**Instituição:** Centro Universitário Católica de Santa Catarina — Engenharia de Software
**Disciplina:** Portfólio · 2026/2

| | |
|---|---|
| **Backend** | [ihome-backend](https://github.com/dudufritz/ihome-backend) |
| **Documentação** | [Wiki](../../wiki) |
| **Stack** | React 18 · Create React App · PWA · Azure Static Web Apps |

---

## Como rodar

```bash
git clone https://github.com/dudufritz/ihome-frontend.git
cd ihome-frontend
npm install

cp .env.example .env.local     # REACT_APP_API_URL=http://localhost:3001
npm start                      # http://localhost:3000
```

Requer o [backend](https://github.com/dudufritz/ihome-backend) rodando.

### Testes

```bash
npm test                       # 49 testes, cobertura mínima exigida: 25%
```

---

## Estrutura

```
src/
├── App.js          Composição: sessão, navegação e estado compartilhado
├── App.test.js     Suíte de testes
├── auth.js         Cliente de autenticação: sessão, renovação de token, chamadas /auth
├── App.css         Estilos
├── index.js        Ponto de entrada do React
├── components/     Peças reutilizadas por mais de uma tela
│   ├── Icons.js             Conjunto de ícones SVG
│   ├── DeviceIcon.js        Escolhe o ícone pela categoria do dispositivo
│   ├── PasswordField.js     Campo de senha com o botão de revelar
│   ├── Toggle.js            Interruptor de ligar e desligar
│   ├── LoginLogo.js         Logo completa da tela de login
│   ├── SidebarLogo.js       Logo reduzida da barra lateral
│   ├── IHomeBubbleIcon.js   Ícone do botão flutuante
│   ├── Sidebar.js           Navegação lateral do desktop
│   ├── BottomNav.js         Navegação inferior do celular
│   └── FloatingAssistant.js Assistente por texto e voz
├── pages/          Uma tela inteira por arquivo
│   ├── Login.js          Entrar, criar conta e recuperar senha
│   ├── Dashboard.js      Visão geral e alertas recentes
│   ├── Devices.js        Dispositivos: filtro por cômodo e acionamento
│   ├── Automations.js    Rotinas por horário
│   ├── Alerts.js         Dispositivos que saíram ou voltaram do ar
│   ├── Cameras.js        Câmeras da casa
│   ├── Status.js         Indicadores de saúde da casa
│   ├── AuditLog.js       Auditoria: filtros, busca e paginação
│   ├── Downloads.js      Instalação do PWA e exportação
│   ├── Help.js           Perguntas frequentes
│   └── Settings.js       Credenciais, compartilhamento e notificações
└── utils/
    └── push.js     Conversão da chave VAPID para o formato do PushManager
public/
├── manifest.json      Manifesto do PWA — é o que permite instalar no celular
├── service-worker.js  Cache offline
└── logo.png           Identidade visual
```

**A regra da divisão:** tela inteira vai em `pages/`, peça usada por mais de uma
tela vai em `components/`. O `App.js` guarda só o que é composição — sessão,
navegação e o estado que as telas compartilham.

O arquivo tinha **2.138 linhas e 22 componentes**; hoje tem 130 e nenhuma tela.
A separação começou por um code review externo, que apontou o problema antes que
ele piorasse, e revelou de quebra uma variável morta que reprovava o build de
produção — invisível num arquivo de duas mil linhas, óbvia num de quinhentas.

---

## Telas

| Tela | O que faz |
|---|---|
| **Visão Geral** | Painel com contadores, dispositivos recentes e últimos alertas |
| **Dispositivos** | Lista com estado em tempo real e controle por toque |
| **Automação** | Rotinas agendadas por horário |
| **Alertas** | Histórico de quedas e retornos de conexão |
| **Câmeras** | Dispositivos de vídeo |
| **Status** | Indicadores de disponibilidade |
| **Auditoria** | Quem fez o quê e quando, com filtros por usuário, resultado e período |
| **Configurações** | Credenciais Tuya, compartilhamento de casa e notificações |
| **Assistente** | Campo flutuante para comandos em linguagem natural |

---

## Decisões técnicas

**PWA em vez de app nativo.** Instala pelo navegador, sem loja de aplicativos, e a mesma base de código atende celular e desktop. Para um sistema cuja função é acionar dispositivos remotos, a diferença prática em relação a um app nativo é irrelevante — e o custo de manutenção de duas plataformas nativas, não.

**Sessão renovada por interceptor.** O access token dura 15 minutos. Quando expira, o backend responde 401 com `code: 'token_expired'`; um interceptor do axios em `auth.js` troca o refresh por um par novo e refaz a requisição original. Nenhum componente precisa saber que o token expira.

Há uma trava para renovações concorrentes: se várias requisições falharem ao mesmo tempo, todas aguardam a mesma renovação. Sem isso, o backend interpretaria as chamadas simultâneas como reuso de refresh token — que é o sinal de roubo — e derrubaria a sessão do usuário.

**Tokens em localStorage.** Compromisso assumido: é legível por JavaScript, então um XSS os alcançaria. A alternativa mais segura seriam cookies `httpOnly`, que exigiriam CORS com credenciais e proteção contra CSRF. Optamos por localStorage e mitigamos o XSS na origem — o React escapa todo conteúdo por padrão e o projeto não usa `dangerouslySetInnerHTML` em lugar nenhum.

**`auth.js` mantém a superfície de um cliente de identidade.** Os métodos (`signInWithPassword`, `signUp`, `getSession`, `onAuthStateChange`) seguem uma convenção conhecida. Foi o que permitiu trocar o provedor de autenticação alterando 6 linhas do `App.js` e nenhuma da tela de login.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `REACT_APP_API_URL` | sim, em produção | URL base da API |

> ⚠️ No Create React App as variáveis `REACT_APP_*` são substituídas no código **durante o build**, não lidas em tempo de execução. Se faltar no build de produção, o site publicado tentará falar com `localhost:3001`. O workflow de CI falha de propósito quando o secret está ausente, em vez de publicar um site quebrado.

---

## Qualidade

| | |
|---|---|
| Testes | 49, com Jest e React Testing Library |
| Análise estática | SonarCloud, executado a cada push |
| CI/CD | GitHub Actions — testes, portão de cobertura, build e deploy no Static Web Apps |

O job de deploy só executa se o de testes passar, e o pipeline falha se a cobertura cair abaixo de 25%.

---

## Licença

Projeto acadêmico desenvolvido para a disciplina de Portfólio do Centro Universitário Católica de Santa Catarina.
