// ANTES: import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import * as productoService from '../../services/productoService';
import Input from '../../components/common/InputField';
import Button from '../../components/common/Button';
import './FormPage.css';
const ProductoForm = ({ id_producto, onSuccess, onClose }) => {
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

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };


    // 1. CARGA DE DATOS (Solo en modo Edición)
    useEffect(() => {
        if (isEditMode && id_producto) {
            const fetchProduct = async () => {
                try {
                    const data = await productoService.getProductoById(id_producto);
                    
                    const formattedData = {
                        ...data,
                        // Convertir los valores numéricos a strings para los inputs
                        cantidad: data.cantidad.toString(),
                        precio_costo: data.precio_costo ? data.precio_costo.toString() : '',
                        precio_venta: data.precio_venta ? data.precio_venta.toString() : '',
                        // Formatear la fecha
                        fecha_caducidad: formatDateForInput(data.fecha_caducidad),
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
            // Convertimos la fecha vacía a null para el backend
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
            
            if(onSuccess) onSuccess();
            if(onClose) onClose();
            
        } catch (err) {
            setError(err.response?.data?.error || `Error al ${isEditMode ? 'actualizar' : 'crear'} el producto.`);
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="loading-message">Cargando datos del producto...</div>;

    return (
        // 🎯 CAMBIO 1: Usamos la clase CSS principal 'form-container'
        // El contenido del formulario va DENTRO del .form-container
        <div className="form-container"> 
            
            {/* 🎯 TÍTULO: Aseguramos el h2 para aplicar el estilo unificado */}
            

            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                
                {/* 🎯 CAMBIO 2: Envolvemos cada Input en un div para el espaciado de 1rem */}
                <div> 
                    {/* Campo Nombre */}
                    <Input 
                        label="Nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        // 🎯 CAMBIO 3: Aseguramos que el componente Input agregue la clase 'form-input'
                        // (Si tu componente Input no maneja esto internamente, revisa su código)
                        className="form-input" 
                    />
                </div>

                <div>
                    {/* Campo Cantidad (Stock) - Bloqueado en Edición */}
                    <Input 
                        label="Cantidad (Stock)"
                        name="cantidad"
                        type="number"
                        value={formData.cantidad}
                        onChange={handleChange}
                        required
                        disabled={isEditMode} 
                        readOnly={isEditMode} 
                        // 🎯 CAMBIO 3: Aseguramos la clase 'form-input'
                        className={`form-input ${isEditMode ? 'form-input-readonly' : ''}`} 
                    />
                </div>

                <div>
                    {/* 💰 Campo Precio de Costo */}
                    <Input 
                        label="Precio de Costo ($)"
                        name="precio_costo"
                        type="number"
                        step="0.01" 
                        value={formData.precio_costo}
                        onChange={handleChange}
                        required
                        // 🎯 CAMBIO 3: Aseguramos la clase 'form-input'
                        className="form-input"
                    />
                </div>

                <div>
                    {/* 🏷️ Campo Precio de Venta */}
                    <Input 
                        label="Precio de Venta ($)"
                        name="precio_venta"
                        type="number"
                        step="0.01" 
                        value={formData.precio_venta}
                        onChange={handleChange}
                        required
                        // 🎯 CAMBIO 3: Aseguramos la clase 'form-input'
                        className="form-input"
                    />
                </div>
                
                <div>
                    {/* Campo Fecha de Caducidad */}
                    <Input 
                        label="Fecha de Caducidad"
                        name="fecha_caducidad"
                        type="date"
                        value={formData.fecha_caducidad}
                        onChange={handleChange}
                        // 🎯 CAMBIO 3: Aseguramos la clase 'form-input'
                        className="form-input"
                    />
                </div>
                
                <div>
                    {/* Campo Ubicación */}
                    <Input 
                        label="Ubicación"
                        name="ubicacion"
                        value={formData.ubicacion}
                        onChange={handleChange}
                        required
                        // 🎯 CAMBIO 3: Aseguramos la clase 'form-input'
                        className="form-input"
                    />
                </div>

                {/* Botones */}
                <div className="form-actions">
                    {/* 🎯 CAMBIO 4: Usamos variant="primary" y variant="secondary" para los estilos unificados */}
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Producto')}
                    </Button>
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={onClose} 
                    >
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProductoForm;