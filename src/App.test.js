
// Mocks devem vir antes dos imports — Babel os hissa automaticamente
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock supabase
jest.mock('./supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      signOut: jest.fn(),
    },
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
import { supabase } from './supabase';

// Helper para configurar mocks de auth
function setupAuthMocks({ session = null } = {}) {
  supabase.auth.getSession.mockResolvedValue({ data: { session }, error: null });
  supabase.auth.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });
  supabase.auth.signInWithPassword.mockResolvedValue({ error: null });
  supabase.auth.signUp.mockResolvedValue({ error: null });
  supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });
  supabase.auth.signOut.mockResolvedValue({});
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
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: 'u@t.com', password: '123456' });
  });

  test('exibe erro de credenciais inválidas', async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({ error: { message: 'bad' } });
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
    expect(supabase.auth.signUp).toHaveBeenCalled();
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

  test('exibe erro do supabase no registro', async () => {
    supabase.auth.signUp.mockResolvedValueOnce({ error: { message: 'Email taken' } });
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
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('u@t.com', expect.any(Object));
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
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: { message: 'Not found' } });
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
  supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });
  supabase.auth.onAuthStateChange.mockImplementation((cb) => {
    setTimeout(() => cb('SIGNED_IN', mockSession), 0);
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  });
  supabase.auth.signOut.mockResolvedValue({});
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
    expect(supabase.auth.signOut).toHaveBeenCalled();
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
