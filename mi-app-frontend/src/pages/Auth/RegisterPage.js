// src/pages/Auth/RegisterPage.js
import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './AuthPage.css';

const RegisterSchema = Yup.object().shape({
  // El backend requiere 'nombre' (Nombre Completo)
  nombre: Yup.string().required('El nombre completo es requerido'),
  username: Yup.string().required('El nombre de usuario es requerido'),
  
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir')
    .required('Confirma tu contraseña'),
});

const RegisterPage = () => {
  const { register } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setError(null);
    setSuccess(false);
    try {
      await register({ nombre: values.nombre, usuario_login: values.username, contrasena: values.password });
      setSuccess(true);
      resetForm(); // Limpia el formulario al éxito
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Registro</h2>
        <Formik
          initialValues={{ nombre: '', username: '', password: '', confirmPassword: '' }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, handleChange, values, errors, touched }) => (
            <Form>
              <InputField
                label="Nombre de Completo"
                type="text"
                name="nombre"
                value={values.nombre}
                onChange={handleChange}
                error={touched.nombre && errors.nombre}
              />
              <InputField
                label="Nombre de Usuario"
                type="text"
                name="username"
                value={values.username}
                onChange={handleChange}
                error={touched.username && errors.username}
              />
              <InputField
                label="Contraseña"
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                error={touched.password && errors.password}
              />
              <InputField
                label="Confirmar Contraseña"
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                error={touched.confirmPassword && errors.confirmPassword}
              />
              {error && <div className="auth-error-message">{error}</div>}
              {success && <div className="auth-success-message">¡Registro exitoso! Ya puedes iniciar sesión.</div>}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registrando...' : 'Registrarse'}
              </Button>
            </Form>
          )}
        </Formik>
        <p className="auth-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;