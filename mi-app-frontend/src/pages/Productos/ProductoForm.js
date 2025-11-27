// ANTES: import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import * as productoService from '../../services/productoService';
import Input from '../../components/common/InputField';
import Button from '../../components/common/Button';
import './FormPage.css';
// 🔑 NUEVAS PROPS: Recibe data de producto (para edición) y funciones de control (para modal)
const ProductoForm = ({ id_producto, onSuccess, onClose }) => {
    // Determina si estamos en modo Edición (si se pasa un id_producto como prop)
    const isEditMode = !!id_producto; 
    
    // Estado inicial de los campos (sincronizados con tu DB)
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

    // Función auxiliar para formatear a YYYY-MM-DD
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        // Asume que la fecha viene como ISO String (ej. 2025-11-26T05:00:00.000Z)
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
            
            // 🔑 CAMBIO: Llamar a onSuccess para notificar a la lista
            if(onSuccess) onSuccess();
            // 🔑 CAMBIO: Llamar a onClose para cerrar el Modal (si aplica)
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
        <div className="producto-form-content"> {/* Cambié la clase para diferenciar */}
            
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
                    className={isEditMode ? 'form-input form-input-readonly' : ''} 
                />

                {/* 💰 Campo Precio de Costo */}
                <Input 
                    label="Precio de Costo ($)"
                    name="precio_costo"
                    type="number"
                    step="0.01" 
                    value={formData.precio_costo}
                    onChange={handleChange}
                    required
                />

                {/* 🏷️ Campo Precio de Venta */}
                <Input 
                    label="Precio de Venta ($)"
                    name="precio_venta"
                    type="number"
                    step="0.01" 
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
                        onClick={onClose} // 🔑 CAMBIO: Ahora llama a onClose
                    >
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProductoForm;