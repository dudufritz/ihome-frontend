/**
 * privacidade.test.js — Política de Privacidade e o cartão "Seus dados".
 *
 * Os testes guardam três coisas que a LGPD exige e que são fáceis de quebrar
 * sem perceber:
 *
 *   1. A política abre SEM login (a pessoa lê antes de se cadastrar).
 *   2. Ela declara o que importa: compartilhamento com terceiros, retenção,
 *      direitos e um canal de contato. Se alguém apagar uma seção por engano,
 *      o teste avisa.
 *   3. O botão "Baixar meus dados" chama a exportação.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('./auth', () => ({
  API: 'http://localhost:3001',
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    exportData: jest.fn(),
    deleteAccount: jest.fn(),
  },
}));
jest.mock('axios');

Object.defineProperty(window, 'matchMedia', {
  writable: true, configurable: true,
  value: (q) => ({
    matches: false, media: q, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => console.error.mockRestore());

import axios from 'axios';
import { auth } from './auth';
import App from './App';
import Settings from './pages/Settings';
import { CONTATO_PRIVACIDADE } from './pages/Privacidade';

beforeEach(() => {
  jest.clearAllMocks();
  auth.getSession.mockResolvedValue({ data: { session: null } });
  auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
  auth.exportData.mockResolvedValue({ error: null });
  axios.get = jest.fn().mockResolvedValue({ data: [] });
});

afterEach(() => window.history.replaceState({}, '', '/'));

describe('Política de Privacidade (/privacidade)', () => {
  function abrir() {
    window.history.replaceState({}, '', '/privacidade');
    render(<App />);
  }

  test('abre SEM sessão — a pessoa lê antes de criar a conta', () => {
    abrir();
    expect(screen.getByRole('heading', { name: 'Política de Privacidade' })).toBeInTheDocument();
    // Nem chegou a montar a tela de login.
    expect(screen.queryByText('Entrar')).not.toBeInTheDocument();
  });

  test('declara o compartilhamento com terceiros fora do Brasil (art. 33)', () => {
    abrir();
    ['Microsoft Azure', 'Tuya', 'Google Gemini', 'Google Gmail'].forEach((servico) => {
      expect(screen.getAllByText(new RegExp(servico)).length).toBeGreaterThan(0);
    });
    expect(screen.getByText(/transferência internacional/)).toBeInTheDocument();
  });

  test('diz exatamente o que vai para o Gemini — e o que NÃO vai', () => {
    abrir();
    expect(screen.getByText(/nunca seu e-mail ou nome/)).toBeInTheDocument();
  });

  test('informa a retenção, inclusive os 90 dias da auditoria', () => {
    abrir();
    expect(screen.getByText(/90 dias/)).toBeInTheDocument();
  });

  test('explica como exercer cada direito pelo próprio app', () => {
    abrir();
    expect(screen.getAllByText(/Baixar meus dados/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Excluir conta/).length).toBeGreaterThan(0);
  });

  test('tem um canal de contato para privacidade (art. 41)', () => {
    abrir();
    const contato = screen.getAllByRole('link', { name: CONTATO_PRIVACIDADE });
    expect(contato[0]).toHaveAttribute('href', `mailto:${CONTATO_PRIVACIDADE}`);
  });

  test('afirma que CPF e telefone NÃO são pedidos', () => {
    abrir();
    expect(screen.getByText(/Não pedimos CPF nem telefone/)).toBeInTheDocument();
  });
});

describe('cartão "Seus dados" em Configurações', () => {
  const sessao = { access_token: 't', user: { email: 'eduardo@ihome.com', full_name: 'Eduardo Fritz' } };

  test('"Baixar meus dados" chama a exportação', async () => {
    render(<Settings session={sessao} onLogout={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Baixar meus dados' }));
    await waitFor(() => expect(auth.exportData).toHaveBeenCalledTimes(1));
  });

  test('falha na exportação mostra o erro', async () => {
    auth.exportData.mockResolvedValueOnce({ error: { message: 'Sem conexão com o servidor.' } });
    render(<Settings session={sessao} onLogout={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Baixar meus dados' }));
    await waitFor(() => expect(screen.getByText('Sem conexão com o servidor.')).toBeInTheDocument());
  });

  test('o nome aparece na conta — é a finalidade declarada para guardá-lo', () => {
    render(<Settings session={sessao} onLogout={jest.fn()} />);
    expect(screen.getByText('Eduardo Fritz')).toBeInTheDocument();
  });

  test('o cartão linka para a Política de Privacidade', () => {
    render(<Settings session={sessao} onLogout={jest.fn()} />);
    expect(screen.getByRole('link', { name: 'Política de Privacidade' })).toHaveAttribute('href', '/privacidade');
  });
});
