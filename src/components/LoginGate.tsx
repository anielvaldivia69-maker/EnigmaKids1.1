/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserAccount } from '../types';
import { sounds } from '../utils/sound';
import { User, Lock, Sparkles, GraduationCap, ShieldAlert, BadgeCheck, Eye, EyeOff, Star, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OWL_MASCOT_DATA_URL } from '../assets/owlMascotImage';

interface LoginGateProps {
  onLoginSuccess: (user: UserAccount) => void;
}

const AVATARS = [
  { id: 'buho', emoji: '🦉', label: 'Búho Sabio' },
  { id: 'leon', emoji: '🦁', label: 'León Calculador' },
  { id: 'pand', emoji: '🐼', label: 'Panda Explorador' },
  { id: 'gato', emoji: '🐱', label: 'Gatito Literario' },
  { id: 'zorros', emoji: '🦊', label: 'Zorrito Filósofo' },
  { id: 'ping', emoji: '🐧', label: 'Pingüino Científico' },
];

const COLORS = [
  { class: 'bg-emerald-400 border-emerald-500 text-white', label: 'Verde' },
  { class: 'bg-sky-400 border-sky-500 text-white', label: 'Azul' },
  { class: 'bg-yellow-400 border-yellow-500 text-slate-800', label: 'Amarillo' },
  { class: 'bg-rose-400 border-rose-500 text-white', label: 'Rojo' },
  { class: 'bg-purple-400 border-purple-500 text-white', label: 'Morado' },
];

export const LoginGate: React.FC<LoginGateProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Registration-specific fields
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [grade, setGrade] = useState<'Primer Grado' | 'Segundo Grado' | 'Tercer Grado' | null>('Primer Grado');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('buho');
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0].class);
  
  // Error / Feedback state
  const [errorMsg, setErrorMsg] = useState<string>('');

  const getRegisteredUsers = (): UserAccount[] => {
    const raw = localStorage.getItem('enigmakids_registered_users');
    if (!raw) {
      // Bootstrapping a default teacher and some initial students for quick access
      const defaultUsers: UserAccount[] = [
        {
          id: 'admin-main',
          username: 'admin',
          password: '123',
          name: 'Administrador Enigma',
          role: 'admin',
          avatar: 'buho',
          avatarColor: 'bg-rose-500 border-rose-600 text-white',
          active: true,
          grade: null,
        },
        {
          id: 'teacher-main',
          username: 'profesor.enigma',
          password: '123',
          name: 'Profesor 🎓',
          role: 'teacher',
          avatar: 'buho',
          avatarColor: 'bg-purple-400 border-purple-500 text-white',
          active: true,
          grade: null,
        },
        {
          id: 'std-hugo',
          username: 'hugo',
          password: '123',
          name: 'Hugo López',
          role: 'student',
          avatar: 'leon',
          avatarColor: 'bg-emerald-400 border-emerald-500 text-white',
          grade: 'Primer Grado',
          points: 150,
          stars: 2,
          unlockedBadges: ['math_bronze'],
          mathLevels: { suma: 2, resta: 1, multiplicacion: 1, division: 1 },
        },
        {
          id: 'std-sofi',
          username: 'sofi',
          password: '123',
          name: 'Sofía Díaz',
          role: 'student',
          avatar: 'gato',
          avatarColor: 'bg-purple-400 border-purple-500 text-white',
          grade: 'Segundo Grado',
          points: 280,
          stars: 4,
          unlockedBadges: ['math_silver'],
          mathLevels: { suma: 2, resta: 2, multiplicacion: 1, division: 1 },
        }
      ];
      localStorage.setItem('enigmakids_registered_users', JSON.stringify(defaultUsers));
      
      // Keep classroom student list in sync
      const classroomStudents = defaultUsers.filter(u => u.role === 'student');
      localStorage.setItem('enigmakids_school_students', JSON.stringify(classroomStudents));
      
      return defaultUsers;
    }
    try {
      const parsed: UserAccount[] = JSON.parse(raw);
      return parsed.map(u => {
        if (u.role === 'teacher' && u.name.includes('Profe Sabiondo')) {
          return { ...u, name: 'Profesor 🎓' };
        }
        return u;
      });
    } catch {
      return [];
    }
  };

  const saveRegisteredUsers = (users: UserAccount[]) => {
    localStorage.setItem('enigmakids_registered_users', JSON.stringify(users));
    
    // Also sync the students array for general classroom features
    const classroomStudents = users.filter(u => u.role === 'student');
    localStorage.setItem('enigmakids_school_students', JSON.stringify(classroomStudents));
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const users = getRegisteredUsers();

    if (isRegister) {
      // REGISTRATION FLOW
      if (!name.trim()) {
        setErrorMsg('Por favor introduce tu nombre completo o apodo.');
        return;
      }

      // Check if username already exists
      const userExists = users.some(u => u.username?.toLowerCase() === cleanUsername);
      if (userExists) {
        setErrorMsg('Este nombre de usuario ya está registrado.');
        sounds.speak('El nombre de usuario ya existe, intenta con otro nombre.');
        return;
      }

      const newUserId = `user-${Date.now()}`;
      const newUser: UserAccount = {
        id: newUserId,
        username: cleanUsername,
        password: password,
        name: name.trim(),
        role: role,
        grade: role === 'student' ? grade : null,
        avatar: selectedAvatar,
        avatarColor: selectedColor,
        points: role === 'student' ? 20 : undefined, // starter points
        stars: role === 'student' ? 1 : undefined,
        unlockedBadges: role === 'student' ? [] : undefined,
        mathLevels: role === 'student' ? { suma: 1, resta: 1, multiplicacion: 1, division: 1 } : undefined,
      };

      const updatedUsers = [...users, newUser];
      saveRegisteredUsers(updatedUsers);

      sounds.playLevelUp();
      sounds.speak(`¡Registro completado con éxito, ${newUser.name}!`);
      onLoginSuccess(newUser);
    } else {
      // LOGIN FLOW
      const matchedUser = users.find(u => u.username?.toLowerCase() === cleanUsername);
      
      if (!matchedUser) {
        setErrorMsg('Nombre de usuario no encontrado. Si eres nuevo, ¡regístrate!');
        sounds.speak('No encontré ese usuario. Si eres nuevo, puedes registrarte.');
        return;
      }

      if (matchedUser.active === false) {
        setErrorMsg('Esta cuenta ha sido desactivada por la dirección del colegio. Contacta al Administrador.');
        sounds.speak('Tu cuenta se encuentra desactivada.');
        return;
      }

      if (matchedUser.password !== password) {
        setErrorMsg('Contraseña incorrecta. Inténtalo de nuevo amiguito.');
        sounds.speak('La contraseña es incorrecta, inténtalo otra vez.');
        return;
      }

      // Successful Login
      sounds.playLevelUp();
      sounds.speak(`¡Qué bueno verte de nuevo, ${matchedUser.name}!`);
      onLoginSuccess(matchedUser);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-400 via-orange-500 to-amber-500 relative overflow-hidden flex flex-col justify-between select-none font-lexend [font-family:'Lexend',sans-serif]">
      
      {/* ================= FLOATING DECORATIVE ELEMENTS ================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Floating Stars ⭐ */}
        <div className="absolute top-12 left-10 text-yellow-200/40 text-4xl animate-float-slow">⭐</div>
        <div className="absolute top-1/4 right-12 text-yellow-100/50 text-5xl animate-float-reverse">✨</div>
        <div className="absolute bottom-1/3 left-16 text-yellow-200/30 text-3xl animate-float-fast">⭐</div>
        <div className="absolute top-10 right-1/3 text-amber-200/40 text-2xl animate-float-slow">🌟</div>

        {/* Floating Numbers 1, 2, 3 🔢 */}
        <div className="absolute top-20 left-1/4 text-white/20 font-black text-6xl animate-float-reverse font-lexend">1</div>
        <div className="absolute bottom-1/4 left-10 text-white/25 font-black text-7xl animate-float-slow font-lexend">2</div>
        <div className="absolute top-1/3 right-1/4 text-white/20 font-black text-6xl animate-float-fast font-lexend">3</div>

        {/* Floating Letters A, B, C 🔤 */}
        <div className="absolute top-16 right-20 text-white/25 font-black text-6xl animate-float-slow font-lexend">A</div>
        <div className="absolute bottom-1/3 right-10 text-white/20 font-black text-7xl animate-float-reverse font-lexend">B</div>
        <div className="absolute top-2/3 left-1/3 text-white/20 font-black text-5xl animate-float-fast font-lexend">C</div>

        {/* Educational Objects: Pencils, Planets, Books, Puzzles, Science ✏️🪐📚🧩🔬 */}
        <div className="absolute top-8 left-1/2 text-white/30 text-4xl animate-float-slow">✏️</div>
        <div className="absolute bottom-20 left-1/4 text-white/25 text-5xl animate-float-reverse">🪐</div>
        <div className="absolute top-1/2 left-8 text-white/25 text-4xl animate-float-fast">📚</div>
        <div className="absolute bottom-12 right-1/3 text-white/25 text-5xl animate-float-slow">🧩</div>
        <div className="absolute top-2/3 right-16 text-white/20 text-4xl animate-float-reverse">🔬</div>

        {/* Dynamic Soft Cloud Blobs */}
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl" />
      </div>

      {/* ================= MAIN CONTENT 2-COLUMN GRID ================= */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ================= LEFT COLUMN: WELCOME & MASCOT ================= */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left text-white"
          >
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 text-amber-950 font-black text-xs uppercase tracking-widest shadow-sm mb-4">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
              <span>Universo Educativo Interactivo</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black font-lexend text-white leading-tight drop-shadow-md tracking-tight">
              ¡Aprende, juega y explora con{' '}
              <span className="text-yellow-300 underline decoration-wavy decoration-yellow-400/80">
                EnigmaKids
              </span>
              !
            </h1>

            {/* Secondary Subtitle */}
            <p className="text-base sm:text-lg font-bold text-amber-100 mt-4 max-w-lg drop-shadow-sm leading-relaxed">
              Un universo interactivo donde aprender se convierte en una aventura.
            </p>

            {/* ENLARGED OFFICIAL 3D CARTOON ENIGMAKIDS MASCOT (BÚHO SABIO) */}
            <div className="relative my-6 lg:my-8 group flex items-center justify-center">
              {/* Soft Pulsing Backlight */}
              <div className="absolute inset-0 bg-yellow-300/35 rounded-full blur-2xl scale-110 animate-pulse-glow pointer-events-none" />

              {/* Owl Mascot Container with floating animation */}
              <div className="relative z-10 animate-mascot cursor-pointer flex flex-col items-center">
                <img
                  src={OWL_MASCOT_DATA_URL}
                  alt="Búho Sabio Mascota de EnigmaKids"
                  referrerPolicy="no-referrer"
                  className="w-56 h-56 sm:w-72 sm:h-72 lg:w-84 lg:h-84 object-contain drop-shadow-2xl transition-transform hover:scale-105"
                />
              </div>

              {/* Speech Bubble Greeting */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -top-2 -right-2 sm:right-2 bg-white text-indigo-950 px-3.5 py-1.5 rounded-2xl rounded-bl-none shadow-xl border-2 border-yellow-400 font-black text-xs sm:text-sm flex items-center gap-1.5 font-lexend"
              >
                <span>¡Hola, amiguito! 👋</span>
              </motion.div>
            </div>

            {/* Educational Subjects Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                <span>🔢</span> Matemáticas
              </span>
              <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                <span>📚</span> Lenguaje
              </span>
              <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                <span>🔬</span> Ciencias
              </span>
              <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                <span>🦉</span> Filosofía
              </span>
              <span className="bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                <span>🎨</span> Dibujo
              </span>
            </div>
          </motion.div>

          {/* ================= RIGHT COLUMN: CARTOON 3D CARD FORM ================= */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 w-full max-w-lg mx-auto"
          >
            <div 
              className="w-full bg-white rounded-[2.2rem] sm:rounded-[2.5rem] border-4 border-amber-300 p-6 sm:p-8 relative overflow-hidden transition-all"
              style={{
                boxShadow: '0 10px 0 0 #d97706, 0 20px 30px rgba(0, 0, 0, 0.18)'
              }}
            >
              {/* Rainbow top line */}
              <div className="absolute top-0 inset-x-0 h-3.5 bg-gradient-to-r from-emerald-400 via-yellow-400 to-rose-400" />

              {/* Card Header & Brand Logo */}
              <div className="flex flex-col items-center text-center mt-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🚀</span>
                  <h2 className="text-2xl sm:text-3xl font-black font-lexend text-indigo-950 uppercase tracking-tight">
                    ENIGMAKIDS
                  </h2>
                </div>
                <p className="text-[11px] font-black text-slate-400 mt-0.5 uppercase tracking-wide">
                  Plataforma Interactiva Multigrado
                </p>
              </div>

              {/* Login vs Register Tabs */}
              <div className="flex gap-2 mt-4 bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsRegister(false);
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer font-lexend ${
                    !isRegister
                      ? 'bg-amber-400 text-amber-950 shadow-md border-2 border-amber-500 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                  }`}
                >
                  <span>🔑</span>
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsRegister(true);
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer font-lexend ${
                    isRegister
                      ? 'bg-amber-400 text-amber-950 shadow-md border-2 border-amber-500 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                  }`}
                >
                  <span>📝</span>
                  <span>Registrarse</span>
                </button>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleAuthSubmit} className="mt-5 space-y-4">
                
                {/* Error Banner */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 bg-rose-50 border-2 border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-sm"
                  >
                    <ShieldAlert className="w-5 h-5 shrink-0 text-rose-500" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {/* Core Credentials Inputs */}
                <div className="space-y-3.5">
                  {/* Username Input */}
                  <div>
                    <label className="block text-slate-700 text-xs font-black uppercase mb-1 font-lexend tracking-wide">
                      👤 Nombre de Usuario
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="ej: sofi, hugo"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all placeholder:text-slate-300 text-slate-800"
                      />
                      <User className="w-5 h-5 text-amber-500 absolute left-3.5 top-3.5 pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Usa solo letras, sin espacios.</p>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label className="block text-slate-700 text-xs font-black uppercase mb-1 font-lexend tracking-wide">
                      🔒 Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Escribe tu contraseña..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-3 text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all placeholder:text-slate-300 text-slate-800"
                      />
                      <Lock className="w-5 h-5 text-amber-500 absolute left-3.5 top-3.5 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-lg transition-colors cursor-pointer"
                        title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">Consejo: Recuerda anotarla bien.</p>
                  </div>
                </div>

                {/* Additional Registration Fields */}
                {isRegister && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-4 border-t-2 border-dashed border-slate-200"
                  >
                    {/* Display Name */}
                    <div>
                      <label className="block text-slate-700 text-xs font-black uppercase mb-1 font-lexend tracking-wide">
                        👋 Nombre Completo o Apodo
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ej: Sofía Díaz, Mateo López"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all placeholder:text-slate-300 text-slate-800"
                      />
                    </div>

                    {/* Role Selection */}
                    <div>
                      <label className="block text-slate-700 text-xs font-black uppercase mb-2 font-lexend tracking-wide">
                        🏫 Elige tu Rol en la Escuela
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setRole('student');
                          }}
                          className={`flex-1 py-3 border-2 rounded-2xl font-black text-xs uppercase flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            role === 'student'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-950 scale-102 shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-2xl">🎒</span>
                          <span>Soy Estudiante</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setRole('teacher');
                          }}
                          className={`flex-1 py-3 border-2 rounded-2xl font-black text-xs uppercase flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            role === 'teacher'
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-950 scale-102 shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-2xl">👩‍🏫</span>
                          <span>Soy Profesor</span>
                        </button>
                      </div>
                    </div>

                    {/* Grade Selection (Student) */}
                    {role === 'student' && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-amber-50/70 p-3.5 rounded-2xl border-2 border-amber-200"
                      >
                        <label className="block text-slate-800 text-xs font-black uppercase mb-2 font-lexend tracking-wide">
                          🌟 Elige tu Grado de Aprendizaje (Obligatorio)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['Primer Grado', 'Segundo Grado', 'Tercer Grado'] as const).map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => {
                                sounds.playClick();
                                setGrade(g);
                              }}
                              className={`py-2.5 border-2 rounded-xl font-black text-[10px] sm:text-[11px] uppercase transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                grade === g
                                  ? 'border-amber-500 bg-amber-200 text-amber-950 shadow-sm scale-105'
                                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-base">
                                {g === 'Primer Grado' ? '🌱' : g === 'Segundo Grado' ? '🌿' : '🌳'}
                              </span>
                              <span>{g}</span>
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-amber-900 mt-2 font-semibold">
                          * Tu grado determinará de manera única qué juegos podrás jugar.
                        </p>
                      </motion.div>
                    )}

                    {/* Avatar Selection */}
                    <div>
                      <label className="block text-slate-700 text-xs font-black uppercase mb-2 font-lexend tracking-wide">
                        🐾 Elige tu Avatar Guardián
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {AVATARS.map((av) => (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setSelectedAvatar(av.id);
                            }}
                            className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                              selectedAvatar === av.id
                                ? 'border-amber-400 bg-amber-100 scale-105 shadow-sm'
                                : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-2xl sm:text-3xl">{av.emoji}</span>
                            <span className="text-[8px] font-black uppercase text-slate-500 mt-0.5">{av.id}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <label className="block text-slate-700 text-xs font-black uppercase mb-2 font-lexend tracking-wide">
                        🎨 Tu Color de Fondo Favorito
                      </label>
                      <div className="flex gap-2 justify-center">
                        {COLORS.map((c, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setSelectedColor(c.class);
                            }}
                            className={`w-8 h-8 rounded-full border-2 shadow-sm transition-all cursor-pointer ${c.class} ${
                              selectedColor === c.class ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-110'
                            }`}
                            title={c.label}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit 3D Button with Shine Animation */}
                <button
                  type="submit"
                  className="w-full py-4 mt-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-amber-950 font-black text-base sm:text-lg rounded-2xl border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden group font-lexend"
                >
                  {/* Subtle shine light effect passing through */}
                  <div className="absolute inset-0 w-1/2 h-full bg-white/30 animate-shine pointer-events-none" />
                  <span className="relative z-10 drop-shadow-sm">
                    {isRegister ? '¡Registrarme y Comenzar! 🚀' : '¡Ingresar al Universo Enigmakids! 🔑'}
                  </span>
                </button>

                {/* Security Tag */}
                <div className="text-center pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50 px-3.5 py-1 rounded-full border border-slate-100">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Acceso Seguro Escolar • Enigmakids
                  </span>
                </div>

              </form>

              {/* Quick Access Account Shortcuts */}
              <div className="mt-5 border-t-2 border-dashed border-slate-200 pt-4 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-lexend">
                  Cuentas rápidas de prueba:
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('profesor.enigma');
                      setPassword('123');
                      setIsRegister(false);
                      sounds.playClick();
                    }}
                    className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-all uppercase cursor-pointer"
                  >
                    profesor.enigma 👩‍🏫 (Pass: 123)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('hugo');
                      setPassword('123');
                      setIsRegister(false);
                      sounds.playClick();
                    }}
                    className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-all uppercase cursor-pointer"
                  >
                    Hugo 🎒 (1º Grado)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('sofi');
                      setPassword('123');
                      setIsRegister(false);
                      sounds.playClick();
                    }}
                    className="text-[10px] font-black bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl border border-purple-200 hover:bg-purple-100 transition-all uppercase cursor-pointer"
                  >
                    Sofi 🎒 (2º Grado)
                  </button>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-center">
                  <a
                    href="#/admin"
                    onClick={(e) => {
                      e.preventDefault();
                      sounds.playClick();
                      window.location.hash = '#/admin';
                      window.dispatchEvent(new HashChangeEvent('hashchange'));
                    }}
                    className="text-[10px] font-black text-slate-400 hover:text-slate-600 hover:underline flex items-center gap-1 uppercase tracking-wider cursor-pointer"
                  >
                    🔒 Portal de Administración (/admin)
                  </a>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* ================= BOTTOM ORGANIC CLOUD SHAPES ================= */}
      <div className="relative w-full pointer-events-none z-0 mt-auto">
        <svg viewBox="0 0 1440 160" className="w-full h-auto block fill-white/20">
          <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,117.3C960,128,1056,128,1152,112C1248,96,1344,64,1392,48L1440,32L1440,160L1392,160C1344,160,1248,160,1152,160C1056,160,960,160,864,160C768,160,672,160,576,160C480,160,384,160,288,160C192,160,96,160,48,160L0,160Z"></path>
        </svg>
        <svg viewBox="0 0 1440 120" className="w-full h-auto block fill-white/40 -mt-12 sm:-mt-20">
          <path d="M0,32L60,48C120,64,240,96,360,96C480,96,600,64,720,58.7C840,53,960,75,1080,80C1200,85,1320,75,1380,69.3L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"></path>
        </svg>
      </div>

    </div>
  );
};
