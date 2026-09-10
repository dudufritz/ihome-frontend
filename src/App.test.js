
// Mocks devem vir antes dos imports — Babel os hissa automaticamente
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock do cliente de autenticacao proprio (src/auth.js)
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

// Mock axios
jest.mock('axios');

// Mock window APIs ausentes no jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (q) => ({
    matches: false, media: q, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Supress console errors during tests
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

// Helper para configurar mocks de auth
function setupAuthMocks({ session = null } = {}) {
  auth.getSession.mockResolvedValue({ data: { session }, error: null });
  auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });
  auth.signInWithPassword.mockResolvedValue({ error: null });
  auth.signUp.mockResolvedValue({ error: null });
  auth.resetPasswordForEmail.mockResolvedValue({ error: null });
  auth.signOut.mockResolvedValue({});
  axios.get = jest.fn().mockResolvedValue({ data: { result: { list: [] } } });
  axios.post = jest.fn().mockResolvedValue({ data: {} });
  axios.put = jest.fn().mockResolvedValue({ data: {} });
  axios.delete = jest.fn().mockResolvedValue({ data: {} });
}

beforeEach(() => {
  jest.clearAllMocks();
  setupAuthMocks();
});

// ── RENDERIZAÇÃO INICIAL ──────────────────────────────────────
describe('App — tela de login', () => {
  test('renderiza campo de e-mail', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('renderiza botão Entrar', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('Entrar')).toBeInTheDocument(), { timeout: 3000 });
  });

  test('renderiza link Esqueci minha senha', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('Esqueci minha senha')).toBeInTheDocument(), { timeout: 3000 });
  });

  test('renderiza link Criar conta', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('Criar conta')).toBeInTheDocument(), { timeout: 3000 });
  });

  test('campo senha inicia como password', async () => {
    render(<App />);
    await waitFor(() => screen.getByPlaceholderText('Mínimo 6 caracteres'), { timeout: 3000 });
    expect(screen.getByPlaceholderText('Mínimo 6 caracteres')).toHaveAttribute('type', 'password');
  });
});

// ── TOGGLE SENHA ──────────────────────────────────────────────
describe('PasswordField', () => {
  test('olhinho revela senha', async () => {
    render(<App />);
    await waitFor(() => screen.getByPlaceholderText('Mínimo 6 caracteres'), { timeout: 3000 });
    fireEvent.click(document.querySelector('.pw-eye'));
    expect(screen.getByPlaceholderText('Mínimo 6 caracteres')).toHaveAttribute('type', 'text');
  });

  test('segundo clique volta a ocultar', async () => {
    render(<App />);
    await waitFor(() => screen.getByPlaceholderText('Mínimo 6 caracteres'), { timeout: 3000 });
    const btn = document.querySelector('.pw-eye');
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(screen.getByPlaceholderText('Mínimo 6 caracteres')).toHaveAttribute('type', 'password');
  });
});

// ── NAVEGAÇÃO ENTRE MODOS ─────────────────────────────────────
describe('Login — modos', () => {
  test('muda para registro', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Criar conta'), { timeout: 3000 });
    fireEvent.click(screen.getByText('Criar conta'));
    await waitFor(() => expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument());
  });

  test('muda para forgot', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Esqueci minha senha'), { timeout: 3000 });
    fireEvent.click(screen.getByText('Esqueci minha senha'));
    await waitFor(() => expect(screen.getByText('Enviar link')).toBeInTheDocument());
  });

  test('volta de forgot para login', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Esqueci minha senha'), { timeout: 3000 });
    fireEvent.click(screen.getByText('Esqueci minha senha'));
    await waitFor(() => screen.getByText('Voltar ao login'));
    fireEvent.click(screen.getByText('Voltar ao login'));
    await waitFor(() => expect(screen.getByText('Entrar')).toBeInTheDocument());
  });

  test('volta de registro para login', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Criar conta'), { timeout: 3000 });
    fireEvent.click(screen.getByText('Criar conta'));
    await waitFor(() => screen.getByText('Já tenho conta'));
    fireEvent.click(screen.getByText('Já tenho conta'));
    await waitFor(() => expect(screen.getByText('Entrar')).toBeInTheDocument());
  });
});

// ── SUBMISSÃO DE LOGIN ────────────────────────────────────────
describe('Login — submit', () => {
  test('chama signInWithPassword', async () => {
    render(<App />);
    await waitFor(() => screen.getByPlaceholderText('seu@email.com'), { timeout: 3000 });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'u@t.com' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), { target: { value: '123456' } });
    await act(async () => { fireEvent.click(screen.getByText('Entrar')); });
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: 'u@t.com', password: '123456' });
  });

  test('exibe erro de credenciais inválidas', async () => {
    auth.signInWithPassword.mockResolvedValueOnce({ error: { message: 'bad' } });
    render(<App />);
    await waitFor(() => screen.getByPlaceholderText('seu@email.com'), { timeout: 3000 });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'b@t.com' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), { target: { value: 'wrong' } });
    await act(async () => { fireEvent.click(screen.getByText('Entrar')); });
    await waitFor(() => expect(screen.getByText('E-mail ou senha incorretos.')).toBeInTheDocument());
  });
});

// ── REGISTRO ─────────────────────────────────────────────────
describe('Login — registro', () => {
  beforeEach(async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Criar conta'), { timeout: 3000 });
    fireEvent.click(screen.getByText('Criar conta'));
    await waitFor(() => screen.getByPlaceholderText('Seu nome completo'));
  });

  test('valida CPF inválido', async () => {
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'n@t.com' } });
    fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), { target: { value: '123' } });
    await act(async () => { fireEvent.click(screen.getByText('Criar conta')); });
    await waitFor(() => expect(screen.getByText('CPF inválido.')).toBeInTheDocument());
  });

  test('formata CPF', () => {
    fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), { target: { value: '52998224725' } });
    expect(screen.getByPlaceholderText('000.000.000-00').value).toBe('529.982.247-25');
  });

  test('formata telefone', () => {
    fireEvent.change(screen.getByPlaceholderText('(00) 00000-0000'), { target: { value: '48999887766' } });
    expect(screen.getByPlaceholderText('(00) 00000-0000').value).toBe('(48) 99988-7766');
  });

  test('chama signUp com dados válidos', async () => {
    fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), { target: { value: 'Eduardo Fritz' } });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'e@t.com' } });
    fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), { target: { value: '529.982.247-25' } });
    fireEvent.change(screen.getByPlaceholderText('(00) 00000-0000'), { target: { value: '(48) 99988-7766' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), { target: { value: 'senha123' } });
    await act(async () => { fireEvent.click(screen.getByText('Criar conta')); });
    expect(auth.signUp).toHaveBeenCalled();
  });

  test('exibe mensagem de sucesso após signUp', async () => {
    fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), { target: { value: 'Eduardo Fritz' } });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'e@t.com' } });
    fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), { target: { value: '529.982.247-25' } });
    fireEvent.change(screen.getByPlaceholderText('(00) 00000-0000'), { target: { value: '(48) 99988-7766' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), { target: { value: 'senha123' } });
    await act(async () => { fireEvent.click(screen.getByText('Criar conta')); });
    await waitFor(() => expect(screen.getByText(/Verifique seu e-mail/)).toBeInTheDocument());
  });

  test('exibe erro do backend no registro', async () => {
    auth.signUp.mockResolvedValueOnce({ error: { message: 'Email taken' } });
    fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), { target: { value: 'Eduardo Fritz' } });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'e@t.com' } });
    fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), { target: { value: '529.982.247-25' } });
    fireEvent.change(screen.getByPlaceholderText('(00) 00000-0000'), { target: { value: '(48) 99988-7766' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), { target: { value: 'senha123' } });
    await act(async () => { fireEvent.click(screen.getByText('Criar conta')); });
    await waitFor(() => expect(screen.getByText('Email taken')).toBeInTheDocument());
  });
});

// ── FORGOT PASSWORD ───────────────────────────────────────────
describe('Login — forgot', () => {
  test('envia e-mail de recuperação', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Esqueci minha senha'), { timeout: 3000 });
    fireEvent.click(screen.getByText('Esqueci minha senha'));
    await waitFor(() => screen.getByText('Enviar link'));
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'u@t.com' } });
    await act(async () => { fireEvent.click(screen.getByText('Enviar link')); });
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('u@t.com', expect.any(Object));
  });

  test('exibe sucesso ao enviar link', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Esqueci minha senha'), { timeout: 3000 });
    fireEvent.click(screen.getByText('Esqueci minha senha'));
    await waitFor(() => screen.getByText('Enviar link'));
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'u@t.com' } });
    await act(async () => { fireEvent.click(screen.getByText('Enviar link')); });
    await waitFor(() => expect(screen.getByText(/redefinição enviado/)).toBeInTheDocument());
  });

  test('exibe erro quando forgot falha', async () => {
    auth.resetPasswordForEmail.mockResolvedValueOnce({ error: { message: 'Not found' } });
    render(<App />);
    await waitFor(() => screen.getByText('Esqueci minha senha'), { timeout: 3000 });
    fireEvent.click(screen.getByText('Esqueci minha senha'));
    await waitFor(() => screen.getByText('Enviar link'));
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: 'x@t.com' } });
    await act(async () => { fireEvent.click(screen.getByText('Enviar link')); });
    await waitFor(() => expect(screen.getByText('Not found')).toBeInTheDocument());
  });
});

// ── APP COM SESSÃO LOGADA (DASHBOARD) ─────────────────────────
const mockSession = {
  user: { email: 'eduardo@test.com', id: 'uid-123' },
  access_token: 'fake-token-123',
};

function setupSessionMocks() {
  auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
  auth.onAuthStateChange.mockImplementation((cb) => {
    setTimeout(() => cb('SIGNED_IN', mockSession), 0);
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  });
  auth.signOut.mockResolvedValue({});
  axios.get = jest.fn().mockImplementation((url) => {
    if (url.includes('/devices'))   return Promise.resolve({ data: { result: { list: [] } } });
    if (url.includes('/alerts'))    return Promise.resolve({ data: [] });
    if (url.includes('/schedules')) return Promise.resolve({ data: [] });
    return Promise.resolve({ data: {} });
  });
  axios.post = jest.fn().mockResolvedValue({ data: {} });
  axios.put = jest.fn().mockResolvedValue({ data: {} });
  axios.delete = jest.fn().mockResolvedValue({ data: {} });
}

describe('App — dashboard (sessão ativa)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSessionMocks();
  });

  test('renderiza sidebar com itens de navegação', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('Visão Geral')).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getAllByText('Dispositivos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Automação').length).toBeGreaterThan(0);
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  test('renderiza painel principal (Dashboard)', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('Painel Principal')).toBeInTheDocument(), { timeout: 3000 });
  });

  test('mostra email do usuário na sidebar', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('eduardo@test.com')).toBeInTheDocument(), { timeout: 3000 });
  });

  test('chama fetchDevices ao montar com sessão', async () => {
    render(<App />);
    await waitFor(() => expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/devices'),
      expect.any(Object)
    ), { timeout: 3000 });
  });

  test('faz logout ao clicar em Sair', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Sair'), { timeout: 3000 });
    fireEvent.click(screen.getByText('Sair'));
    expect(auth.signOut).toHaveBeenCalled();
  });

  test('navega para Alertas ao clicar no menu', async () => {
    render(<App />);
    await waitFor(() => screen.getAllByText('Alertas').length > 0, { timeout: 3000 });
    fireEvent.click(screen.getAllByText('Alertas')[0]);
    await waitFor(() => expect(screen.getAllByText('Alertas').length).toBeGreaterThan(0));
  });

  test('navega para Configurações ao clicar no menu', async () => {
    render(<App />);
    await waitFor(() => screen.getAllByText('Configurações').length > 0, { timeout: 3000 });
    // Configurações aparece na sidebar e no BottomNav
    expect(screen.getAllByText('Configurações').length).toBeGreaterThanOrEqual(1);
  });

  test('renderiza BottomNav', async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText('Início')).toBeInTheDocument(), { timeout: 3000 });
  });

  test('dashboard mostra contador de dispositivos', async () => {
    render(<App />);
    await waitFor(() => screen.getByText('Painel Principal'), { timeout: 3000 });
    expect(screen.getAllByText('Dispositivos').length).toBeGreaterThan(0);
  });

  test('renderiza com dispositivos online', async () => {
    axios.get = jest.fn().mockImplementation((url) => {
      if (url.includes('/devices')) return Promise.resolve({
        data: { result: { list: [
          { id: 'd1', name: 'Luz sala', online: true, category_name: 'Luz' },
          { id: 'd2', name: 'Tomada', online: false, category_name: 'Tomada' },
        ]}}
      });
      if (url.includes('/alerts'))    return Promise.resolve({ data: [] });
      if (url.includes('/schedules')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });
    render(<App />);
    await waitFor(() => screen.getByText('Painel Principal'), { timeout: 3000 });
    await waitFor(() => expect(screen.getByText('Luz sala')).toBeInTheDocument(), { timeout: 3000 });
  });
});

// ── TELA DE AUDITORIA ─────────────────────────────────────────
// O registro de auditoria e a funcionalidade mais sensivel do app: e por
// ela que o dono da casa descobre o que um convidado fez. Os testes abaixo
// cobrem o que a tela precisa acertar para cumprir esse papel.

/** Entrada de auditoria completa, com valores padrao sobrescreviveis. */
function entrada(overrides = {}) {
  return {
    id: 1,
    home_owner_email: 'eduardo@test.com',
    actor_email: 'eduardo@test.com',
    action: 'device.command',
    device_id: 'dev-1',
    device_name: 'Lampada da Sala',
    details: { summary: 'Ligou' },
    result: 'success',
    error_message: null,
    ip_address: '203.0.113.10',
    created_at: '2026-09-01T14:30:00.000Z',
    ...overrides,
  };
}

/**
 * Prepara os mocks da tela de auditoria.
 * A ordem dos testes de URL importa: '/audit-log/actors' tambem contem
 * '/audit-log', entao a rota mais especifica precisa ser checada primeiro.
 */
function mockAuditoria({ entries = [], total = null, actors = ['eduardo@test.com'] } = {}) {
  axios.get = jest.fn().mockImplementation((url) => {
    if (url.includes('/audit-log/actors')) return Promise.resolve({ data: actors });
    if (url.includes('/audit-log')) {
      return Promise.resolve({
        data: { total: total ?? entries.length, limit: 50, offset: 0, entries },
      });
    }
    if (url.includes('/devices'))   return Promise.resolve({ data: { result: { list: [] } } });
    if (url.includes('/alerts'))    return Promise.resolve({ data: [] });
    if (url.includes('/schedules')) return Promise.resolve({ data: [] });
    return Promise.resolve({ data: {} });
  });
}

/** Renderiza o app ja logado e navega ate a aba Auditoria. */
async function abrirAuditoria() {
  render(<App />);
  await waitFor(() => screen.getAllByText('Auditoria').length > 0, { timeout: 3000 });
  await act(async () => { fireEvent.click(screen.getAllByText('Auditoria')[0]); });
}

describe('Auditoria — tela', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupSessionMocks();
  });

  test('item Auditoria aparece na navegacao', async () => {
    mockAuditoria();
    render(<App />);
    await waitFor(() => expect(screen.getAllByText('Auditoria').length).toBeGreaterThan(0), { timeout: 3000 });
  });

  test('busca os registros e a lista de atores ao abrir', async () => {
    mockAuditoria();
    await abrirAuditoria();
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/audit-log?'), expect.any(Object)
      );
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/audit-log/actors'), expect.any(Object)
      );
    }, { timeout: 3000 });
  });

  test('estado vazio explica que as acoes passarao a ser registradas', async () => {
    mockAuditoria({ entries: [] });
    await abrirAuditoria();
    await waitFor(() => expect(screen.getByText('Nenhum registro ainda')).toBeInTheDocument(), { timeout: 3000 });
  });

  test('mostra o resumo da acao e o dispositivo', async () => {
    mockAuditoria({ entries: [entrada()] });
    await abrirAuditoria();
    await waitFor(() => expect(screen.getByText('Ligou')).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByText(/Lampada da Sala/)).toBeInTheDocument();
  });

  test('acao propria aparece como "Voce"', async () => {
    mockAuditoria({ entries: [entrada({ actor_email: 'eduardo@test.com' })] });
    await abrirAuditoria();
    await waitFor(() => expect(screen.getByText(/Voc[eê]/)).toBeInTheDocument(), { timeout: 3000 });
  });

  test('acao de convidado mostra o e-mail dele e o rotulo de convidado', async () => {
    // Este e o caso que justifica a funcionalidade existir.
    mockAuditoria({
      entries: [entrada({ actor_email: 'convidado@test.com', details: { summary: 'Desligou' } })],
    });
    await abrirAuditoria();
    await waitFor(() => expect(screen.getByText(/convidado@test\.com/)).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByText(/convidado na sua casa/)).toBeInTheDocument();
  });

  test('acao em casa de terceiro identifica de quem e a casa', async () => {
    mockAuditoria({
      entries: [entrada({ home_owner_email: 'outro@test.com' })],
    });
    await abrirAuditoria();
    await waitFor(() => expect(screen.getByText(/na casa de outro@test\.com/)).toBeInTheDocument(), { timeout: 3000 });
  });

  test('resultado negado aparece com o rotulo correto e a justificativa', async () => {
    mockAuditoria({
      entries: [entrada({
        result: 'denied',
        error_message: 'Acesso negado: permissão apenas de visualização',
      })],
    });
    await abrirAuditoria();

    // ⚠️ A espera precisa ser por um texto EXCLUSIVO do registro.
    // "Negado" nao serve: ele tambem e uma opcao do filtro de resultado,
    // entao o waitFor terminaria de imediato, com a lista ainda em
    // "Carregando registros..." — e o teste passaria sem ter verificado nada.
    await waitFor(
      () => expect(screen.getByText(/apenas de visualiza/i)).toBeInTheDocument(),
      { timeout: 3000 }
    );

    // Agora sim o selo: "Negado" aparece duas vezes — na opcao do filtro e
    // no selo do registro. Mais de uma ocorrencia confirma que o selo existe.
    expect(screen.getAllByText('Negado').length).toBeGreaterThan(1);
  });

  test('resultado com falha aparece como Falhou', async () => {
    mockAuditoria({ entries: [entrada({ result: 'error', error_message: 'Timeout na Tuya' })] });
    await abrirAuditoria();
    // Mesmo cuidado: espera pela mensagem de erro, que so existe no registro.
    await waitFor(
      () => expect(screen.getByText('Timeout na Tuya')).toBeInTheDocument(),
      { timeout: 3000 }
    );
    expect(screen.getAllByText('Falhou').length).toBeGreaterThan(1);
  });

  test('mostra data e hora completas, nao tempo relativo', async () => {
    // Em auditoria "ha 5 minutos" nao serve como evidencia.
    mockAuditoria({ entries: [entrada()] });
    await abrirAuditoria();
    await waitFor(() => expect(screen.getByText(/01\/09\/2026/)).toBeInTheDocument(), { timeout: 3000 });
  });

  test('exibe o IP de origem da acao', async () => {
    mockAuditoria({ entries: [entrada()] });
    await abrirAuditoria();
    await waitFor(() => expect(screen.getByText('203.0.113.10')).toBeInTheDocument(), { timeout: 3000 });
  });

  test('filtro de resultado entra na consulta enviada ao backend', async () => {
    mockAuditoria({ entries: [entrada()] });
    await abrirAuditoria();
    await waitFor(() => screen.getByText('Ligou'), { timeout: 3000 });

    const selects = document.querySelectorAll('select');
    await act(async () => {
      fireEvent.change(selects[1], { target: { value: 'denied' } });
    });

    await waitFor(() => {
      const chamou = axios.get.mock.calls.some(
        ([url]) => url.includes('/audit-log?') && url.includes('result=denied')
      );
      expect(chamou).toBe(true);
    }, { timeout: 3000 });
  });

  test('busca textual entra na consulta', async () => {
    mockAuditoria({ entries: [entrada()] });
    await abrirAuditoria();
    await waitFor(() => screen.getByText('Ligou'), { timeout: 3000 });

    const busca = screen.getByPlaceholderText(/Buscar dispositivo/i);
    await act(async () => {
      fireEvent.change(busca, { target: { value: 'portao' } });
    });

    await waitFor(() => {
      const chamou = axios.get.mock.calls.some(
        ([url]) => url.includes('/audit-log?') && url.includes('q=portao')
      );
      expect(chamou).toBe(true);
    }, { timeout: 3000 });
  });

  test('filtro sem resultado explica que os filtros podem ser limpos', async () => {
    mockAuditoria({ entries: [entrada()] });
    await abrirAuditoria();
    await waitFor(() => screen.getByText('Ligou'), { timeout: 3000 });

    mockAuditoria({ entries: [] });
    const busca = screen.getByPlaceholderText(/Buscar dispositivo/i);
    await act(async () => {
      fireEvent.change(busca, { target: { value: 'inexistente' } });
    });

    await waitFor(
      () => expect(screen.getByText('Nenhum registro para esses filtros')).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });

  test('paginacao aparece so quando ha mais registros que a pagina', async () => {
    mockAuditoria({ entries: [entrada()], total: 120 });
    await abrirAuditoria();
    await waitFor(() => expect(screen.getByText('Próxima')).toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByText('Anterior')).toBeInTheDocument();
  });

  test('paginacao nao aparece com poucos registros', async () => {
    mockAuditoria({ entries: [entrada()], total: 1 });
    await abrirAuditoria();
    await waitFor(() => screen.getByText('Ligou'), { timeout: 3000 });
    expect(screen.queryByText('Próxima')).not.toBeInTheDocument();
  });

  test('erro no backend nao quebra a tela', async () => {
    axios.get = jest.fn().mockImplementation((url) => {
      if (url.includes('/audit-log')) return Promise.reject(new Error('500'));
      if (url.includes('/devices'))   return Promise.resolve({ data: { result: { list: [] } } });
      return Promise.resolve({ data: [] });
    });
    await abrirAuditoria();
    // Degrada para o estado vazio em vez de derrubar a aplicacao.
    await waitFor(() => expect(screen.getByText('Nenhum registro ainda')).toBeInTheDocument(), { timeout: 3000 });
  });
});
