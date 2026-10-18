/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserAccount, Quiz, QuizSubmission } from '../types';
import { sounds } from '../utils/sound';
import {
  Users,
  BookOpen,
  FileText,
  BarChart3,
  CheckCircle2,
  Clock,
  Bell,
  Plus,
  Sparkles,
  Search,
  Settings,
  User,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  GraduationCap,
  DoorOpen
} from 'lucide-react';
import { motion } from 'motion/react';

interface TeacherHomeProps {
  currentUser: UserAccount;
  students: UserAccount[];
  quizzes: Quiz[];
  submissions: QuizSubmission[];
  onNavigateTab: (tab: 'overview' | 'tracking' | 'roster' | 'exams' | 'grading' | 'virtual-rooms' | 'attendance') => void;
}

export const TeacherHome: React.FC<TeacherHomeProps> = ({
  currentUser,
  students,
  quizzes,
  submissions,
  onNavigateTab,
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Check if a student was registered by this specific teacher
  const isStudentRegisteredByTeacher = (studentId: string): boolean => {
    const testAccounts = ['std-hugo', 'std-sofi', 'std-mateo'];
    if (testAccounts.includes(studentId)) return false;

    const std = students.find((s) => s.id === studentId);
    if (std && (std.teacherId === currentUser.id || std.registeredByTeacherId === currentUser.id || std.registeredBy === currentUser.id)) {
      return true;
    }
    try {
      const stored = localStorage.getItem(`enigmakids_teacher_students_${currentUser.id}`);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        if (ids.includes(studentId)) return true;
      }
    } catch {
      // ignore
    }
    return false;
  };

  // Calculated metrics - strictly for students registered by this teacher
  const relevantSubmissions = submissions.filter((s) => isStudentRegisteredByTeacher(s.studentId));
  const pendingSubmissions = relevantSubmissions.filter((s) => !s.isGraded);
  const gradedSubmissions = relevantSubmissions.filter((s) => s.isGraded);
  
  const totalStudentXp = students.reduce((acc, std) => acc + (std.points || 0), 0);
  const avgStudentXp = students.length > 0 ? Math.round(totalStudentXp / students.length) : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* WELCOME HERO HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-4 border-indigo-200 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-indigo-100/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-md shrink-0">
              👩‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-900 text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Panel Principal de Control
                </span>
                <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                  Ciclo Escolar Activo
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
                ¡Bienvenido, <span className="text-indigo-600">Profesor</span>! 👋
              </h2>
              <p className="text-xs font-extrabold text-slate-500 mt-0.5">
                Resumen ejecutivo del estado de tus aulas, alumnos y evaluaciones asignadas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                sounds.playClick();
                onNavigateTab('grading');
              }}
              className="flex-1 md:flex-none bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-5 py-3 rounded-2xl shadow border-b-4 border-rose-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Calificar Tareas ({pendingSubmissions.length})</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onNavigateTab('virtual-rooms');
              }}
              className="flex-1 md:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs px-5 py-3 rounded-2xl shadow border-b-4 border-indigo-900 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <DoorOpen className="w-4 h-4" />
              <span>Salas Virtuales (Códigos) 🏫</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onNavigateTab('exams');
              }}
              className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-3 rounded-2xl shadow border-b-4 border-indigo-800 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Examen</span>
            </button>
          </div>
        </div>

        {/* METRICS SUMMARY CARDS */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-indigo-50/70 border border-indigo-150 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-indigo-700 font-black uppercase">Estudiantes Asignados</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-indigo-950">{students.length} alumnos</p>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5">En tus 3 grados activos</p>
          </div>

          <div className="bg-amber-50/70 border border-amber-150 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-amber-700 font-black uppercase">Cursos Impartidos</span>
              <BookOpen className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-950">3 Materias</p>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5">Mate, Lengua y Ciencias</p>
          </div>

          <div className="bg-rose-50/70 border border-rose-150 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-rose-700 font-black uppercase">Pendientes por Revisar</span>
              <Clock className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-950">{pendingSubmissions.length} entregas</p>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5">Requieren calificación</p>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-150 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-emerald-700 font-black uppercase">Exámenes Publicados</span>
              <GraduationCap className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-950">{quizzes.length} evaluaciones</p>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5">Asignadas a los estudiantes</p>
          </div>
        </div>
      </motion.div>

      {/* QUICK ACCESS BUTTONS BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
          ⚡ Accesos Rápidos
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => { sounds.playClick(); onNavigateTab('exams'); }}
            className="p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-102 active:scale-95"
          >
            <span className="text-xl">📚</span>
            <span>Gestionar Cursos</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onNavigateTab('roster'); }}
            className="p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-102 active:scale-95"
          >
            <span className="text-xl">👥</span>
            <span>Ver Estudiantes</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onNavigateTab('grading'); }}
            className="p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-102 active:scale-95"
          >
            <span className="text-xl">✍️</span>
            <span>Revisar Tareas</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); onNavigateTab('overview'); }}
            className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-102 active:scale-95"
          >
            <span className="text-xl">📊</span>
            <span>Consultar Reportes</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setShowProfileModal(true); }}
            className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-102 active:scale-95"
          >
            <span className="text-xl">👤</span>
            <span>Perfil</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setShowSettingsModal(true); }}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-2xl font-black text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-102 active:scale-95"
          >
            <span className="text-xl">⚙️</span>
            <span>Configuración</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD CONTENT GRID */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* PENDING SUBMISSIONS FOR REVIEW */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h3 className="font-black text-slate-900 uppercase text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" /> Tareas y Exámenes Pendientes de Calificar
              </h3>
              <p className="text-xs text-slate-400 font-bold">Entregas enviadas por tus alumnos que aguardan nota y feedback</p>
            </div>

            <button
              onClick={() => { sounds.playClick(); onNavigateTab('grading'); }}
              className="text-xs font-black text-indigo-600 hover:underline shrink-0"
            >
              Ver todas ({pendingSubmissions.length}) →
            </button>
          </div>

          {pendingSubmissions.length > 0 ? (
            <div className="space-y-3">
              {pendingSubmissions.slice(0, 4).map((sub) => {
                const std = students.find((s) => s.id === sub.studentId);
                const quiz = quizzes.find((q) => q.id === sub.quizId);

                return (
                  <div
                    key={sub.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-black text-lg">
                        🎒
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">
                          {std ? std.name : 'Estudiante'}
                        </h4>
                        <p className="text-xs font-bold text-slate-500">
                          Examen: <span className="text-indigo-600 font-extrabold">{quiz ? quiz.title : 'Evaluación'}</span>
                        </p>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          Entregado: {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        onNavigateTab('grading');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Calificar Examen ✍️
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-black text-slate-700 text-sm uppercase">¡No hay entregas pendientes!</p>
              <p className="text-xs text-slate-400 font-bold mt-1">Todos los exámenes entregados han sido revisados y publicados.</p>
            </div>
          )}
        </div>

        {/* STATS & NOTIFICATIONS SIDEBAR */}
        <div className="space-y-6">
          {/* GENERAL STATS CARD */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider flex items-center gap-2 pb-2 border-b">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Estadísticas Generales
            </h3>

            <div className="space-y-2.5 text-xs font-bold text-slate-700">
              <div className="flex justify-between py-1 border-b border-dashed">
                <span>Promedio Experiencia Alumnos:</span>
                <span className="font-black text-amber-600">{avgStudentXp} XP</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span>Total Entregas Revisadas:</span>
                <span className="font-black text-emerald-600">{gradedSubmissions.length} exámenes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-dashed">
                <span>Evaluaciones Activas:</span>
                <span className="font-black text-indigo-600">{quizzes.length} publicadas</span>
              </div>
            </div>

            <button
              onClick={() => { sounds.playClick(); onNavigateTab('overview'); }}
              className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs uppercase rounded-xl transition-all text-center cursor-pointer block"
            >
              Ver Informe Completo →
            </button>
          </div>

          {/* LATEST NOTIFICATIONS */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-wider flex items-center gap-2 pb-2 border-b">
              <Bell className="w-4 h-4 text-rose-500" /> Últimas Notificaciones
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 bg-indigo-50/70 border border-indigo-150 rounded-2xl flex items-start gap-2.5 text-xs">
                <span className="text-base">📢</span>
                <div>
                  <p className="font-black text-indigo-950">Sistema Enigmakids Activo</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                    Todas las funciones del panel están sincronizadas con las sesiones de los alumnos.
                  </p>
                </div>
              </div>

              {submissions.length > 0 && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-150 rounded-2xl flex items-start gap-2.5 text-xs">
                  <span className="text-base">🎒</span>
                  <div>
                    <p className="font-black text-emerald-950">Nuevas Entregas Recibidas</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                      Has recibido un total de {submissions.length} entregas de exámenes en el aula.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-4 border-indigo-300 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="font-black text-slate-900 text-lg uppercase flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> Perfil del Docente
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-2xl border border-indigo-150">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow">
                👩‍🏫
              </div>
              <div>
                <h4 className="font-black text-base text-slate-900">{currentUser.name.replace('Profe Sabiondo', 'Profesor')}</h4>
                <p className="text-xs font-bold text-slate-500 uppercase">Rol: Profesor / Docente</p>
                <p className="text-xs font-black text-indigo-600 uppercase mt-0.5">Usuario: @{currentUser.username || 'profesor'}</p>
              </div>
            </div>

            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase rounded-xl transition-all cursor-pointer"
            >
              Cerrar
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
                <Settings className="w-5 h-5 text-indigo-600" /> Configuración Docente
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-black text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border space-y-2">
              <p className="font-black text-xs text-slate-800 uppercase">Ajustes de Panel</p>
              <p className="text-xs text-slate-500 font-bold">
                Las configuraciones de tus aulas y estudiantes se guardan localmente de forma automática.
              </p>
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
