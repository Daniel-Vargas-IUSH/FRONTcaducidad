// ANTES: import { useParams, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import * as movimientoService from '../../services/movimientoService';
import * as productoService from '../../services/productoService'; 
import Input from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext'; 
import './FormPage.css'; 


const formatDateToSQL = (isoDateString) => {
    if (!isoDateString || typeof isoDateString !== 'string') return null;
    try {
        // Extrae la parte YYYY-MM-DD para el backend (si la fecha es un ISO string)
        return isoDateString.slice(0, 10);
    } catch (error) {
        console.error("Error al formatear la fecha:", error);
        return isoDateString; 
    }
};


// 🔑 NUEVAS PROPS: Recibir onClose (cerrar modal) y onSuccess (refrescar lista)
const MovimientoForm = ({ onClose, onSuccess }) => {
    const isEditMode = false; 
    
    const { user, loading: authLoading } = useAuth();
    const currentUserId = user?.id_usuario; 

    const [formData, setFormData] = useState({
        tipo: 'entrada',
        cantidad: 1,
        id_producto: '',
    });

    const [productos, setProductos] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Cargar listas al inicio
    useEffect(() => {
        const fetchData = async () => {
            setError(null);
            try {
                const prodsData = await productoService.getProductos();
                setProductos(prodsData);
                
            } catch (err) {
                setError(err.message || 'Error al cargar datos necesarios (productos).');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []); 

    // Manejo de cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'tipo' ? value.toLowerCase() : value; 
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // 1. Validaciones iniciales
        if (!currentUserId) {
            setError("Error de autenticación: El ID de usuario no está disponible.");
            setIsSubmitting(false);
            return;
        }
        if (!formData.id_producto || Number(formData.cantidad) <= 0) {
            setError("Debes seleccionar un producto y la cantidad debe ser mayor a cero.");
            setIsSubmitting(false);
            return;
        }

        const cantidadMovimiento = Number(formData.cantidad);
        const productoId = Number(formData.id_producto);
        const tipoMovimiento = formData.tipo;
        const productoActual = productos.find(p => p.id_producto === productoId);

        if (!productoActual) {
            setError("Error: El producto seleccionado no se pudo encontrar en la lista.");
            setIsSubmitting(false);
            return;
        }

        const stockActual = Number(productoActual.cantidad); 
        let nuevoStock;

        // Lógica de cálculo de stock
        if (tipoMovimiento === 'entrada') {
            nuevoStock = stockActual + cantidadMovimiento;
        } else if (tipoMovimiento === 'salida') {
            if (stockActual < cantidadMovimiento) {
                setError(`Stock insuficiente. Solo hay ${stockActual} unidades disponibles.`);
                setIsSubmitting(false);
                return;
            }
            nuevoStock = stockActual - cantidadMovimiento;
        } else {
            setError("Tipo de movimiento inválido.");
            setIsSubmitting(false);
            return;
        }

        // Payloads para las peticiones
        const movimientoPayload = {
            id_producto: productoId,
            tipo: tipoMovimiento, 
            cantidad: cantidadMovimiento,
            id_usuario: currentUserId,
        };

        // Prepara el payload para actualizar el producto
        const { id_producto: _, ...restOfProductData } = productoActual;
        
        const productoUpdatePayload = {
            ...restOfProductData, 
            cantidad: nuevoStock,
            fecha_caducidad: formatDateToSQL(productoActual.fecha_caducidad),
        };


        try {
            // 2. Ejecutar transacciones
            await movimientoService.createMovimiento(movimientoPayload);
            await productoService.updateProducto(productoId, productoUpdatePayload);

            alert(`Movimiento de ${tipoMovimiento} registrado con éxito. Stock actualizado a ${nuevoStock}.`);
            
            
            if (onSuccess) onSuccess(); 
            if (onClose) onClose();     

        } catch (err) {
            console.error("Error en el submit:", err);
            const errorMessage = 
                err.response?.data?.mensaje || 
                err.response?.data?.error || 
                `Error al procesar el movimiento y/o actualizar el stock. Detalles: ${err.message}`;

            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || authLoading) return <div>Cargando formulario de movimiento...</div>;
    if (!currentUserId) return <div className="error-message">Error: Debe iniciar sesión para registrar movimientos.</div>;

    return (
        
        <div className="form-container"> 
            
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                
                {/* Selector de Tipo de Movimiento */}
                <div className="form-group"> 
                    <label htmlFor="tipo">Tipo de Movimiento</label>
                    <select
                        id="tipo"
                        name="tipo"
                        value={formData.tipo} 
                        onChange={handleChange}
                        required
                        className="form-select" 
                        disabled={isEditMode} 
                    >
                        <option value="entrada">Entrada (Sumar Stock)</option>
                        <option value="salida">Salida (Restar Stock)</option>
                    </select>
                </div>

                {/* Selector de Producto */}
                <div className="form-group">
                    <label htmlFor="id_producto">Producto</label>
                    <select
                        id="id_producto"
                        name="id_producto"
                        value={formData.id_producto}
                        onChange={handleChange}
                        required
                        className="form-select"
                        disabled={isEditMode} 
                    >
                        <option value="">-- Selecciona un producto --</option>
                        {productos.map(p => (
                            <option key={p.id_producto} value={p.id_producto}>
                                {p.nombre} (Stock actual: {p.cantidad})
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Cantidad */}
                <Input 
                    label="Cantidad"
                    name="cantidad"
                    type="number"
                    value={formData.cantidad}
                    onChange={handleChange}
                    min="1"
                    required
                />

                <div className="form-actions">
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Procesando...' : 'Registrar Movimiento'}
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

export default MovimientoForm;