import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as productoService from '../../services/productoService';
import Input from '../../components/common/InputField'; 
import Button from '../../components/common/Button'; 
import './FormPage.css'; 
const ProductoFormPage = () => {
    const { id_producto } = useParams(); 
    const navigate = useNavigate();
    const isEditMode = !!id_producto; 
    
    const [formData, setFormData] = useState({
        nombre: '',
        cantidad: '',
        fecha_caducidad: '',
        ubicacion: '',
        precio_costo: '',
        precio_venta: '',
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
                        // Convertir los valores numéricos a strings para los inputs
                        cantidad: data.cantidad.toString(),
                        precio_costo: data.precio_costo ? data.precio_costo.toString() : '',
                        precio_venta: data.precio_venta ? data.precio_venta.toString() : '',
                        fecha_caducidad: data.fecha_caducidad ? data.fecha_caducidad.split('T')[0] : '',
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

        // Pre-procesamiento de datos: convertir strings vacíos a null o 0 para el backend
        const dataToSend = {
            ...formData,
            cantidad: Number(formData.cantidad),
            precio_costo: Number(formData.precio_costo || 0), 
            precio_venta: Number(formData.precio_venta || 0), 
            fecha_caducidad: formData.fecha_caducidad || null, 
        };

        try {
            if (isEditMode) {
                await productoService.updateProducto(id_producto, dataToSend);
                alert('Producto actualizado con éxito!');
            } else {
                await productoService.createProducto(dataToSend);
                alert('Producto creado con éxito!');
            }
            
            navigate('/productos');
        } catch (err) {
            setError(err.response?.data?.error || `Error al ${isEditMode ? 'actualizar' : 'crear'} el producto.`);
            console.error(err);
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="loading-message">Cargando datos del producto...</div>;

    return (
        <div className="form-container">
            <h2>{isEditMode ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
            
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                
                {/* Campo Nombre */}
                <Input 
                    label="Nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />

                {/* Campo Cantidad (Stock) - Bloqueado en Edición, como lo tenías */}
                <Input 
                    label="Cantidad (Stock)"
                    name="cantidad"
                    type="number"
                    value={formData.cantidad}
                    onChange={handleChange}
                    required
                    disabled={isEditMode} 
                    readOnly={isEditMode} 
                    className={isEditMode ? 'form-input form-input-readonly' : ''} 
                />

                {/* 💰 Campo Precio de Costo */}
                <Input 
                    label="Precio de Costo ($)"
                    name="precio_costo"
                    type="number"
                    step="0.01" // Permite decimales
                    value={formData.precio_costo}
                    onChange={handleChange}
                    required
                />

                {/* 🏷️ Campo Precio de Venta */}
                <Input 
                    label="Precio de Venta ($)"
                    name="precio_venta"
                    type="number"
                    step="0.01" // Permite decimales
                    value={formData.precio_venta}
                    onChange={handleChange}
                    required
                />
                
                {/* Campo Fecha de Caducidad */}
                <Input 
                    label="Fecha de Caducidad"
                    name="fecha_caducidad"
                    type="date"
                    value={formData.fecha_caducidad}
                    onChange={handleChange}
                    // Nota: No es requerido, algunos productos no caducan
                />
                
                {/* Campo Ubicación */}
                <Input 
                    label="Ubicación"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleChange}
                    required
                />

                {/* Botones */}
                <div className="form-actions">
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
                </div>
            </form>
        </div>
    );
};

export default ProductoFormPage;