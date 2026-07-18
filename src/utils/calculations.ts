/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Servicio, Pago, Ajuste, PagoEsperado, DatosMigracion } from '../types';

/**
 * Genera de forma determinista todas las fechas de pago esperado para un servicio
 * desde su fecha de asignación hasta la fecha actual de consulta (o fecha límite).
 */
export function generarPagosEsperados(
  servicio: Servicio,
  fechaHasta: string // YYYY-MM-DD (usualmente hoy)
): PagoEsperado[] {
  const pagosEsperados: PagoEsperado[] = [];
  const start = new Date(servicio.fechaAsignacion + 'T00:00:00');
  const end = new Date(fechaHasta + 'T00:00:00');

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [];
  }

  // Si el servicio está finalizado, el límite es la fecha de finalización
  const fechaLimiteEfectiva = servicio.fechaFinalizacion && new Date(servicio.fechaFinalizacion + 'T00:00:00') < end
    ? new Date(servicio.fechaFinalizacion + 'T00:00:00')
    : end;

  let current = new Date(start);

  if (servicio.frecuencia === 'SEMANAL') {
    // Generar cada 7 días o alineado al viernes si los días de trabajo lo requieren.
    // Por simplicidad de la automatización limpia: cada 7 días a partir de la fecha de asignación.
    while (current <= fechaLimiteEfectiva) {
      // No agregar el mismo día de la asignación a menos que haya pasado un tiempo
      const diffTime = Math.abs(current.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        pagosEsperados.push({
          id: `${servicio.id}_${current.toISOString().split('T')[0]}`,
          servicioId: servicio.id,
          trabajadorId: servicio.trabajadorId,
          fechaEsperada: current.toISOString().split('T')[0],
          monto: servicio.monto,
          estado: 'PENDIENTE'
        });
      }
      current.setDate(current.getDate() + 7);
    }
  } else if (servicio.frecuencia === 'QUINCENAL') {
    // Frecuencia estándar quincenal: cada 15 días o el 15 y último de mes.
    // Por simplicidad robusta: cada 15 días a partir de la fecha de asignación.
    while (current <= fechaLimiteEfectiva) {
      const diffTime = Math.abs(current.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        pagosEsperados.push({
          id: `${servicio.id}_${current.toISOString().split('T')[0]}`,
          servicioId: servicio.id,
          trabajadorId: servicio.trabajadorId,
          fechaEsperada: current.toISOString().split('T')[0],
          monto: servicio.monto,
          estado: 'PENDIENTE'
        });
      }
      current.setDate(current.getDate() + 15);
    }
  } else if (servicio.frecuencia === 'MENSUAL') {
    // Cada mes en el mismo día
    while (current <= fechaLimiteEfectiva) {
      const diffTime = Math.abs(current.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        pagosEsperados.push({
          id: `${servicio.id}_${current.toISOString().split('T')[0]}`,
          servicioId: servicio.id,
          trabajadorId: servicio.trabajadorId,
          fechaEsperada: current.toISOString().split('T')[0],
          monto: servicio.monto,
          estado: 'PENDIENTE'
        });
      }
      current.setMonth(current.getMonth() + 1);
    }
  } else {
    // PERSONALIZADO o Dos fechas específicas (Ej: 7 y 25 de cada mes)
    // Generamos cada 15 días simulado como fallback
    while (current <= fechaLimiteEfectiva) {
      const diffTime = Math.abs(current.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        pagosEsperados.push({
          id: `${servicio.id}_${current.toISOString().split('T')[0]}`,
          servicioId: servicio.id,
          trabajadorId: servicio.trabajadorId,
          fechaEsperada: current.toISOString().split('T')[0],
          monto: servicio.monto,
          estado: 'PENDIENTE'
        });
      }
      current.setDate(current.getDate() + 14); // 2 semanas aprox
    }
  }

  // Modificar estados según si ya pasaron de la fecha actual
  const hoyStr = new Date().toISOString().split('T')[0];
  const hoy = new Date(hoyStr + 'T00:00:00');

  return pagosEsperados.map(p => {
    const pFecha = new Date(p.fechaEsperada + 'T00:00:00');
    if (pFecha < hoy) {
      return { ...p, estado: 'VENCIDO' };
    }
    return p;
  });
}

export interface BalanceTrabajador {
  trabajadorId: string;
  saldoInicial: number;
  totalGeneradoServicios: number;
  totalAjustesPositivos: number; // Bonos, extras, etc.
  totalAjustesNegativos: number; // Descuentos, suspensiones
  totalPagado: number; // Pagos confirmados
  totalRegistradoPendienteConfirmacion: number; // Pagos registrados por trabajador pendientes de confirmación
  saldoPendiente: number; // Saldo anterior + servicios + extras - pagos - descuentos
  proximoPagoMonto: number;
  proximoPagoFecha: string;
}

/**
 * Calcula el balance total e histórico para un trabajador específico.
 */
export function calcularBalanceTrabajador(
  trabajadorId: string,
  servicios: Servicio[],
  pagos: Pago[],
  ajustes: Ajuste[],
  migracion?: DatosMigracion,
  fechaHasta: string = new Date().toISOString().split('T')[0]
): BalanceTrabajador {
  // 1. Saldo inicial por migración
  const saldoInicial = migracion ? migracion.saldoPendienteInicial : 0;

  // 2. Total generado por servicios automáticamente
  let totalGeneradoServicios = 0;
  const todosLosPagosEsperados: PagoEsperado[] = [];

  const serviciosDelTrabajador = servicios.filter(s => s.trabajadorId === trabajadorId);
  
  serviciosDelTrabajador.forEach(s => {
    const pagosEsperados = generarPagosEsperados(s, fechaHasta);
    todosLosPagosEsperados.push(...pagosEsperados);
    totalGeneradoServicios += pagosEsperados.reduce((sum, p) => sum + p.monto, 0);
  });

  // 3. Ajustes
  let totalAjustesPositivos = 0; // Trabajo extra, limpieza profunda, bonificación
  let totalAjustesNegativos = 0; // Descuento, semana no trabajada, etc. (se guardan con montos negativos)

  const ajustesDelTrabajador = ajustes.filter(a => a.trabajadorId === trabajadorId);
  ajustesDelTrabajador.forEach(a => {
    if (a.monto > 0) {
      totalAjustesPositivos += a.monto;
    } else {
      totalAjustesNegativos += Math.abs(a.monto);
    }
  });

  // 4. Pagos realizados
  const pagosDelTrabajador = pagos.filter(p => p.trabajadorId === trabajadorId);
  
  // Total pagado (confirmados o registrados por jefe)
  const totalPagado = pagosDelTrabajador
    .filter(p => p.estadoConfirmacion === 'CONFIRMADO')
    .reduce((sum, p) => sum + p.monto, 0);

  // Pagos registrados por trabajador pendientes de confirmación por el jefe
  const totalRegistradoPendienteConfirmacion = pagosDelTrabajador
    .filter(p => p.estadoConfirmacion === 'PENDIENTE_JEFE')
    .reduce((sum, p) => sum + p.monto, 0);

  // 5. Saldo Pendiente
  // Saldo Pendiente = Saldo Inicial + Servicios Generados + Ajustes Positivos - Ajustes Negativos - Pagos Confirmados
  // Nota: Si un trabajador registra un pago pero no está confirmado, la deuda se reduce para él o permanece igual?
  // Normalmente la deuda oficial considera los pagos confirmados.
  const saldoPendiente = saldoInicial + totalGeneradoServicios + totalAjustesPositivos - totalAjustesNegativos - totalPagado;

  // 6. Próximo pago esperado
  let proximoPagoMonto = 0;
  let proximoPagoFecha = 'N/A';

  const hoyStr = new Date().toISOString().split('T')[0];
  const futurosPagosEsperados = todosLosPagosEsperados
    .filter(p => p.fechaEsperada >= hoyStr)
    .sort((a, b) => a.fechaEsperada.localeCompare(b.fechaEsperada));

  if (futurosPagosEsperados.length > 0) {
    proximoPagoMonto = futurosPagosEsperados[0].monto;
    proximoPagoFecha = futurosPagosEsperados[0].fechaEsperada;
  } else if (serviciosDelTrabajador.length > 0) {
    // Fallback: si no hay pagos esperados futuros pregenerados, dar un estimado del monto de sus servicios activos
    proximoPagoMonto = serviciosDelTrabajador
      .filter(s => s.estado === 'ACTIVO')
      .reduce((sum, s) => sum + s.monto, 0);
    proximoPagoFecha = 'Próximo periodo';
  }

  return {
    trabajadorId,
    saldoInicial,
    totalGeneradoServicios,
    totalAjustesPositivos,
    totalAjustesNegativos,
    totalPagado,
    totalRegistradoPendienteConfirmacion,
    saldoPendiente,
    proximoPagoMonto,
    proximoPagoFecha
  };
}
