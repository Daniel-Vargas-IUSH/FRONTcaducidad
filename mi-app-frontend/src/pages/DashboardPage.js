// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import * as productoService from '../services/productoService';
import * as movimientoService from '../services/movimientoService';
import './DashboardPage.css';


const formatSafeDate = (dateString) => {
    if (!dateString) return 'Sin fecha'; 
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        return 'Fecha inválida'; 
    }
    
    return date.toLocaleDateString();
};

const calculateDaysUntilExpiration = (expirationDate) => {
    if (!expirationDate) return null;
    const now = new Date();
    const expiration = new Date(expirationDate.split('T')[0]);
    const diffTime = expiration.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};


const DashboardPage = () => {
    const [stats, setStats] = useState({
        totalStock: 0,
        expiredProducts: 0,
        lowStockProducts: 0,
        recentMovementsCount: 0,
    });
    const [alerts, setAlerts] = useState({
        expirationAlerts: [], 
        lowStockAlerts: [], 
        recentMovements: [], 
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const LOW_STOCK_THRESHOLD = 10;
    const EXPIRATION_DAYS_THRESHOLD = 30;

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const allProducts = await productoService.getProductos();
                const allMovements = await movimientoService.getMovimientos();

                let totalStock = 0;
                let expiredCount = 0;
                let lowStockCount = 0;
                const expirationAlerts = [];
                const lowStockAlerts = [];

                allProducts.forEach(p => {
                    const cantidad = Number(p.cantidad);
                    totalStock += cantidad;

                    const daysUntil = calculateDaysUntilExpiration(p.fecha_caducidad);
                    
                    if (daysUntil !== null) {
                        if (daysUntil < 0) {
                            expiredCount++;
                            expirationAlerts.push({ ...p, daysUntil, isExpired: true });
                        } else if (daysUntil <= EXPIRATION_DAYS_THRESHOLD) {
                            expirationAlerts.push({ ...p, daysUntil, isExpired: false });
                        }
                    }

                    if (cantidad <= LOW_STOCK_THRESHOLD) {
                        lowStockCount++;
                        lowStockAlerts.push(p);
                    }
                });
               
                const recentMovements = allMovements
                    .sort((a, b) => {
                    const dateA = new Date(a.fecha);
                    const dateB = new Date(b.fecha);
                    return dateB - dateA; 
                })
                .slice(0, 5); 
                
                setStats({
                    totalStock,
                    expiredProducts: expiredCount,
                    lowStockProducts: lowStockCount,
                    recentMovementsCount: allMovements.length, 
                });

                setAlerts({
                    expirationAlerts,
                    lowStockAlerts,
                    recentMovements,
                });

            } catch (err) {
                console.error("Error al cargar datos del Dashboard:", err);
                setError("Error al cargar datos del inventario. Inténtalo de nuevo.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="loading-message">Cargando Dashboard...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <main className="dashboard-page">
            <h1 className="dashboard-title">Visión General del Inventario</h1>

            {/* Sección 1: Métricas Clave (WIDGETS) */}
            <section className="metrics-grid">
                
                <div className="metric-card primary-stat">
                    <h2>Stock Total</h2>
                    <p>{stats.totalStock.toLocaleString()} Unidades</p>
                </div>
                
                <div className="metric-card warning-stat">
                    <h2>Stock Bajo</h2>
                    <p>{stats.lowStockProducts.toLocaleString()} Productos</p>
                </div>
                
                <div className="metric-card danger-stat">
                    <h2>Productos Caducados</h2>
                    <p>{stats.expiredProducts.toLocaleString()} Productos</p>
                </div>

                 <div className="metric-card secondary-stat">
                    <h2>Movimientos Totales</h2>
                    <p>{stats.recentMovementsCount.toLocaleString()} Registros</p>
                </div>

            </section>

            {/* Separador */}
            <hr className="divider" />


            {/* Sección 2: Alertas y Acciones Rápidas */}
            <section className="alerts-and-actions-grid">
                
                {/* Columna 1: Alertas de Caducidad */}
                <div className="alert-panel expiration-panel">
                    <h3>⚠️ Alertas de Caducidad ({alerts.expirationAlerts.length})</h3>
                    {alerts.expirationAlerts.length > 0 ? (
                        <ul className="alert-list">
                            {alerts.expirationAlerts.map(p => (
                                <li key={p.id_producto} className={`alert-item ${p.isExpired ? 'expired' : 'expiring'}`}>
                                    <strong>{p.nombre}</strong> ({p.cantidad} uds.)
                                    <span className="date-info">
                                        {p.isExpired 
                                            ? `EXPIRÓ hace ${Math.abs(p.daysUntil)} días` 
                                            : `Caduca en ${p.daysUntil} días`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-alerts">No hay alertas de caducidad próximas.</p>
                    )}
                </div>

                {/* Columna 2: Alertas de Stock Bajo */}
                <div className="alert-panel low-stock-panel">
                    <h3>⬇️ Stock Bajo ({alerts.lowStockAlerts.length})</h3>
                    {alerts.lowStockAlerts.length > 0 ? (
                        <ul className="alert-list">
                            {alerts.lowStockAlerts.map(p => (
                                <li key={p.id_producto} className="alert-item low-stock">
                                    <strong>{p.nombre}</strong>
                                    <span className="stock-info">Stock: {p.cantidad} uds.</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-alerts">Ningún producto está bajo el umbral de stock ({LOW_STOCK_THRESHOLD}).</p>
                    )}
                </div>

                {/* Columna 3: Últimos Movimientos */}
                <div className="alert-panel recent-movements-panel">
                    <h3>🔄 Últimos Movimientos</h3>
                    {alerts.recentMovements.length > 0 ? (
                        <ul className="movement-list">
                            {alerts.recentMovements.map(m => (
                                <li key={m.id_movimiento} className={`movement-item ${m.tipo}`}>
                                    <span className="type-label">{m.tipo.toUpperCase()}</span>
                                    <p>{m.cantidad} uds. de <strong>{m.nombre_producto}</strong></p>
                                    <small>{formatSafeDate(m.fecha)}</small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-alerts">No hay movimientos recientes.</p>
                    )}
                </div>

            </section>
        </main>
    );
};

export default DashboardPage;