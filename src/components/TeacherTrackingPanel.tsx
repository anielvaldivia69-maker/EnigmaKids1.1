/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserAccount, Quiz, QuizSubmission } from '../types';
import {
  Lock,
  Search,
  Award,
  Sparkles,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  TrendingUp,
  Brain,
  ShieldCheck,
  Calendar,
  Gamepad2,
  Star,
  Target,
  GraduationCap,
  Trophy
} from 'lucide-react';
import { sounds } from '../utils/sound';

const AVATARS = [
  { id: 'buho', emoji: '🦉', label: 'Búho Sabio' },
  { id: 'leon', emoji: '🦁', label: 'León Calculador' },
  { id: 'pand', emoji: '🐼', label: 'Panda' },
  { id: 'gato', emoji: '🐱', label: 'Gatito' },
  { id: 'zorros', emoji: '🦊', label: 'Zorrito' },
  { id: 'ping', emoji: '🐧', label: 'Pingüino' },
];

const BADGES = [
  { id: 'matematico_novato', title: 'Matemático Novato', icon: '🧮', description: 'Completó 5 problemas de suma' },
  { id: 'explorador_suma', title: 'Maestro de la Suma', icon: '➕', description: 'Alcanzó el Nivel 3 en Sumas' },
  { id: 'rey_resta', title: 'Rey de la Resta', icon: '➖', description: 'Dominio perfecto en operaciones de Resta' },
  { id: 'estrella_multiplicacion', title: 'Estrella de Multiplicar', icon: '✖️', description: 'Completó la tabla del 5 sin errores' },
  { id: 'sabio_division', title: 'Especialista en División', icon: '➗', description: 'Superó los retos de división en Tercer Grado' },
  { id: 'campeon_semanal', title: 'Campeón Enigmakids', icon: '🏆', description: 'Obtuvo el puntaje más alto del aula virtual' },
];

interface TeacherTrackingPanelProps {
  students: UserAccount[];
  quizzes: Quiz[];
  submissions: QuizSubmission[];
  selectedStudentId?: string | null;
  onSelectStudent?: (id: string) => void;
}

export const TeacherTrackingPanel: React.FC<TeacherTrackingPanelProps> = ({
  students,
  quizzes,
  submissions,
  selectedStudentId: externalSelectedId,
  onSelectStudent,
}) => {
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    students.length > 0 ? students[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const activeStudentId = externalSelectedId || internalSelectedId || (students.length > 0 ? students[0].id : null);

  const handleSelect = (id: string) => {
    sounds.playClick();
    setInternalSelectedId(id);
    if (onSelectStudent) onSelectStudent(id);
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.grade && s.grade.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const currentStudent = students.find(s => s.id === activeStudentId);

  // Derive academic statistics for active student
  const studentSubmissions = submissions.filter(s => s.studentId === activeStudentId);
  const studentQuizzesAssigned = quizzes.filter(
    q => q.assignedTo.includes('all') || q.assignedTo.includes(activeStudentId || '')
  );

  // Grade averages
  const gradedSubs = studentSubmissions.filter(s => s.isGraded || s.score !== undefined);
  const totalScoreSum = gradedSubs.reduce((acc, curr) => acc + (curr.score || 70), 0);
  const avgScorePct = gradedSubs.length > 0 ? Math.round(totalScoreSum / gradedSubs.length) : null;
  const avgScoreGrade = avgScorePct !== null ? (Math.round((avgScorePct / 10) * 10) / 10) : 'Sin notas';

  // Math level calculations
  const mathSuma = currentStudent?.mathLevels?.suma || 1;
  const mathResta = currentStudent?.mathLevels?.resta || 1;
  const mathMult = currentStudent?.mathLevels?.multiplicacion || 1;
  const mathDiv = currentStudent?.mathLevels?.division || 1;
  const totalMathLevelsSum = mathSuma + mathResta + mathMult + mathDiv;

  // General calculated progress percentage (0 - 100%)
  const xpPoints = currentStudent?.points || 0;
  const badgesUnlockedCount = currentStudent?.unlockedBadges?.length || 0;
  const calculatedProgress = Math.min(
    100,
    Math.round(((xpPoints / 300) * 40) + ((totalMathLevelsSum / 20) * 30) + ((studentSubmissions.length / Math.max(1, studentQuizzesAssigned.length)) * 30))
  );

  // Estimated study time in minutes
  const estimatedStudyTime = currentStudent?.studyTimeMinutes || Math.round((xpPoints * 0.4) + (studentSubmissions.length * 12) + 25);

  // Last Connection mock or recorded date
  const lastActiveDate = currentStudent?.lastConnection || 'Hoy hace 15 minutos';

  // Dynamic Strengths & Areas for Improvement
  const strengths: string[] = [];
  const areasForImprovement: string[] = [];

  if (mathSuma >= 2 && mathResta >= 2) {
    strengths.push('Excelente velocidad y precisión en sumas y restas básicas.');
  }
  if (mathMult >= 2 || mathDiv >= 2) {
    strengths.push('Gran comprensión de la multiplicación y división inicial.');
  }
  if (xpPoints >= 150) {
    strengths.push('Constancia ejemplar y acumulación destacada de experiencia (XP).');
  }
  if (badgesUnlockedCount >= 2) {
    strengths.push(`Ha desbloqueado ${badgesUnlockedCount} insignias de excelencia.`);
  }
  if (avgScorePct !== null && avgScorePct >= 80) {
    strengths.push('Promedio de calificaciones sobresaliente en evaluaciones de clase.');
  }
  if (strengths.length === 0) {
    strengths.push('Entusiasmo positivo por aprender e interactuar en las aulas.');
  }

  if (mathMult === 1 && currentStudent?.grade !== 'Primer Grado') {
    areasForImprovement.push('Reforzar las tablas de multiplicar y ejercicios de repetición.');
  }
  if (mathDiv === 1 && currentStudent?.grade !== 'Primer Grado') {
    areasForImprovement.push('Practicar reparto equitativo e iniciación a la división.');
  }
  if (studentSubmissions.length < studentQuizzesAssigned.length) {
    areasForImprovement.push('Completar evaluaciones pendientes asignadas por el profesor.');
  }
  if (avgScorePct !== null && avgScorePct < 70) {
    areasForImprovement.push('Repasar conceptos previos antes de realizar nuevos exámenes.');
  }
  if (areasForImprovement.length === 0) {
    areasForImprovement.push('Mantener el buen ritmo de estudio y explorar desafíos más avanzados.');
  }

  return (
    <div className="space-y-8">
      {/* Read-Only Enforced Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex items-center justify-between gap-3 text-amber-950 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs md:text-sm uppercase tracking-wide flex items-center gap-1.5">
              <span>🔒 Modo de Solo Lectura Activo</span>
              <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-black">
                Protección Pedagógica
              </span>
            </h3>
            <p className="text-[11px] text-amber-800 font-medium mt-0.5">
              Toda la información académica, nivel de matemáticas, XP, insignias y progreso son generados automáticamente por la plataforma EnigmaKids. El profesor no puede alterar estas métricas manualmente.
            </p>
          </div>
        </div>

        <div className="shrink-0 hidden md:flex items-center gap-1 text-xs font-black bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Datos Integrófilos</span>
        </div>
      </div>

      {/* Main Container: Student Selector Sidebar + Detailed Read-Only File */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Students Selection Roster */}
        <div className="bg-white border-2 border-slate-100 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Lista de Alumnos ({students.length})</span>
            </h3>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar estudiante o grado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-bold border rounded-xl bg-slate-50 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Student Cards List */}
          {filteredStudents.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredStudents.map(student => {
                const isSelected = student.id === activeStudentId;
                const avInfo = AVATARS.find(a => a.id === student.avatar);

                return (
                  <div
                    key={student.id}
                    onClick={() => handleSelect(student.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-4 ring-indigo-500/10'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 ${student.avatarColor}`}>
                        {avInfo?.emoji || '🦁'}
                      </span>
                      <div>
                        <h4 className="font-black text-xs leading-tight">{student.name}</h4>
                        <span className={`text-[10px] font-extrabold block ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {student.grade || 'Sin Grado'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {student.points || 0} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-6 text-center">No se encontraron estudiantes.</p>
          )}
        </div>

        {/* Right Column: Complete Read-Only Academic File */}
        {currentStudent ? (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Student Header Card */}
            <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-100/60 border-2 border-indigo-200 p-6 rounded-3xl shadow-sm relative overflow-hidden space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                <div className="flex items-center gap-4">
                  <span className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-md border-2 border-white ${currentStudent.avatarColor}`}>
                    {AVATARS.find(a => a.id === currentStudent.avatar)?.emoji || '🐼'}
                  </span>
                  <div>
                    <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      {currentStudent.grade || 'Primer Grado'}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-1">{currentStudent.name}</h2>
                    <p className="text-xs text-slate-500 font-extrabold flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Última conexión: <strong className="text-slate-700">{lastActiveDate}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <div className="bg-white p-3 rounded-2xl border text-center min-w-[90px]">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Puntos XP</span>
                    <span className="text-lg font-black text-emerald-600">{currentStudent.points || 0}</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border text-center min-w-[90px]">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Estrellas</span>
                    <span className="text-lg font-black text-amber-500">⭐ {currentStudent.stars || 0}</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border text-center min-w-[90px]">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Promedio</span>
                    <span className="text-lg font-black text-indigo-600">{avgScoreGrade}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar & Time metrics */}
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-2xl border">
                  <div className="flex justify-between items-center text-xs font-black text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1">
                      <BarChart2 className="w-4 h-4 text-indigo-600" />
                      Progreso General del Año:
                    </span>
                    <span className="text-indigo-600">{calculatedProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${calculatedProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    Calculado en base a ejercicios, exámenes e insignias
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Tiempo Estimado de Estudio</span>
                    <p className="text-xl font-black text-slate-800">{estimatedStudyTime} <span className="text-xs text-slate-500">minutos</span></p>
                    <span className="text-[10px] text-emerald-600 font-bold">Actividad registrada en la plataforma</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </div>

            </div>

            {/* Academic Levels in Math & Subjects */}
            <div className="bg-white border-2 border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase flex items-center gap-2 border-b pb-3">
                <Brain className="w-5 h-5 text-indigo-600" />
                <span>Dominio Académico en "🧮 Matemáticas Mágicas"</span>
              </h3>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-black uppercase">Suma</span>
                  <p className="text-lg font-black text-indigo-700">Nivel {mathSuma}</p>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full inline-block">
                    {mathSuma > 1 ? 'Avanzado' : 'Iniciación'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-black uppercase">Resta</span>
                  <p className="text-lg font-black text-indigo-700">Nivel {mathResta}</p>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full inline-block">
                    {mathResta > 1 ? 'Avanzado' : 'Iniciación'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-black uppercase">Multiplicación</span>
                  <p className="text-lg font-black text-indigo-700">
                    {currentStudent.grade === 'Primer Grado' ? 'N/A (Bloqueado)' : `Nivel ${mathMult}`}
                  </p>
                  <span className="text-[9px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full inline-block">
                    {currentStudent.grade === 'Primer Grado' ? 'Para 2º Grado' : (mathMult > 1 ? 'En progreso' : 'Inicial')}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-black uppercase">División</span>
                  <p className="text-lg font-black text-indigo-700">
                    {currentStudent.grade === 'Primer Grado' ? 'N/A (Bloqueado)' : `Nivel ${mathDiv}`}
                  </p>
                  <span className="text-[9px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full inline-block">
                    {currentStudent.grade === 'Primer Grado' ? 'Para 2º Grado' : (mathDiv > 1 ? 'En progreso' : 'Inicial')}
                  </span>
                </div>
              </div>
            </div>

            {/* Strengths & Improvement Areas Card */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-emerald-50/70 border-2 border-emerald-200 p-5 rounded-3xl space-y-3">
                <h4 className="font-extrabold text-emerald-950 text-xs uppercase flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Fortalezas Académicas Destacadas</span>
                </h4>
                <ul className="space-y-2">
                  {strengths.map((str, i) => (
                    <li key={i} className="text-xs text-emerald-900 font-bold flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-amber-50/70 border-2 border-amber-200 p-5 rounded-3xl space-y-3">
                <h4 className="font-extrabold text-amber-950 text-xs uppercase flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-600" />
                  <span>Áreas de Mejora y Refuerzo</span>
                </h4>
                <ul className="space-y-2">
                  {areasForImprovement.map((area, i) => (
                    <li key={i} className="text-xs text-amber-900 font-bold flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Unlocked Badges */}
            <div className="bg-white border-2 border-slate-100 p-6 rounded-3xl shadow-sm space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase flex items-center gap-2 border-b pb-3">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Insignias y Medallas Obtenidas ({badgesUnlockedCount})</span>
              </h3>

              {currentStudent.unlockedBadges && currentStudent.unlockedBadges.length > 0 ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {currentStudent.unlockedBadges.map(badgeId => {
                    const badgeObj = BADGES.find(b => b.id === badgeId);
                    if (!badgeObj) return null;

                    return (
                      <div key={badgeId} className="p-3 bg-slate-50 border rounded-2xl flex items-center gap-3">
                        <span className="text-2xl">{badgeObj.icon}</span>
                        <div>
                          <h5 className="font-extrabold text-xs text-slate-800">{badgeObj.title}</h5>
                          <p className="text-[9px] text-slate-400 font-bold">{badgeObj.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  El alumno aún no ha desbloqueado insignias. Continuar completando lecciones para obtenerlas.
                </p>
              )}
            </div>

            {/* Exam & Submission History */}
            <div className="bg-white border-2 border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm uppercase flex items-center gap-2 border-b pb-3">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Historial de Evaluaciones y Exámenes ({studentSubmissions.length})</span>
              </h3>

              {studentSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {studentSubmissions.map(sub => {
                    const quizInfo = quizzes.find(q => q.id === sub.quizId);

                    return (
                      <div key={sub.id} className="p-4 rounded-2xl border bg-slate-50/70 space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="font-extrabold text-xs text-slate-800">{quizInfo?.title || 'Examen Asignado'}</h4>
                            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                              Entregado el: {new Date(sub.submittedAt).toLocaleDateString('es-ES', { dateStyle: 'long' })}
                            </span>
                          </div>

                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                            sub.isGraded ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {sub.isGraded ? `Nota: ${sub.grade || 'Calificado'}` : 'Pendiente de Calificar'}
                          </span>
                        </div>

                        {sub.teacherFeedback && (
                          <div className="bg-white p-2.5 rounded-xl border text-xs text-slate-700 italic">
                            " {sub.teacherFeedback} "
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  Este estudiante no ha realizado entregas de exámenes por el momento.
                </p>
              )}
            </div>

          </div>
        ) : (
          <p className="text-center text-slate-400 py-12 lg:col-span-2">
            Selecciona un estudiante de la lista de la izquierda para visualizar su expediente académico.
          </p>
        )}

      </div>
    </div>
  );
};
