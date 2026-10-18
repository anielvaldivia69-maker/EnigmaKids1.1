/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PlayerProfile, UserAccount, Subject, Quiz, QuizSubmission } from '../types';
import { badgesList } from './Badges';
import { sounds } from '../utils/sound';
import {
  Sparkles,
  Trophy,
  Star,
  BookOpen,
  Calculator,
  Atom,
  Brain,
  Palette,
  GraduationCap,
  Clock,
  CheckCircle2,
  Bell,
  Play,
  Award,
  User,
  Settings,
  ArrowRight,
  Flame,
  ChevronRight,
  Volume2,
  VolumeX,
  FileText,
  Zap,
  BarChart2
} from 'lucide-react';
import { motion } from 'motion/react';

interface StudentHomeProps {
  profile: PlayerProfile;
  currentUser: UserAccount;
  onNavigateSubject: (subject: Subject | 'badges' | 'classroom' | 'virtual_rooms') => void;
  onToggleSound?: () => void;
  soundOn?: boolean;
}

export const StudentHome: React.FC<StudentHomeProps> = ({
  profile,
  currentUser,
  onNavigateSubject,
  onToggleSound,
  soundOn = true,
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Load pending quizzes and submissions for the student from localStorage
  useEffect(() => {
    const rawQuizzes = localStorage.getItem('enigmakids_school_quizzes');
    if (rawQuizzes) {
      try {
        const parsedQuizzes: Quiz[] = JSON.parse(rawQuizzes);
        setQuizzes(parsedQuizzes);
      } catch (e) {
        console.error('Failed to parse quizzes in StudentHome', e);
      }
    }

    const rawSubmissions = localStorage.getItem('enigmakids_school_submissions');
    if (rawSubmissions) {
      try {
        const parsedSubmissions: QuizSubmission[] = JSON.parse(rawSubmissions);
        setSubmissions(parsedSubmissions);
      } catch (e) {
        console.error('Failed to parse submissions in StudentHome', e);
      }
    }
  }, []);

  // Filter quizzes assigned to student or 'all' that haven't been submitted yet
  const mySubmissions = submissions.filter((s) => s.studentId === currentUser.id);
  const pendingQuizzes = quizzes.filter((q) => {
    const isAssigned = q.assignedTo.includes('all') || q.assignedTo.includes(currentUser.id);
    const alreadySubmitted = mySubmissions.some((s) => s.quizId === q.id);
    return isAssigned && !alreadySubmitted;
  });

  const gradedSubmissions = mySubmissions.filter((s) => s.isGraded);

  // Calculated level logic (Level 1: 0-99 XP, Level 2: 100-249 XP, Level 3: 250-499 XP, Level 4: 500+ XP)
  const xp = profile.points || 0;
  let levelNumber = 1;
  let levelTitle = 'Explorador Curioso';
  let nextLevelXp = 100;
  let currentLevelBaseXp = 0;

  if (xp >= 500) {
    levelNumber = 4;
    levelTitle = 'Gran Genio Enigma';
    nextLevelXp = 1000;
    currentLevelBaseXp = 500;
  } else if (xp >= 250) {
    levelNumber = 3;
    levelTitle = 'Mente Brillante';
    nextLevelXp = 500;
    currentLevelBaseXp = 250;
  } else if (xp >= 100) {
    levelNumber = 2;
    levelTitle = 'Buscador de Desafíos';
    nextLevelXp = 250;
    currentLevelBaseXp = 100;
  }

  const levelProgress = Math.min(
    100,
    Math.max(0, Math.round(((xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100))
  );

  // Unlocked badges details
  const unlockedBadgesDetails = badgesList.filter((b) =>
    profile.unlockedBadges.includes(b.id)
  );

  // Course / Subject catalog cards
  const COURSES = [
    {
      id: 'math' as const,
      title: 'Matemáticas Mágicas',
      emoji: '🧮',
      icon: Calculator,
      color: 'from-amber-400 to-yellow-500',
      borderColor: 'border-amber-500',
      badgeColor: 'bg-amber-100 text-amber-900',
      desc: 'Sumas, restas, multiplicaciones y desafíos con niveles de dificultad.',
    },
    {
      id: 'language' as const,
      title: 'Lengua y Arte',
      emoji: '📚',
      icon: BookOpen,
      color: 'from-sky-400 to-blue-500',
      borderColor: 'border-blue-500',
      badgeColor: 'bg-sky-100 text-blue-900',
      desc: 'Sopa de letras, formación de palabras y retos gramaticales.',
    },
    {
      id: 'science' as const,
      title: 'Ciencias Sorpresa',
      emoji: '🧪',
      icon: Atom,
      color: 'from-emerald-400 to-teal-500',
      borderColor: 'border-emerald-500',
      badgeColor: 'bg-emerald-100 text-emerald-900',
      desc: 'Explora el cuerpo humano, ecosistemas y simulador de volcán.',
    },
    {
      id: 'philosophy_curiosities' as const,
      title: 'Filosofía y Secretos',
      emoji: '💭',
      icon: Brain,
      color: 'from-purple-400 to-indigo-500',
      borderColor: 'border-purple-500',
      badgeColor: 'bg-purple-100 text-purple-900',
      desc: 'Preguntas profundas, curiosidades del mundo e historias sobre ética.',
    },
    {
      id: 'painting_drawing' as const,
      title: 'Pintar y Dibujar',
      emoji: '🎨',
      icon: Palette,
      color: 'from-pink-400 to-rose-500',
      borderColor: 'border-rose-500',
      badgeColor: 'bg-pink-100 text-pink-900',
      desc: 'Lienzo interactivo de arte para colorear y expresar tu creatividad.',
    },
    {
      id: 'classroom' as const,
      title: 'Aula Virtual',
      emoji: '🏫',
      icon: GraduationCap,
      color: 'from-indigo-500 to-indigo-600',
      borderColor: 'border-indigo-700',
      badgeColor: 'bg-indigo-100 text-indigo-900',
      desc: 'Rinde exámenes asignados por tu profesor y revisa tus calificaciones.',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* WELCOME HERO BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-md border-4 border-yellow-300 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Avatar and Welcome Message */}
          <div className="flex items-center gap-4 text-left w-full md:w-auto">
            <div className="relative">
              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center text-4xl md:text-5xl shadow-lg border-4 border-white ${profile.avatarColor}`}>
                {profile.avatar === 'buho' ? '🦉' : profile.avatar === 'leon' ? '🦁' : profile.avatar === 'pand' ? '🐼' : profile.avatar === 'gato' ? '🐱' : profile.avatar === 'zorros' ? '🦊' : '🐧'}
              </div>
              <span className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-950 font-black text-xs px-2.5 py-0.5 rounded-full border-2 border-white shadow">
                Nivel {levelNumber}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {currentUser.grade || 'Primer Grado'} 🌟
                </span>
                <span className="bg-indigo-100 text-indigo-900 text-xs font-black px-2.5 py-1 rounded-full uppercase">
                  {levelTitle}
                </span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-indigo-950 mt-1 leading-tight">
                ¡Hola, <span className="text-amber-600">{profile.name}</span>! 👋
              </h2>
              <p className="text-sm font-extrabold text-slate-600 mt-1">
                🦉 Sabihondo dice: <span className="italic">"¡Cada juego completado te acerca a una nueva medalla de sabiduría!"</span>
              </p>
            </div>
          </div>

          {/* Action to continue last activity */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <button
              onClick={() => {
                sounds.playClick();
                onNavigateSubject('math');
              }}
              className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-black text-sm px-6 py-3.5 rounded-2xl shadow-lg border-b-4 border-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Continuar con Matemáticas Mágicas</span>
            </button>

            <button
              id="btn-hero-join-room"
              onClick={() => {
                sounds.playClick();
                onNavigateSubject('virtual_rooms');
              }}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow border-b-4 border-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🔑 Unirse a una Sala (Código)</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onNavigateSubject('classroom');
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow border-b-4 border-indigo-800 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Ver Aula Virtual ({pendingQuizzes.length} pendientes)</span>
            </button>
          </div>
        </div>

        {/* PROGRESS & LEVEL STATS BAR */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid sm:grid-cols-3 gap-4">
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xl shadow-xs">
              🎒
            </div>
            <div>
              <span className="text-[10px] text-amber-700 font-black uppercase block leading-none">Puntos de Experiencia</span>
              <p className="text-xl font-black text-amber-950 leading-tight">{profile.points} XP</p>
            </div>
          </div>

          <div className="bg-yellow-50/80 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-yellow-950 flex items-center justify-center font-black text-xl shadow-xs">
              ⭐
            </div>
            <div>
              <span className="text-[10px] text-yellow-700 font-black uppercase block leading-none">Estrellas de Sabiduría</span>
              <p className="text-xl font-black text-yellow-950 leading-tight">{profile.stars} Estrellas</p>
            </div>
          </div>

          <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-400 text-white flex items-center justify-center font-black text-xl shadow-xs">
              🏆
            </div>
            <div>
              <span className="text-[10px] text-rose-700 font-black uppercase block leading-none">Insignias Desbloqueadas</span>
              <p className="text-xl font-black text-rose-950 leading-tight">{profile.unlockedBadges.length} Medallas</p>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR FOR NEXT LEVEL */}
        <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-1.5 text-xs font-black">
            <span className="text-indigo-900 uppercase flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Progreso de Nivel {levelNumber}: <span className="text-amber-600 font-black">{levelTitle}</span>
            </span>
            <span className="text-indigo-700 font-black">{xp} / {nextLevelXp} XP ({levelProgress}%)</span>
          </div>
          <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-300">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 h-full rounded-full shadow-inner"
            />
          </div>
          <p className="text-[11px] text-slate-500 font-bold mt-2 text-right">
            Te faltan <span className="text-amber-700 font-black">{Math.max(0, nextLevelXp - xp)} XP</span> para alcanzar el siguiente hito de nivel.
          </p>
        </div>
      </motion.div>

      {/* QUICK ACCESS BAR */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl border-2 border-slate-200 shadow-md">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">
          ⚡ Accesos Rápidos
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <button
            id="btn-quick-virtual-rooms"
            onClick={() => { sounds.playClick(); onNavigateSubject('virtual_rooms'); }}
            className="p-3 bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-950 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
          >
            <span className="text-2xl">🔑</span>
            <span>Salas Virtuales</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onNavigateSubject('math'); }}
            className="p-3 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 text-yellow-900 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <span className="text-2xl">📚</span>
            <span>Cursos</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onNavigateSubject('classroom'); }}
            className="p-3 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-900 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <span className="text-2xl">📝</span>
            <span>Evaluaciones</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onNavigateSubject('badges'); }}
            className="p-3 bg-rose-50 hover:bg-rose-100 border-2 border-rose-200 text-rose-900 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <span className="text-2xl">🏆</span>
            <span>Progreso</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setShowProfileModal(true);
            }}
            className="p-3 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 text-purple-900 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <span className="text-2xl">👤</span>
            <span>Perfil</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setShowSettingsModal(true);
            }}
            className="p-3 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 text-slate-800 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 col-span-2 sm:col-span-1"
          >
            <span className="text-2xl">⚙️</span>
            <span>Configuración</span>
          </button>
        </div>
      </div>

      {/* VIRTUAL ROOM INVITATION BANNER */}
      <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 rounded-3xl p-6 shadow-xl border-4 border-yellow-200 text-amber-950 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/90 text-amber-900 flex items-center justify-center text-3xl shadow-sm shrink-0">
            🔑
          </div>
          <div>
            <span className="bg-white/30 text-amber-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              Conexión en Vivo
            </span>
            <h3 className="text-xl font-black mt-0.5 text-white drop-shadow-xs">
              ¿Tienes un código de tu profesor?
            </h3>
            <p className="text-xs font-extrabold text-amber-950/80 mt-0.5">
              Ingresa a la sala virtual para participar en clases en vivo, ver a tus compañeros y resolver actividades.
            </p>
          </div>
        </div>

        <button
          id="btn-banner-join-virtual-room"
          onClick={() => {
            sounds.playClick();
            onNavigateSubject('virtual_rooms');
          }}
          className="w-full md:w-auto px-6 py-3.5 bg-white hover:bg-yellow-100 text-indigo-950 font-black text-xs uppercase rounded-2xl shadow-lg border-b-4 border-amber-600 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 tracking-wider shrink-0"
        >
          <span>Unirse a una Sala Ahora</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* COURSES / SUBJECTS ENROLLED */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-yellow-200" />
            <h3 className="text-xl md:text-2xl font-black text-white drop-shadow">
              Tus Cursos e Itinerarios de Aprendizaje
            </h3>
          </div>
          <span className="bg-white/20 text-white font-black text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-white/30">
            6 Materias Activas
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {COURSES.map((course) => {
            const IconComponent = course.icon;
            return (
              <motion.div
                key={course.id}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white border-4 border-slate-100 hover:border-yellow-300 rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 ${course.badgeColor}`}>
                      <span>{course.emoji}</span>
                      <span>{course.title}</span>
                    </span>
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${course.color} text-white flex items-center justify-center shadow-md`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">
                    {course.title}
                  </h4>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed mb-4">
                    {course.desc}
                  </p>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    onNavigateSubject(course.id);
                  }}
                  className={`w-full py-3 bg-gradient-to-r ${course.color} text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md border-b-4 ${course.borderColor} active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2`}
                >
                  <span>Ingresar al Curso</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* DASHBOARD GRID: UPCOMING TASKS, LATEST ACTIVITIES & NOTIFICATIONS */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* UPCOMING EXAMS / ASSIGNMENTS */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-black text-slate-900 uppercase text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Próximas Tareas y Exámenes
            </h3>
            <span className="bg-indigo-100 text-indigo-900 font-black text-xs px-2.5 py-0.5 rounded-full">
              {pendingQuizzes.length}
            </span>
          </div>

          {pendingQuizzes.length > 0 ? (
            <div className="space-y-3">
              {pendingQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-indigo-50/60 border border-indigo-200 p-3.5 rounded-2xl flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl mt-0.5">
                      {quiz.subject === 'math' ? '🧮' : quiz.subject === 'language' ? '📚' : '🧪'}
                    </span>
                    <div>
                      <h4 className="font-black text-xs text-slate-900 leading-snug">{quiz.title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                        {quiz.questions.length} ejercicios • Profesor
                      </p>
                      {quiz.dueDate && (
                        <span className="inline-block text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded mt-1">
                          📅 Vence: {new Date(quiz.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      onNavigateSubject('classroom');
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] uppercase rounded-xl transition-all text-center cursor-pointer shadow-xs"
                  >
                    Resolver Examen →
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-black text-slate-700 uppercase">¡Al día con tus exámenes!</p>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">No tienes tareas ni pruebas pendientes por responder.</p>
            </div>
          )}
        </div>

        {/* EARNED BADGES HIGHLIGHT */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-black text-slate-900 uppercase text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Insignias Obtenidas
            </h3>
            <button
              onClick={() => { sounds.playClick(); onNavigateSubject('badges'); }}
              className="text-xs font-black text-indigo-600 hover:underline"
            >
              Ver todas →
            </button>
          </div>

          {unlockedBadgesDetails.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {unlockedBadgesDetails.slice(0, 4).map((badge) => (
                <div
                  key={badge.id}
                  className="bg-amber-50/50 border border-amber-200 p-3 rounded-2xl flex flex-col items-center text-center gap-1.5"
                >
                  <span className="text-3xl">{badge.emoji}</span>
                  <h4 className="font-black text-xs text-amber-950 leading-tight">{badge.title}</h4>
                  <p className="text-[9px] text-amber-800/80 font-bold line-clamp-2">{badge.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-black text-slate-600 uppercase">¡Completa actividades!</p>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">Gana tus primeras medallas respondiendo ejercicios de Matemáticas y Lengua.</p>
            </div>
          )}
        </div>

        {/* NOTIFICATIONS & ANNOUNCEMENTS */}
        <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-black text-slate-900 uppercase text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-500" /> Notificaciones del Sistema
            </h3>
            <span className="bg-rose-100 text-rose-800 font-black text-xs px-2 py-0.5 rounded-full">
              Novedades
            </span>
          </div>

          <div className="space-y-3">
            {gradedSubmissions.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-start gap-2.5">
                <span className="text-xl">✍️</span>
                <div>
                  <h4 className="font-black text-xs text-emerald-950">¡Tienes notas publicadas!</h4>
                  <p className="text-[10px] font-bold text-emerald-800 mt-0.5">
                    Tu profesor ya ha calificado tus exámenes. Revisa la sección de Aula Virtual.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-2xl flex items-start gap-2.5">
              <span className="text-xl">🦉</span>
              <div>
                <h4 className="font-black text-xs text-yellow-950">Consejo de Sabihondo</h4>
                <p className="text-[10px] font-bold text-yellow-900 mt-0.5">
                  Practica todos los días 10 minutos de cálculo mental en Matemáticas Mágicas para subir de nivel rápidamente.
                </p>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-2xl flex items-start gap-2.5">
              <span className="text-xl">🎨</span>
              <div>
                <h4 className="font-black text-xs text-indigo-950">Nuevo Taller de Pintura</h4>
                <p className="text-[10px] font-bold text-indigo-900 mt-0.5">
                  Prueba el lienzo interactivo de Pintar y Dibujar con tus animalitos preferidos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-yellow-300 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-black text-slate-900 text-lg uppercase flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> Perfil del Estudiante
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow ${profile.avatarColor}`}>
                {profile.avatar === 'buho' ? '🦉' : profile.avatar === 'leon' ? '🦁' : profile.avatar === 'pand' ? '🐼' : profile.avatar === 'gato' ? '🐱' : profile.avatar === 'zorros' ? '🦊' : '🐧'}
              </div>
              <div>
                <h4 className="font-black text-base text-slate-900">{profile.name}</h4>
                <p className="text-xs font-bold text-slate-500 uppercase">Grado: {currentUser.grade || 'Primer Grado'}</p>
                <p className="text-xs font-black text-indigo-600 uppercase mt-0.5">Usuario: @{currentUser.username || 'estudiante'}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-bold text-slate-700">
              <div className="flex justify-between py-1.5 border-b border-dashed">
                <span>Puntos Totales acumulados:</span>
                <span className="font-black text-amber-600">{profile.points} XP</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-dashed">
                <span>Estrellas de Sabiduría:</span>
                <span className="font-black text-yellow-600">⭐ {profile.stars}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-dashed">
                <span>Nivel Alcanzado:</span>
                <span className="font-black text-indigo-600">Nivel {levelNumber} ({levelTitle})</span>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
            >
              Cerrar Perfil
            </button>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-black text-slate-900 text-lg uppercase flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" /> Configuración
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border">
                <div>
                  <p className="font-black text-xs text-slate-800 uppercase">Efectos de Sonido y Voz</p>
                  <p className="text-[10px] text-slate-500 font-bold">Activa o desactiva la voz parlante de Sabihondo</p>
                </div>
                <button
                  onClick={onToggleSound}
                  className={`p-3 rounded-2xl font-black text-xs flex items-center gap-2 cursor-pointer transition-all ${
                    soundOn ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {soundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
            >
              Guardar y Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
