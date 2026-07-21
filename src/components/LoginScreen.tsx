import React, { useState } from 'react';
import { Usuario } from '../types';
import { KeyRound, User, HelpCircle, Eye, EyeOff, AlertCircle, RefreshCw, LogIn } from 'lucide-react';

interface LoginScreenProps {
  usuarios: Usuario[];
  onLoginSuccess: (user: Usuario) => void;
  darkMode: boolean;
}

export default function LoginScreen({ usuarios, onLoginSuccess, darkMode }: LoginScreenProps) {
  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Recovery states
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<1 | 2>(1); // 1: username, 2: answer
  const [recoveryUser, setRecoveryUser] = useState<Usuario | null>(null);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);

  // Quick select helper states (to make testing easy)
  const [showDemoAccounts, setShowDemoAccounts] = useState(true);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const user = usuarios.find(
      (u) => u.username?.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      setLoginError('El nombre de usuario no existe.');
      return;
    }

    if (user.estado === 'SUSPENDIDO') {
      setLoginError('Este usuario está suspendido de la plataforma.');
      return;
    }

    if (user.password !== password) {
      setLoginError('Contraseña incorrecta.');
      return;
    }

    onLoginSuccess(user);
  };

  const handleStartRecovery = () => {
    setIsRecovering(true);
    setRecoveryStep(1);
    setRecoveryUser(null);
    setRecoveryAnswer('');
    setRecoveryError(null);
    setRecoveredPassword(null);
  };

  const handleRecoveryNext = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    const user = usuarios.find(
      (u) => u.username?.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      setRecoveryError('El nombre de usuario no existe.');
      return;
    }

    if (!user.preguntaSeguridad) {
      setRecoveryError('Este usuario no tiene configurada una pregunta de seguridad. Contacta al Administrador.');
      return;
    }

    setRecoveryUser(user);
    setRecoveryStep(2);
  };

  const handleRecoveryVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError(null);

    if (!recoveryUser) return;

    const formattedAnswer = recoveryAnswer.trim().toLowerCase();
    const correctAnswer = recoveryUser.respuestaSeguridad?.trim().toLowerCase();

    if (formattedAnswer === correctAnswer) {
      setRecoveredPassword(recoveryUser.password || 'Sin clave');
    } else {
      setRecoveryError('Respuesta incorrecta. Inténtalo de nuevo.');
    }
  };

  const handleQuickLogin = (demoUser: Usuario) => {
    setUsername(demoUser.username || '');
    setPassword(demoUser.password || '');
    setLoginError(null);
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black text-2xl tracking-tighter shadow-md shadow-emerald-600/30 mx-auto mb-4">
          CP
        </div>
        <h2 className="text-2xl font-black tracking-tight font-sans">
          CleanPay <span className="text-emerald-600 font-medium">SaaS</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Ingresa tus credenciales para acceder al control transparente de tus servicios y deudas de limpieza.
        </p>
      </div>

      {/* Main Auth Card */}
      <div className={`w-full p-6 rounded-2xl border shadow-sm transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
      }`}>
        {!isRecovering ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <h3 className="font-bold text-sm tracking-tight mb-2 flex items-center gap-2">
              <LogIn size={16} className="text-emerald-600" />
              Inicio de Sesión
            </h3>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={14} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={15} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: maria, alejandro..."
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={handleStartRecovery}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-500 hover:underline transition cursor-pointer"
                >
                  ¿La olvidaste?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={15} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                    darkMode 
                      ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm shadow-emerald-600/10 active:scale-[0.98]"
            >
              Iniciar Sesión
            </button>
          </form>
        ) : (
          /* PASSWORD RECOVERY FORM */
          <div className="space-y-4">
            <h3 className="font-bold text-sm tracking-tight mb-1 flex items-center gap-2">
              <HelpCircle size={16} className="text-emerald-600" />
              Recuperar Contraseña
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Responde la pregunta de seguridad configurada para recuperar el acceso.
            </p>

            {recoveryError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
                <AlertCircle size={14} className="shrink-0" />
                <span>{recoveryError}</span>
              </div>
            )}

            {recoveredPassword ? (
              /* Recovery Success state */
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">Tu contraseña actual es:</p>
                  <p className="text-lg font-black tracking-widest text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                    {recoveredPassword}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPassword(recoveredPassword);
                    setIsRecovering(false);
                  }}
                  className="w-full bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Volver al Inicio y Usarla
                </button>
              </div>
            ) : recoveryStep === 1 ? (
              /* Step 1: Username search */
              <form onSubmit={handleRecoveryNext} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Ingresa tu Usuario
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej: maria"
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                      darkMode 
                        ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRecovering(false)}
                    className={`w-1/2 py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer text-center ${
                      darkMode ? 'bg-slate-850 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer"
                  >
                    Siguiente
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Answer verification */
              <form onSubmit={handleRecoveryVerify} className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800 text-[11px] font-medium leading-relaxed">
                  <span className="font-bold block text-slate-400 uppercase tracking-wide text-[9px] mb-1">PREGUNTA DE SEGURIDAD:</span>
                  {recoveryUser?.preguntaSeguridad}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tu Respuesta
                  </label>
                  <input
                    type="text"
                    required
                    value={recoveryAnswer}
                    onChange={(e) => setRecoveryAnswer(e.target.value)}
                    placeholder="Ingresa la respuesta de seguridad"
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                      darkMode 
                        ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600' 
                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRecoveryStep(1)}
                    className={`w-1/2 py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer text-center ${
                      darkMode ? 'bg-slate-850 hover:bg-slate-800 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer"
                  >
                    Verificar
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* QUICK LOGIN HELPER FOR CONVENIENT TESTING */}
      {showDemoAccounts && (
        <div className={`w-full mt-6 p-4 rounded-2xl border ${
          darkMode ? 'bg-slate-900/60 border-slate-800/80 text-slate-300' : 'bg-slate-100/80 border-slate-200 text-slate-600'
        }`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Credenciales de Simulación (Fácil Acceso)
            </span>
            <button
              onClick={() => setShowDemoAccounts(false)}
              className="text-[10px] text-slate-400 hover:text-emerald-600 font-semibold cursor-pointer"
            >
              Ocultar
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {usuarios.map((u) => (
              <button
                key={u.id}
                onClick={() => handleQuickLogin(u)}
                className={`flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                  darkMode 
                    ? 'bg-slate-950/60 hover:bg-slate-950 text-slate-300 border border-slate-800/50' 
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/50'
                }`}
              >
                <div>
                  <p className="text-[11px] font-bold leading-tight">{u.name}</p>
                  <p className="text-[10px] text-slate-400">
                    Rol: <span className="font-semibold text-emerald-600">{u.role}</span>
                  </p>
                </div>
                <div className="text-right font-mono text-[10px] text-slate-400">
                  <p>User: <strong className="text-slate-800 dark:text-slate-200">{u.username}</strong></p>
                  <p>Clave: <strong className="text-slate-800 dark:text-slate-200">{u.password}</strong></p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
