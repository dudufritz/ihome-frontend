/**
 * auth.test.js — Testes do cliente de autenticação.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * ---------------------------
 * O auth.js estava em 0% de cobertura, e é onde moram as decisões menos
 * óbvias do frontend: a renovação silenciosa do access token, a guarda
 * contra laço infinito no interceptor e a prevenção de tempestade de
 * renovações. Nada disso aparece na tela — então, sem teste, uma regressão
 * só seria notada quando a sessão de alguém caísse sem motivo aparente.
 *
 * COMO O AXIOS É SIMULADO
 * -----------------------
 * O auth.js instala o interceptor no momento em que o módulo é carregado.
 * Por isso o mock precisa oferecer `interceptors.response.use` já na
 * primeira linha, e por isso cada teste recarrega o módulo do zero
 * (jest.resetModules): `renovacaoEmAndamento` é estado de módulo, e um teste
 * deixaria o seguinte sujo.
 */

// O axios é exportado como CommonJS; devolver a função direto faz o
// `import axios from 'axios'` do auth.js receber este mock.
jest.mock('axios', () => {
  const mock = jest.fn();
  mock.post = jest.fn();
  mock.get = jest.fn();
  mock.interceptors = { response: { use: jest.fn() } };
  return mock;
});

const CHAVE = 'ihome.session';

let axios;
let auth;
let API;
let aoFalhar; // o segundo argumento passado a interceptors.response.use

/** Recarrega o módulo com estado limpo e captura o handler de erro. */
function carregar() {
  jest.resetModules();
  axios = require('axios');
  const mod = require('./auth');
  auth = mod.auth;
  API = mod.API;
  aoFalhar = axios.interceptors.response.use.mock.calls[0][1];
}

/** Resposta de login/refresh no formato que o backend devolve. */
function respostaSessao(sufixo = '1') {
  return {
    data: {
      access_token: `acesso-${sufixo}`,
      refresh_token: `renovacao-${sufixo}`,
      user: { email: 'eduardo@exemplo.com' },
    },
  };
}

/** Erro do axios com resposta do servidor. */
function erroDoServidor(status, data) {
  return { response: { status, data }, config: { headers: {} } };
}

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  carregar();
});

// ═══════════════════════════════════════════════════════════════
//  LEITURA DA SESSÃO GUARDADA
// ═══════════════════════════════════════════════════════════════
describe('getSession — o que conta como sessão válida', () => {
  test('sem nada guardado, devolve null', async () => {
    const { data } = await auth.getSession();
    expect(data.session).toBeNull();
  });

  test('devolve a sessão guardada', async () => {
    localStorage.setItem(CHAVE, JSON.stringify({
      access_token: 'abc', refresh_token: 'def', user: { email: 'a@b.c' },
    }));
    carregar();

    const { data } = await auth.getSession();
    expect(data.session.access_token).toBe('abc');
    expect(data.session.user.email).toBe('a@b.c');
  });

  test('JSON corrompido devolve null em vez de quebrar a tela', async () => {
    // Acontece de verdade: atualização interrompida, storage truncado. Sem o
    // try/catch, o JSON.parse lançaria e o app inteiro ficaria em tela branca
    // — sem nem mostrar o login, que seria a saída óbvia.
    localStorage.setItem(CHAVE, '{isso nao e json');
    carregar();

    const { data } = await auth.getSession();
    expect(data.session).toBeNull();
  });

  test('sessão sem access_token é descartada', async () => {
    // Lixo de uma versão anterior do app. Devolver esse objeto faria o App.js
    // achar que há usuário logado e montar a tela principal sem token — toda
    // chamada voltaria 401 e a pessoa veria um app vazio, não a tela de login.
    localStorage.setItem(CHAVE, JSON.stringify({ user: { email: 'a@b.c' } }));
    carregar();

    const { data } = await auth.getSession();
    expect(data.session).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════
//  AVISO DE MUDANÇA DE SESSÃO
// ═══════════════════════════════════════════════════════════════
describe('onAuthStateChange', () => {
  test('avisa SIGNED_IN ao entrar e SIGNED_OUT ao sair', async () => {
    const ouvinte = jest.fn();
    auth.onAuthStateChange(ouvinte);

    axios.post.mockResolvedValueOnce(respostaSessao());
    await auth.signInWithPassword({ email: 'a@b.c', password: 'segredo123' });
    expect(ouvinte).toHaveBeenCalledWith('SIGNED_IN', expect.objectContaining({
      access_token: 'acesso-1',
    }));

    axios.post.mockResolvedValueOnce({ data: {} });
    await auth.signOut();
    expect(ouvinte).toHaveBeenLastCalledWith('SIGNED_OUT', null);
  });

  test('unsubscribe para de receber avisos', async () => {
    // O App.js chama isto ao desmontar. Sem funcionar, cada remontagem
    // empilharia mais um ouvinte e o mesmo evento seria tratado N vezes.
    const ouvinte = jest.fn();
    const { data } = auth.onAuthStateChange(ouvinte);
    data.subscription.unsubscribe();

    axios.post.mockResolvedValueOnce(respostaSessao());
    await auth.signInWithPassword({ email: 'a@b.c', password: 'segredo123' });

    expect(ouvinte).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════
//  LOGIN, CADASTRO E SAÍDA
// ═══════════════════════════════════════════════════════════════
describe('signInWithPassword', () => {
  test('sucesso guarda a sessão', async () => {
    axios.post.mockResolvedValueOnce(respostaSessao());

    const { error } = await auth.signInWithPassword({
      email: 'a@b.c', password: 'segredo123',
    });

    expect(error).toBeNull();
    expect(axios.post).toHaveBeenCalledWith(`${API}/auth/login`, {
      email: 'a@b.c', password: 'segredo123',
    });
    expect(JSON.parse(localStorage.getItem(CHAVE)).access_token).toBe('acesso-1');
  });

  test('erro do backend chega com a mensagem do backend', async () => {
    axios.post.mockRejectedValueOnce(
      erroDoServidor(400, { error: 'E-mail nao confirmado.' })
    );

    const { error } = await auth.signInWithPassword({
      email: 'a@b.c', password: 'segredo123',
    });

    expect(error.message).toBe('E-mail nao confirmado.');
  });

  test('queda de rede vira frase legível, não "Network Error"', async () => {
    // Sem o extrairErro, o usuário veria o texto cru do axios na tela.
    axios.post.mockRejectedValueOnce({ request: {} });

    const { error } = await auth.signInWithPassword({
      email: 'a@b.c', password: 'segredo123',
    });

    expect(error.message).toMatch(/conex[aã]o/i);
  });
});

describe('signUp', () => {
  test('achata os campos extras de options.data no corpo da requisição', async () => {
    // A tela manda nome, CPF e telefone dentro de options.data, seguindo a
    // convenção dos clientes de identidade. O backend espera tudo no mesmo
    // nível — a tradução acontece aqui, e é o que este teste guarda.
    axios.post.mockResolvedValueOnce(respostaSessao());

    await auth.signUp({
      email: 'a@b.c',
      password: 'segredo123',
      options: { data: { full_name: 'Eduardo', cpf: '000', phone: '47999' } },
    });

    expect(axios.post).toHaveBeenCalledWith(`${API}/auth/register`, {
      email: 'a@b.c',
      password: 'segredo123',
      full_name: 'Eduardo',
      cpf: '000',
      phone: '47999',
    });
  });

  test('sem options não quebra', async () => {
    axios.post.mockResolvedValueOnce(respostaSessao());
    const { error } = await auth.signUp({ email: 'a@b.c', password: 'segredo123' });
    expect(error).toBeNull();
  });
});

describe('signOut', () => {
  test('revoga o refresh no backend e limpa o local', async () => {
    localStorage.setItem(CHAVE, JSON.stringify({
      access_token: 'a', refresh_token: 'r',
    }));
    carregar();
    axios.post.mockResolvedValueOnce({ data: {} });

    await auth.signOut();

    expect(axios.post).toHaveBeenCalledWith(`${API}/auth/logout`, {
      refresh_token: 'r',
    });
    expect(localStorage.getItem(CHAVE)).toBeNull();
  });

  test('rede fora NÃO impede o logout local', async () => {
    // Quem clica em sair espera sair. Se a falha de rede abortasse a limpeza,
    // a pessoa continuaria logada na própria máquina depois de pedir para
    // sair — que é o pior desfecho possível num computador compartilhado.
    localStorage.setItem(CHAVE, JSON.stringify({
      access_token: 'a', refresh_token: 'r',
    }));
    carregar();
    axios.post.mockRejectedValueOnce(new Error('sem rede'));

    await auth.signOut();

    expect(localStorage.getItem(CHAVE)).toBeNull();
  });
});

describe('redefinição de senha', () => {
  test('forgot-password envia o e-mail informado', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });
    const { error } = await auth.resetPasswordForEmail('a@b.c');

    expect(error).toBeNull();
    expect(axios.post).toHaveBeenCalledWith(`${API}/auth/forgot-password`, {
      email: 'a@b.c',
    });
  });

  test('reset-password envia token e senha nova', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });
    const { error } = await auth.resetPassword({ token: 't', password: 'nova12345' });

    expect(error).toBeNull();
    expect(axios.post).toHaveBeenCalledWith(`${API}/auth/reset-password`, {
      token: 't', password: 'nova12345',
    });
  });

  test('link expirado chega como mensagem do backend', async () => {
    axios.post.mockRejectedValueOnce(
      erroDoServidor(400, { error: 'Link invalido ou expirado.' })
    );
    const { error } = await auth.resetPassword({ token: 'velho', password: 'nova12345' });

    expect(error.message).toBe('Link invalido ou expirado.');
  });
});

// ═══════════════════════════════════════════════════════════════
//  RENOVAÇÃO SILENCIOSA — a parte menos óbvia do arquivo
// ═══════════════════════════════════════════════════════════════
describe('interceptor de renovação', () => {
  function comSessao() {
    localStorage.setItem(CHAVE, JSON.stringify({
      access_token: 'velho', refresh_token: 'renovacao-0',
    }));
    carregar();
  }

  test('401 token_expired renova e REFAZ a requisição com o token novo', async () => {
    comSessao();
    axios.post.mockResolvedValueOnce(respostaSessao('2'));   // /auth/refresh
    axios.mockResolvedValueOnce({ data: { ok: true } });     // requisição repetida

    const erro = erroDoServidor(401, { code: 'token_expired' });
    erro.config = { url: '/devices', headers: {} };

    const resultado = await aoFalhar(erro);

    expect(axios.post).toHaveBeenCalledWith(`${API}/auth/refresh`, {
      refresh_token: 'renovacao-0',
    });
    // O ponto central: a requisição volta com o token NOVO, não o expirado.
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      headers: { Authorization: 'Bearer acesso-2' },
    }));
    expect(resultado.data.ok).toBe(true);
  });

  test('401 sem code token_expired não tenta renovar', async () => {
    // 401 de senha errada, por exemplo. Renovar aqui seria gastar uma chamada
    // para descobrir o que ja se sabe.
    comSessao();
    const erro = erroDoServidor(401, { error: 'Credenciais invalidas' });

    await expect(aoFalhar(erro)).rejects.toBe(erro);
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('_jaTentou impede laço infinito', async () => {
    // Se a requisição repetida falhar de novo com 401, o erro precisa SUBIR.
    // Sem esta guarda, interceptor e renovação se chamariam para sempre e a
    // aba travaria.
    comSessao();
    const erro = erroDoServidor(401, { code: 'token_expired' });
    erro.config = { url: '/devices', headers: {}, _jaTentou: true };

    await expect(aoFalhar(erro)).rejects.toBe(erro);
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('refresh recusado derruba a sessão e propaga o erro', async () => {
    comSessao();
    axios.post.mockRejectedValueOnce(erroDoServidor(401, { error: 'invalido' }));

    const erro = erroDoServidor(401, { code: 'token_expired' });
    erro.config = { url: '/devices', headers: {} };

    await expect(aoFalhar(erro)).rejects.toBe(erro);
    expect(localStorage.getItem(CHAVE)).toBeNull();
  });

  test('sem refresh_token guardado, nem tenta renovar', async () => {
    localStorage.setItem(CHAVE, JSON.stringify({ access_token: 'so-isso' }));
    carregar();

    const erro = erroDoServidor(401, { code: 'token_expired' });
    erro.config = { url: '/devices', headers: {} };

    await expect(aoFalhar(erro)).rejects.toBe(erro);
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('cinco falhas simultâneas disparam UMA única renovação', async () => {
    // O teste mais importante deste arquivo.
    //
    // O backend ROTACIONA o refresh token: usar um que já foi trocado é
    // tratado como reuso e derruba a sessão inteira, por segurança. Se as
    // cinco requisições de uma tela chamassem /auth/refresh ao mesmo tempo,
    // a primeira funcionaria e as outras quatro seriam lidas como ataque —
    // o usuário seria deslogado justamente por ter varias coisas carregando.
    comSessao();

    let liberar;
    axios.post.mockImplementationOnce(
      () => new Promise((resolve) => { liberar = () => resolve(respostaSessao('3')); })
    );
    axios.mockResolvedValue({ data: { ok: true } });

    const falhas = [1, 2, 3, 4, 5].map((i) => {
      const erro = erroDoServidor(401, { code: 'token_expired' });
      erro.config = { url: `/rota-${i}`, headers: {} };
      return aoFalhar(erro);
    });

    await Promise.resolve();
    liberar();
    await Promise.all(falhas);

    const chamadasDeRefresh = axios.post.mock.calls.filter(
      ([url]) => url === `${API}/auth/refresh`
    );
    expect(chamadasDeRefresh).toHaveLength(1);
    // E as cinco foram refeitas, nenhuma perdida pelo caminho.
    expect(axios).toHaveBeenCalledTimes(5);
  });
});
