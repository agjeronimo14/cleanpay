/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'SUPER_ADMIN' | 'JEFE' | 'TRABAJADOR';

export interface Usuario {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  empresaId?: string; // Los Super Admin no tienen empresaId
  telefono?: string;
  avatarUrl?: string;
  estado: 'ACTIVO' | 'SUSPENDIDO';
  username?: string;
  password?: string;
  preguntaSeguridad?: string;
  respuestaSeguridad?: string;
}

export interface Empresa {
  id: string;
  name: string;
  logoUrl?: string;
  direccion?: string;
  telefono?: string;
  correo: string;
  responsableId: string; // ID del Jefe principal
  estado: 'ACTIVO' | 'SUSPENDIDO';
}

export type FrecuenciaPago = 'SEMANAL' | 'QUINCENAL' | 'MENSUAL' | 'PERSONALIZADO';

export type EstadoServicio = 'ACTIVO' | 'PAUSADO' | 'PENDIENTE_CAMBIO' | 'FINALIZADO';

export interface Servicio {
  id: string;
  name: string;
  direccion: string;
  cliente: string; // Nombre de la empresa o persona cliente
  frecuencia: FrecuenciaPago;
  diasTrabajo: string[]; // Ej: ['Lunes', 'Miércoles', 'Viernes'] o ['7', '25']
  monto: number; // Monto generado por cada periodo de pago
  fechaAsignacion: string; // ISO Date YYYY-MM-DD
  fechaFinalizacion?: string; // Opcional
  trabajadorId: string;
  empresaId: string;
  estado: EstadoServicio;
}

export type TipoEventoServicio = 
  | 'ASIGNACION'
  | 'CAMBIO_TRABAJADOR'
  | 'CAMBIO_PAGO'
  | 'CAMBIO_FRECUENCIA'
  | 'QUEJA'
  | 'FECHA_TENTATIVA_SALIDA'
  | 'CONTINUA_ACTIVO'
  | 'FINALIZACION';

export interface EventoServicio {
  id: string;
  servicioId: string;
  tipo: TipoEventoServicio;
  fecha: string; // ISO Date
  descripcion: string;
  registradoPor: string; // ID de usuario
}

export type TipoPago = 'COMPLETO' | 'PARCIAL' | 'ADELANTO' | 'EXTRAORDINARIO';

export type EstadoPagoConfirmacion = 'PENDIENTE_JEFE' | 'CONFIRMADO';

export interface Pago {
  id: string;
  servicioId?: string; // Opcional si es un pago general al trabajador
  trabajadorId: string;
  empresaId: string;
  monto: number;
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM
  metodo: 'EFECTIVO' | 'TRANSFERENCIA' | 'ZELLE' | 'OTRO';
  tipo: TipoPago;
  notas?: string;
  registradoPor: string; // ID de usuario
  estadoConfirmacion: EstadoPagoConfirmacion;
  comprobanteUrl?: string;
}

export type TipoAjuste = 
  | 'TRABAJO_EXTRA'
  | 'LIMPIEZA_PROFUNDA'
  | 'BONIFICACION'
  | 'DESCUENTO'
  | 'SEMANA_NO_TRABAJADA'
  | 'SUSPENSION_TEMPORAL';

export interface Ajuste {
  id: string;
  trabajadorId: string;
  empresaId: string;
  servicioId?: string;
  tipo: TipoAjuste;
  monto: number; // Puede ser positivo (bono, extra) o negativo (descuento)
  fecha: string; // YYYY-MM-DD
  notas: string;
  registradoPor: string;
}

// Representa las fechas donde se devengó un pago del servicio (Generación Automática)
export interface PagoEsperado {
  id: string; // servicioId + '_' + fechaVencimiento
  servicioId: string;
  trabajadorId: string;
  fechaEsperada: string; // YYYY-MM-DD
  monto: number;
  estado: 'PENDIENTE' | 'VENCIDO' | 'PAGADO';
}

// Datos de migración inicial para trabajadores nuevos
export interface DatosMigracion {
  trabajadorId: string;
  saldoPendienteInicial: number;
  fechaCorteInicial: string; // Fecha desde la cual empieza el sistema
  notas?: string;
}
