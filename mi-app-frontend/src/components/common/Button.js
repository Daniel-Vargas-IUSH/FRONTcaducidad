// src/components/common/Button.js
import React from 'react';
import './Button.css'; // Crea este archivo CSS

const Button = ({ children, onClick, type = 'button', variant = 'primary', ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn btn-${variant}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;