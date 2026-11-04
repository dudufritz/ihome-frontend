/**
 * excluir-conta.test.js — O cartão "Excluir conta" em Configurações.
 *
 * É a única ação do app que não se desfaz, então os testes aqui guardam as
 * barreiras contra o clique por engano: o primeiro botão só abre a
 * confirmação, o botão final não habilita sem senha, e cancelar não exclui.
 *
 * O `auth.deleteAccount` em si (a chamada ao backend e a limpeza da sessão)
 * é testado em auth.test.js. Aqui ele é mockado — o que importa é a tela.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('./auth', () => ({
  API: 'http://localhost:3001',
  auth: { deleteAccount: jest.fn() },
}));
jest.mock('axios');

// O cartão "Desinstalar app", na mesma tela, pergunta ao navegador se o app
// está instalado (`matchMedia('(display-mode: standalone)')`). O jsdom não
// implementa matchMedia, então sem isto a tela inteira nem monta.
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

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => console.error.mockRestore());

import axios from 'axios';
import { auth } from './auth';
import Settings from './pages/Settings';

const sessao = { access_token: 't', user: { email: 'eduardo@ihome.com' } };

beforeEach(() => {
  jest.clearAllMocks();
  // As chamadas que Configurações faz ao abrir: credenciais, aparelhos,
  // compartilhamentos. Respostas vazias bastam para a tela montar.
  axios.get = jest.fn().mockResolvedValue({ data: [] });
  auth.deleteAccount.mockResolvedValue({ error: null });
});

function abrirConfirmacao() {
  render(<Settings session={sessao} onLogout={jest.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Excluir conta' }));
}

describe('cartão Excluir conta', () => {
  test('o primeiro botão só ABRE a confirmação, não exclui', () => {
    abrirConfirmacao();
    expect(screen.getByText(/não pode ser desfeito/)).toBeInTheDocument();
    expect(auth.deleteAccount).not.toHaveBeenCalled();
  });

  test('a confirmação avisa que os convidados perdem o acesso', () => {
    // É a consequência menos óbvia: excluir a própria conta afeta outras
    // pessoas. A decisão precisa ser informada.
    abrirConfirmacao();
    expect(screen.getByText(/quem você convidou perde o acesso/)).toBeInTheDocument();
  });

  test('sem senha digitada, o botão final fica desabilitado', () => {
    abrirConfirmacao();
    expect(screen.getByRole('button', { name: 'Excluir definitivamente' })).toBeDisabled();
  });

  test('com a senha, chama deleteAccount com ela', async () => {
    abrirConfirmacao();
    fireEvent.change(screen.getByLabelText(/Digite sua senha/), { target: { value: 'minha-senha' } });
    fireEvent.click(screen.getByRole('button', { name: 'Excluir definitivamente' }));

    await waitFor(() => expect(auth.deleteAccount).toHaveBeenCalledWith('minha-senha'));
  });

  test('senha errada mostra o erro do backend e mantém o formulário', async () => {
    auth.deleteAccount.mockResolvedValueOnce({ error: { message: 'Senha incorreta.' } });
    abrirConfirmacao();
    fireEvent.change(screen.getByLabelText(/Digite sua senha/), { target: { value: 'errada' } });
    fireEvent.click(screen.getByRole('button', { name: 'Excluir definitivamente' }));

    await waitFor(() => expect(screen.getByText('Senha incorreta.')).toBeInTheDocument());
    // O botão volta a funcionar para a pessoa tentar de novo.
    expect(screen.getByRole('button', { name: 'Excluir definitivamente' })).not.toBeDisabled();
  });

  test('cancelar fecha a confirmação, apaga a senha digitada e não exclui', () => {
    abrirConfirmacao();
    fireEvent.change(screen.getByLabelText(/Digite sua senha/), { target: { value: 'minha-senha' } });
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByText(/não pode ser desfeito/)).not.toBeInTheDocument();
    expect(auth.deleteAccount).not.toHaveBeenCalled();

    // Reabrindo, o campo vem vazio: a senha não fica guardada na tela.
    fireEvent.click(screen.getByRole('button', { name: 'Excluir conta' }));
    expect(screen.getByLabelText(/Digite sua senha/)).toHaveValue('');
  });
});
