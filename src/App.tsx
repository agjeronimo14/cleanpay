/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Usuario, Empresa, Servicio, Pago, Ajuste, DatosMigracion 
} from './types';
import { 
  mockUsuarios, mockEmpresas, mockServicios, mockPagos, mockAjustes, mockDatosMigracion 
} from './data/mockData';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import JefeDashboard from './components/JefeDashboard';
import TrabajadorDashboard from './components/TrabajadorDashboard';
import { 
  Sparkles, Sun, Moon, User, Check, Building, RefreshCw, AlertCircle, Info, Database, Shield, Download, ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Active Simulated User
  const [activeUserRole, setActiveUserRole] = useState<'SUPER_ADMIN' | 'JEFE' | 'TRABAJADOR'>('JEFE');
  const [activeUserId, setActiveUserId] = useState<string>('u_jefe1'); // Alejandro González

  // Core App States (Preserved in localStorage for persistent demo experience)
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem('cleanpay_usuarios');
    return saved ? JSON.parse(saved) : mockUsuarios;
  });

  const [empresas, setEmpresas] = useState<Empresa[]>(() => {
    const saved = localStorage.getItem('cleanpay_empresas');
    return saved ? JSON.parse(saved) : mockEmpresas;
  });

  const [servicios, setServicios] = useState<Servicio[]>(() => {
    const saved = localStorage.getItem('cleanpay_servicios');
    return saved ? JSON.parse(saved) : mockServicios;
  });

  const [pagos, setPagos] = useState<Pago[]>(() => {
    const saved = localStorage.getItem('cleanpay_pagos');
    return saved ? JSON.parse(saved) : mockPagos;
  });

  const [ajustes, setAjustes] = useState<Ajuste[]>(() => {
    const saved = localStorage.getItem('cleanpay_ajustes');
    return saved ? JSON.parse(saved) : mockAjustes;
  });

  const [migraciones, setMigraciones] = useState<DatosMigracion[]>(() => {
    const saved = localStorage.getItem('cleanpay_migraciones');
    return saved ? JSON.parse(saved) : mockDatosMigracion;
  });

  // Notifications or status banners
  const [notificacion, setNotificacion] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cleanpay_usuarios', JSON.stringify(usuarios));
    localStorage.setItem('cleanpay_empresas', JSON.stringify(empresas));
    localStorage.setItem('cleanpay_servicios', JSON.stringify(servicios));
    localStorage.setItem('cleanpay_pagos', JSON.stringify(pagos));
    localStorage.setItem('cleanpay_ajustes', JSON.stringify(ajustes));
    localStorage.setItem('cleanpay_migraciones', JSON.stringify(migraciones));
  }, [usuarios, empresas, servicios, pagos, ajustes, migraciones]);

  const triggerNotification = (msg: string) => {
    setNotificacion(msg);
    setTimeout(() => setNotificacion(null), 4000);
  };

  // State Mutators
  const handleAddEmpresa = (newEmp: Omit<Empresa, 'id'>) => {
    const id = `e_${Date.now()}`;
    const created: Empresa = { ...newEmp, id };
    setEmpresas([...empresas, created]);
    triggerNotification(`Empresa "${newEmp.name}" creada exitosamente.`);
  };

  const handleAddUsuario = (newUser: Omit<Usuario, 'id'>) => {
    const id = `u_${Date.now()}`;
    const created: Usuario = { ...newUser, id };
    setUsuarios([...usuarios, created]);
    triggerNotification(`Usuario "${newUser.name}" registrado como ${newUser.role}.`);
  };

  const handleToggleEstadoUsuario = (id: string) => {
    setUsuarios(usuarios.map(u => {
      if (u.id === id) {
        const nuevoEstado = u.estado === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
        triggerNotification(`Usuario "${u.name}" ahora está ${nuevoEstado}.`);
        return { ...u, estado: nuevoEstado };
      }
      return u;
    }));
  };

  const handleToggleEstadoEmpresa = (id: string) => {
    setEmpresas(empresas.map(e => {
      if (e.id === id) {
        const nuevoEstado = e.estado === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
        triggerNotification(`Empresa "${e.name}" ahora está ${nuevoEstado}.`);
        return { ...e, estado: nuevoEstado };
      }
      return e;
    }));
  };

  const handleAddTrabajador = (newTrab: Omit<Usuario, 'id'>) => {
    const id = `u_${Date.now()}`;
    const created: Usuario = { ...newTrab, id };
    setUsuarios([...usuarios, created]);
    triggerNotification(`Trabajador "${newTrab.name}" creado con éxito.`);
  };

  const handleAddServicio = (newServ: Omit<Servicio, 'id'>) => {
    const id = `s_${Date.now()}`;
    const created: Servicio = { ...newServ, id };
    setServicios([...servicios, created]);
    triggerNotification(`Servicio "${newServ.name}" asignado con éxito.`);
  };

  const handleAddPago = (newPago: Omit<Pago, 'id'>) => {
    const id = `p_${Date.now()}`;
    const created: Pago = { ...newPago, id };
    setPagos([created, ...pagos]);
    triggerNotification(`Pago de $${newPago.monto} registrado exitosamente.`);
  };

  const handleConfirmarPago = (pagoId: string) => {
    setPagos(pagos.map(p => {
      if (p.id === pagoId) {
        triggerNotification(`Pago por $${p.monto} ha sido confirmado y consolidado.`);
        return { ...p, estadoConfirmacion: 'CONFIRMADO' };
      }
      return p;
    }));
  };

  const handleAddAjuste = (newAjuste: Omit<Ajuste, 'id'>) => {
    const id = `aj_${Date.now()}`;
    const created: Ajuste = { ...newAjuste, id };
    setAjustes([created, ...ajustes]);
    triggerNotification(`Excepción / Ajuste de $${Math.abs(newAjuste.monto)} registrado.`);
  };

  const handleAddMigracion = (trabajadorId: string, saldoInicial: number, fechaCorte: string) => {
    const filtrados = migraciones.filter(m => m.trabajadorId !== trabajadorId);
    const nuevaMigracion: DatosMigracion = {
      trabajadorId,
      saldoPendienteInicial: saldoInicial,
      fechaCorteInicial: fechaCorte,
      notas: 'Ajuste de migración inicial'
    };
    setMigraciones([...filtrados, nuevaMigracion]);
    triggerNotification(`Saldo inicial de migración de $${saldoInicial} actualizado.`);
  };

  // Actions for Trabajador Dashboard
  const handleRegistrarPagoRecibido = (monto: number, metodo: 'EFECTIVO' | 'TRANSFERENCIA' | 'ZELLE' | 'OTRO', notas?: string) => {
    const activeTrab = usuarios.find(u => u.id === activeUserId);
    if (!activeTrab) return;

    handleAddPago({
      trabajadorId: activeTrab.id,
      empresaId: activeTrab.empresaId || 'e_cleaning_pro',
      monto,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      metodo,
      tipo: 'COMPLETO',
      notas: notas || 'Registrado por el trabajador',
      registradoPor: activeTrab.id,
      estadoConfirmacion: 'PENDIENTE_JEFE' // El jefe debe validarlo en su panel
    });
  };

  const handleReportarDiferencia = (motivo: string) => {
    const activeTrab = usuarios.find(u => u.id === activeUserId);
    if (!activeTrab) return;

    // Se guarda como un ajuste neutral de 0 pesos pero con notas de discrepancia
    handleAddAjuste({
      trabajadorId: activeTrab.id,
      empresaId: activeTrab.empresaId || 'e_cleaning_pro',
      tipo: 'BONIFICACION',
      monto: 0,
      fecha: new Date().toISOString().split('T')[0],
      notas: `DISCREPANCIA REPORTADA POR TRABAJADOR: ${motivo}`,
      registradoPor: activeTrab.id
    });
    triggerNotification('Reporte de diferencia enviado al jefe exitosamente.');
  };

  const handleResetDemoData = () => {
    if (confirm('¿Está seguro de restablecer todos los datos de prueba a su estado original?')) {
      localStorage.removeItem('cleanpay_usuarios');
      localStorage.removeItem('cleanpay_empresas');
      localStorage.removeItem('cleanpay_servicios');
      localStorage.removeItem('cleanpay_pagos');
      localStorage.removeItem('cleanpay_ajustes');
      localStorage.removeItem('cleanpay_migraciones');
      setUsuarios(mockUsuarios);
      setEmpresas(mockEmpresas);
      setServicios(mockServicios);
      setPagos(mockPagos);
      setAjustes(mockAjustes);
      setMigraciones(mockDatosMigracion);
      triggerNotification('Datos restablecidos correctamente.');
    }
  };

  // Find active entity profiles
  const currentUser = usuarios.find(u => u.id === activeUserId) || usuarios[0];
  const currentEmpresa = empresas.find(e => e.id === currentUser.empresaId) || empresas[0];

  // Workers belonging to the current empresa
  const trabajadoresDeEmpresa = usuarios.filter(u => u.role === 'TRABAJADOR' && u.empresaId === currentUser.empresaId);

  // Services belonging to the current empresa
  const serviciosDeEmpresa = servicios.filter(s => s.empresaId === currentUser.empresaId);

  // Payments belonging to the current empresa
  const pagosDeEmpresa = pagos.filter(p => p.empresaId === currentUser.empresaId);

  // Ajustes belonging to the current empresa
  const ajustesDeEmpresa = ajustes.filter(a => a.empresaId === currentUser.empresaId);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* SaaS Global Header */}
      <header className={`border-b ${darkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200/80 bg-white/90'} backdrop-blur-md sticky top-0 z-40 transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black tracking-tighter shadow-sm shadow-emerald-600/30">
              CP
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-1.5">
                CleanPay 
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">SaaS Demo</span>
              </span>
              <p className="text-[10px] text-slate-400">Control de deuda transparente para empresas de limpieza</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
              title="Alternar Tema"
            >
              {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            {/* Simulated Live Database Downloader */}
            <a
              href="#schema_down"
              onClick={() => {
                alert('Puedes encontrar el script listo de Base de Datos PostgreSQL listo para copiar y pegar en Supabase en el archivo /supabase-schema.sql de tu espacio.');
              }}
              className="hidden md:inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 text-[11px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer border border-transparent hover:border-emerald-100"
            >
              <Database size={13} />
              Esquema Supabase SQL
            </a>

            {/* Reset Simulator */}
            <button
              onClick={handleResetDemoData}
              className="text-[11px] font-bold bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1"
              title="Restablecer Simulador"
            >
              <RefreshCw size={12} />
              Reset Datos
            </button>
          </div>
        </div>
      </header>

      {/* Simulator Control Dock (For Multi-role SaaS Testing) */}
      <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="shrink-0" />
            <span><strong>DOCK DE SIMULACIÓN MULTI-INQUILINO (SAAS):</strong> Cambia de usuario para ver cómo cada uno ve CleanPay de manera privada.</span>
          </span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {/* Super Admin */}
            <button
              onClick={() => {
                setActiveUserRole('SUPER_ADMIN');
                setActiveUserId('u_superadmin');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeUserRole === 'SUPER_ADMIN' ? 'bg-slate-900 text-white shadow-xs' : 'bg-amber-600 hover:bg-amber-700 text-amber-950'
              }`}
            >
              👑 Super Admin
            </button>

            {/* Boss Alejandro */}
            <button
              onClick={() => {
                setActiveUserRole('JEFE');
                setActiveUserId('u_jefe1');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeUserRole === 'JEFE' ? 'bg-slate-900 text-white shadow-xs' : 'bg-amber-600 hover:bg-amber-700 text-amber-950'
              }`}
            >
              💼 Jefe (Alejandro)
            </button>

            {/* Worker María */}
            <button
              onClick={() => {
                setActiveUserRole('TRABAJADOR');
                setActiveUserId('u_trabajador1');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeUserId === 'u_trabajador1' ? 'bg-slate-900 text-white shadow-xs' : 'bg-amber-600 hover:bg-amber-700 text-amber-950'
              }`}
            >
              🧹 Trabajadora (María)
            </button>

            {/* Worker Juan */}
            <button
              onClick={() => {
                setActiveUserRole('TRABAJADOR');
                setActiveUserId('u_trabajador2');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeUserId === 'u_trabajador2' ? 'bg-slate-900 text-white shadow-xs' : 'bg-amber-600 hover:bg-amber-700 text-amber-950'
              }`}
            >
              🧹 Trabajador (Juan)
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Real-time Toast Notifications */}
        <AnimatePresence>
          {notificacion && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs max-w-2xl mx-auto"
            >
              <span className="flex items-center gap-2">
                <Check size={16} className="text-emerald-600" />
                {notificacion}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Dashboard Router depending on active simulated role */}
        <div className="space-y-6">
          {activeUserRole === 'SUPER_ADMIN' && (
            <SuperAdminDashboard
              usuarios={usuarios}
              empresas={empresas}
              onAddEmpresa={handleAddEmpresa}
              onAddUsuario={handleAddUsuario}
              onToggleEstadoUsuario={handleToggleEstadoUsuario}
              onToggleEstadoEmpresa={handleToggleEstadoEmpresa}
            />
          )}

          {activeUserRole === 'JEFE' && (
            <JefeDashboard
              jefe={currentUser}
              empresa={currentEmpresa}
              trabajadores={trabajadoresDeEmpresa}
              servicios={serviciosDeEmpresa}
              pagos={pagosDeEmpresa}
              ajustes={ajustesDeEmpresa}
              onAddTrabajador={handleAddTrabajador}
              onAddServicio={handleAddServicio}
              onAddPago={handleAddPago}
              onConfirmarPago={handleConfirmarPago}
              onAddAjuste={handleAddAjuste}
              onAddMigracion={handleAddMigracion}
            />
          )}

          {activeUserRole === 'TRABAJADOR' && (
            <TrabajadorDashboard
              trabajador={currentUser}
              empresa={currentEmpresa}
              servicios={serviciosDeEmpresa.filter(s => s.trabajadorId === currentUser.id)}
              pagos={pagosDeEmpresa.filter(p => p.trabajadorId === currentUser.id)}
              ajustes={ajustesDeEmpresa.filter(a => a.trabajadorId === currentUser.id)}
              onRegistrarPagoRecibido={handleRegistrarPagoRecibido}
              onReportarDiferencia={handleReportarDiferencia}
            />
          )}
        </div>

        {/* Free Deployment Explainer Section at the bottom */}
        <section className={`mt-12 p-6 rounded-2xl border ${darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white font-sans">Guía de Despliegue 100% Gratuito en la Nube</h2>
              <p className="text-xs text-slate-500">¿Cómo llevar este SaaS a producción de forma independiente sin pagar hosting?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-600 dark:text-slate-300">
            <div className="space-y-2">
              <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-extrabold text-[10px]">1</span>
                Supabase (Base de Datos & Auth)
              </span>
              <p className="leading-relaxed">
                Regístrate en <strong className="text-emerald-600">supabase.com</strong> con tu cuenta de GitHub. Crea un proyecto gratuito y abre el <strong>SQL Editor</strong>. Copia y pega el contenido completo de nuestro archivo <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">/supabase-schema.sql</code> para crear todas tus tablas y reglas de seguridad multi-empresa al instante.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-extrabold text-[10px]">2</span>
                Cloudflare Pages / Vercel
              </span>
              <p className="leading-relaxed">
                Usa el botón de <strong>Exportar a GitHub</strong> arriba a la derecha en este panel de AI Studio. Luego, entra a <strong className="text-emerald-600">Cloudflare Pages</strong> o <strong className="text-emerald-600">Vercel</strong>, conecta tu repositorio y despliega tu frontend React con un solo clic de manera gratuita e ilimitada.
              </p>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-extrabold text-[10px]">3</span>
                Cuentas Claras Automatizadas
              </span>
              <p className="leading-relaxed">
                ¡Listo! Ambas partes podrán consultar la misma base de datos, el jefe registrará pagos, el trabajador podrá reportar recibos desde su celular y el cálculo automático de deudas mantendrá todo transparente sin margen de error.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Global Footer */}
      <footer className="py-8 border-t border-slate-200/50 dark:border-slate-800/40 text-center text-xs text-slate-400">
        <p>© 2026 CleanPay SaaS. Desarrollado de forma transparente y colaborativa.</p>
      </footer>
    </div>
  );
}
