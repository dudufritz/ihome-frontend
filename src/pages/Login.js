/**
 * Login.js — Entrar, criar conta, pedir redefinição e redefinir a senha.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 *
 * SÃO QUATRO MODOS, e o quarto é o que fecha o ciclo da senha esquecida:
 *
 *   login    → entrar
 *   register → criar conta
 *   forgot   → PEDIR o link por e-mail
 *   reset    → ESCOLHER a senha nova, com o token que veio no link
 *
 * O modo `reset` não é escolhido por clique: ele é deduzido da URL. O e-mail
 * de redefinição aponta para `/redefinir-senha?token=...`, e o
 * `navigationFallback` do Static Web App devolve o index.html para esse
 * caminho. Sem ler o token aqui, o link do e-mail caía na tela de login e o
 * token era descartado em silêncio — o `auth.resetPassword` existia, estava
 * testado, e nenhuma tela o chamava.
 */
import React, { useState } from 'react';
import { auth } from '../auth';
import LoginLogo from '../components/LoginLogo';
import PasswordField from '../components/PasswordField';

/**
 * Lê o token de redefinição da URL, uma única vez.
 *
 * Fica fora do componente porque o valor não muda enquanto a tela vive: quem
 * chega aqui veio de um link, e o React não remonta a página por causa disso.
 */
function lerTokenDaUrl() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('token') || '';
}

// ── LOGIN ─────────────────────────────────────────────────────
function Login() {
  // O token é lido na montagem; a presença dele é o que decide o modo inicial.
  const [resetToken] = useState(lerTokenDaUrl);
  const [mode, setMode] = useState(() => (lerTokenDaUrl() ? 'reset' : 'login'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formatCpf = v => {
    v = v.replace(/\D/g, '');
    if (v.length <= 3) return v;
    if (v.length <= 6) return v.slice(0,3)+'.'+v.slice(3);
    if (v.length <= 9) return v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6);
    return v.slice(0,3)+'.'+v.slice(3,6)+'.'+v.slice(6,9)+'-'+v.slice(9,11);
  };
  const formatPhone = v => {
    v = v.replace(/\D/g, '');
    if (v.length <= 2) return v;
    if (v.length <= 7) return '('+v.slice(0,2)+') '+v.slice(2);
    return '('+v.slice(0,2)+') '+v.slice(2,7)+'-'+v.slice(7,11);
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const { error } = await auth.signInWithPassword({ email, password });
    if (error) setError('E-mail ou senha incorretos.');
    setLoading(false);
  };

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    if (cpf.replace(/\D/g,'').length !== 11) { setError('CPF inválido.'); setLoading(false); return; }
    if (phone.replace(/\D/g,'').length < 10) { setError('Telefone inválido.'); setLoading(false); return; }
    const { error } = await auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone: phone.replace(/\D/g,''), cpf: cpf.replace(/\D/g,'') } }
    });
    if (error) { setError(error.message); setLoading(false); return; }
    setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
    setLoading(false);
  };

  const handleForgot = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const { error } = await auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) setError(error.message);
    else setSuccess('E-mail de redefinição enviado! Verifique sua caixa de entrada.');
    setLoading(false);
  };

  /**
   * Troca a senha usando o token que veio no link do e-mail.
   *
   * Em caso de sucesso, duas coisas acontecem além da mensagem:
   *
   * 1. O token sai da URL (`replaceState`). O token é de USO ÚNICO — dar F5
   *    com ele ainda no endereço mandaria um token já consumido e a pessoa
   *    veria "link inválido" logo depois de ter dado certo.
   * 2. A tela volta para o login. O backend revoga todas as sessões ao trocar
   *    a senha, então entrar de novo é exatamente o próximo passo.
   */
  const handleReset = async e => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');

    const { error } = await auth.resetPassword({ token: resetToken, password });

    if (error) {
      // A mensagem vem do backend: "Link invalido ou expirado." é a comum, e
      // é informação útil — diz para pedir outro link, não para tentar de novo.
      setError(error.message);
      setLoading(false);
      return;
    }

    window.history.replaceState({}, '', window.location.pathname);
    setPassword('');
    setMode('login');
    setSuccess('Senha redefinida! Entre com a nova senha.');
    setLoading(false);
  };

  /** Qual função o formulário dispara, por modo. */
  const aoEnviar =
    mode === 'login'    ? handleLogin :
    mode === 'register' ? handleRegister :
    mode === 'reset'    ? handleReset :
                          handleForgot;

  return (
    <div className="login-page">
      <div className="login-box">
        <LoginLogo />
        <form onSubmit={aoEnviar} className="login-form">
          {mode === 'reset' && (
            <p className="login-intro">Escolha uma nova senha para a sua conta.</p>
          )}
          {mode === 'register' && (
            <div className="login-field">
              <label>Nome completo</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome completo" required />
            </div>
          )}
          {/* No modo `reset` não pedimos e-mail: quem identifica a conta é o
              token do link, e pedir o endereço só criaria uma forma de errar. */}
          {mode !== 'reset' && (
            <div className="login-field">
              <label>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
          )}
          {mode === 'register' && <>
            <div className="login-field">
              <label>CPF</label>
              <input type="text" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} placeholder="000.000.000-00" maxLength={14} required />
            </div>
            <div className="login-field">
              <label>Telefone</label>
              <input type="text" value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} required />
            </div>
          </>}
          {mode !== 'forgot' && (
            <div className="login-field">
              <label>{mode === 'reset' ? 'Nova senha' : 'Senha'}</label>
              {/*
                minLength 8, não 6.
                O backend recusa senha com menos de 8 (`validarSenha`, em
                auth.service.js). Com 6 aqui, o navegador deixava enviar uma
                senha de 7 e a pessoa levava um 400 depois da ida ao servidor
                — erro tardio para uma regra que o front já poderia ter dito
                na hora. Os dois números precisam andar juntos.
              */}
              <PasswordField value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required minLength={8} />
            </div>
          )}
          {error   && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Aguarde...'
              : mode === 'login'    ? 'Entrar'
              : mode === 'register' ? 'Criar conta'
              : mode === 'reset'    ? 'Salvar nova senha'
              :                       'Enviar link'}
          </button>
        </form>

        <div className="login-links">
          {mode === 'login' && <>
            <button onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}>Esqueci minha senha</button>
            <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>Criar conta</button>
          </>}
          {mode === 'register' && <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Já tenho conta</button>}
          {mode === 'forgot'   && <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Voltar ao login</button>}
          {mode === 'reset'    && <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Voltar ao login</button>}
        </div>
      </div>
    </div>
  );
}

export default Login;
