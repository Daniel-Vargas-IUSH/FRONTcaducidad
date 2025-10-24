// src/components/common/InputField.js
import React from 'react';
import './InputField.css'; // Crea este archivo CSS

const InputField = ({ label, type = 'text', name, value, onChange, error, ...props }) => {
  return (
    <div className="input-group">
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={error ? 'input-error' : ''}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default InputField;

