/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Usuario, Empresa, Servicio, Pago, Ajuste, FrecuenciaPago, EstadoServicio, TipoPago } from '../types';
import { calcularBalanceTrabajador, BalanceTrabajador, generarPagosEsperados } from '../utils/calculations';
import { 
  Users, DollarSign, Calendar, FileText, Check, AlertTriangle, 
  Plus, Edit2, CheckCircle2, UserCheck, TrendingUp, HelpCircle, ArrowUpRight, ArrowDownRight, Send, Filter, Search, ClipboardList
} from 'lucide-react';
import { motion } from 'motion/react';

interface JefeDashboardProps {
  jefe: Usuario;
  empresa: Empresa;
  trabajadores: Usuario[];
  servicios: Servicio[];
  pagos: Pago[];
  ajustes: Ajuste[];
  onAddTrabajador: (trabajador: Omit<Usuario, 'id'>) => void;
  onAddServicio: (servicio: Omit<Servicio, 'id'>) => void;
  onAddPago: (pago: Omit<Pago, 'id'>) => void;
  onConfirmarPago: (pagoId: string) => void;
  onAddAjuste: (ajuste: Omit<Ajuste, 'id'>) => void;
  onAddMigracion: (trabajadorId: string, saldoInicial: number, fechaCorte: string) => void;
}

export default function JefeDashboard({
  jefe,
  empresa,
  trabajadores,
  servicios,
  pagos,
  ajustes,
  onAddTrabajador,
  onAddServicio,
  onAddPago,
  onConfirmarPago,
  onAddAjuste,
  onAddMigracion
}: JefeDashboardProps) {
  const [activeTab, setActiveTab] = useState<'resumen' | 'trabajadores' | 'servicios' | 'pagos' | 'ajustes' | 'reportes'>('resumen');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [showTrabajadorModal, setShowTrabajadorModal] = useState(false);
  const [showServicioModal, setShowServicioModal] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showAjusteModal, setShowAjusteModal] = useState(false);
  const [showMigracionModal, setShowMigracionModal] = useState(false);

  // New Trabajador Form
  const [newTrabajadorName, setNewTrabajadorName] = useState('');
  const [newTrabajadorEmail, setNewTrabajadorEmail] = useState('');
  const [newTrabajadorTelefono, setNewTrabajadorTelefono] = useState('');

  // New Servicio Form
  const [newServicioName, setNewServicioName] = useState('');
  const [newServicioCliente, setNewServicioCliente] = useState('');
  const [newServicioDireccion, setNewServicioDireccion] = useState('');
  const [newServicioFrecuencia, setNewServicioFrecuencia] = useState<FrecuenciaPago>('SEMANAL');
  const [newServicioMonto, setNewServicioMonto] = useState<number>(200);
  const [newServicioTrabajadorId, setNewServicioTrabajadorId] = useState('');
  const [newServicioFechaAsignacion, setNewServicioFechaAsignacion] = useState(new Date().toISOString().split('T')[0]);

  // New Pago Form
  const [newPagoTrabajadorId, setNewPagoTrabajadorId] = useState('');
  const [newPagoMonto, setNewPagoMonto] = useState<number>(0);
  const [newPagoMetodo, setNewPagoMetodo] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'ZELLE' | 'OTRO'>('TRANSFERENCIA');
  const [newPagoTipo, setNewPagoTipo] = useState<TipoPago>('COMPLETO');
  const [newPagoNotas, setNewPagoNotas] = useState('');

  // New Ajuste Form
  const [newAjusteTrabajadorId, setNewAjusteTrabajadorId] = useState('');
  const [newAjusteTipo, setNewAjusteTipo] = useState<any>('TRABAJO_EXTRA');
  const [newAjusteMonto, setNewAjusteMonto] = useState<number>(0);
  const [newAjusteNotas, setNewAjusteNotas] = useState('');

  // New Migracion Form
  const [migracionTrabajadorId, setMigracionTrabajadorId] = useState('');
  const [migracionSaldo, setMigracionSaldo] = useState<number>(0);
  const [migracionFecha, setMigracionFecha] = useState(new Date().toISOString().split('T')[0]);

  // Selected worker for deep dive reports
  const [selectedTrabajadorReport, setSelectedTrabajadorReport] = useState<string>('');

  // Calculations: Balances for all workers
  const balancesTrabajadores = trabajadores.map(t => {
    return {
      trabajador: t,
      balance: calcularBalanceTrabajador(t.id, servicios, pagos, ajustes)
    };
  });

  const totalDeudaGeneral = balancesTrabajadores.reduce((sum, b) => sum + b.balance.saldoPendiente, 0);

  // Workers with highest debt
  const trabajadoresConMayorDeuda = [...balancesTrabajadores]
    .sort((a, b) => b.balance.saldoPendiente - a.balance.saldoPendiente)
    .slice(0, 4);

  // Filter lists based on search
  const filteredTrabajadores = balancesTrabajadores.filter(b => 
    b.trabajador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.trabajador.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServicios = servicios.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Form Submissions
  const handleAddTrabajador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrabajadorName || !newTrabajadorEmail) return;
    onAddTrabajador({
      name: newTrabajadorName,
      email: newTrabajadorEmail,
      role: 'TRABAJADOR',
      empresaId: empresa.id,
      telefono: newTrabajadorTelefono,
      estado: 'ACTIVO'
    });
    setNewTrabajadorName('');
    setNewTrabajadorEmail('');
    setNewTrabajadorTelefono('');
    setShowTrabajadorModal(false);
  };

  const handleAddServicio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServicioName || !newServicioTrabajadorId) return;
    onAddServicio({
      name: newServicioName,
      cliente: newServicioCliente || 'Cliente Genérico',
      direccion: newServicioDireccion || 'No provista',
      frecuencia: newServicioFrecuencia,
      diasTrabajo: ['Lunes', 'Miércoles'],
      monto: Number(newServicioMonto),
      fechaAsignacion: newServicioFechaAsignacion,
      trabajadorId: newServicioTrabajadorId,
      empresaId: empresa.id,
      estado: 'ACTIVO'
    });
    setNewServicioName('');
    setNewServicioCliente('');
    setNewServicioDireccion('');
    setShowServicioModal(false);
  };

  const handleAddPagoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPagoTrabajadorId || Number(newPagoMonto) <= 0) return;
    onAddPago({
      trabajadorId: newPagoTrabajadorId,
      empresaId: empresa.id,
      monto: Number(newPagoMonto),
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      metodo: newPagoMetodo,
      tipo: newPagoTipo,
      notas: newPagoNotas,
      registradoPor: jefe.id,
      estadoConfirmacion: 'CONFIRMADO' // Como lo registra el Jefe, ya está confirmado
    });
    setNewPagoMonto(0);
    setNewPagoNotas('');
    setShowPagoModal(false);
  };

  const handleAddAjusteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAjusteTrabajadorId || Number(newAjusteMonto) === 0) return;
    onAddAjuste({
      trabajadorId: newAjusteTrabajadorId,
      empresaId: empresa.id,
      tipo: newAjusteTipo,
      monto: Number(newAjusteMonto),
      fecha: new Date().toISOString().split('T')[0],
      notas: newAjusteNotas,
      registradoPor: jefe.id
    });
    setNewAjusteMonto(0);
    setNewAjusteNotas('');
    setShowAjusteModal(false);
  };

  const handleMigracionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!migracionTrabajadorId) return;
    onAddMigracion(migracionTrabajadorId, Number(migracionSaldo), migracionFecha);
    setMigracionSaldo(0);
    setShowMigracionModal(false);
  };

  // Generate WhatsApp Share Statement
  const handleWhatsAppShare = (workerId: string) => {
    const selected = balancesTrabajadores.find(b => b.trabajador.id === workerId);
    if (!selected) return;

    const b = selected.balance;
    const txt = `*ESTADO DE CUENTA - CLEANPAY*\n` +
                `*Empresa:* ${empresa.name}\n` +
                `*Trabajador:* ${selected.trabajador.name}\n` +
                `-----------------------------------------\n` +
                `• *Saldo Inicial:* $${b.saldoInicial}\n` +
                `• *Generado por Trabajos:* $${b.totalGeneradoServicios}\n` +
                `• *Trabajos Extras/Bonos:* $${b.totalAjustesPositivos}\n` +
                `• *Descuentos/Suspensiones:* -$${b.totalAjustesNegativos}\n` +
                `• *Total Pagado:* $${b.totalPagado}\n` +
                `-----------------------------------------\n` +
                `*SALDO PENDIENTE ACTUAL: $${b.saldoPendiente}*\n` +
                `-----------------------------------------\n` +
                `_Reporte generado automáticamente de manera transparente para ambas partes._`;

    const encoded = encodeURIComponent(txt);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6" id="jefe_panel">
      {/* Top Welcome and Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl shadow-xs">
        <div>
          <span className="text-emerald-400 font-semibold text-xs tracking-wider uppercase">{empresa.name}</span>
          <h1 className="text-2xl font-bold tracking-tight font-sans">Hola, {jefe.name}</h1>
          <p className="text-xs text-slate-300">Monitoree servicios, valide pagos y mantenga cuentas claras con su equipo.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              if (trabajadores.length === 0) {
                alert('Debe tener al menos un trabajador registrado.');
                return;
              }
              setNewPagoTrabajadorId(trabajadores[0].id);
              setShowPagoModal(true);
            }}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            <DollarSign size={15} />
            Registrar Pago
          </button>
          <button
            onClick={() => {
              if (trabajadores.length === 0) {
                alert('Debe tener al menos un trabajador registrado.');
                return;
              }
              setNewAjusteTrabajadorId(trabajadores[0].id);
              setShowAjusteModal(true);
            }}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            <Plus size={15} />
            Añadir Excepción/Ajuste
          </button>
          <button
            onClick={() => {
              if (trabajadores.length === 0) {
                alert('Debe tener al menos un trabajador registrado.');
                return;
              }
              setMigracionTrabajadorId(trabajadores[0].id);
              setShowMigracionModal(true);
            }}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-teal-400 font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer font-sans"
          >
            <TrendingUp size={15} />
            Migración Inicial
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto">
        {(['resumen', 'trabajadores', 'servicios', 'pagos', 'ajustes', 'reportes'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-semibold capitalize whitespace-nowrap transition border-b-2 -mb-[2px] cursor-pointer ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-600 font-bold bg-emerald-50/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            {tab === 'resumen' ? 'Panel de Control' : tab}
          </button>
        ))}
      </div>

      {/* SEARCH / FILTERS FOR LISTS (Except overview and reports) */}
      {activeTab !== 'resumen' && activeTab !== 'reportes' && (
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={`Buscar en ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {/* TAB CONTENTS */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Main Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Deuda Pendiente Total</span>
              <span className="text-3xl font-extrabold text-red-600 font-sans tracking-tight">${totalDeudaGeneral.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Suma acumulada por pagar</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Trabajadores Activos</span>
              <span className="text-3xl font-extrabold text-slate-800 font-sans tracking-tight">{trabajadores.length}</span>
              <span className="text-[10px] text-emerald-600 block mt-1">● Todos autorizados</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Servicios Activos</span>
              <span className="text-3xl font-extrabold text-slate-800 font-sans tracking-tight">{servicios.length}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Oficinas, condominios, etc.</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold block">Pagos Esperados Próximos</span>
              <span className="text-3xl font-extrabold text-teal-600 font-sans tracking-tight">
                ${servicios.reduce((sum, s) => sum + s.monto, 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Estimación de ciclos vigentes</span>
            </div>
          </div>

          {/* Validation Banner (Worker registered payments pending boss approval) */}
          {pagos.some(p => p.estadoConfirmacion === 'PENDIENTE_JEFE') && (
            <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">Validaciones Pendientes</h4>
                  <p className="text-[11px] text-amber-700">Hay pagos registrados por trabajadores que necesitan su confirmación para oficializar el balance.</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('pagos')}
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] px-3.5 py-1.5 rounded-lg transition shrink-0"
              >
                Ver Pagos por Confirmar
              </button>
            </div>
          )}

          {/* Core Analytics Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workers with Highest Debt list */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
              <h3 className="font-bold text-xs text-slate-400 tracking-wider uppercase font-sans">Trabajadores con Mayor Deuda</h3>
              <div className="space-y-3">
                {trabajadoresConMayorDeuda.map(({ trabajador, balance }) => (
                  <div key={trabajador.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {trabajador.name.substring(0,2)}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-800 block">{trabajador.name}</span>
                        <span className="text-[10px] text-slate-400 block">{trabajador.telefono || 'Sin teléfono'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-red-600 block">${balance.saldoPendiente.toLocaleString()}</span>
                      <button 
                        onClick={() => handleWhatsAppShare(trabajador.id)}
                        className="text-[10px] text-emerald-600 font-bold hover:underline"
                      >
                        Enviar WhatsApp ↗
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick action info */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-xs text-slate-400 tracking-wider uppercase font-sans mb-3">Automatización Activa</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  CleanPay genera de forma continua los pagos esperados según la frecuencia configurada de los servicios asignados.
                </p>
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Frecuencia Semanal</span>
                    <span className="font-bold text-slate-700">Se genera cada 7 días</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Frecuencia Quincenal</span>
                    <span className="font-bold text-slate-700">Se genera cada 15 días</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Frecuencia Mensual</span>
                    <span className="font-bold text-slate-700">Se genera cada mes</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between items-center text-xs">
                <span className="text-slate-400">¿Nuevo contrato?</span>
                <button 
                  onClick={() => setShowServicioModal(true)}
                  className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
                >
                  Asignar nuevo servicio +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trabajadores' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-base text-slate-800">Directorio de Trabajadores</h2>
            <button
              onClick={() => setShowTrabajadorModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              + Nuevo Trabajador
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Nombre</th>
                  <th className="pb-3">Correo / Teléfono</th>
                  <th className="pb-3 text-right">Saldo Pendiente</th>
                  <th className="pb-3 text-center">Pagos Confirmados</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredTrabajadores.map(({ trabajador, balance }) => (
                  <tr key={trabajador.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 font-semibold text-slate-800 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                        {trabajador.name.substring(0, 2)}
                      </div>
                      {trabajador.name}
                    </td>
                    <td className="py-3">
                      <span className="block font-medium text-slate-600">{trabajador.email}</span>
                      <span className="block text-[10px] text-slate-400">{trabajador.telefono || 'Sin teléfono'}</span>
                    </td>
                    <td className="py-3 text-right font-extrabold text-red-600">
                      ${balance.saldoPendiente.toLocaleString()}
                    </td>
                    <td className="py-3 text-center text-slate-500 font-medium">
                      ${balance.totalPagado.toLocaleString()}
                    </td>
                    <td className="py-3 text-right space-x-1.5">
                      <button 
                        onClick={() => handleWhatsAppShare(trabajador.id)}
                        className="text-[11px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold hover:bg-emerald-100 transition"
                      >
                        WhatsApp
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'servicios' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-base text-slate-800">Servicios Asignados</h2>
            <button
              onClick={() => {
                if (trabajadores.length === 0) {
                  alert('Registre al menos un trabajador antes de crear servicios.');
                  return;
                }
                setNewServicioTrabajadorId(trabajadores[0].id);
                setShowServicioModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
            >
              + Asignar Servicio
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Nombre Servicio / Cliente</th>
                  <th className="pb-3">Dirección</th>
                  <th className="pb-3">Frecuencia</th>
                  <th className="pb-3">Monto</th>
                  <th className="pb-3">Trabajador Asignado</th>
                  <th className="pb-3">Fecha Inicio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredServicios.map(s => {
                  const trab = trabajadores.find(t => t.id === s.trabajadorId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3">
                        <span className="font-semibold text-slate-800 block">{s.name}</span>
                        <span className="text-[10px] text-slate-400 block">{s.cliente}</span>
                      </td>
                      <td className="py-3 text-slate-500 max-w-xs truncate">{s.direccion}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase">
                          {s.frecuencia}
                        </span>
                      </td>
                      <td className="py-3 font-extrabold text-slate-800">${s.monto}</td>
                      <td className="py-3 font-medium text-slate-700">{trab ? trab.name : 'No asignado'}</td>
                      <td className="py-3 text-slate-400">{s.fechaAsignacion}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'pagos' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h2 className="font-bold text-base text-slate-800">Historial de Pagos</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Fecha / Hora</th>
                  <th className="pb-3">Trabajador</th>
                  <th className="pb-3">Monto</th>
                  <th className="pb-3">Método</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Notas</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 text-right">Confirmación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {pagos.map(p => {
                  const trab = trabajadores.find(t => t.id === p.trabajadorId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3">
                        <span className="font-semibold block text-slate-800">{p.fecha}</span>
                        <span className="text-[10px] text-slate-400 block">{p.hora}</span>
                      </td>
                      <td className="py-3 font-semibold text-slate-700">{trab ? trab.name : 'Desconocido'}</td>
                      <td className="py-3 font-extrabold text-emerald-600">${p.monto}</td>
                      <td className="py-3 font-medium text-slate-600">{p.metodo}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                          {p.tipo}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400 max-w-xs truncate">{p.notas || '-'}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.estadoConfirmacion === 'CONFIRMADO' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {p.estadoConfirmacion === 'CONFIRMADO' ? 'Confirmado' : 'Pendiente Confirmar'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {p.estadoConfirmacion === 'PENDIENTE_JEFE' ? (
                          <button
                            onClick={() => onConfirmarPago(p.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition cursor-pointer"
                          >
                            Confirmar Pago
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">✓ Verificado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ajustes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h2 className="font-bold text-base text-slate-800">Ajustes & Excepciones</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Trabajador</th>
                  <th className="pb-3">Tipo de Excepción</th>
                  <th className="pb-3">Monto</th>
                  <th className="pb-3">Motivo / Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {ajustes.map(a => {
                  const trab = trabajadores.find(t => t.id === a.trabajadorId);
                  return (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 text-slate-600">{a.fecha}</td>
                      <td className="py-3 font-semibold text-slate-700">{trab ? trab.name : 'Desconocido'}</td>
                      <td className="py-3 font-bold text-slate-800 uppercase text-[10px]">{a.tipo.replace('_', ' ')}</td>
                      <td className={`py-3 font-extrabold ${a.monto > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {a.monto > 0 ? `+$${a.monto}` : `-$${Math.abs(a.monto)}`}
                      </td>
                      <td className="py-3 text-slate-400">{a.notas}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reportes' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
          <div>
            <h2 className="font-bold text-base text-slate-800">Reportes de Estado de Cuenta</h2>
            <p className="text-xs text-slate-500">Seleccione un trabajador para generar un reporte exportable en formato texto, ideal para imprimir o enviar por WhatsApp.</p>
          </div>

          <div className="flex gap-4 items-end">
            <div className="w-full max-w-xs space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">Seleccione un Trabajador</label>
              <select
                value={selectedTrabajadorReport}
                onChange={(e) => setSelectedTrabajadorReport(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-white focus:outline-none"
              >
                <option value="">-- Seleccionar --</option>
                {trabajadores.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            {selectedTrabajadorReport && (
              <button
                onClick={() => handleWhatsAppShare(selectedTrabajadorReport)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={14} />
                Compartir por WhatsApp
              </button>
            )}
          </div>

          {selectedTrabajadorReport ? (
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl font-mono text-xs max-w-2xl text-slate-700 space-y-4">
              <div className="text-center font-bold text-sm border-b border-dashed border-slate-300 pb-3 space-y-0.5">
                <div>CLEANPAY STATE STATEMENT</div>
                <div className="text-xs text-slate-400 font-normal">{empresa.name}</div>
                <div className="text-xs text-slate-400 font-normal">Fecha: {new Date().toISOString().split('T')[0]}</div>
              </div>

              <div className="space-y-1">
                <div><strong>Trabajador:</strong> {trabajadores.find(t => t.id === selectedTrabajadorReport)?.name}</div>
                <div><strong>Teléfono:</strong> {trabajadores.find(t => t.id === selectedTrabajadorReport)?.telefono || 'N/A'}</div>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5">
                <div className="flex justify-between">
                  <span>Saldo de Migración Inicial:</span>
                  <span>${calcularBalanceTrabajador(selectedTrabajadorReport, servicios, pagos, ajustes).saldoInicial}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Generado (Servicios):</span>
                  <span>${calcularBalanceTrabajador(selectedTrabajadorReport, servicios, pagos, ajustes).totalGeneradoServicios}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ajustes Positivos (Extras/Bonos):</span>
                  <span>${calcularBalanceTrabajador(selectedTrabajadorReport, servicios, pagos, ajustes).totalAjustesPositivos}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Ajustes Negativos (Descuentos):</span>
                  <span>-${calcularBalanceTrabajador(selectedTrabajadorReport, servicios, pagos, ajustes).totalAjustesNegativos}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Total Cobrado (Confirmados):</span>
                  <span>-${calcularBalanceTrabajador(selectedTrabajadorReport, servicios, pagos, ajustes).totalPagado}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-slate-300 pt-3 flex justify-between font-bold text-sm text-slate-900">
                <span>SALDO PENDIENTE NETO:</span>
                <span className="text-red-600">
                  ${calcularBalanceTrabajador(selectedTrabajadorReport, servicios, pagos, ajustes).saldoPendiente}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 text-xs">
              Por favor, seleccione un trabajador para ver la vista previa de su estado de cuenta.
            </div>
          )}
        </div>
      )}

      {/* FORM MODALS */}
      {showTrabajadorModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Nuevo Trabajador</h3>
              <button onClick={() => setShowTrabajadorModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>
            <form onSubmit={handleAddTrabajador} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newTrabajadorName}
                  onChange={(e) => setNewTrabajadorName(e.target.value)}
                  placeholder="Ej: María Rodríguez"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newTrabajadorEmail}
                  onChange={(e) => setNewTrabajadorEmail(e.target.value)}
                  placeholder="maria@gmail.com"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Teléfono</label>
                <input
                  type="text"
                  value={newTrabajadorTelefono}
                  onChange={(e) => setNewTrabajadorTelefono(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowTrabajadorModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Crear Trabajador
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showServicioModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Asignar Servicio</h3>
              <button onClick={() => setShowServicioModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>
            <form onSubmit={handleAddServicio} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Nombre del Servicio *</label>
                <input
                  type="text"
                  required
                  value={newServicioName}
                  onChange={(e) => setNewServicioName(e.target.value)}
                  placeholder="Ej: Oficinas Planta Baja"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Cliente</label>
                  <input
                    type="text"
                    value={newServicioCliente}
                    onChange={(e) => setNewServicioCliente(e.target.value)}
                    placeholder="Ej: TechCorp S.A."
                    className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Monto por Período ($) *</label>
                  <input
                    type="number"
                    required
                    value={newServicioMonto}
                    onChange={(e) => setNewServicioMonto(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Asignar a Trabajador *</label>
                <select
                  value={newServicioTrabajadorId}
                  onChange={(e) => setNewServicioTrabajadorId(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 bg-white text-sm"
                >
                  <option value="">-- Seleccionar --</option>
                  {trabajadores.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Frecuencia de Pago *</label>
                  <select
                    value={newServicioFrecuencia}
                    onChange={(e) => setNewServicioFrecuencia(e.target.value as FrecuenciaPago)}
                    className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 bg-white text-sm"
                  >
                    <option value="SEMANAL">Semanal (Cada 7 días)</option>
                    <option value="QUINCENAL">Quincenal (Cada 15 días)</option>
                    <option value="MENSUAL">Mensual (Cada mes)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Fecha de Asignación *</label>
                  <input
                    type="date"
                    required
                    value={newServicioFechaAsignacion}
                    onChange={(e) => setNewServicioFechaAsignacion(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Dirección</label>
                <input
                  type="text"
                  value={newServicioDireccion}
                  onChange={(e) => setNewServicioDireccion(e.target.value)}
                  placeholder="Dirección completa"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowServicioModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Asignar Servicio
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showPagoModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Registrar Pago</h3>
              <button onClick={() => setShowPagoModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>
            <form onSubmit={handleAddPagoSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Trabajador *</label>
                <select
                  value={newPagoTrabajadorId}
                  onChange={(e) => setNewPagoTrabajadorId(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 bg-white text-sm"
                >
                  {trabajadores.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Monto Pagado ($) *</label>
                  <input
                    type="number"
                    required
                    value={newPagoMonto}
                    onChange={(e) => setNewPagoMonto(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Método de Pago *</label>
                  <select
                    value={newPagoMetodo}
                    onChange={(e) => setNewPagoMetodo(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 bg-white text-sm"
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="ZELLE">Zelle</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Tipo de Transacción *</label>
                <select
                  value={newPagoTipo}
                  onChange={(e) => setNewPagoTipo(e.target.value as TipoPago)}
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 bg-white text-sm"
                >
                  <option value="COMPLETO">Pago Completo</option>
                  <option value="PARCIAL">Pago Parcial</option>
                  <option value="ADELANTO">Adelanto</option>
                  <option value="EXTRAORDINARIO">Pago Extraordinario</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Notas / Notas de Corrección</label>
                <textarea
                  value={newPagoNotas}
                  onChange={(e) => setNewPagoNotas(e.target.value)}
                  placeholder="Ej: Pago de quincena o ajuste por error"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm h-20"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPagoModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Registrar Pago
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showAjusteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Añadir Excepción / Ajuste</h3>
              <button onClick={() => setShowAjusteModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>
            <form onSubmit={handleAddAjusteSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Trabajador *</label>
                <select
                  value={newAjusteTrabajadorId}
                  onChange={(e) => setNewAjusteTrabajadorId(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 bg-white text-sm"
                >
                  {trabajadores.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Monto ($) *</label>
                  <input
                    type="number"
                    required
                    value={newAjusteMonto}
                    onChange={(e) => setNewAjusteMonto(Number(e.target.value))}
                    placeholder="Monto (+ para bonos, - para descuentos)"
                    className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm"
                  />
                  <span className="text-[10px] text-slate-400">Usa números negativos para descuentos.</span>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Tipo de Ajuste *</label>
                  <select
                    value={newAjusteTipo}
                    onChange={(e) => setNewAjusteTipo(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 bg-white text-sm"
                  >
                    <option value="TRABAJO_EXTRA">Trabajo Extra</option>
                    <option value="LIMPIEZA_PROFUNDA">Limpieza Profunda</option>
                    <option value="BONIFICACION">Bonificación</option>
                    <option value="DESCUENTO">Descuento</option>
                    <option value="SEMANA_NO_TRABAJADA">Semana No Trabajada</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Notas / Justificación *</label>
                <textarea
                  required
                  value={newAjusteNotas}
                  onChange={(e) => setNewAjusteNotas(e.target.value)}
                  placeholder="Explique el motivo del ajuste. Esto quedará guardado de manera permanente en el historial del trabajador."
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm h-20"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAjusteModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Registrar Ajuste
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showMigracionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Migración de Saldo Inicial</h3>
              <button onClick={() => setShowMigracionModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>
            <form onSubmit={handleMigracionSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Trabajador *</label>
                <select
                  value={migracionTrabajadorId}
                  onChange={(e) => setMigracionTrabajadorId(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 bg-white text-sm"
                >
                  {trabajadores.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Saldo Pendiente Acumulado Previo ($) *</label>
                <input
                  type="number"
                  required
                  value={migracionSaldo}
                  onChange={(e) => setMigracionSaldo(Number(e.target.value))}
                  placeholder="Ej: 300 (si ya se le debían $300)"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Fecha de Inicio en CleanPay *</label>
                <input
                  type="date"
                  required
                  value={migracionFecha}
                  onChange={(e) => setMigracionFecha(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                Esta acción establece un balance inicial antes de que CleanPay empiece a computar los contratos de limpieza automáticamente. Ideal para traer cuentas acumuladas de meses pasados sin perder el historial.
              </p>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowMigracionModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Guardar Saldo Inicial
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
