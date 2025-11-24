import React, { useState, useEffect, useRef } from 'react';
import { MdNotifications } from 'react-icons/md'; // Asegúrate de tener instalado react-icons
import * as productoService from '../../services/productoService.js';
import './NotificationBell.css'; 

const NotificationBell = () => {
    const [alerts, setAlerts] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef(null);

    // Función para cargar las alertas
    const fetchAlerts = async () => {
        try {
            const data = await productoService.getAlerts();

            if (data && typeof data === 'object') {
                // Combinamos las listas de alertas rojas y amarillas
                const roja = (data.alerta_roja || []).map(a => ({ ...a, tipo: 'alerta_roja' }));
                const amarilla = (data.alerta_amarilla || []).map(a => ({ ...a, tipo: 'alerta_amarilla' }));
                
                const combinedAlerts = [...roja, ...amarilla];
                
                combinedAlerts.sort((a, b) => new Date(a.fecha_caducidad) - new Date(b.fecha_caducidad));

                setAlerts(combinedAlerts);
            } else {
                setAlerts([]); 
            }
        } catch (error) {
            console.error('No se pudieron cargar las alertas de caducidad.', error);
            setAlerts([]); 
        }
    };

    // 1. Carga inicial y recarga periódica
    useEffect(() => {
        fetchAlerts();
        const intervalId = setInterval(fetchAlerts, 300000); 
        return () => clearInterval(intervalId);
    }, []);

    // 2. Manejar clic fuera del menú para cerrarlo
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [bellRef]);
    
    // Función de formato auxiliar
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const cleanedDateString = dateString.split('T')[0];
        return new Date(cleanedDateString + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Función para calcular los días restantes
    const calculateDaysRemaining = (dateString) => {
        if (!dateString) return null;
        const cleanedDateString = dateString.split('T')[0];
        const expirationDate = new Date(cleanedDateString + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = expirationDate.getTime() - today.getTime();
        const daysUntilExpiration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return daysUntilExpiration;
    };


    return (
        <div className="notification-bell-container" ref={bellRef}>
            <button 
                className={`notification-bell-icon ${alerts.length > 0 ? 'has-alerts' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={`Tienes ${alerts.length} notificaciones de caducidad`}
                aria-expanded={isOpen}
            >
                <MdNotifications size={24} /> 
                
                {alerts.length > 0 && (
                    <span className="alert-count">{alerts.length}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown">
                    <h4>Notificaciones de Caducidad</h4>
                    {alerts.length === 0 ? (
                        <p className="no-alerts">✅ Todo en orden. No hay productos próximos a caducar.</p>
                    ) : (
                        <ul className="alerts-list">
                            {alerts.map((alert, index) => {
                                const daysRemaining = calculateDaysRemaining(alert.fecha_caducidad);
                                
                                // 🟢 LÓGICA DE CLASIFICACIÓN CORREGIDA POR DÍAS
                                let alertTypeClass = 'alert-warning'; // 8 a 30 días (Amarillo por defecto)
                                let alertEmoji = '🟡';
                                
                                if (daysRemaining !== null) {
                                    
                                    // 1. CONDICIÓN DE PELIGRO: 7 DÍAS O MENOS
                                    if (daysRemaining <= 7) { 
                                        alertTypeClass = 'alert-danger'; 
                                        alertEmoji = '🔴';
                                    } 
                                    
                                    // 2. CONDICIÓN DE EXPIRADO: ¡SOBRESCRIBE! 0 DÍAS O MENOS
                                    if (daysRemaining <= 0) {
                                         alertTypeClass = 'alert-danger'; 
                                         alertEmoji = '💀'; // 💀 CALAVERA
                                    } 
                                    
                                    // Si cae entre 8 y 30 días, mantiene los valores iniciales 'alert-warning' y '🟡'.
                                }
                                
                                // FIN DE LA LÓGICA 🔴🟡💀

                                return (
                                    <li key={alert.id_producto || index} className={`alert-item ${alertTypeClass}`}>
                                        {alertEmoji} Producto **{alert.nombre}** <br />
                                        Caduca el **{formatDate(alert.fecha_caducidad)}**
                                        {daysRemaining !== null && (
                                            <small> ({daysRemaining} días restantes)</small>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;