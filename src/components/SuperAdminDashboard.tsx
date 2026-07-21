/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Usuario, Empresa } from '../types';
import { Plus, Users, Building, ShieldAlert, CheckCircle, Search, Trash2, Ban, RefreshCw, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface SuperAdminDashboardProps {
  usuarios: Usuario[];
  empresas: Empresa[];
  onAddEmpresa: (empresa: Omit<Empresa, 'id'>) => void;
  onAddUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  onToggleEstadoUsuario: (id: string) => void;
  onToggleEstadoEmpresa: (id: string) => void;
  onOpenSupabaseSettings?: () => void;
}

export default function SuperAdminDashboard({
  usuarios,
  empresas,
  onAddEmpresa,
  onAddUsuario,
  onToggleEstadoUsuario,
  onToggleEstadoEmpresa,
  onOpenSupabaseSettings
}: SuperAdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for new Empresa form
  const [showEmpresaModal, setShowEmpresaModal] = useState(false);
  const [newEmpresaName, setNewEmpresaName] = useState('');
  const [newEmpresaCorreo, setNewEmpresaCorreo] = useState('');
  const [newEmpresaTelefono, setNewEmpresaTelefono] = useState('');
  const [newEmpresaDireccion, setNewEmpresaDireccion] = useState('');

  // States for new Usuario form
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'JEFE' | 'TRABAJADOR'>('TRABAJADOR');
  const [newUserEmpresaId, setNewUserEmpresaId] = useState('');
  const [newUserTelefono, setNewUserTelefono] = useState('');

  // Filtered lists
  const filteredEmpresas = empresas.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsuarios = usuarios.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmpresaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpresaName || !newEmpresaCorreo) return;

    onAddEmpresa({
      name: newEmpresaName,
      correo: newEmpresaCorreo,
      telefono: newEmpresaTelefono,
      direccion: newEmpresaDireccion,
      responsableId: 'u_jefe1', // Asignado a Alejandro temporalmente
      estado: 'ACTIVO'
    });

    // Reset
    setNewEmpresaName('');
    setNewEmpresaCorreo('');
    setNewEmpresaTelefono('');
    setNewEmpresaDireccion('');
    setShowEmpresaModal(false);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    onAddUsuario({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      empresaId: newUserRole === 'JEFE' ? newUserEmpresaId || undefined : newUserEmpresaId || undefined,
      telefono: newUserTelefono,
      estado: 'ACTIVO'
    });

    // Reset
    setNewUserName('');
    setNewUserEmail('');
    setNewUserTelefono('');
    setNewUserEmpresaId('');
    setShowUserModal(false);
  };

  return (
    <div className="space-y-6" id="super_admin_panel">
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">Panel de Control Global</h1>
          <p className="text-sm text-slate-500">Super Administrador de CleanPay. Administre empresas y accesos del sistema.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEmpresaModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
            id="btn_nueva_empresa"
          >
            <Plus size={16} />
            Nueva Empresa
          </button>
          <button
            onClick={() => {
              if (empresas.length === 0) {
                alert('Debe crear al menos una empresa antes de registrar usuarios.');
                return;
              }
              setNewUserEmpresaId(empresas[0].id);
              setShowUserModal(true);
            }}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
            id="btn_nuevo_usuario"
          >
            <Plus size={16} />
            Nuevo Usuario
          </button>
          {onOpenSupabaseSettings && (
            <button
              onClick={onOpenSupabaseSettings}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
              id="btn_conectar_supabase"
            >
              <Database size={16} />
              Configurar Supabase
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4" id="stat_empresas">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Building size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Empresas Registradas</span>
            <span className="text-2xl font-bold text-slate-800 font-sans">{empresas.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4" id="stat_usuarios">
          <div className="p-3 rounded-xl bg-teal-50 text-teal-600">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Usuarios Totales</span>
            <span className="text-2xl font-bold text-slate-800 font-sans">{usuarios.length}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4" id="stat_actividad">
          <div className="p-3 rounded-xl bg-slate-50 text-slate-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Estado del Sistema</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 inline-block mt-1">
              Todos los sistemas OK
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Buscar empresas, correos, nombres..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
        />
      </div>

      {/* Main Grid: Empresas & Usuarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Empresas Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 font-sans flex items-center gap-2">
            <Building size={18} className="text-slate-500" />
            Empresas
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 font-medium uppercase">
                  <th className="pb-3 font-semibold">Empresa</th>
                  <th className="pb-3 font-semibold">Contacto</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 text-right font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredEmpresas.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 font-medium text-slate-800 flex items-center gap-3">
                      {e.logoUrl ? (
                        <img src={e.logoUrl} alt={e.name} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                          {e.name.substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <span className="block font-semibold">{e.name}</span>
                        <span className="text-xs text-slate-400">{e.direccion || 'Sin dirección'}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="block font-medium text-xs text-slate-700">{e.correo}</span>
                      <span className="block text-[11px] text-slate-400">{e.telefono}</span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        e.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {e.estado === 'ACTIVO' ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onToggleEstadoEmpresa(e.id)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          e.estado === 'ACTIVO'
                            ? 'border-red-100 text-red-600 hover:bg-red-50'
                            : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={e.estado === 'ACTIVO' ? 'Suspender Empresa' : 'Activar Empresa'}
                      >
                        <Ban size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEmpresas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-400 text-xs">
                      No se encontraron empresas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Usuarios Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <h2 className="text-base font-semibold text-slate-900 font-sans flex items-center gap-2">
            <Users size={18} className="text-slate-500" />
            Usuarios del Sistema
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 font-medium uppercase">
                  <th className="pb-3 font-semibold">Nombre</th>
                  <th className="pb-3 font-semibold">Rol</th>
                  <th className="pb-3 font-semibold">Estado</th>
                  <th className="pb-3 text-right font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredUsuarios.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 flex items-center gap-3">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                          {u.name.substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <span className="block font-semibold text-slate-800">{u.name}</span>
                        <span className="text-[11px] text-slate-400 block">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        u.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700' :
                        u.role === 'JEFE' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role === 'SUPER_ADMIN' ? 'Super Admin' : u.role === 'JEFE' ? 'Jefe' : 'Trabajador'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {u.estado === 'ACTIVO' ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => onToggleEstadoUsuario(u.id)}
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            u.estado === 'ACTIVO'
                              ? 'border-red-100 text-red-600 hover:bg-red-50'
                              : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.estado === 'ACTIVO' ? 'Suspender Usuario' : 'Activar Usuario'}
                        >
                          <Ban size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsuarios.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-400 text-xs">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Empresa Modal */}
      {showEmpresaModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Nueva Empresa</h3>
              <button onClick={() => setShowEmpresaModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>
            <form onSubmit={handleAddEmpresaSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Nombre de la Empresa *</label>
                <input
                  type="text"
                  required
                  value={newEmpresaName}
                  onChange={(e) => setNewEmpresaName(e.target.value)}
                  placeholder="Ej: Magic Cleans LLC"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newEmpresaCorreo}
                  onChange={(e) => setNewEmpresaCorreo(e.target.value)}
                  placeholder="contacto@magiccleans.com"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Teléfono</label>
                  <input
                    type="text"
                    value={newEmpresaTelefono}
                    onChange={(e) => setNewEmpresaTelefono(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Dirección</label>
                  <input
                    type="text"
                    value={newEmpresaDireccion}
                    onChange={(e) => setNewEmpresaDireccion(e.target.value)}
                    placeholder="Calle, Ciudad, Estado"
                    className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowEmpresaModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Crear Empresa
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Nuevo Usuario</h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">×</button>
            </div>
            <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ej: Carlos Silva"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="carlos@gmail.com"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Rol *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as 'JEFE' | 'TRABAJADOR')}
                    className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-indigo-500 bg-white text-sm"
                  >
                    <option value="TRABAJADOR">Trabajador</option>
                    <option value="JEFE">Jefe</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 block">Asociar Empresa *</label>
                  <select
                    value={newUserEmpresaId}
                    onChange={(e) => setNewUserEmpresaId(e.target.value)}
                    required
                    className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-indigo-500 bg-white text-sm"
                  >
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 block">Teléfono</label>
                <input
                  type="text"
                  value={newUserTelefono}
                  onChange={(e) => setNewUserTelefono(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full border border-slate-200 rounded-xl p-2 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
