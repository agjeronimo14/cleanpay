import { getSupabaseClient } from './supabase';
import { Usuario, Empresa, Servicio, EventoServicio, Pago, Ajuste, DatosMigracion } from '../types';

// ==========================================
// MAPPERS: CamelCase <-> SnakeCase
// ==========================================

export const mapEmpresaFromDB = (row: any): Empresa => ({
  id: row.id,
  name: row.name,
  logoUrl: row.logo_url,
  direccion: row.direccion,
  telefono: row.telefono,
  correo: row.correo,
  responsableId: row.responsable_id || '',
  estado: row.estado
});

// Mapeo estático y generador determinista para convertir IDs demo en UUIDs válidos para Supabase
const idMap: Record<string, string> = {
  'u_superadmin': '9620ba01-79e5-4ca2-8db4-91c8ba360a01',
  'u_jefe1': '3bf1e012-ae31-4be3-b99b-3fa7df702b81',
  'u_trabajador1': 'a627a195-bfde-4b95-ae04-c3e06180df11',
  'u_trabajador2': 'dbf719b0-9f5b-4357-96a1-08103565e231',
  'u_trabajador3': 'fc74be0f-2b28-4447-8178-95666ca0bf01',
  'e_cleaning_pro': '1e741cde-75bf-400c-b26a-912f205c0651',
  's_oficina_a': '0fbfbe01-1bfa-4be1-8bbf-f9cb7ea12701',
  's_iglesia': '5a8cfb02-7cfa-4ae3-b7cf-3fbca7ea4902',
  's_condominio': '7f7fbe03-2bfa-4be3-bcbe-bfcb7ea29703',
  's_oficina_b': '9cbfe044-4bfa-4be4-bcbe-bfcb7ea29704',
  'p1': 'e8cfb123-1111-4444-8888-000000000001',
  'p2': 'e8cfb123-2222-4444-8888-000000000002',
  'p3': 'e8cfb123-3333-4444-8888-000000000003',
  'p4': 'e8cfb123-4444-4444-8888-000000000004',
  'p_juan_1': 'e8cfb123-5555-4444-8888-000000000005',
  'aj1': 'a0cfb321-1111-4444-9999-000000000001',
  'aj2': 'a0cfb321-2222-4444-9999-000000000002',
};

export function safeUUID(id: string | null | undefined): string {
  if (!id) {
    return '00000000-0000-0000-0000-000000000000';
  }
  
  // Validar si ya es un formato UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  
  // Buscar en diccionario estático
  if (idMap[id]) {
    return idMap[id];
  }
  
  // Generar un hash determinista para cualquier otra cadena
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  
  const absHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `${absHash}-4000-8000-0000-${absHash.repeat(2)}`;
}

export const mapEmpresaToDB = (item: Empresa) => ({
  id: safeUUID(item.id),
  name: item.name,
  logo_url: item.logoUrl || null,
  direccion: item.direccion || null,
  telefono: item.telefono || null,
  correo: item.correo,
  responsable_id: item.responsableId ? safeUUID(item.responsableId) : null,
  estado: item.estado
});

export const mapUsuarioFromDB = (row: any): Usuario => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  empresaId: row.empresa_id || undefined,
  telefono: row.telefono || undefined,
  avatarUrl: row.avatar_url || undefined,
  estado: row.estado,
  username: row.username || undefined,
  password: row.password || undefined,
  preguntaSeguridad: row.pregunta_seguridad || undefined,
  respuestaSeguridad: row.respuesta_seguridad || undefined
});

export const mapUsuarioToDB = (item: Usuario) => ({
  id: safeUUID(item.id),
  name: item.name,
  email: item.email,
  role: item.role,
  empresa_id: item.empresaId ? safeUUID(item.empresaId) : null,
  telefono: item.telefono || null,
  avatar_url: item.avatarUrl || null,
  estado: item.estado,
  username: item.username || null,
  password: item.password || null,
  pregunta_seguridad: item.preguntaSeguridad || null,
  respuesta_seguridad: item.respuestaSeguridad || null
});

export const mapServicioFromDB = (row: any): Servicio => ({
  id: row.id,
  name: row.name,
  cliente: row.cliente,
  direccion: row.direccion,
  frecuencia: row.frecuencia,
  diasTrabajo: row.dias_trabajo || [],
  monto: Number(row.monto),
  fechaAsignacion: row.fecha_asignacion,
  fechaFinalizacion: row.fecha_finalizacion || undefined,
  trabajadorId: row.trabajador_id,
  empresaId: row.empresa_id,
  estado: row.estado
});

export const mapServicioToDB = (item: Servicio) => ({
  id: safeUUID(item.id),
  name: item.name,
  cliente: item.cliente,
  direccion: item.direccion,
  frecuencia: item.frecuencia,
  dias_trabajo: item.diasTrabajo,
  monto: item.monto,
  fecha_asignacion: item.fechaAsignacion,
  fecha_finalizacion: item.fechaFinalizacion || null,
  trabajador_id: safeUUID(item.trabajadorId),
  empresa_id: safeUUID(item.empresaId),
  estado: item.estado
});

export const mapEventoFromDB = (row: any): EventoServicio => ({
  id: row.id,
  servicioId: row.servicio_id,
  tipo: row.tipo,
  fecha: row.fecha,
  descripcion: row.descripcion,
  registradoPor: row.registrado_por
});

export const mapEventoToDB = (item: EventoServicio) => ({
  id: safeUUID(item.id),
  servicio_id: safeUUID(item.servicioId),
  tipo: item.tipo,
  fecha: item.fecha,
  descripcion: item.descripcion,
  registrado_por: safeUUID(item.registradoPor)
});

export const mapPagoFromDB = (row: any): Pago => ({
  id: row.id,
  servicioId: row.servicio_id || undefined,
  trabajadorId: row.trabajador_id,
  empresaId: row.empresa_id,
  monto: Number(row.monto),
  fecha: row.fecha,
  hora: row.hora || '00:00',
  metodo: row.metodo,
  tipo: row.tipo,
  notas: row.notas || undefined,
  registradoPor: row.registrado_por,
  estadoConfirmacion: row.estado_confirmacion,
  comprobanteUrl: row.comprobante_url || undefined
});

export const mapPagoToDB = (item: Pago) => ({
  id: safeUUID(item.id),
  servicio_id: item.servicioId ? safeUUID(item.servicioId) : null,
  trabajador_id: safeUUID(item.trabajadorId),
  empresa_id: safeUUID(item.empresaId),
  monto: item.monto,
  fecha: item.fecha,
  hora: item.hora,
  metodo: item.metodo,
  tipo: item.tipo,
  notas: item.notas || null,
  registrado_por: safeUUID(item.registradoPor),
  estado_confirmacion: item.estadoConfirmacion,
  comprobante_url: item.comprobanteUrl || null
});

export const mapAjusteFromDB = (row: any): Ajuste => ({
  id: row.id,
  trabajadorId: row.trabajador_id,
  empresaId: row.empresa_id,
  servicioId: row.servicio_id || undefined,
  tipo: row.tipo,
  monto: Number(row.monto),
  fecha: row.fecha,
  notas: row.notas,
  registradoPor: row.registrado_por
});

export const mapAjusteToDB = (item: Ajuste) => ({
  id: safeUUID(item.id),
  trabajador_id: safeUUID(item.trabajadorId),
  empresa_id: safeUUID(item.empresaId),
  servicio_id: item.servicioId ? safeUUID(item.servicioId) : null,
  tipo: item.tipo,
  monto: item.monto,
  fecha: item.fecha,
  notas: item.notas,
  registrado_por: safeUUID(item.registradoPor)
});

export const mapDatosMigracionFromDB = (row: any): DatosMigracion => ({
  trabajadorId: row.trabajador_id,
  saldoPendienteInicial: Number(row.saldo_pendiente_inicial),
  fechaCorteInicial: row.fecha_corte_inicial,
  notas: row.notas || undefined
});

export const mapDatosMigracionToDB = (item: DatosMigracion) => ({
  trabajador_id: safeUUID(item.trabajadorId),
  saldo_pendiente_inicial: item.saldoPendienteInicial,
  fecha_corte_inicial: item.fechaCorteInicial,
  notas: item.notas || null
});


// ==========================================
// CORE DATABASE SYNC METHODS
// ==========================================

export async function fetchAllFromSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    // Fetch all tables in parallel
    const [
      { data: emps, error: errEmps },
      { data: usrs, error: errUsrs },
      { data: servs, error: errServs },
      { data: evts, error: errEvts },
      { data: pgs, error: errPgs },
      { data: ajsts, error: errAjsts },
      { data: mgrs, error: errMgrs }
    ] = await Promise.all([
      supabase.from('empresas').select('*'),
      supabase.from('usuarios').select('*'),
      supabase.from('servicios').select('*'),
      supabase.from('historial_servicios').select('*'),
      supabase.from('pagos').select('*'),
      supabase.from('ajustes').select('*'),
      supabase.from('datos_migracion').select('*')
    ]);

    if (errEmps || errUsrs || errServs || errEvts || errPgs || errAjsts || errMgrs) {
      console.error('Error fetching data from Supabase:', { errEmps, errUsrs, errServs, errEvts, errPgs, errAjsts, errMgrs });
      throw new Error('No se pudo cargar la base de datos completa de Supabase. Revisa las políticas RLS y las columnas.');
    }

    return {
      empresas: (emps || []).map(mapEmpresaFromDB),
      usuarios: (usrs || []).map(mapUsuarioFromDB),
      servicios: (servs || []).map(mapServicioFromDB),
      historialServicios: (evts || []).map(mapEventoFromDB),
      pagos: (pgs || []).map(mapPagoFromDB),
      ajustes: (ajsts || []).map(mapAjusteFromDB),
      datosMigracion: (mgrs || []).map(mapDatosMigracionFromDB)
    };
  } catch (error) {
    console.error('Error in fetchAllFromSupabase:', error);
    throw error;
  }
}

export async function uploadAllToSupabase(data: {
  empresas: Empresa[];
  usuarios: Usuario[];
  servicios: Servicio[];
  historialServicios: EventoServicio[];
  pagos: Pago[];
  ajustes: Ajuste[];
  datosMigracion: DatosMigracion[];
}) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    // 1. Clear existing data in correct dependency order
    await clearAllFromSupabase();

    // 2. Upload with safe batch insertions
    if (data.empresas.length > 0) {
      const { error } = await supabase.from('empresas').insert(data.empresas.map(mapEmpresaToDB));
      if (error) throw error;
    }

    if (data.usuarios.length > 0) {
      const { error } = await supabase.from('usuarios').insert(data.usuarios.map(mapUsuarioToDB));
      if (error) throw error;
    }

    // Circular dependency: Update the principal manager for empresas if defined
    for (const emp of data.empresas) {
      if (emp.responsableId) {
        await supabase.from('empresas').update({ responsable_id: emp.responsableId }).eq('id', emp.id);
      }
    }

    if (data.servicios.length > 0) {
      const { error } = await supabase.from('servicios').insert(data.servicios.map(mapServicioToDB));
      if (error) throw error;
    }

    if (data.historialServicios.length > 0) {
      const { error } = await supabase.from('historial_servicios').insert(data.historialServicios.map(mapEventoToDB));
      if (error) throw error;
    }

    if (data.pagos.length > 0) {
      const { error } = await supabase.from('pagos').insert(data.pagos.map(mapPagoToDB));
      if (error) throw error;
    }

    if (data.ajustes.length > 0) {
      const { error } = await supabase.from('ajustes').insert(data.ajustes.map(mapAjusteToDB));
      if (error) throw error;
    }

    if (data.datosMigracion.length > 0) {
      const { error } = await supabase.from('datos_migracion').insert(data.datosMigracion.map(mapDatosMigracionToDB));
      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error inserting data to Supabase:', error);
    throw error;
  }
}

export async function clearAllFromSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    // Delete in reverse dependency order to prevent foreign key constraint violations
    await supabase.from('datos_migracion').delete().neq('trabajador_id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('ajustes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('pagos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('historial_servicios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('servicios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Set company responsibility pointers to null first to avoid circular key issues
    await supabase.from('empresas').update({ responsable_id: null }).neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('usuarios').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('empresas').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    return true;
  } catch (error) {
    console.error('Error clearing data from Supabase:', error);
    throw error;
  }
}

// Single Item Sync Mutators
export async function syncSaveUsuario(user: Usuario) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('usuarios').upsert(mapUsuarioToDB(user));
  if (error) console.error('Error syncing usuario:', error);
}

export async function syncDeleteUsuario(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('usuarios').delete().eq('id', id);
  if (error) console.error('Error syncing delete usuario:', error);
}

export async function syncSaveEmpresa(emp: Empresa) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('empresas').upsert(mapEmpresaToDB(emp));
  if (error) console.error('Error syncing empresa:', error);
}

export async function syncSaveServicio(serv: Servicio) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('servicios').upsert(mapServicioToDB(serv));
  if (error) console.error('Error syncing servicio:', error);
}

export async function syncDeleteServicio(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('servicios').delete().eq('id', id);
  if (error) console.error('Error syncing delete servicio:', error);
}

export async function syncSaveEvento(evt: EventoServicio) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('historial_servicios').upsert(mapEventoToDB(evt));
  if (error) console.error('Error syncing evento:', error);
}

export async function syncSavePago(pago: Pago) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('pagos').upsert(mapPagoToDB(pago));
  if (error) console.error('Error syncing pago:', error);
}

export async function syncDeletePago(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('pagos').delete().eq('id', id);
  if (error) console.error('Error syncing delete pago:', error);
}

export async function syncSaveAjuste(ajuste: Ajuste) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('ajustes').upsert(mapAjusteToDB(ajuste));
  if (error) console.error('Error syncing ajuste:', error);
}

export async function syncDeleteAjuste(id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('ajustes').delete().eq('id', id);
  if (error) console.error('Error syncing delete ajuste:', error);
}

export async function syncSaveDatosMigracion(migracion: DatosMigracion) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const { error } = await supabase.from('datos_migracion').upsert(mapDatosMigracionToDB(migracion));
  if (error) console.error('Error syncing datos migracion:', error);
}
