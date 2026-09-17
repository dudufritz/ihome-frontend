/**
 * Login.js — Entrar, criar conta e recuperar senha.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React, { useState } from 'react';
import { auth } from '../auth';
import LoginLogo from '../components/LoginLogo';
import PasswordField from '../components/PasswordField';

// ── LOGIN ─────────────────────────────────────────────────────
function Login() {
  const [mode, setMode] = useState('login');
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

  return (
    <div className="login-page">
      <div className="login-box">
        <LoginLogo />
        <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleForgot} className="login-form">
          {mode === 'register' && (
            <div className="login-field">
              <label>Nome completo</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome completo" required />
            </div>
          )}
          <div className="login-field">
            <label>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>
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
              <label>Senha</label>
              <PasswordField value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} />
            </div>
          )}
          {error   && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar conta' : 'Enviar link'}
          </button>
        </form>

        <div className="login-links">
          {mode === 'login' && <>
            <button onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}>Esqueci minha senha</button>
            <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>Criar conta</button>
          </>}
          {mode === 'register' && <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Já tenho conta</button>}
          {mode === 'forgot'   && <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>Voltar ao login</button>}
        </div>
      </div>
    </div>
  );
}

export default Login;
