/**
 * redefinir-senha.test.js — O ciclo completo da senha esquecida.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * ---------------------------
 * O `auth.resetPassword` existia, estava coberto por teste, e NENHUMA TELA O
 * CHAMAVA. O e-mail de redefinição aponta para `/redefinir-senha?token=...`,
 * e o app ignorava esse token: a pessoa caía na tela de login comum e o link
 * não servia para nada.
 *
 * Era a pior categoria de defeito — a peça testada em isolamento, funcionando
 * perfeitamente, desligada do resto. Cobertura alta não pega isso; só um teste
 * que entra pela URL, como o usuário entra.
 *
 * Estes testes montam o App com a URL que o e-mail realmente produz.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('./auth', () => ({
  API: 'http://localhost:3001',
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    resetPassword: jest.fn(),
    signOut: jest.fn(),
  },
}));
jest.mock('axios');

global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
global.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
Object.defineProperty(window, 'matchMedia', {
  writable: true, configurable: true,
  value: (q) => ({
    matches: false, media: q, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
  console.warn.mockRestore();
});

import App from './App';
import axios from 'axios';
import { auth } from './auth';

/** Põe o navegador na URL que o link do e-mail abriria. */
function visitar(url) {
  window.history.replaceState({}, '', url);
}

beforeEach(() => {
  jest.clearAllMocks();
  auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
  auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });
  auth.resetPassword.mockResolvedValue({ error: null });
  axios.get = jest.fn().mockResolvedValue({ data: {} });
  axios.post = jest.fn().mockResolvedValue({ data: {} });
});

afterEach(() => {
  // Cada teste parte de uma URL limpa: o modo da tela é deduzido dela, então
  // um token esquecido aqui contaminaria o teste seguinte.
  visitar('/');
});

// ═══════════════════════════════════════════════════════════════
// O MODO É DEDUZIDO DA URL
// ═══════════════════════════════════════════════════════════════
describe('entrar pelo link do e-mail', () => {
  test('com ?token= a tela abre no modo de redefinir senha', async () => {
    visitar('/redefinir-senha?token=abc123');
    render(<App />);

    await waitFor(() => expect(screen.getByText('Nova senha')).toBeInTheDocument(),
      { timeout: 3000 });
    expect(screen.getByText('Salvar nova senha')).toBeInTheDocument();
  });

  test('no modo redefinir NÃO pede e-mail', async () => {
    // Quem identifica a conta é o token. Pedir o endereço só criaria uma
    // forma de errar: digitar outro e-mail não mudaria de quem é a senha.
    visitar('/redefinir-senha?token=abc123');
    render(<App />);

    await waitFor(() => screen.getByText('Nova senha'), { timeout: 3000 });
    expect(screen.queryByPlaceholderText('seu@email.com')).not.toBeInTheDocument();
  });

  test('sem token, abre no login normal', async () => {
    visitar('/');
    render(<App />);

    await waitFor(() => expect(screen.getByText('Entrar')).toBeInTheDocument(),
      { timeout: 3000 });
    expect(screen.queryByText('Salvar nova senha')).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════
// A TROCA EM SI
// ═══════════════════════════════════════════════════════════════
describe('salvar a senha nova', () => {
  async function abrirFormulario(token = 'token-do-email') {
    visitar(`/redefinir-senha?token=${token}`);
    render(<App />);
    await waitFor(() => screen.getByText('Nova senha'), { timeout: 3000 });
  }

  test('envia o token da URL junto com a senha digitada', async () => {
    await abrirFormulario('token-do-email');

    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'),
      { target: { value: 'senhanova123' } });
    fireEvent.click(screen.getByText('Salvar nova senha'));

    await waitFor(() => expect(auth.resetPassword).toHaveBeenCalledWith({
      token: 'token-do-email',
      password: 'senhanova123',
    }));
  });

  test('ao dar certo, o token SAI da URL', async () => {
    // O token é de uso único. Deixá-lo no endereço faria um F5 reenviar um
    // token já consumido, e a pessoa veria "link inválido" logo depois de ter
    // dado certo — o pior momento possível para uma mensagem de erro.
    await abrirFormulario();

    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'),
      { target: { value: 'senhanova123' } });
    fireEvent.click(screen.getByText('Salvar nova senha'));

    await waitFor(() => expect(window.location.search).toBe(''));
  });

  test('ao dar certo, volta para o login com a confirmação', async () => {
    // O backend revoga todas as sessões ao trocar a senha, então entrar de
    // novo é literalmente o próximo passo — a tela já leva a pessoa para lá.
    await abrirFormulario();

    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'),
      { target: { value: 'senhanova123' } });
    fireEvent.click(screen.getByText('Salvar nova senha'));

    await waitFor(() => {
      expect(screen.getByText('Senha redefinida! Entre com a nova senha.')).toBeInTheDocument();
    });
    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });

  test('link expirado mostra a mensagem do backend e NÃO volta ao login', async () => {
    // Mandar a pessoa de volta ao login aqui seria perder o formulário sem
    // motivo: o erro é do token, não da senha digitada.
    auth.resetPassword.mockResolvedValueOnce({
      error: { message: 'Link invalido ou expirado.' },
    });
    await abrirFormulario();

    fireEvent.change(screen.getByPlaceholderText('Mínimo 8 caracteres'),
      { target: { value: 'senhanova123' } });
    fireEvent.click(screen.getByText('Salvar nova senha'));

    await waitFor(() => {
      expect(screen.getByText('Link invalido ou expirado.')).toBeInTheDocument();
    });
    expect(screen.getByText('Salvar nova senha')).toBeInTheDocument();
  });

  test('o campo exige 8 caracteres, igual ao backend', async () => {
    // Estava em 6 enquanto o `validarSenha` do backend exigia 8: o navegador
    // deixava enviar 7 e a pessoa levava um 400 depois da ida ao servidor.
    await abrirFormulario();

    expect(screen.getByPlaceholderText('Mínimo 8 caracteres'))
      .toHaveAttribute('minLength', '8');
  });
});

// ═══════════════════════════════════════════════════════════════
// CONFIRMAÇÃO DE E-MAIL
// ═══════════════════════════════════════════════════════════════
describe('aviso de confirmação de e-mail', () => {
  test('?verify=success avisa que deu certo — sem precisar estar logado', async () => {
    // O aviso vivia só no return de baixo, que exige sessão. Quem clica em
    // "Confirmar e-mail" não está logado: a conta era confirmada no banco e a
    // pessoa não via nada, então clicava de novo — aí com o token consumido.
    visitar('/?verify=success');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/E-mail confirmado/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('?verify=invalid explica que o link já foi usado', async () => {
    visitar('/?verify=invalid');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/já foi usado ou expirou/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('o parâmetro sai da URL para o F5 não repetir o aviso', async () => {
    visitar('/?verify=success');
    render(<App />);

    await waitFor(() => expect(window.location.search).toBe(''), { timeout: 3000 });
  });

  test('?invite=accepted continua funcionando, agora também deslogado', async () => {
    visitar('/?invite=accepted');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Convite aceito/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('sem parâmetro nenhum, não aparece aviso', async () => {
    visitar('/');
    render(<App />);

    await waitFor(() => screen.getByText('Entrar'), { timeout: 3000 });
    expect(screen.queryByText(/E-mail confirmado/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Convite aceito/)).not.toBeInTheDocument();
  });
});
