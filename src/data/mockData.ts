/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Usuario, Empresa, Servicio, Pago, Ajuste, DatosMigracion } from '../types';

export const mockUsuarios: Usuario[] = [
  {
    id: 'u_superadmin',
    name: 'Carlos Mendoza (Super Admin)',
    email: 'admin@cleanpay.com',
    role: 'SUPER_ADMIN',
    estado: 'ACTIVO',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    username: 'admin',
    password: 'admin123',
    preguntaSeguridad: '¿Cuál es el nombre de tu primera mascota?',
    respuestaSeguridad: 'firulais'
  },
  {
    id: 'u_jefe1',
    name: 'Alejandro González',
    email: 'alejandro@cleaningservices.com',
    role: 'JEFE',
    empresaId: 'e_cleaning_pro',
    telefono: '+1 (555) 019-2834',
    estado: 'ACTIVO',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    username: 'alejandro',
    password: 'jefe123',
    preguntaSeguridad: '¿Cuál es tu color favorito?',
    respuestaSeguridad: 'azul'
  },
  {
    id: 'u_trabajador1',
    name: 'María Rodríguez',
    email: 'maria.cleaning@gmail.com',
    role: 'TRABAJADOR',
    empresaId: 'e_cleaning_pro',
    telefono: '+1 (555) 014-3921',
    estado: 'ACTIVO',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    username: 'maria',
    password: 'maria123',
    preguntaSeguridad: '¿En qué ciudad naciste?',
    respuestaSeguridad: 'miami'
  },
  {
    id: 'u_trabajador2',
    name: 'Juan Pérez',
    email: 'juan.perez@gmail.com',
    role: 'TRABAJADOR',
    empresaId: 'e_cleaning_pro',
    telefono: '+1 (555) 012-9481',
    estado: 'ACTIVO',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    username: 'juan',
    password: 'juan123',
    preguntaSeguridad: '¿Cuál es el nombre de tu primer auto?',
    respuestaSeguridad: 'toyota'
  },
  {
    id: 'u_trabajador3',
    name: 'Laura Sánchez',
    email: 'laura.s@gmail.com',
    role: 'TRABAJADOR',
    empresaId: 'e_cleaning_pro',
    telefono: '+1 (555) 011-2384',
    estado: 'ACTIVO',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    username: 'laura',
    password: 'laura123',
    preguntaSeguridad: '¿Cuál es tu comida favorita?',
    respuestaSeguridad: 'pizza'
  }
];

export const mockEmpresas: Empresa[] = [
  {
    id: 'e_cleaning_pro',
    name: 'Cleaning Pro Services LLC',
    correo: 'contacto@cleaningpro.com',
    telefono: '+1 (555) 234-5678',
    direccion: '123 Business Rd, Suite 100, Miami, FL 33101',
    responsableId: 'u_jefe1',
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=150&q=80',
    estado: 'ACTIVO'
  }
];

export const mockServicios: Servicio[] = [
  // Servicios de María Rodríguez (u_trabajador1)
  {
    id: 's_oficina_a',
    name: 'Oficinas Corporativas Tech',
    cliente: 'TechCorp Miami',
    direccion: '456 Innovation Blvd, Miami, FL 33130',
    frecuencia: 'SEMANAL',
    diasTrabajo: ['Lunes', 'Miércoles', 'Viernes'],
    monto: 250, // 250 por semana
    fechaAsignacion: '2026-05-01', // Asignado hace un par de meses para generar historial
    trabajadorId: 'u_trabajador1',
    empresaId: 'e_cleaning_pro',
    estado: 'ACTIVO'
  },
  {
    id: 's_iglesia',
    name: 'Iglesia San Patricio',
    cliente: 'Parroquia San Patricio',
    direccion: '789 Faith Way, Coral Gables, FL 33134',
    frecuencia: 'QUINCENAL',
    diasTrabajo: ['Sábado'],
    monto: 400, // 400 por quincena
    fechaAsignacion: '2026-05-15',
    trabajadorId: 'u_trabajador1',
    empresaId: 'e_cleaning_pro',
    estado: 'ACTIVO'
  },

  // Servicios de Juan Pérez (u_trabajador2)
  {
    id: 's_condominio',
    name: 'Condominio Bella Vista',
    cliente: 'Asoc. Bella Vista',
    direccion: '101 Ocean Dr, Miami Beach, FL 33139',
    frecuencia: 'QUINCENAL',
    diasTrabajo: ['Martes', 'Jueves'],
    monto: 500,
    fechaAsignacion: '2026-05-01',
    trabajadorId: 'u_trabajador2',
    empresaId: 'e_cleaning_pro',
    estado: 'ACTIVO'
  },
  {
    id: 's_oficina_b',
    name: 'Clínica Dental DentalCare',
    cliente: 'Dr. Alejandro Peña',
    direccion: '202 Medical Dr, Suite 5, Miami, FL 33145',
    frecuencia: 'MENSUAL',
    diasTrabajo: ['Último Sábado'],
    monto: 600,
    fechaAsignacion: '2026-06-01',
    trabajadorId: 'u_trabajador2',
    empresaId: 'e_cleaning_pro',
    estado: 'ACTIVO'
  }
];

export const mockDatosMigracion: DatosMigracion[] = [
  {
    trabajadorId: 'u_trabajador1',
    saldoPendienteInicial: 150, // Empezó con una deuda previa de $150
    fechaCorteInicial: '2026-05-01',
    notas: 'Saldo acumulado de abril por retraso del banco'
  }
];

export const mockPagos: Pago[] = [
  {
    id: 'p1',
    trabajadorId: 'u_trabajador1',
    empresaId: 'e_cleaning_pro',
    monto: 1000,
    fecha: '2026-05-30',
    hora: '14:30',
    metodo: 'TRANSFERENCIA',
    tipo: 'COMPLETO',
    notas: 'Pago acumulado de las primeras semanas de mayo',
    registradoPor: 'u_jefe1',
    estadoConfirmacion: 'CONFIRMADO'
  },
  {
    id: 'p2',
    trabajadorId: 'u_trabajador1',
    empresaId: 'e_cleaning_pro',
    monto: 500,
    fecha: '2026-06-15',
    hora: '10:00',
    metodo: 'ZELLE',
    tipo: 'PARCIAL',
    notas: 'Pago a cuenta quincenal',
    registradoPor: 'u_jefe1',
    estadoConfirmacion: 'CONFIRMADO'
  },
  {
    id: 'p3',
    trabajadorId: 'u_trabajador1',
    empresaId: 'e_cleaning_pro',
    monto: 250,
    fecha: '2026-07-05',
    hora: '18:15',
    metodo: 'EFECTIVO',
    tipo: 'ADELANTO',
    notas: 'Adelanto solicitado para medicina',
    registradoPor: 'u_jefe1',
    estadoConfirmacion: 'CONFIRMADO'
  },
  // Pago registrado por el trabajador pendiente de confirmación por el jefe
  {
    id: 'p4',
    trabajadorId: 'u_trabajador1',
    empresaId: 'e_cleaning_pro',
    monto: 350,
    fecha: '2026-07-16',
    hora: '09:45',
    metodo: 'EFECTIVO',
    tipo: 'COMPLETO',
    notas: 'El jefe me pagó en efectivo en la oficina',
    registradoPor: 'u_trabajador1',
    estadoConfirmacion: 'PENDIENTE_JEFE'
  },

  // Pagos de Juan Pérez
  {
    id: 'p_juan_1',
    trabajadorId: 'u_trabajador2',
    empresaId: 'e_cleaning_pro',
    monto: 1000,
    fecha: '2026-06-15',
    hora: '11:00',
    metodo: 'TRANSFERENCIA',
    tipo: 'COMPLETO',
    notas: 'Pagos de mayo',
    registradoPor: 'u_jefe1',
    estadoConfirmacion: 'CONFIRMADO'
  }
];

export const mockAjustes: Ajuste[] = [
  {
    id: 'aj1',
    trabajadorId: 'u_trabajador1',
    empresaId: 'e_cleaning_pro',
    servicioId: 's_oficina_a',
    tipo: 'TRABAJO_EXTRA',
    monto: 80,
    fecha: '2026-06-10',
    notas: 'Limpieza de ventanas exteriores extra de fin de semana',
    registradoPor: 'u_jefe1'
  },
  {
    id: 'aj2',
    trabajadorId: 'u_trabajador1',
    empresaId: 'e_cleaning_pro',
    servicioId: 's_iglesia',
    tipo: 'DESCUENTO',
    monto: -50,
    fecha: '2026-06-20',
    notas: 'Faltó a limpiar el área comunal, se cubrió con otro trabajador',
    registradoPor: 'u_jefe1'
  }
];
