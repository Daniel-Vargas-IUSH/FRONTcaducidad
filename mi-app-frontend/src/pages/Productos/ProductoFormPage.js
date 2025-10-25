// src/pages/Productos/ProductoFormPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as productoService from '../../services/productoService';
import Input from '../../components/common/InputField'; // Asumiendo que tenés un componente Input
import Button from '../../components/common/Button'; // Asumiendo que tenés un componente Button
import './FormPage.css'; // Crea un archivo CSS para los estilos del formulario

const ProductoFormPage = () => {
    // Obtiene el ID de la URL. Será undefined en el modo /productos/new
    const { id_producto } = useParams(); 
    const navigate = useNavigate();
    const isEditMode = !!id_producto; // Verdadero si hay un ID
    
    // Estado inicial de los campos (sincronizados con tu DB)
    const [formData, setFormData] = useState({
        nombre: '',
        cantidad: '',
        fecha_caducidad: '',
        ubicacion: '',
    });
    const [loading, setLoading] = useState(isEditMode);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. CARGA DE DATOS (Solo en modo Edición)
    useEffect(() => {
        if (isEditMode) {
            const fetchProduct = async () => {
                try {
                    const data = await productoService.getProductoById(id_producto);
                    
                    // Formatear la fecha a YYYY-MM-DD para el input type="date"
                    const formattedData = {
                        ...data,
                        fecha_caducidad: data.fecha_caducidad ? data.fecha_caducidad.split('T')[0] : '',
                        // Nota: fecha_ingreso no se edita, así que no se incluye en el formulario
                    };
                    setFormData(formattedData);
                } catch (err) {
                    setError('Error al cargar los datos del producto.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id_producto, isEditMode]);

    // Maneja cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 2. ENVÍO DEL FORMULARIO
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (isEditMode) {
                // Modo Edición (llama a la función de actualizar)
                await productoService.updateProducto(id_producto, formData);
                alert('Producto actualizado con éxito!');
            } else {
                // Modo Creación (llama a la función de crear)
                await productoService.createProducto(formData);
                alert('Producto creado con éxito!');
            }
            
            // Redirigir a la lista de productos
            navigate('/productos');
        } catch (err) {
            setError(err.response?.data?.error || `Error al ${isEditMode ? 'actualizar' : 'crear'} el producto.`);
            console.error(err);
            setIsSubmitting(false);
        }
    };

    if (loading) return <div>Cargando datos del producto...</div>;

    return (
        <div className="form-container">
            <h2>{isEditMode ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
            
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                
                <Input 
                    label="Nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />
                <Input 
                    label="Cantidad (Stock)"
                    name="cantidad"
                    type="number"
                    value={formData.cantidad}
                    onChange={handleChange}
                    required
                />
                <Input 
                    label="Fecha de Caducidad"
                    name="fecha_caducidad"
                    type="date"
                    value={formData.fecha_caducidad}
                    onChange={handleChange}
                    // Nota: No es requerido, algunos productos no caducan
                />
                <Input 
                    label="Ubicación"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    required
                />

                <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Producto')}
                </Button>
                <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => navigate('/productos')}
                >
                    Cancelar
                </Button>
            </form>
        </div>
    );
};

export default ProductoFormPage;