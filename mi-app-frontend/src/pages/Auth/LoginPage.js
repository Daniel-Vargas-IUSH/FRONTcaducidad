// src/pages/Auth/LoginPage.js
import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './AuthPage.css'; // Crea un archivo CSS para estilos de auth

const LoginSchema = Yup.object().shape({
  usuario_login: Yup.string().required('El usuario es requerido'),
  contrasena: Yup.string().required('La contraseña es requerida'),
});

const LoginPage = () => {
  const { login } = useAuth();
  const [error, setError] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    setError(null);
    try {
      await login(values);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Iniciar Sesión</h2>
        <Formik
          initialValues={{ usuario_login: '', contrasena: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, handleChange, values, errors, touched }) => (
            <Form>
              <InputField
                label="Usuario o Email" 
                type="text"
                name="usuario_login" // Campo de la DB
                value={values.usuario_login}
                onChange={handleChange}
                error={touched.usuario_login && errors.usuario_login}
              />
              <InputField
                label="Contraseña"
                type="password"
                name="contrasena" // Campo de la DB
                value={values.contrasena}
                onChange={handleChange}
                error={touched.contrasena && errors.contrasena}
              />
              {error && <div className="auth-error-message">{error}</div>}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Cargando...' : 'Entrar'}
              </Button>
            </Form>
          )}
        </Formik>
        <p className="auth-link">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

