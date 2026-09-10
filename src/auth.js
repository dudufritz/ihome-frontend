/**
 * auth.js — Cliente de autenticação do iHome.
 *
 * Fala com as rotas /auth do próprio backend e expõe uma superfície de
 * métodos deliberadamente convencional (signInWithPassword, signUp,
 * getSession, onAuthStateChange). Seguir a convenção dos clientes de
 * identidade conhecidos foi o que permitiu trocar o provedor de
 * autenticação alterando 6 linhas do App.js e nenhuma da tela de login.
 *
 * ═══════════════════════════════════════════════════════════════
 *  COMO A SESSÃO SE MANTÉM VIVA
 * ═══════════════════════════════════════════════════════════════
 * O backend emite dois tokens:
 *   - access token  — JWT de 15 minutos, enviado em toda requisição;
 *   - refresh token — opaco, de 30 dias, serve só para obter um access novo.
 *
 * Quando o access token expira, o backend responde 401 com
 * code: 'token_expired'. O interceptor do axios instalado aqui captura essa
 * resposta, troca o refresh por um par novo e REFAZ a requisição original —
 * tudo isso sem que a tela perceba. É por isso que nenhum componente do
 * App.js precisou saber que o access token dura 15 minutos.
 *
 * ═══════════════════════════════════════════════════════════════
 *  ONDE OS TOKENS FICAM GUARDADOS
 * ═══════════════════════════════════════════════════════════════
 * Em localStorage, para a sessão sobreviver ao fechar o navegador.
 *
 * O compromisso assumido: localStorage é legível por JavaScript, então um
 * XSS conseguiria ler os tokens. A alternativa mais segura seriam cookies
 * httpOnly, invisíveis ao JS — mas exigiriam CORS com credenciais e proteção
 * contra CSRF, que localStorage dispensa por não ser enviado automaticamente.
 * Optamos por localStorage e mitigamos o XSS na origem: o React escapa
 * todo conteúdo por padrão e o projeto não usa dangerouslySetInnerHTML.
 */
import axios from 'axios';

export const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const CHAVE_SESSAO = 'ihome.session';

// Ouvintes de mudança de sessão (login, logout, renovação de token).
let listeners = [];

/** Lê a sessão guardada. Retorna null se não houver ou se estiver corrompida. */
function lerSessao() {
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    if (!bruto) return null;
    const s = JSON.parse(bruto);
    // Sessão sem token é lixo de uma versão anterior: descarta.
    return s && s.access_token ? s : null;
  } catch {
    return null; // JSON inválido ou localStorage bloqueado
  }
}

/** Grava a sessão e avisa quem estiver ouvindo. */
function gravarSessao(sessao) {
  try {
    if (sessao) localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    else localStorage.removeItem(CHAVE_SESSAO);
  } catch {
    // Modo privado de alguns navegadores bloqueia a escrita. A sessão segue
    // válida em memória até a aba fechar — degrada, não quebra.
  }
  listeners.forEach((cb) => cb(sessao ? 'SIGNED_IN' : 'SIGNED_OUT', sessao));
}

/** Converte a resposta do backend no formato de sessão usado pelo app. */
function montarSessao(data) {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user,
  };
}

/**
 * Traduz o erro do axios numa mensagem legível.
 * Sem isso, uma queda de rede apareceria como "Network Error" para o usuário.
 */
function extrairErro(err, padrao) {
  if (err?.response?.data?.error) return { message: err.response.data.error };
  if (err?.request) return { message: 'Não foi possível falar com o servidor. Verifique sua conexão.' };
  return { message: padrao };
}

// ═══════════════════════════════════════════════════════════════
//  RENOVAÇÃO AUTOMÁTICA DO ACCESS TOKEN
// ═══════════════════════════════════════════════════════════════

/**
 * Promessa da renovação em andamento.
 *
 * Serve para evitar uma tempestade de renovações: se cinco requisições
 * falharem com 401 ao mesmo tempo, todas aguardam a MESMA renovação em vez
 * de dispararem cinco chamadas concorrentes a /auth/refresh — o que, com a
 * rotação de tokens do backend, faria as quatro últimas serem interpretadas
 * como reuso e derrubaria a sessão do usuário.
 */
let renovacaoEmAndamento = null;

async function renovarSessao() {
  const atual = lerSessao();
  if (!atual?.refresh_token) return null;

  if (!renovacaoEmAndamento) {
    renovacaoEmAndamento = axios
      .post(`${API}/auth/refresh`, { refresh_token: atual.refresh_token })
      .then((r) => {
        const nova = montarSessao(r.data);
        gravarSessao(nova);
        return nova;
      })
      .catch(() => {
        // Refresh recusado: a sessão acabou de verdade.
        gravarSessao(null);
        return null;
      })
      .finally(() => {
        renovacaoEmAndamento = null;
      });
  }
  return renovacaoEmAndamento;
}

/**
 * Instala o interceptor que renova o token e repete a requisição.
 * Chamado uma única vez, na carga do módulo.
 */
function instalarInterceptor() {
  axios.interceptors.response.use(
    (resposta) => resposta,
    async (erro) => {
      const requisicao = erro.config;
      const expirou = erro?.response?.status === 401
        && erro?.response?.data?.code === 'token_expired';

      // `_jaTentou` impede laço infinito: se a requisição repetida falhar
      // de novo com 401, o erro sobe para quem chamou.
      if (!expirou || !requisicao || requisicao._jaTentou) {
        return Promise.reject(erro);
      }
      requisicao._jaTentou = true;

      const nova = await renovarSessao();
      if (!nova) return Promise.reject(erro);

      requisicao.headers = requisicao.headers || {};
      requisicao.headers.Authorization = `Bearer ${nova.access_token}`;
      return axios(requisicao);
    }
  );
}
instalarInterceptor();

// ═══════════════════════════════════════════════════════════════
//  API PÚBLICA
// ═══════════════════════════════════════════════════════════════

export const auth = {
  /** Sessão atual, lida do localStorage. */
  async getSession() {
    return { data: { session: lerSessao() }, error: null };
  },

  /**
   * Registra um ouvinte de mudança de sessão.
   * Devolve { data: { subscription: { unsubscribe } } } — o formato que o
   * useEffect do App.js espera para cancelar a inscrição ao desmontar.
   */
  onAuthStateChange(callback) {
    listeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            listeners = listeners.filter((l) => l !== callback);
          },
        },
      },
    };
  },

  /** Login por e-mail e senha. */
  async signInWithPassword({ email, password }) {
    try {
      const r = await axios.post(`${API}/auth/login`, { email, password });
      gravarSessao(montarSessao(r.data));
      return { error: null };
    } catch (err) {
      return { error: extrairErro(err, 'E-mail ou senha incorretos.') };
    }
  },

  /**
   * Cadastro. Os campos extras (nome, CPF, telefone) vêm em options.data,
   * seguindo a convenção que a tela de registro já usava.
   */
  async signUp({ email, password, options }) {
    const extras = options?.data || {};
    try {
      const r = await axios.post(`${API}/auth/register`, {
        email,
        password,
        full_name: extras.full_name,
        cpf: extras.cpf,
        phone: extras.phone,
      });
      gravarSessao(montarSessao(r.data));
      return { error: null };
    } catch (err) {
      return { error: extrairErro(err, 'Não foi possível criar a conta.') };
    }
  },

  /** Solicita o e-mail de redefinição de senha. */
  async resetPasswordForEmail(email) {
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      return { error: null };
    } catch (err) {
      return { error: extrairErro(err, 'Não foi possível enviar o e-mail.') };
    }
  },

  /** Define a nova senha a partir do token recebido por e-mail. */
  async resetPassword({ token, password }) {
    try {
      await axios.post(`${API}/auth/reset-password`, { token, password });
      return { error: null };
    } catch (err) {
      return { error: extrairErro(err, 'Não foi possível redefinir a senha.') };
    }
  },

  /**
   * Encerra a sessão.
   * Avisa o backend para revogar o refresh token, mas limpa o estado local
   * de qualquer forma: se a rede estiver fora, o usuário ainda espera sair.
   */
  async signOut() {
    const atual = lerSessao();
    try {
      if (atual?.refresh_token) {
        await axios.post(`${API}/auth/logout`, { refresh_token: atual.refresh_token });
      }
    } catch {
      // falha de rede não deve impedir o logout local
    }
    gravarSessao(null);
    return {};
  },
};
