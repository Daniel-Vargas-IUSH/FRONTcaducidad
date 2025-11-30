import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as movimientoService from '../../services/movimientoService';
import * as productoService from '../../services/productoService'; 
import Input from '../../components/common/InputField';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext'; 
import './FormPage.css'; 

// FUNCIÓN DE CORRECCIÓN: Convierte la fecha ISO a formato de fecha simple (YYYY-MM-DD)
const formatDateToSQL = (isoDateString) => {
    if (!isoDateString || typeof isoDateString !== 'string') return null;
    try {
        // La parte .slice(0, 10) extrae la parte YYYY-MM-DD
        return isoDateString.slice(0, 10);
    } catch (error) {
        console.error("Error al formatear la fecha:", error);
        return isoDateString; // Devuelve el original si falla
    }
};

const MovimientoFormPage = () => {
    const { id_movimiento } = useParams(); 
    const navigate = useNavigate();
    const isEditMode = !!id_movimiento; 
    const { user, loading: authLoading } = useAuth();
    // CLAVE: Accedemos al id_usuario desde el objeto 'user'
    const currentUserId = user?.id_usuario; 

    const [formData, setFormData] = useState({
        tipo: 'entrada',
        cantidad: 1,
        id_producto: '',
    });
    // La lista de productos debe tener el stock actual
    const [productos, setProductos] = useState([]); 
    const [loading, setLoading] = useState(true); // Carga de productos/movimiento
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cargar listas y datos de edición al inicio
    useEffect(() => {
        const fetchData = async () => {
            setError(null);
            try {
                // 1. Cargar la lista de productos (incluye el stock) para el selector
                const prodsData = await productoService.getProductos();
                setProductos(prodsData);
                
                // Si estamos editando, cargar los datos del movimiento
                if (isEditMode && id_movimiento) {
                    const movData = await movimientoService.getMovimientoById(id_movimiento);
                    setFormData({
                        tipo: movData.tipo.toLowerCase(),
                        cantidad: movData.cantidad,
                        id_producto: movData.id_producto,
                    });
                }
            } catch (err) {
                setError(err.message || 'Error al cargar datos necesarios (movimiento o productos).');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id_movimiento, isEditMode]);


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
        if (isEditMode) {
            setError("La edición de movimientos no está soportada. Registra una corrección.");
            setIsSubmitting(false);
            return;
        }

        const cantidadMovimiento = Number(formData.cantidad);
        const productoId = Number(formData.id_producto);
        const tipoMovimiento = formData.tipo;

        // 2. Lógica de cálculo de stock
        const productoActual = productos.find(p => p.id_producto === productoId);

        if (!productoActual) {
            setError("Error: El producto seleccionado no se pudo encontrar en la lista.");
            setIsSubmitting(false);
            return;
        }

        const stockActual = Number(productoActual.cantidad); 
        let nuevoStock;

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

        // Payload para el registro histórico del movimiento
        const movimientoPayload = {
            id_producto: productoId,
            tipo: tipoMovimiento, 
            cantidad: cantidadMovimiento,
            id_usuario: currentUserId,
        };

        // Desestructuramos para excluir la propiedad 'id_producto' (que se pasa por URL param en el backend)
        const { id_producto: _, ...restOfProductData } = productoActual;
        
        // Payload para la actualización del stock del producto
        const productoUpdatePayload = {
            ...restOfProductData, 
            cantidad: nuevoStock, 
            // *** CLAVE DE CORRECCIÓN AQUÍ ***
            fecha_caducidad: formatDateToSQL(productoActual.fecha_caducidad),
        };

        try {
            // PASO 1: Registrar el Movimiento (historial)
            await movimientoService.createMovimiento(movimientoPayload);
            
            // PASO 2: Actualizar el Producto (stock)
            await productoService.updateProducto(productoId, productoUpdatePayload);

            alert(`Movimiento de ${tipoMovimiento} registrado. Stock actualizado a ${nuevoStock}.`);
            
            // Redirigir a la lista de movimientos
            navigate('/movimientos');
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
            <h2>{isEditMode ? 'Detalle de Movimiento' : 'Registrar Nuevo Movimiento'}</h2>
            
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                
                {/* Selector de Tipo de Movimiento */}
                <div>
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
                <div>
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

                <Button type="submit" variant="primary" disabled={isSubmitting || isEditMode}>
                    {isSubmitting ? 'Procesando...' : (isEditMode ? 'Ver Movimiento' : 'Registrar Movimiento')}
                </Button>
            <div className="form-action-secondary"></div>
                <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => navigate('/movimientos')}
                >
                    Cancelar
                </Button>
            </form>
        </div>
    );
};

export default MovimientoFormPage;