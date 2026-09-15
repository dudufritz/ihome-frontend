/**
 * PasswordField.js — Campo de senha com o botão que revela o texto.
 *
 * Extraído do App.js, que reunia 22 componentes num arquivo só.
 */
import React, { useState } from 'react';
import Icons from './Icons';

// ── CAMPO DE SENHA COM OLHINHO ────────────────────────────────
function PasswordField({ value, onChange, placeholder, required, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
      />
      <button type="button" className="pw-eye" onClick={() => setShow(s => !s)} tabIndex={-1}>
        {show ? Icons.eyeOff : Icons.eyeOn}
      </button>
    </div>
  );
}

export default PasswordField;
