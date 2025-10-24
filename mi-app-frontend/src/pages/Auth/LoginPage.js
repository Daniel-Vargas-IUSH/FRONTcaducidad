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
  email: Yup.string().email('Email inválido').required('El email es requerido'),
  password: Yup.string().required('La contraseña es requerida'),
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
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, handleChange, values, errors, touched }) => (
            <Form>
              <InputField
                label="Email"
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                error={touched.email && errors.email}
              />
              <InputField
                label="Contraseña"
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                error={touched.password && errors.password}
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

