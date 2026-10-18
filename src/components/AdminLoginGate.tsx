/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserAccount } from '../types';
import { sounds } from '../utils/sound';
import { ShieldAlert, Lock, User, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminLoginGateProps {
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onNavigateHome: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({
  currentUser,
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If user is ALREADY logged in as student or teacher, show Unauthorized Access
  if (currentUser && currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-950 text-white relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-slate-900 border-2 border-rose-500/50 p-8 rounded-3xl shadow-2xl text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto text-3xl">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-rose-500/30">
              Acceso Restringido
            </span>
            <h2 className="text-2xl font-black text-white mt-3">Acceso No Autorizado</h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Hola, <strong className="text-white">{currentUser.name}</strong> ({currentUser.role === 'teacher' ? 'Profesor' : 'Estudiante'}). Tu cuenta no cuenta con permisos de <strong className="text-rose-400">Administrador</strong> para acceder a este módulo privado.
            </p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-left text-xs space-y-1">
            <p className="text-slate-400 font-extrabold uppercase text-[10px]">Detalle de la solicitud:</p>
            <p className="text-slate-200"><strong>Ruta:</strong> /admin (Panel de Dirección)</p>
            <p className="text-slate-200"><strong>Rol requerido:</strong> Administrador</p>
            <p className="text-slate-200"><strong>Tu Rol actual:</strong> {currentUser.role === 'teacher' ? 'Profesor' : 'Estudiante'}</p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => {
                sounds.playClick();
                onNavigateHome();
              }}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Aplicación ({currentUser.role === 'teacher' ? 'Panel Profesor' : 'Inicio Estudiante'})</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const getRegisteredUsers = (): UserAccount[] => {
    const raw = localStorage.getItem('enigmakids_registered_users');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Ingresa usuario y contraseña de Administrador.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const users = getRegisteredUsers();
    
    // Look for user
    const matched = users.find(u => u.username?.toLowerCase() === cleanUsername);

    if (!matched) {
      setErrorMsg('Usuario administrador no registrado.');
      sounds.speak('Usuario no encontrado.');
      return;
    }

    if (matched.role !== 'admin') {
      setErrorMsg('Acceso denegado: Esta cuenta no es de Administrador.');
      sounds.speak('Acceso no autorizado.');
      return;
    }

    if (matched.active === false) {
      setErrorMsg('Esta cuenta de Administrador se encuentra inactiva.');
      return;
    }

    if (matched.password !== password) {
      setErrorMsg('Contraseña de Administrador incorrecta.');
      sounds.speak('Contraseña incorrecta.');
      return;
    }

    // Success
    sounds.playLevelUp();
    sounds.speak(`Bienvenido Administrador ${matched.name}`);
    onLoginSuccess(matched);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden text-slate-100">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border-2 border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl relative"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <button
            onClick={() => {
              sounds.playClick();
              onNavigateHome();
            }}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>
          <span className="text-[10px] font-black uppercase text-rose-400 bg-rose-950/60 border border-rose-800/50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Ruta Privada /admin
          </span>
        </div>

        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-rose-600 to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg text-white">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Portal de Administrador</h1>
          <p className="text-xs text-slate-400 font-medium">
            Ingreso exclusivo para la Dirección General y Administradores del Sistema EnigmaKids.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-600/50 rounded-2xl text-rose-300 text-xs font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-xs font-black uppercase mb-1">
              Usuario Administrador
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="ej: admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm font-bold bg-slate-800 border border-slate-700 rounded-2xl focus:border-rose-500 focus:outline-none text-white placeholder:text-slate-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-black uppercase mb-1">
              Contraseña Privada
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Contraseña de administrador..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm font-bold bg-slate-800 border border-slate-700 rounded-2xl focus:border-rose-500 focus:outline-none text-white placeholder:text-slate-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer active:scale-98"
          >
            Iniciar Sesión como Administrador 🔑
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center space-y-2">
          <p className="text-[10px] text-slate-400 font-extrabold uppercase">Cuenta de prueba rápida:</p>
          <button
            type="button"
            onClick={() => {
              setUsername('admin');
              setPassword('123');
              sounds.playClick();
            }}
            className="text-xs font-black bg-rose-950/80 border border-rose-800/60 text-rose-300 px-3 py-1.5 rounded-xl hover:bg-rose-900 transition-all uppercase"
          >
            Admin 🛡️ (User: admin / Pass: 123)
          </button>
        </div>
      </motion.div>
    </div>
  );
};
