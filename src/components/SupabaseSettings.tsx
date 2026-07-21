import React, { useState, useEffect } from 'react';
import { getSupabaseCredentials, saveSupabaseCredentials, resetSupabaseClient, getSupabaseClient } from '../lib/supabase';
import { fetchAllFromSupabase, uploadAllToSupabase, clearAllFromSupabase } from '../lib/supabaseSync';
import { Database, Link2, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle, Play, Trash2, X, Info } from 'lucide-react';
import { Empresa, Usuario, Servicio, EventoServicio, Pago, Ajuste, DatosMigracion } from '../types';

interface SupabaseSettingsProps {
  onClose: () => void;
  onRefreshAppState: () => Promise<void>;
  localState: {
    empresas: Empresa[];
    usuarios: Usuario[];
    servicios: Servicio[];
    historialServicios: EventoServicio[];
    pagos: Pago[];
    ajustes: Ajuste[];
    datosMigracion: DatosMigracion[];
  };
  darkMode: boolean;
}

export default function SupabaseSettings({ onClose, onRefreshAppState, localState, darkMode }: SupabaseSettingsProps) {
  const [credentials, setCredentials] = useState(getSupabaseCredentials());
  const [urlInput, setUrlInput] = useState(credentials.url);
  const [keyInput, setKeyInput] = useState(credentials.key);
  
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');

  const [showConfirmPurge, setShowConfirmPurge] = useState(false);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(urlInput, keyInput);
    resetSupabaseClient();
    
    const creds = getSupabaseCredentials();
    setCredentials(creds);
    
    setTestStatus('idle');
    setTestMessage('');
    setSyncStatus('idle');
    setSyncMessage('');
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Verificando conexión con Supabase...');
    
    const client = getSupabaseClient();
    if (!client) {
      setTestStatus('error');
      setTestMessage('El cliente de Supabase no se pudo inicializar. Asegúrate de guardar los datos primero.');
      return;
    }

    try {
      // Test by reading companies table
      const { data, error } = await client.from('empresas').select('count', { count: 'exact', head: true });
      
      if (error) {
        throw error;
      }
      
      setTestStatus('success');
      setTestMessage('¡Conexión exitosa! El cliente se ha conectado a la base de datos de manera correcta.');
    } catch (err: any) {
      console.error(err);
      setTestStatus('error');
      setTestMessage(`Error de conexión: ${err.message || 'Error desconocido'}. Asegúrate de habilitar acceso público o crear las tablas correspondientes.`);
    }
  };

  const handleSeedDatabase = async () => {
    if (!window.confirm('¿Deseas poblar la base de datos de Supabase con los datos de demostración? Esto borrará el contenido actual en Supabase.')) {
      return;
    }

    setSyncStatus('syncing');
    setSyncMessage('Subiendo datos iniciales a Supabase... Esto puede tardar unos segundos.');
    
    try {
      const success = await uploadAllToSupabase(localState);
      if (success) {
        setSyncStatus('success');
        setSyncMessage('¡Éxito! Los datos de simulación iniciales se subieron correctamente a Supabase.');
        await onRefreshAppState();
      } else {
        throw new Error('No se pudo inicializar la carga.');
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setSyncMessage(`Error al subir datos: ${err.message || 'Error de permisos o restricciones de llave foránea.'}`);
    }
  };

  const handlePurgeDatabase = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Eliminando datos de Supabase...');
    
    try {
      const success = await clearAllFromSupabase();
      if (success) {
        setSyncStatus('success');
        setSyncMessage('¡Limpieza completada! Toda la información ha sido eliminada de Supabase de manera exitosa.');
        setShowConfirmPurge(false);
        await onRefreshAppState();
      } else {
        throw new Error('No se pudo completar la limpieza.');
      }
    } catch (err: any) {
      console.error(err);
      setSyncStatus('error');
      setSyncMessage(`Error de limpieza: ${err.message || 'Asegúrate de que tus tablas admitan eliminaciones y que tengas permisos.'}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-xl flex flex-col max-h-[90vh] overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-600">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold font-sans">Conexión a Base de Datos (Supabase)</h3>
              <p className="text-xs text-slate-400">Pasa de modo simulación local a producción real</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* SQL Instructions */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 space-y-2">
            <div className="flex items-center gap-2 font-bold mb-1 text-amber-700 dark:text-amber-300">
              <AlertTriangle size={15} />
              <span>¡Acción Requerida antes de conectar!</span>
            </div>
            <p className="leading-relaxed">
              Como agregaste inicio de sesión con <strong>usuario y contraseña</strong> sin correos, debes agregar los campos correspondientes a la tabla <code>usuarios</code> de tu base de datos Supabase ejecutando este código en el <strong>SQL Editor</strong> de Supabase:
            </p>
            <pre className="p-2.5 rounded-lg bg-slate-950 text-[10px] text-emerald-400 font-mono overflow-x-auto select-all">
{`alter table usuarios add column username text unique;
alter table usuarios add column password text;
alter table usuarios add column pregunta_seguridad text;
alter table usuarios add column respuesta_seguridad text;`}
            </pre>
            <p className="leading-relaxed">
              Esto creará las columnas necesarias para que el sistema de autenticación de usuario y clave que implementamos funcione correctamente en Supabase.
            </p>
          </div>

          {/* Connection form */}
          <form onSubmit={handleSaveCredentials} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  SUPABASE PROJECT URL
                </label>
                <input 
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  SUPABASE ANON API KEY
                </label>
                <input 
                  type="password"
                  required
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className={`w-full px-3 py-2 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${credentials.isConfigured ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {credentials.isConfigured 
                  ? `Estado: Configurado ${credentials.isFromEnv ? '(desde Variables de Entorno)' : '(desde LocalStorage)'}` 
                  : 'Estado: No conectado'}
              </span>

              <div className="flex gap-2">
                {credentials.isConfigured && (
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      darkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {testStatus === 'testing' ? <RefreshCw size={13} className="animate-spin" /> : <Link2 size={13} />}
                    Probar Conexión
                  </button>
                )}
                
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  Guardar Datos
                </button>
              </div>
            </div>
          </form>

          {/* Test Status Messages */}
          {testStatus !== 'idle' && (
            <div className={`p-4 rounded-xl text-xs flex gap-2 font-medium border ${
              testStatus === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : testStatus === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                  : 'bg-slate-500/10 border-slate-500/20 text-slate-500 dark:text-slate-400 animate-pulse'
            }`}>
              {testStatus === 'success' && <CheckCircle size={15} className="shrink-0" />}
              {testStatus === 'error' && <ShieldAlert size={15} className="shrink-0" />}
              {testStatus === 'testing' && <RefreshCw size={15} className="shrink-0 animate-spin" />}
              <div>{testMessage}</div>
            </div>
          )}

          {/* Production Database Seeding & Cleansing Controls */}
          {credentials.isConfigured && (
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-4`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-amber-500" />
                Acciones de Administración de Base de Datos
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Seed block */}
                <div className="space-y-2">
                  <span className="text-xs font-bold block">Poblar base de datos inicial</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sube toda la información de simulación inicial (usuarios demo, empresas, servicios y pagos de muestra) a tus tablas en Supabase.
                  </p>
                  <button
                    onClick={handleSeedDatabase}
                    disabled={syncStatus === 'syncing'}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
                  >
                    <Play size={13} />
                    Poblar Datos Iniciales
                  </button>
                </div>

                {/* Purge block */}
                <div className="space-y-2">
                  <span className="text-xs font-bold block text-red-500">Limpieza completa de datos</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Elimina de forma irreversible toda la información de las tablas en tu base de datos Supabase para comenzar con un sistema limpio.
                  </p>
                  {showConfirmPurge ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-red-500 font-bold bg-red-500/10 p-2 rounded-lg leading-relaxed">
                        ⚠️ ¿Estás absolutamente seguro? Esta acción borrará todas tus tablas de Supabase para siempre.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowConfirmPurge(false)}
                          className="w-1/2 bg-slate-500 hover:bg-slate-400 text-white py-1.5 px-2 rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handlePurgeDatabase}
                          className="w-1/2 bg-red-600 hover:bg-red-500 text-white py-1.5 px-2 rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          Sí, Borrar Todo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowConfirmPurge(true)}
                      disabled={syncStatus === 'syncing'}
                      className="w-full bg-red-600/10 hover:bg-red-600 hover:text-white text-red-600 py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-red-500/10 transition disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      Eliminar Toda la Información
                    </button>
                  )}
                </div>
              </div>

              {/* Sync Status Messages */}
              {syncStatus !== 'idle' && (
                <div className={`p-3.5 rounded-xl text-xs flex gap-2 font-semibold border ${
                  syncStatus === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : syncStatus === 'error'
                      ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                      : 'bg-slate-500/10 border-slate-500/20 text-slate-500 dark:text-slate-400 animate-pulse'
                }`}>
                  {syncStatus === 'success' && <CheckCircle size={15} className="shrink-0" />}
                  {syncStatus === 'error' && <ShieldAlert size={15} className="shrink-0" />}
                  {syncStatus === 'syncing' && <RefreshCw size={15} className="shrink-0 animate-spin" />}
                  <div>{syncMessage}</div>
                </div>
              )}
            </div>
          )}

          {/* Cloudflare Pages info */}
          <div className={`p-4 rounded-xl border flex gap-3 text-xs ${
            darkMode ? 'bg-slate-950/20 border-slate-800 text-slate-400' : 'bg-slate-100/50 border-slate-200 text-slate-500'
          }`}>
            <Info size={18} className="text-blue-500 shrink-0" />
            <div className="space-y-1.5 leading-relaxed">
              <span className="font-bold text-slate-800 dark:text-slate-200">¿Cómo agregar esto permanentemente a Cloudflare Pages?</span>
              <p>
                Para evitar tener que escribir tus datos de Supabase en cada navegador, puedes configurarlos en tu panel de administración de <strong>Cloudflare Pages</strong>:
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                <li>Ve a tu proyecto en el panel de Cloudflare.</li>
                <li>Entra a <strong>Settings (Ajustes)</strong> &gt; <strong>Environment Variables (Variables de entorno)</strong>.</li>
                <li>Agrega dos variables para todas las ramas y entornos:
                  <ul className="list-disc pl-4 mt-1 space-y-1 font-mono text-[10px] text-emerald-500">
                    <li>VITE_SUPABASE_URL</li>
                    <li>VITE_SUPABASE_ANON_KEY</li>
                  </ul>
                </li>
                <li>Haz clic en guardar y realiza una nueva compilación (re-deploy) de tu proyecto.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cerrar Panel
          </button>
        </div>
      </div>
    </div>
  );
}
