/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Usuario, Empresa, Servicio, Pago, Ajuste } from '../types';
import { calcularBalanceTrabajador, generarPagosEsperados } from '../utils/calculations';
import { 
  DollarSign, Calendar, ClipboardList, CheckCircle2, AlertCircle, 
  Send, ShieldAlert, History, MapPin, Check, Plus, CreditCard
} from 'lucide-react';
import { motion } from 'motion/react';

interface TrabajadorDashboardProps {
  trabajador: Usuario;
  empresa: Empresa;
  servicios: Servicio[];
  pagos: Pago[];
  ajustes: Ajuste[];
  onRegistrarPagoRecibido: (monto: number, metodo: 'EFECTIVO' | 'TRANSFERENCIA' | 'ZELLE' | 'OTRO', notas?: string) => void;
  onReportarDiferencia: (motivo: string) => void;
}

export default function TrabajadorDashboard({
  trabajador,
  empresa,
  servicios,
  pagos,
  ajustes,
  onRegistrarPagoRecibido,
  onReportarDiferencia
}: TrabajadorDashboardProps) {
  const [showPagoRecibidoModal, setShowPagoRecibidoModal] = useState(false);
  const [showDiferenciaModal, setShowDiferenciaModal] = useState(false);

  // Form states
  const [recibidoMonto, setRecibidoMonto] = useState<number>(0);
  const [recibidoMetodo, setRecibidoMetodo] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'ZELLE' | 'OTRO'>('TRANSFERENCIA');
  const [recibidoNotas, setRecibidoNotas] = useState('');

  const [diferenciaMotivo, setDiferenciaMotivo] = useState('');

  // Calculate worker's individual balance
  const balance = calcularBalanceTrabajador(trabajador.id, servicios, pagos, ajustes);

  // Active services
  const serviciosActivos = servicios.filter(s => s.trabajadorId === trabajador.id && s.estado === 'ACTIVO');

  // Filter payments
  const pagosTrabajador = pagos.filter(p => p.trabajadorId === trabajador.id);

  // Filter adjustments
  const ajustesTrabajador = ajustes.filter(a => a.trabajadorId === trabajador.id);

  const handlePagoRecibidoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (recibidoMonto <= 0) return;
    onRegistrarPagoRecibido(recibidoMonto, recibidoMetodo, recibidoNotas);
    setRecibidoMonto(0);
    setRecibidoNotas('');
    setShowPagoRecibidoModal(false);
  };

  const handleDiferenciaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diferenciaMotivo) return;
    onReportarDiferencia(diferenciaMotivo);
    setDiferenciaMotivo('');
    setShowDiferenciaModal(false);
  };

  return (
    <div className="space-y-6" id="trabajador_panel">
      {/* Worker Greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-emerald-600 rounded-2xl text-white gap-4">
        <div>
          <span className="text-[10px] bg-emerald-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider block w-max mb-1.5">
            Trabajador de {empresa.name}
          </span>
          <h1 className="text-xl font-bold font-sans">¡Hola, {trabajador.name}!</h1>
          <p className="text-xs text-emerald-100">Consulte su saldo, pagos recibidos e informe novedades en tiempo real.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPagoRecibidoModal(true)}
            className="bg-white hover:bg-slate-50 text-emerald-950 font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 size={15} />
            Marcar Pago Recibido
          </button>
          <button
            onClick={() => setShowDiferenciaModal(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5"
          >
            <AlertCircle size={15} />
            Reportar Diferencia
          </button>
        </div>
      </div>

      {/* Main Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Ssaldo pendiente */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 text-red-100"><DollarSign size={80} /></div>
          <span className="text-xs text-slate-400 font-bold block">Me Deben Actualmente</span>
          <span className="text-4xl font-extrabold text-red-600 block font-sans tracking-tight mt-1">
            ${balance.saldoPendiente.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Saldo calculado de manera transparente</span>
        </div>

        {/* Total Pagado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 text-emerald-50"><CheckCircle2 size={80} /></div>
          <span className="text-xs text-slate-400 font-bold block">Total Pagado / Recibido</span>
          <span className="text-4xl font-extrabold text-slate-800 block font-sans tracking-tight mt-1">
            ${balance.totalPagado.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 block mt-1">Confirmado en el historial</span>
        </div>

        {/* Proximo Pago */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 text-teal-50"><Calendar size={80} /></div>
          <span className="text-xs text-slate-400 font-bold block">Próximo Pago Esperado</span>
          <span className="text-2xl font-bold text-teal-600 block font-sans tracking-tight mt-2">
            ${balance.proximoPagoMonto.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Fecha aproximada: {balance.proximoPagoFecha}</span>
        </div>
      </div>

      {/* Pending Validation Banner */}
      {balance.totalRegistradoPendienteConfirmacion > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-amber-600 shrink-0" size={18} />
          <div>
            <h4 className="text-xs font-bold text-amber-900">Pago pendiente por confirmar por el Jefe</h4>
            <p className="text-[11px] text-amber-700">
              Registraste un pago de <strong>${balance.totalRegistradoPendienteConfirmacion}</strong>. Una vez que el jefe lo confirme en su panel, se descontará oficialmente de tu deuda.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Services & History */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
            <h3 className="font-bold text-xs text-slate-400 tracking-wider uppercase font-sans flex items-center gap-2">
              <ClipboardList size={16} className="text-slate-500" />
              Mis Servicios Activos
            </h3>
            <div className="space-y-3">
              {serviciosActivos.map(s => (
                <div key={s.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-slate-800 block">{s.name}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin size={10} />
                        {s.direccion}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 bg-white border border-slate-200/60 px-2.5 py-0.5 rounded-lg">
                      ${s.monto} / {s.frecuencia.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
              {serviciosActivos.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No tienes servicios activos asignados actualmente.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
            <h3 className="font-bold text-xs text-slate-400 tracking-wider uppercase font-sans flex items-center gap-2">
              <History size={16} className="text-slate-500" />
              Historial Completo de Pagos
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1">
              {pagosTrabajador.map(p => (
                <div key={p.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">Pago de ${p.monto}</span>
                    <span className="text-[10px] text-slate-400 block">{p.fecha} • {p.metodo}</span>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.estadoConfirmacion === 'CONFIRMADO' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {p.estadoConfirmacion === 'CONFIRMADO' ? 'Cobrado' : 'Por Confirmar'}
                    </span>
                  </div>
                </div>
              ))}
              {pagosTrabajador.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Aún no has recibido ningún pago registrado.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Balance History Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h3 className="font-bold text-xs text-slate-400 tracking-wider uppercase font-sans">Desglose de mi Cuenta</h3>
          
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-xs text-slate-600 border-b border-slate-100 pb-2">
              <span>Monto Inicial Acumulado:</span>
              <span className="font-semibold text-slate-800">${balance.saldoInicial}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600 border-b border-slate-100 pb-2">
              <span>Trabajos Realizados (Sistemas):</span>
              <span className="font-semibold text-slate-800">${balance.totalGeneradoServicios}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600 border-b border-slate-100 pb-2">
              <span>Trabajos Extras / Ajustes:</span>
              <span className="font-semibold text-slate-800 text-emerald-600">+${balance.totalAjustesPositivos}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600 border-b border-slate-100 pb-2">
              <span>Descuentos Aplicados:</span>
              <span className="font-semibold text-red-600">-${balance.totalAjustesNegativos}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-600 border-b border-slate-100 pb-2">
              <span>Total Pagos Cobrados:</span>
              <span className="font-semibold text-emerald-600">-${balance.totalPagado}</span>
            </div>

            <div className="flex justify-between items-center text-sm font-extrabold text-slate-800 pt-3 border-t border-dashed border-slate-200">
              <span>Deuda Pendiente Neta:</span>
              <span className="text-red-600 text-base">${balance.saldoPendiente}</span>
            </div>
          </div>

          {/* Adjustments history */}
          {ajustesTrabajador.length > 0 && (
            <div className="mt-4 space-y-2.5 pt-4 border-t border-slate-100">
              <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ajustes & Extras Recientes</h4>
              <div className="space-y-2">
                {ajustesTrabajador.map(a => (
                  <div key={a.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100/80 text-[11px] flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-slate-700 block">{a.tipo.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-400 block">{a.notas}</span>
                    </div>
                    <span className={`font-bold ${a.monto > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {a.monto > 0 ? `+$${a.monto}` : `-$${Math.abs(a.monto)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showPagoRecibidoModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Marcar Pago Recibido</h3>
              <button onClick={() => setShowPagoRecibidoModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>
            <form onSubmit={handlePagoRecibidoSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">¿Cuánto Dinero Recibió? ($) *</label>
                <input
                  type="number"
                  required
                  value={recibidoMonto}
                  onChange={(e) => setRecibidoMonto(Number(e.target.value))}
                  placeholder="Ej: 350"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Método de Recibo *</label>
                <select
                  value={recibidoMetodo}
                  onChange={(e) => setRecibidoMetodo(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 bg-white text-sm"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="ZELLE">Zelle</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Notas / Comentarios (Opcional)</label>
                <textarea
                  value={recibidoNotas}
                  onChange={(e) => setRecibidoNotas(e.target.value)}
                  placeholder="Ej: Entregado en efectivo en las oficinas de Magic Clean"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-emerald-500 text-sm h-20"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowPagoRecibidoModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Guardar y Reportar al Jefe
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showDiferenciaModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Reportar Diferencia</h3>
              <button onClick={() => setShowDiferenciaModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>
            <form onSubmit={handleDiferenciaSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Motivo / Novedad *</label>
                <textarea
                  required
                  value={diferenciaMotivo}
                  onChange={(e) => setDiferenciaMotivo(e.target.value)}
                  placeholder="Ej: Hola jefe, considero que el monto de la quincena de Iglesia San Patricio no corresponde. Falta sumar el día extra de limpieza de alfombras."
                  className="w-full border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-emerald-500 text-sm h-28"
                />
              </div>

              <p className="text-[10px] text-slate-400 bg-slate-50 p-2 rounded-lg leading-relaxed">
                El reporte enviará una alerta y creará una nota en el panel de control del Jefe para revisar las cuentas y llegar a un acuerdo transparente.
              </p>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDiferenciaModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Enviar Reporte
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
