/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlayerProfile, Subject, UserAccount } from './types';
import { MathGame } from './components/MathGame';
import { LanguageGame } from './components/LanguageGame';
import { ScienceGame } from './components/ScienceGame';
import { PhilosophyCuriosities } from './components/PhilosophyCuriosities';
import { Badges, badgesList } from './components/Badges';
import { Classroom } from './components/Classroom';
import { PaintingDrawing } from './components/PaintingDrawing';
import { VoiceAssistant } from './components/VoiceAssistant';
import { LoginGate } from './components/LoginGate';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentHome } from './components/StudentHome';
import { AdminLoginGate } from './components/AdminLoginGate';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentVirtualRooms } from './components/StudentVirtualRooms';
import { sounds } from './utils/sound';
import { Star, Trophy, Volume2, VolumeX, Sparkles, User, GraduationCap, Compass, ShieldAlert, BadgeCheck, Check, DoorOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AVATARS = [
  { id: 'buho', emoji: '🦉', label: 'Búho Sabio' },
  { id: 'leon', emoji: '🦁', label: 'León Calculador' },
  { id: 'pand', emoji: '🐼', label: 'Panda Explorador' },
  { id: 'gato', emoji: '🐱', label: 'Gatito Literario' },
  { id: 'zorros', emoji: '🦊', label: 'Zorrito Filósofo' },
  { id: 'ping', emoji: '🐧', label: 'Pingüino Científico' },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [activeSubject, setActiveSubject] = useState<Subject | 'badges' | 'classroom' | 'home' | 'virtual_rooms'>('home');
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Load user session and sound preferences on mount
  useEffect(() => {
    // Sound preferences
    const savedSound = localStorage.getItem('enigmakids_sound');
    if (savedSound !== null) {
      const state = savedSound === 'true';
      setSoundOn(state);
      sounds.enabled = state;
    }

    // Active User session
    const savedSession = localStorage.getItem('enigmakids_active_session');
    if (savedSession) {
      try {
        const user: UserAccount = JSON.parse(savedSession);
        setCurrentUser(user);
        
        if (user.role === 'student') {
          const studentProfile: PlayerProfile = {
            name: user.name,
            avatar: user.avatar,
            avatarColor: user.avatarColor,
            points: user.points ?? 20,
            streak: 0,
            stars: user.stars ?? 1,
            completedActivities: [],
            unlockedBadges: user.unlockedBadges ?? [],
            mathScores: { suma: 0, resta: 0, multiplicacion: 0, division: 0 },
            mathLevels: user.mathLevels ?? { suma: 1, resta: 1, multiplicacion: 1, division: 1 },
          };
          setProfile(studentProfile);
          setActiveSubject('home');
        }
      } catch (e) {
        localStorage.removeItem('enigmakids_active_session');
      }
    }
  }, []);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem('enigmakids_active_session', JSON.stringify(user));

    if (user.role === 'student') {
      const studentProfile: PlayerProfile = {
        name: user.name,
        avatar: user.avatar,
        avatarColor: user.avatarColor,
        points: user.points ?? 20,
        streak: 0,
        stars: user.stars ?? 1,
        completedActivities: [],
        unlockedBadges: user.unlockedBadges ?? [],
        mathScores: { suma: 0, resta: 0, multiplicacion: 0, division: 0 },
        mathLevels: user.mathLevels ?? { suma: 1, resta: 1, multiplicacion: 1, division: 1 },
      };
      setProfile(studentProfile);
      setActiveSubject('home');
    } else {
      setProfile(null);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setProfile(null);
    localStorage.removeItem('enigmakids_active_session');
    sounds.playClick();
    sounds.speak('Sesión cerrada. ¡Vuelve pronto amiguito!');
  };

  // Helper to determine allowed subjects/sections based on grade level (mandatory restriction)
  const getSubjectListForGrade = (gradeName: string | undefined | null) => {
    // All classes or sections available to students
    return ['philosophy_curiosities', 'classroom', 'virtual_rooms', 'badges', 'math', 'painting_drawing', 'language', 'science'];
  };

  const allowedSubjects = getSubjectListForGrade(currentUser?.grade);

  // Update profile and sync changes to localStorage
  const saveProfile = (newProfile: PlayerProfile) => {
    setProfile(newProfile);
    localStorage.setItem('enigmakids_profile', JSON.stringify(newProfile));

    // Keep active session and credentials synced in localStorage database
    if (currentUser && currentUser.role === 'student') {
      const updatedUser: UserAccount = {
        ...currentUser,
        name: newProfile.name,
        avatar: newProfile.avatar,
        avatarColor: newProfile.avatarColor,
        points: newProfile.points,
        stars: newProfile.stars,
        unlockedBadges: newProfile.unlockedBadges,
        mathLevels: newProfile.mathLevels,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('enigmakids_active_session', JSON.stringify(updatedUser));

      // Update in registered users database
      const rawUsers = localStorage.getItem('enigmakids_registered_users');
      if (rawUsers) {
        try {
          const users: UserAccount[] = JSON.parse(rawUsers);
          const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
          localStorage.setItem('enigmakids_registered_users', JSON.stringify(updatedUsers));
          
          // Keep classroom students synced
          const classroomStudents = updatedUsers.filter(u => u.role === 'student');
          localStorage.setItem('enigmakids_school_students', JSON.stringify(classroomStudents));
        } catch (e) {
          console.error("Failed to sync updated profile to registered database", e);
        }
      }
    }
  };

  const addPoints = (points: number) => {
    if (!profile) return;
    const newPoints = profile.points + points;
    
    // Every 100 points gets an extra yellow star!
    const originalMilestones = Math.floor(profile.points / 100);
    const newMilestones = Math.floor(newPoints / 100);
    let extraStars = 0;
    if (newMilestones > originalMilestones) {
      extraStars = newMilestones - originalMilestones;
      sounds.playLevelUp();
      sounds.speak(`¡Increíble! Has alcanzado un hito de puntaje. ¡Toma una estrella de sabiduría dorada!`);
    }

    const updatedProfile: PlayerProfile = {
      ...profile,
      points: newPoints,
      stars: profile.stars + extraStars,
    };

    // Check custom point-based badges dynamically
    const unlockedBadges = [...updatedProfile.unlockedBadges];
    if (newPoints >= 100 && !unlockedBadges.includes('math_bronze')) {
      unlockedBadges.push('math_bronze');
    }
    if (newPoints >= 250 && !unlockedBadges.includes('math_silver')) {
      unlockedBadges.push('math_silver');
    }
    if (newPoints >= 500 && !unlockedBadges.includes('math_gold')) {
      unlockedBadges.push('math_gold');
    }

    updatedProfile.unlockedBadges = unlockedBadges;
    saveProfile(updatedProfile);
  };

  const unlockBadge = (badgeId: string) => {
    if (!profile) return;
    if (profile.unlockedBadges.includes(badgeId)) return;
    
    sounds.playLevelUp();
    const updatedBadgeList = [...profile.unlockedBadges, badgeId];
    const badgeDetails = badgesList.find(b => b.id === badgeId);
    
    const updatedProfile: PlayerProfile = {
      ...profile,
      unlockedBadges: updatedBadgeList,
      points: profile.points + 50,
      stars: profile.stars + 1,
    };

    saveProfile(updatedProfile);
    
    if (badgeDetails) {
      sounds.speak(`¡Felicidades! Desbloqueaste la medalla: ${badgeDetails.title}. ¡Excelente trabajo!`);
    }
  };

  const updateMathLevel = (operation: 'suma' | 'resta' | 'multiplicacion' | 'division', newLevel: number) => {
    if (!profile) return;
    const updatedLevels = { ...profile.mathLevels, [operation]: newLevel };
    const updatedProfile: PlayerProfile = {
      ...profile,
      mathLevels: updatedLevels,
    };
    saveProfile(updatedProfile);
  };

  const toggleSound = () => {
    const newState = !soundOn;
    setSoundOn(newState);
    sounds.enabled = newState;
    localStorage.setItem('enigmakids_sound', String(newState));
    if (newState) {
      sounds.playClick();
    } else {
      sounds.stopSpeaking();
    }
  };

  const handleResetProfile = () => {
    const confirmReset = window.confirm('¿Estás seguro de que quieres cerrar tu sesión escolar amiguito?');
    if (confirmReset) {
      handleLogout();
    }
  };

  // --- RENDERING ROUTER CORNER ---

  const isAdminRoute = currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/admin/login';

  // 1. ADMIN ROUTE ACCESS CONTROL
  if (isAdminRoute) {
    if (currentUser && currentUser.role === 'admin') {
      return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
    }
    return (
      <AdminLoginGate
        onLoginSuccess={handleLoginSuccess}
        onBackToMain={() => {
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
        }}
      />
    );
  }

  // 2. ADMIN USER DIRECT ACCESS (if logged in as admin)
  if (currentUser && currentUser.role === 'admin') {
    return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  // 3. GATEWAY: If user is not logged in, force LoginGate
  if (!currentUser) {
    return <LoginGate onLoginSuccess={handleLoginSuccess} />;
  }

  // 4. TEACHER PORTAL: Redirect professors automatically to exclusive Dashboard
  if (currentUser.role === 'teacher') {
    return <TeacherDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  // 3. STUDENT PORTAL (with profile loaded)
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-400 via-orange-500 to-orange-600 text-slate-800 font-sans pb-16 antialiased relative overflow-x-hidden selection:bg-yellow-250">
      
      {/* Decorative sky clouds floating in background */}
      <div className="absolute top-10 left-10 text-white/50 w-24 h-10 bg-white/40 blur-[3px] rounded-full pointer-events-none" />
      <div className="absolute top-24 right-16 text-white/50 w-36 h-12 bg-[#FFFBEB]/20 blur-[3px] rounded-full pointer-events-none" />
      <div className="absolute bottom-20 left-12 text-white/50 w-40 h-14 bg-[#FFFBEB]/10 blur-[5px] rounded-full pointer-events-none" />

      {/* SOUND CONTROL floating toggle button */}
      <button
        id="btn-sound-toggle-floating"
        onClick={toggleSound}
        className="fixed bottom-4 right-4 z-50 p-4 bg-white border-2 border-slate-200 text-slate-700 hover:text-indigo-600 rounded-full shadow-lg active:scale-95 transition-all flex items-center justify-center cursor-pointer"
        title="Activar/Silenciar sonidos de Enigmakids"
      >
        {soundOn ? <Volume2 className="w-5 h-5 fill-slate-700 hover:fill-indigo-600" /> : <VolumeX className="w-5 h-5" />}
      </button>

      {profile && (
        <div>
          {/* Header Bar */}
          <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 border-b-4 border-yellow-200 py-3 shadow-md">
            <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-3">
              
              {/* Logo Brand with OWL drawing clicking speech */}
              <div
                onClick={() => {
                  sounds.playLevelUp();
                  sounds.speak('¡Hola! Soy Sabihondo, tu búho mentor en Enigmakids. ¡Sigue completando juegos en tu grado para ganar medallas!');
                }}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <div className="relative">
                  <svg viewBox="0 0 140 140" className="w-[58px] h-[58px] drop-shadow-sm group-hover:scale-110 transition-all duration-300">
                    <path d="M20,100 C20,40 120,40 120,100" fill="none" stroke="#F87171" strokeWidth="6" strokeLinecap="round" />
                    <path d="M28,100 C28,48 112,48 112,100" fill="none" stroke="#FBBF24" strokeWidth="5" strokeLinecap="round" />
                    <path d="M36,100 C36,56 104,56 104,100" fill="none" stroke="#34D399" strokeWidth="4" strokeLinecap="round" />
                    <path d="M44,100 C44,64 96,64 96,100" fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
                    
                    <ellipse cx="70" cy="80" rx="22" ry="26" fill="#6366F1" stroke="#4338CA" strokeWidth="2.5" />
                    <ellipse cx="70" cy="86" rx="14" ry="15" fill="#FFFFFF" />
                    <path d="M62,86 C66,89 74,89 78,86" fill="none" stroke="#818CF8" strokeWidth="1.5" />
                    <polygon points="70,44 100,53 70,62 40,53" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
                    <rect x="64" y="53" width="12" height="8" fill="#1E293B" />
                    <path d="M92,55 L92,66 C92,66 94,66 95,66" fill="none" stroke="#EF4444" strokeWidth="1.5" />
                    <circle cx="95" cy="67" r="1.5" fill="#EF4444" />
                    <circle cx="61" cy="74" r="8" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
                    <circle cx="79" cy="74" r="8" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
                    <circle cx="61" cy="74" r="3.5" fill="#000" />
                    <circle cx="79" cy="74" r="3.5" fill="#000" />
                    <circle cx="60" cy="73" r="1.2" fill="#FFF" />
                    <circle cx="78" cy="73" r="1.2" fill="#FFF" />
                    <polygon points="70,79 67,76 73,76" fill="#F59E0B" />
                  </svg>
                  <StarsOfActivity text="⭐" className="absolute -top-1 -right-1 text-yellow-400 animate-spin text-xs" />
                </div>

                <div className="hidden sm:block">
                  <h1 className="text-xl font-black text-indigo-950 uppercase leading-none tracking-tight">ENIGMAKIDS</h1>
                  <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mt-0.5">Misterios para Pequeños Genios</span>
                </div>
              </div>

              {/* Player stats box */}
              <div className="flex items-center gap-3">
                {/* Score Points bubble */}
                <div className="bg-amber-100 border-2 border-amber-300 rounded-full px-4 py-1 flex items-center gap-2 shadow-sm">
                  <span className="text-lg leading-none">🎒</span>
                  <div>
                    <span className="text-[10px] text-amber-600 block leading-none font-black uppercase">Puntos</span>
                    <span className="text-sm font-black text-amber-900 leading-none">{profile.points} xp</span>
                  </div>
                </div>

                {/* Stars metrics */}
                <div className="bg-yellow-100 border-2 border-yellow-300 rounded-full px-4 py-1 flex items-center gap-2 shadow-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                  <div>
                    <span className="text-[10px] text-yellow-700 block leading-none font-black uppercase">Estrellas</span>
                    <span className="text-sm font-black text-yellow-900 leading-none">{profile.stars}</span>
                  </div>
                </div>

                {/* Active user profile card */}
                <div
                  id="profile-dropdown-card"
                  onClick={() => {
                    sounds.playClick();
                    sounds.speak(`Hola ${profile.name}. Estás cursando el grado de ${currentUser.grade}. Tienes acumulados ${profile.points} puntos de sabiduría.`);
                  }}
                  className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full py-0.5 pl-1.5 pr-3 cursor-pointer select-none hover:bg-slate-100"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${profile.avatarColor}`}>
                    {AVATARS.find((a) => a.id === profile.avatar)?.emoji || '🐱'}
                  </div>
                  <div className="hidden md:block text-left text-[11px] font-extrabold leading-tight">
                    <p className="text-indigo-900 leading-none">{profile.name}</p>
                    <span className="text-indigo-550 block uppercase font-black text-[8px] leading-none mt-0.5">{currentUser.grade} 🏆</span>
                  </div>
                </div>

                {/* Logout Button in Header */}
                <button
                  id="btn-logout-student-header"
                  onClick={handleLogout}
                  className="p-2.5 bg-slate-50 hover:bg-rose-550 border border-slate-200 text-rose-500 hover:text-white rounded-full transition-all flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
                  title="Cerrar sesión"
                >
                  🚪
                </button>
              </div>

            </div>
          </header>

          {/* MAIN CONTAINER */}
          <main className="max-w-7xl mx-auto px-4 mt-6">
            
            {/* SUBJECTS SELECTION PORTAL BAR (Filtered for student's grade) */}
            <div className="flex flex-wrap gap-2.5 justify-center mb-8 max-w-5xl mx-auto">
              
              <button
                id="btn-sub-home"
                onClick={() => {
                  sounds.playClick();
                  setActiveSubject('home');
                }}
                className={`py-3 px-4 md:py-4.5 md:px-7 rounded-2xl font-black text-sm md:text-base border-b-4 flex items-center gap-2 shadow-md transition-all duration-150 cursor-pointer ${
                  activeSubject === 'home'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 border-amber-600 text-amber-950 scale-105'
                    : 'bg-white border-slate-200 text-indigo-900 hover:bg-yellow-50'
                }`}
              >
                <span>🏠 Inicio</span>
              </button>

              {allowedSubjects.includes('philosophy_curiosities') && (
                <button
                  id="btn-sub-philo"
                  onClick={() => {
                    sounds.playClick();
                    setActiveSubject('philosophy_curiosities');
                  }}
                  className={`py-3 px-4 md:py-4.5 md:px-7 rounded-2xl font-black text-sm md:text-base border-b-4 flex items-center gap-2 shadow-md transition-all duration-150 cursor-pointer ${
                    activeSubject === 'philosophy_curiosities'
                      ? 'bg-gradient-to-r from-purple-400 to-indigo-400 border-purple-600 text-white scale-105'
                      : 'bg-white border-slate-200 text-indigo-900 hover:bg-purple-50'
                  }`}
                >
                  <span>💭 Filosofía y Secretos</span>
                </button>
              )}

              {allowedSubjects.includes('classroom') && (
                <button
                  id="btn-sub-classroom"
                  onClick={() => {
                    sounds.playClick();
                    setActiveSubject('classroom');
                  }}
                  className={`py-3 px-4 md:py-4.5 md:px-7 rounded-2xl font-black text-sm md:text-base border-b-4 flex items-center gap-2 shadow-md transition-all duration-150 cursor-pointer ${
                    activeSubject === 'classroom'
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 border-indigo-700 text-white scale-105'
                      : 'bg-white border-slate-200 text-indigo-900 hover:bg-indigo-50'
                  }`}
                >
                  <span>🏫 Aula Virtual</span>
                </button>
              )}

              {allowedSubjects.includes('virtual_rooms') && (
                <button
                  id="btn-sub-virtual-rooms"
                  onClick={() => {
                    sounds.playClick();
                    setActiveSubject('virtual_rooms');
                  }}
                  className={`py-3 px-4 md:py-4.5 md:px-7 rounded-2xl font-black text-sm md:text-base border-b-4 flex items-center gap-2 shadow-md transition-all duration-150 cursor-pointer ${
                    activeSubject === 'virtual_rooms'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-orange-700 text-white scale-105'
                      : 'bg-white border-slate-200 text-indigo-900 hover:bg-amber-50'
                  }`}
                >
                  <span>🔑 Unirse a una Sala</span>
                </button>
              )}

              {allowedSubjects.includes('badges') && (
                <button
                  id="btn-sub-badges"
                  onClick={() => {
                    sounds.playClick();
                    setActiveSubject('badges');
                  }}
                  className={`py-3 px-4 md:py-4.5 md:px-7 rounded-2xl font-black text-sm md:text-base border-b-4 flex items-center gap-2 shadow-md transition-all duration-150 cursor-pointer ${
                    activeSubject === 'badges'
                      ? 'bg-gradient-to-r from-rose-400 to-pink-400 border-rose-600 text-white scale-105'
                      : 'bg-white border-slate-200 text-indigo-900 hover:bg-rose-50'
                  }`}
                >
                  <span>🏆 Mis Medallas</span>
                </button>
              )}

              {allowedSubjects.includes('math') && (
                <button
                  id="btn-sub-math"
                  onClick={() => {
                    sounds.playClick();
                    setActiveSubject('math');
                  }}
                  className={`py-3 px-4 md:py-4.5 md:px-7 rounded-2xl font-black text-sm md:text-base border-b-4 flex items-center gap-2 shadow-md transition-all duration-150 cursor-pointer ${
                    activeSubject === 'math'
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-400 border-amber-600 text-yellow-950 scale-105'
                      : 'bg-white border-slate-200 text-indigo-900 hover:bg-yellow-50'
                  }`}
                >
                  <span>🧮 Matemáticas Mágicas</span>
                </button>
              )}

              {allowedSubjects.includes('painting_drawing') && (
                <button
                  id="btn-sub-painting"
                  onClick={() => {
                    sounds.playClick();
                    setActiveSubject('painting_drawing');
                    sounds.speak('¡Bienvenido a la sección de arte! Elige tu animalito favorito para comenzar a pintar o dibujar.');
                  }}
                  className={`py-3 px-4 md:py-4.5 md:px-7 rounded-2xl font-black text-sm md:text-base border-b-4 flex items-center gap-2 shadow-md transition-all duration-150 cursor-pointer ${
                    activeSubject === 'painting_drawing'
                      ? 'bg-gradient-to-r from-pink-400 to-rose-400 border-rose-600 text-white scale-105'
                      : 'bg-white border-slate-200 text-indigo-900 hover:bg-pink-50'
                  }`}
                >
                  <span>🎨 Pintar y Dibujar</span>
                </button>
              )}

              {allowedSubjects.includes('language') && (
                <button
                  id="btn-sub-language"
                  onClick={() => {
                    sounds.playClick();
                    setActiveSubject('language');
                  }}
                  className={`py-3 px-4 md:py-4.5 md:px-7 rounded-2xl font-black text-sm md:text-base border-b-4 flex items-center gap-2 shadow-md transition-all duration-150 cursor-pointer ${
                    activeSubject === 'language'
                      ? 'bg-gradient-to-r from-sky-400 to-blue-400 border-blue-600 text-white scale-105'
                      : 'bg-white border-slate-200 text-indigo-900 hover:bg-sky-50'
                  }`}
                >
                  <span>📚 Lengua y Arte</span>
                </button>
              )}

              {allowedSubjects.includes('science') && (
                <button
                  id="btn-sub-science"
                  onClick={() => {
                    sounds.playClick();
                    setActiveSubject('science');
                  }}
                  className={`py-3 px-4 md:py-4.5 md:px-7 rounded-2xl font-black text-sm md:text-base border-b-4 flex items-center gap-2 shadow-md transition-all duration-150 cursor-pointer ${
                    activeSubject === 'science'
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400 border-emerald-600 text-white scale-105'
                      : 'bg-white border-slate-200 text-indigo-900 hover:bg-emerald-50'
                  }`}
                >
                  <span>🧪 Ciencias Sorpresa</span>
                </button>
              )}

            </div>

            {/* MAIN CORE GAME VIEWPORTS CONTAINER */}
            <div className="min-h-[480px]">
              <AnimatePresence mode="wait">
                {activeSubject === 'home' && profile && currentUser && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                  >
                    <StudentHome
                      profile={profile}
                      currentUser={currentUser}
                      onNavigateSubject={(subject) => setActiveSubject(subject)}
                      onToggleSound={toggleSound}
                      soundOn={soundOn}
                    />
                  </motion.div>
                )}

                {activeSubject === 'math' && allowedSubjects.includes('math') && (
                  <motion.div
                    key="math"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                  >
                    <MathGame
                      onAddPoints={addPoints}
                      onUnlockBadge={unlockBadge}
                      mathLevels={profile.mathLevels}
                      onUpdateLevel={updateMathLevel}
                      studentGrade={currentUser?.grade}
                    />
                  </motion.div>
                )}

                {activeSubject === 'language' && allowedSubjects.includes('language') && (
                  <motion.div
                    key="language"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                  >
                    <LanguageGame
                      onAddPoints={addPoints}
                      onUnlockBadge={unlockBadge}
                      studentGrade={currentUser?.grade}
                    />
                  </motion.div>
                )}

                {activeSubject === 'science' && allowedSubjects.includes('science') && (
                  <motion.div
                    key="science"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                  >
                    <ScienceGame
                      onAddPoints={addPoints}
                      onUnlockBadge={unlockBadge}
                    />
                  </motion.div>
                )}

                {activeSubject === 'philosophy_curiosities' && allowedSubjects.includes('philosophy_curiosities') && (
                  <motion.div
                    key="philosophy"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                  >
                    <PhilosophyCuriosities
                      onAddPoints={addPoints}
                      onUnlockBadge={unlockBadge}
                    />
                  </motion.div>
                )}

                {activeSubject === 'badges' && allowedSubjects.includes('badges') && (
                  <motion.div
                    key="badges"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                  >
                    <Badges unlockedBadgeIds={profile.unlockedBadges} />
                  </motion.div>
                )}

                {activeSubject === 'classroom' && allowedSubjects.includes('classroom') && (
                  <motion.div
                    key="classroom"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                  >
                    <Classroom />
                  </motion.div>
                )}

                {activeSubject === 'virtual_rooms' && allowedSubjects.includes('virtual_rooms') && currentUser && (
                  <motion.div
                    key="virtual_rooms"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                  >
                    <StudentVirtualRooms
                      currentUser={currentUser}
                      onNavigateToQuiz={() => {
                        setActiveSubject('classroom');
                      }}
                    />
                  </motion.div>
                )}

                {activeSubject === 'painting_drawing' && allowedSubjects.includes('painting_drawing') && (
                  <motion.div
                    key="painting_drawing"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                  >
                    <PaintingDrawing
                      onAddPoints={addPoints}
                      onUnlockBadge={unlockBadge}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick action footer */}
            <div className="text-center mt-12 mb-4 space-y-3">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                📁 Todos tus avances se guardan de forma segura en tu navegador.
              </p>
              
              <button
                id="btn-reset-player-profile"
                onClick={handleResetProfile}
                className="text-[10px] uppercase font-black text-rose-550 hover:text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 px-4 py-2 rounded-full shadow-sm transition-all cursor-pointer"
              >
                🚪 Cerrar Sesión y Cambiar de Cuenta
              </button>
            </div>

          </main>
        </div>
      )}

      {profile && (
        <VoiceAssistant
          activeSubject={activeSubject}
          setActiveSubject={(sub) => {
            const allowed = getSubjectListForGrade(currentUser.grade);
            if (allowed.includes(sub)) {
              setActiveSubject(sub);
            } else {
              sounds.speak(`Lo siento amiguito, la sección ${sub} no está permitida en tu grado actual.`);
            }
          }}
          soundOn={soundOn}
          toggleSound={toggleSound}
        />
      )}

    </div>
  );
}

const StarsOfActivity = ({ text, className }: { text: string; className: string }) => {
  return <span className={className}>{text}</span>;
}
