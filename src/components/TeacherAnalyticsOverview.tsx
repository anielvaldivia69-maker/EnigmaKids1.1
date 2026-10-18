/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserAccount, Quiz, QuizSubmission } from '../types';
import {
  Trophy,
  AlertTriangle,
  FileCheck,
  Clock,
  BarChart3,
  Users,
  GraduationCap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Award,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { sounds } from '../utils/sound';

interface TeacherAnalyticsOverviewProps {
  students: UserAccount[];
  quizzes: Quiz[];
  submissions: QuizSubmission[];
  onNavigateToGrading: () => void;
  onNavigateToTracking: (studentId: string) => void;
}

export const TeacherAnalyticsOverview: React.FC<TeacherAnalyticsOverviewProps> = ({
  students,
  quizzes,
  submissions,
  onNavigateToGrading,
  onNavigateToTracking,
}) => {
  // Helper to calculate student average score (0-10)
  const getStudentAverage = (studentId: string): number | null => {
    const studentSubs = submissions.filter(s => s.studentId === studentId && (s.isGraded || s.score !== undefined));
    if (studentSubs.length === 0) return null;
    
    const sum = studentSubs.reduce((acc, curr) => {
      // Score is 0-100
      return acc + (curr.score || 70);
    }, 0);
    return Math.round((sum / studentSubs.length) / 10 * 10) / 10;
  };

  // Group calculations
  const studentsWithGrades = students.map(s => ({
    student: s,
    avg: getStudentAverage(s.id),
    submissionsCount: submissions.filter(sub => sub.studentId === s.id).length
  }));

  const validGrades = studentsWithGrades.filter(s => s.avg !== null).map(s => s.avg as number);
  const classAverage = validGrades.length > 0 
    ? Math.round((validGrades.reduce((a, b) => a + b, 0) / validGrades.length) * 10) / 10 
    : 8.5;

  // Rankings
  const topStudents = [...studentsWithGrades]
    .sort((a, b) => (b.avg ?? (b.student.points || 0) / 50) - (a.avg ?? (a.student.points || 0) / 50))
    .slice(0, 3);

  const studentsNeedingSupport = [...studentsWithGrades]
    .filter(s => (s.avg !== null && s.avg < 7.5) || s.submissionsCount === 0 || (s.student.points || 0) < 100)
    .slice(0, 3);

  const pendingSubmissions = submissions.filter(s => !s.isGraded);
  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Banner & Overview Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-lg border-2 border-indigo-700 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-wrap justify-between items-center gap-6">
          <div>
            <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
              🟢 Monitoreo en Tiempo Real del Aula
            </span>
            <h2 className="text-2xl md:text-3xl font-black mt-2 tracking-tight">
              Estadísticas y Estado General del Grupo 📊
            </h2>
            <p className="text-xs md:text-sm text-indigo-200 font-medium max-w-2xl mt-1 leading-relaxed">
              Resumen consolidado del desempeño académico, estudiantes destacados, entregas pendientes y alertas tempranas de apoyo.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl font-black shadow">
              🏆
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-200 block">Promedio del Grupo</span>
              <p className="text-2xl font-black text-amber-300 leading-none mt-0.5">{classAverage} <span className="text-xs text-white/80">/ 10</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-slate-100 p-5 rounded-3xl shadow-sm hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-slate-400">Total Alumnos</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{students.length}</p>
          <span className="text-[10px] font-bold text-slate-400 block mt-1">Registrados en el grupo</span>
        </div>

        <div className="bg-white border-2 border-slate-100 p-5 rounded-3xl shadow-sm hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-slate-400">Promedio XP</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">
            {students.length > 0
              ? Math.round(students.reduce((acc, curr) => acc + (curr.points || 0), 0) / students.length)
              : 0} XP
          </p>
          <span className="text-[10px] font-bold text-slate-400 block mt-1">Experiencia media acumulada</span>
        </div>

        <div className="bg-white border-2 border-slate-100 p-5 rounded-3xl shadow-sm hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-slate-400">Por Revisar</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">{pendingSubmissions.length}</p>
          <button
            onClick={() => { sounds.playClick(); onNavigateToGrading(); }}
            className="text-[10px] font-black text-indigo-600 hover:underline block mt-1"
          >
            Ir a Corregir →
          </button>
        </div>

        <div className="bg-white border-2 border-slate-100 p-5 rounded-3xl shadow-sm hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase text-slate-400">Pruebas Activas</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600">{quizzes.length}</p>
          <span className="text-[10px] font-bold text-slate-400 block mt-1">Evaluaciones en el aula</span>
        </div>
      </div>

      {/* Main Grid: Top Performers & Support Needed */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Top Performing Students */}
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                🌟
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase">Estudiantes con Mejor Rendimiento</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Líderes en progreso académico y experiencia</p>
              </div>
            </div>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2.5 py-1 rounded-full">
              Top 3
            </span>
          </div>

          {topStudents.length > 0 ? (
            <div className="space-y-3">
              {topStudents.map(({ student, avg }, idx) => (
                <div
                  key={student.id}
                  onClick={() => { sounds.playClick(); onNavigateToTracking(student.id); }}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/30 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center shadow-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">{student.name}</h4>
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase">
                        {student.grade || 'Grado Escolar'} • {student.points || 0} XP acumulados
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="bg-emerald-100 text-emerald-800 font-black text-xs px-2.5 py-1 rounded-full">
                      {avg !== null ? `${avg} / 10` : 'Excelente'} ⭐
                    </span>
                    <span className="text-[9px] text-indigo-600 font-black block mt-1 hover:underline">Ver Expediente →</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-6">Aún no hay suficientes alumnos para listar.</p>
          )}
        </div>

        {/* Students Needing Support */}
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                🌱
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm uppercase">Estudiantes que Necesitan Apoyo</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Requieren seguimiento cercano o refuerzo de actividades</p>
              </div>
            </div>
            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black px-2.5 py-1 rounded-full">
              Refuerzo
            </span>
          </div>

          {studentsNeedingSupport.length > 0 ? (
            <div className="space-y-3">
              {studentsNeedingSupport.map(({ student, avg }) => (
                <div
                  key={student.id}
                  onClick={() => { sounds.playClick(); onNavigateToTracking(student.id); }}
                  className="p-4 rounded-2xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50/70 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-rose-200 text-rose-800 font-black text-sm flex items-center justify-center">
                      ❤️
                    </span>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">{student.name}</h4>
                      <p className="text-[10px] text-rose-700 font-extrabold uppercase">
                        Sugerencia: Asignar prácticas de refuerzo guiadas
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="bg-rose-100 text-rose-800 font-black text-xs px-2.5 py-1 rounded-full">
                      {avg !== null ? `${avg} / 10` : 'Poco avance'}
                    </span>
                    <span className="text-[9px] text-indigo-600 font-black block mt-1 hover:underline">Ver Expediente →</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs font-black text-emerald-800">¡Excelente noticia!</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Todos los estudiantes registran un progreso óptimo.</p>
            </div>
          )}
        </div>

      </div>

      {/* Recent Submissions Feed */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm uppercase">Últimos Exámenes Entregados</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Historial reciente de respuestas enviadas por el alumnado</p>
            </div>
          </div>

          <button
            onClick={() => { sounds.playClick(); onNavigateToGrading(); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow transition-all uppercase"
          >
            Ver Todas las Entregas →
          </button>
        </div>

        {recentSubmissions.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSubmissions.map(sub => {
              const student = students.find(s => s.id === sub.studentId);
              const quiz = quizzes.find(q => q.id === sub.quizId);

              return (
                <div key={sub.id} className="p-4 rounded-2xl border border-slate-150 bg-slate-50/60 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-800 text-xs">{student?.name || 'Estudiante'}</span>
                    <span className={`text-[9px] font-black rounded-full px-2 py-0.5 uppercase ${
                      sub.isGraded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900 animate-pulse'
                    }`}>
                      {sub.isGraded ? 'Calificado' : 'Pendiente'}
                    </span>
                  </div>

                  <p className="text-xs text-indigo-900 font-bold truncate">{quiz?.title || 'Evaluación'}</p>
                  
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold pt-2 border-t border-dashed">
                    <span>Score auto: {sub.score}%</span>
                    <span>{new Date(sub.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-6">Aún no se han recibido exámenes entregados.</p>
        )}
      </div>
    </div>
  );
};
