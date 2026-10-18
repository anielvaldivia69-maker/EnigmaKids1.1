/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { UserAccount, Quiz, QuizSubmission, AttendanceRecord, AuditLog } from '../types';
import { sounds } from '../utils/sound';
import {
  Users,
  Plus,
  Trash,
  CheckCircle2,
  XCircle,
  FileText,
  Volume2,
  Sparkles,
  Trophy,
  GraduationCap,
  Check,
  AlertCircle,
  Clock,
  UserCheck,
  UserMinus,
  ArrowRight,
  BookOpen,
  BarChart3,
  Search,
  Calendar,
  Send,
  Lock,
  Award,
  DoorOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TeacherAnalyticsOverview } from './TeacherAnalyticsOverview';
import { TeacherTrackingPanel } from './TeacherTrackingPanel';
import { TeacherHome } from './TeacherHome';
import { TeacherVirtualRooms } from './TeacherVirtualRooms';

interface TeacherDashboardProps {
  currentUser: UserAccount;
  onLogout: () => void;
}

interface FormQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  isOpenQuestion?: boolean;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ currentUser, onLogout }) => {
  const [students, setStudents] = useState<UserAccount[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<'home' | 'overview' | 'tracking' | 'roster' | 'exams' | 'grading' | 'attendance' | 'virtual-rooms'>('home');
  const [selectedStudentForTracking, setSelectedStudentForTracking] = useState<string | null>(null);

  // Attendance Submission State
  const [attendanceGrade, setAttendanceGrade] = useState<'Primer Grado' | 'Segundo Grado' | 'Tercer Grado'>('Primer Grado');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState<{ [studentId: string]: boolean }>({});
  const [attendanceSentMsg, setAttendanceSentMsg] = useState<string>('');

  // New Student registration inside dashboard
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentUsername, setNewStudentUsername] = useState<string>('');
  const [newStudentPassword, setNewStudentPassword] = useState<string>('123');
  const [newStudentGrade, setNewStudentGrade] = useState<'Primer Grado' | 'Segundo Grado' | 'Tercer Grado'>('Primer Grado');
  const [newStudentAvatar, setNewStudentAvatar] = useState<string>('pand');
  const [newStudentColor, setNewStudentColor] = useState<string>('bg-emerald-400');

  // Exam assignment manager active quiz selection
  const [selectedQuizIdForManage, setSelectedQuizIdForManage] = useState<string>('');

  // New Quiz form fields
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizSubject, setQuizSubject] = useState<'math' | 'language' | 'science'>('math');
  const [quizDueDate, setQuizDueDate] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<FormQuestion[]>([
    { question: '', options: ['', '', ''], correctAnswer: '' }
  ]);
  const [assignedStudentId, setAssignedStudentId] = useState<string>('all');

  // Grading Center
  const [gradingSubmission, setGradingSubmission] = useState<QuizSubmission | null>(null);
  const [gradeValue, setGradeValue] = useState<string>('10 / 10 (Excelente) ⭐');
  const [feedbackText, setFeedbackText] = useState<string>('');

  const AVATARS = [
    { id: 'buho', emoji: '🦉', label: 'Búho Sabio' },
    { id: 'leon', emoji: '🦁', label: 'León Calculador' },
    { id: 'pand', emoji: '🐼', label: 'Panda' },
    { id: 'gato', emoji: '🐱', label: 'Gatito' },
    { id: 'zorros', emoji: '🦊', label: 'Zorrito' },
    { id: 'ping', emoji: '🐧', label: 'Pingüino' },
  ];

  const COLORS = [
    { class: 'bg-emerald-400 border-emerald-500 text-white', label: 'Verde' },
    { class: 'bg-sky-400 border-sky-500 text-white', label: 'Azul' },
    { class: 'bg-yellow-400 border-yellow-500 text-slate-800', label: 'Amarillo' },
    { class: 'bg-rose-400 border-rose-500 text-white', label: 'Rojo' },
    { class: 'bg-purple-400 border-purple-500 text-white', label: 'Morado' },
  ];

  // Load state on mount
  useEffect(() => {
    // 1. Students
    const rawUsers = localStorage.getItem('enigmakids_registered_users');
    let allUsers: UserAccount[] = [];
    if (rawUsers) {
      allUsers = JSON.parse(rawUsers);
    }
    const filteredStudents = allUsers.filter(u => u.role === 'student');
    setStudents(filteredStudents);

    // 2. Quizzes
    const storedQuizzes = localStorage.getItem('enigmakids_school_quizzes');
    if (storedQuizzes) {
      const qList = JSON.parse(storedQuizzes);
      setQuizzes(qList);
      if (qList.length > 0) {
        setSelectedQuizIdForManage(qList[0].id);
      }
    } else {
      const initialQuiz: Quiz = {
        id: 'quiz-init-math',
        title: 'Prueba Básica de Operaciones ➕',
        subject: 'math',
        teacherId: currentUser.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        questions: [
          { id: 'q1', question: '¿Cuánto es 4 × 5?', options: ['15', '20', '25'], correctAnswer: '20' },
          { id: 'q2', question: '¿Cuál es la resta de 15 - 6?', options: ['9', '8', '7'], correctAnswer: '9' }
        ],
        assignedTo: ['all'],
        createdAt: new Date().toISOString()
      };
      setQuizzes([initialQuiz]);
      setSelectedQuizIdForManage(initialQuiz.id);
      localStorage.setItem('enigmakids_school_quizzes', JSON.stringify([initialQuiz]));
    }

    // 3. Submissions
    const storedSubmissions = localStorage.getItem('enigmakids_school_submissions');
    if (storedSubmissions) {
      setSubmissions(JSON.parse(storedSubmissions));
    }
  }, [currentUser]);

  // Sync methods
  const saveAllUsersToStorage = (updatedStudents: UserAccount[]) => {
    const rawUsers = localStorage.getItem('enigmakids_registered_users');
    let allUsers: UserAccount[] = [];
    if (rawUsers) {
      allUsers = JSON.parse(rawUsers);
    }
    const teachers = allUsers.filter(u => u.role === 'teacher');
    const merged = [...teachers, ...updatedStudents];
    
    localStorage.setItem('enigmakids_registered_users', JSON.stringify(merged));
    localStorage.setItem('enigmakids_school_students', JSON.stringify(updatedStudents));
    setStudents(updatedStudents);
  };

  const saveQuizzesToStorage = (updatedQuizzes: Quiz[]) => {
    localStorage.setItem('enigmakids_school_quizzes', JSON.stringify(updatedQuizzes));
    setQuizzes(updatedQuizzes);
  };

  const saveSubmissionsToStorage = (updatedSubmissions: QuizSubmission[]) => {
    localStorage.setItem('enigmakids_school_submissions', JSON.stringify(updatedSubmissions));
    setSubmissions(updatedSubmissions);
  };

  // --- TEACHER'S REGISTERED STUDENTS FILTER (for tasks and exams grading) ---
  const isStudentRegisteredByTeacher = (studentId: string): boolean => {
    // Test accounts from bootstrap are NEVER considered registered by new teachers
    const testAccountIds = ['std-hugo', 'std-sofi', 'std-mateo'];
    if (testAccountIds.includes(studentId)) {
      return false;
    }

    const std = students.find((s) => s.id === studentId);
    if (std && (std.teacherId === currentUser.id || std.registeredByTeacherId === currentUser.id || std.registeredBy === currentUser.id)) {
      return true;
    }

    try {
      const stored = localStorage.getItem(`enigmakids_teacher_students_${currentUser.id}`);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        if (ids.includes(studentId)) {
          return true;
        }
      }
    } catch {
      // ignore
    }

    return false;
  };

  // Only show submissions of students registered by this teacher for tasks and exams pending correction
  const teacherGradingSubmissions = useMemo(() => {
    return submissions.filter((sub) => isStudentRegisteredByTeacher(sub.studentId));
  }, [submissions, students, currentUser.id]);

  // --- STUDENT REGISTRATION ---
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentUsername.trim()) return;

    const cleanUsername = newStudentUsername.trim().toLowerCase();
    
    const rawUsers = localStorage.getItem('enigmakids_registered_users');
    let allUsers: UserAccount[] = [];
    if (rawUsers) {
      allUsers = JSON.parse(rawUsers);
    }
    if (allUsers.some(u => u.username?.toLowerCase() === cleanUsername)) {
      alert('¡El nombre de usuario ya está en uso! Elige otro.');
      return;
    }

    sounds.playLevelUp();
    const newStudent: UserAccount = {
      id: `std-${Date.now()}`,
      username: cleanUsername,
      password: newStudentPassword,
      name: newStudentName.trim(),
      role: 'student',
      grade: newStudentGrade,
      avatar: newStudentAvatar,
      avatarColor: newStudentColor,
      points: 20,
      stars: 1,
      unlockedBadges: [],
      mathLevels: { suma: 1, resta: 1, multiplicacion: 1, division: 1 },
      lastConnection: 'Recién registrado',
      studyTimeMinutes: 10,
      teacherId: currentUser.id,
      registeredByTeacherId: currentUser.id,
      registeredBy: currentUser.id,
    };

    // Track registered student ID for this teacher
    try {
      const teacherKey = `enigmakids_teacher_students_${currentUser.id}`;
      const stored = localStorage.getItem(teacherKey);
      const ids: string[] = stored ? JSON.parse(stored) : [];
      if (!ids.includes(newStudent.id)) {
        ids.push(newStudent.id);
        localStorage.setItem(teacherKey, JSON.stringify(ids));
      }
    } catch (err) {
      console.error(err);
    }

    const updatedList = [...students, newStudent];
    saveAllUsersToStorage(updatedList);
    sounds.speak(`Estudiante registrado con éxito: ${newStudent.name}`);
    
    // Clear form
    setNewStudentName('');
    setNewStudentUsername('');
    setNewStudentPassword('123');
  };

  // Delete student
  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${name}? Esto borrará su cuenta y sus datos.`)) {
      sounds.playClick();
      const updated = students.filter(s => s.id !== id);
      saveAllUsersToStorage(updated);
      
      const updatedSub = submissions.filter(sub => sub.studentId !== id);
      saveSubmissionsToStorage(updatedSub);

      try {
        const teacherKey = `enigmakids_teacher_students_${currentUser.id}`;
        const stored = localStorage.getItem(teacherKey);
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          const remaining = ids.filter((sid) => sid !== id);
          localStorage.setItem(teacherKey, JSON.stringify(remaining));
        }
      } catch (err) {
        console.error(err);
      }

      sounds.speak(`Se eliminó al estudiante ${name}.`);
    }
  };

  // --- EXAM ASSIGNMENT MANAGEMENT ---
  const handleAddStudentToExam = (quizId: string, studentId: string) => {
    sounds.playClick();
    const updatedQuizzes = quizzes.map(quiz => {
      if (quiz.id === quizId) {
        let assigned = [...quiz.assignedTo];
        if (assigned.includes('all')) {
          assigned = students.map(s => s.id);
        }
        if (!assigned.includes(studentId)) {
          assigned.push(studentId);
        }
        return { ...quiz, assignedTo: assigned };
      }
      return quiz;
    });
    saveQuizzesToStorage(updatedQuizzes);
    const sName = students.find(s => s.id === studentId)?.name || '';
    sounds.speak(`Agregado con éxito a ${sName} al examen.`);
  };

  const handleRemoveStudentFromExam = (quizId: string, studentId: string) => {
    sounds.playClick();
    const updatedQuizzes = quizzes.map(quiz => {
      if (quiz.id === quizId) {
        let assigned = [...quiz.assignedTo];
        if (assigned.includes('all')) {
          assigned = students.map(s => s.id);
        }
        assigned = assigned.filter(id => id !== studentId);
        return { ...quiz, assignedTo: assigned };
      }
      return quiz;
    });
    saveQuizzesToStorage(updatedQuizzes);
    const sName = students.find(s => s.id === studentId)?.name || '';
    sounds.speak(`Se ha quitado a ${sName} del examen.`);
  };

  // --- CREATE NEW QUIZ EXAM ---
  const handleAddQuestion = () => {
    sounds.playClick();
    setQuizQuestions([...quizQuestions, { question: '', options: ['', '', ''], correctAnswer: '' }]);
  };

  const handleRemoveQuestion = (idx: number) => {
    sounds.playClick();
    if (quizQuestions.length > 1) {
      setQuizQuestions(quizQuestions.filter((_, i) => i !== idx));
    }
  };

  const updateQuestionText = (idx: number, text: string) => {
    const updated = [...quizQuestions];
    updated[idx].question = text;
    setQuizQuestions(updated);
  };

  const updateQuestionOption = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...quizQuestions];
    updated[qIdx].options[optIdx] = val;
    setQuizQuestions(updated);
  };

  const updateQuestionCorrect = (qIdx: number, correctVal: string) => {
    const updated = [...quizQuestions];
    updated[qIdx].correctAnswer = correctVal;
    setQuizQuestions(updated);
  };

  const handlePublishQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      alert('Ingresa el título para la evaluación.');
      return;
    }

    const hasUnsetCorrect = quizQuestions.some(q => !q.correctAnswer || !q.question);
    if (hasUnsetCorrect) {
      alert('Por favor, completa todas las preguntas y marca la respuesta correcta.');
      return;
    }

    sounds.playLevelUp();
    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: quizTitle.trim(),
      subject: quizSubject,
      teacherId: currentUser.id,
      dueDate: quizDueDate || undefined,
      questions: quizQuestions.map((q, idx) => ({
        id: `q-${idx}-${Date.now()}`,
        question: q.question,
        options: q.options.filter(o => o.trim() !== ''),
        correctAnswer: q.correctAnswer
      })),
      assignedTo: [assignedStudentId],
      createdAt: new Date().toISOString()
    };

    const updated = [...quizzes, newQuiz];
    saveQuizzesToStorage(updated);
    setSelectedQuizIdForManage(newQuiz.id);
    sounds.speak(`¡Has publicado el examen: ${newQuiz.title}!`);

    // Reset form
    setQuizTitle('');
    setQuizDueDate('');
    setQuizQuestions([{ question: '', options: ['', '', ''], correctAnswer: '' }]);
    setActiveTab('exams');
  };

  const handleDeleteQuiz = (id: string) => {
    if (window.confirm('¿Deseas eliminar este examen asignado?')) {
      sounds.playClick();
      const updated = quizzes.filter(q => q.id !== id);
      saveQuizzesToStorage(updated);
      
      const updatedSub = submissions.filter(s => s.quizId !== id);
      saveSubmissionsToStorage(updatedSub);
      
      if (selectedQuizIdForManage === id && updated.length > 0) {
        setSelectedQuizIdForManage(updated[0].id);
      }
    }
  };

  // --- SUBMISSIONS REVIEW & GRADING ---
  const handleOpenGradingDialog = (sub: QuizSubmission) => {
    sounds.playClick();
    setGradingSubmission(sub);
    const autoScore = sub.score || 0;
    let pred = '5 / 10';
    if (autoScore >= 95) pred = '10 / 10 (Excelente) ⭐';
    else if (autoScore >= 80) pred = '9 / 10 (Super bien) 👍';
    else if (autoScore >= 60) pred = '7 / 10 (Aprobado)';
    else if (autoScore >= 40) pred = '5 / 10 (Sigue intentándolo)';
    else pred = 'Repetir la prueba para mejorar';

    setGradeValue(sub.grade || pred);
    setFeedbackText(sub.teacherFeedback || '¡Felicidades por completar la prueba! Sigue adelante.');
  };

  const handleSaveTeacherGrade = () => {
    if (!gradingSubmission) return;

    sounds.playLevelUp();
    const updatedSubmissions = submissions.map(sub => {
      if (sub.id === gradingSubmission.id) {
        return {
          ...sub,
          isGraded: true,
          isPublished: true,
          publishedAt: new Date().toISOString(),
          grade: gradeValue,
          teacherFeedback: feedbackText
        };
      }
      return sub;
    });
    saveSubmissionsToStorage(updatedSubmissions);

    // Reward points to student in UserAccount
    const targetStudentId = gradingSubmission.studentId;
    const isPass = !gradeValue.toLowerCase().includes('repetir');
    
    const updatedStudentsList = students.map(student => {
      if (student.id === targetStudentId) {
        const extraPoints = isPass ? 100 : 35;
        const updatedPoints = (student.points || 0) + extraPoints;
        const extraStars = isPass ? 2 : 1;
        return {
          ...student,
          points: updatedPoints,
          stars: (student.stars || 1) + extraStars
        };
      }
      return student;
    });

    saveAllUsersToStorage(updatedStudentsList);
    sounds.speak(`¡Calificación publicada al estudiante con éxito!`);
    setGradingSubmission(null);
  };

  const handleSendAttendanceToAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAttendanceSentMsg('');

    const gradeStudents = students.filter(s => s.grade === attendanceGrade || !s.grade);
    if (gradeStudents.length === 0) {
      alert('No hay estudiantes en este grado.');
      return;
    }

    const recordList = gradeStudents.map(s => ({
      studentId: s.id,
      studentName: s.name,
      present: attendanceMap[s.id] !== false,
    }));

    const newAttendanceRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      courseOrGrade: attendanceGrade,
      date: attendanceDate,
      submittedAt: new Date().toLocaleString('es-ES'),
      status: 'Pendiente',
      records: recordList,
    };

    const rawAtt = localStorage.getItem('enigmakids_attendance_records');
    let currentAtt: AttendanceRecord[] = [];
    if (rawAtt) {
      try { currentAtt = JSON.parse(rawAtt); } catch {}
    }

    const updatedAtt = [newAttendanceRecord, ...currentAtt];
    localStorage.setItem('enigmakids_attendance_records', JSON.stringify(updatedAtt));

    // Audit log
    const rawLogs = localStorage.getItem('enigmakids_audit_logs');
    let currentLogs: AuditLog[] = [];
    if (rawLogs) { try { currentLogs = JSON.parse(rawLogs); } catch {} }

    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'teacher',
      action: 'Envío de Asistencia',
      details: `El profesor ${currentUser.name} envió el parte de asistencia de ${attendanceGrade} (${attendanceDate}).`,
      timestamp: new Date().toLocaleString('es-ES'),
    };

    localStorage.setItem('enigmakids_audit_logs', JSON.stringify([newLog, ...currentLogs]));

    sounds.playLevelUp();
    sounds.speak('Asistencia enviada al Administrador con éxito.');
    setAttendanceSentMsg('¡Asistencia enviada exitosamente al Administrador! 📤');
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Decorative Top header Banner */}
      <header className="bg-white border-b-4 border-indigo-200 sticky top-0 z-40 py-4 shadow-sm px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow">
              👩‍🏫
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Panel de Seguimiento y Evaluación del Profesor
              </h1>
              <p className="text-xs text-indigo-600 font-extrabold uppercase tracking-widest leading-none mt-0.5">
                Plataforma Enigmakids
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-2 text-xs font-bold text-left flex items-center gap-2">
              <span className="text-2xl">🦉</span>
              <div>
                <span className="text-[9px] text-indigo-600 font-black uppercase leading-none block">Sesión: Docente</span>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onLogout();
              }}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 text-xs font-black rounded-xl border-b-4 border-rose-700 shadow active:scale-95 transition-all uppercase leading-none cursor-pointer"
            >
              Cerrar Sesión 🚪
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap gap-2.5 mb-8 border-b pb-4">
          <button
            onClick={() => { sounds.playClick(); setActiveTab('home'); }}
            className={`py-3 px-5 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-indigo-600 border-indigo-800 text-white'
                : 'bg-white border-slate-200 text-indigo-900 hover:bg-indigo-50'
            }`}
          >
            <span>🏠 Inicio</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setActiveTab('overview'); }}
            className={`py-3 px-5 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-indigo-600 border-indigo-800 text-white'
                : 'bg-white border-slate-200 text-indigo-900 hover:bg-indigo-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>📊 Estadísticas del Grupo</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setActiveTab('tracking'); }}
            className={`py-3 px-5 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tracking'
                ? 'bg-indigo-600 border-indigo-800 text-white'
                : 'bg-white border-slate-200 text-indigo-900 hover:bg-indigo-50'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>🔍 Expediente del Alumno (Solo Lectura)</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setActiveTab('roster'); }}
            className={`py-3 px-5 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-indigo-600 border-indigo-800 text-white'
                : 'bg-white border-slate-200 text-indigo-900 hover:bg-indigo-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>👥 Registro de Alumnos ({students.length})</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setActiveTab('exams'); }}
            className={`py-3 px-5 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-indigo-600 border-indigo-800 text-white'
                : 'bg-white border-slate-200 text-indigo-900 hover:bg-indigo-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>📝 Exámenes y Tareas ({quizzes.length})</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setActiveTab('grading'); }}
            className={`py-3 px-5 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow transition-all flex items-center gap-2 cursor-pointer relative ${
              activeTab === 'grading'
                ? 'bg-indigo-600 border-indigo-800 text-white'
                : 'bg-white border-slate-200 text-indigo-900 hover:bg-indigo-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>✍️ Calificar y Publicar</span>
            {teacherGradingSubmissions.filter(s => !s.isGraded).length > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {teacherGradingSubmissions.filter(s => !s.isGraded).length}
              </span>
            )}
          </button>

          <button
            onClick={() => { sounds.playClick(); setActiveTab('virtual-rooms'); }}
            className={`py-3 px-5 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'virtual-rooms'
                ? 'bg-indigo-600 border-indigo-800 text-white'
                : 'bg-white border-slate-200 text-indigo-900 hover:bg-indigo-50'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            <span>🏫 Mis Salas (Códigos de Acceso)</span>
          </button>

          <button
            onClick={() => { sounds.playClick(); setActiveTab('attendance'); }}
            className={`py-3 px-5 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-indigo-600 border-indigo-800 text-white'
                : 'bg-white border-slate-200 text-indigo-900 hover:bg-indigo-50'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>📋 Enviar Asistencia al Administrador</span>
          </button>
        </div>

        {/* --- VIEW TABS CONTENT --- */}
        <AnimatePresence mode="wait">
          {/* TAB 0: HOME / INICIO */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <TeacherHome
                currentUser={currentUser}
                students={students}
                quizzes={quizzes}
                submissions={teacherGradingSubmissions}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            </motion.div>
          )}

          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <TeacherAnalyticsOverview
                students={students}
                quizzes={quizzes}
                submissions={teacherGradingSubmissions}
                onNavigateToGrading={() => setActiveTab('grading')}
                onNavigateToTracking={(stdId) => {
                  setSelectedStudentForTracking(stdId);
                  setActiveTab('tracking');
                }}
              />
            </motion.div>
          )}

          {/* TAB 2: INDIVIDUAL STUDENT TRACKING (READ-ONLY) */}
          {activeTab === 'tracking' && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <TeacherTrackingPanel
                students={students}
                quizzes={quizzes}
                submissions={teacherGradingSubmissions}
                selectedStudentId={selectedStudentForTracking}
                onSelectStudent={(id) => setSelectedStudentForTracking(id)}
              />
            </motion.div>
          )}

          {/* TAB 3: ROSTER & ADDING STUDENT */}
          {activeTab === 'roster' && (
            <motion.div
              key="roster"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid lg:grid-cols-3 gap-8 items-start"
            >
              {/* Students Grid */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <h2 className="font-black text-slate-800 text-lg uppercase">Lista de Estudiantes Registrados</h2>
                    <p className="text-xs text-slate-450 font-semibold">Gesta los alumnos que pertenecen a tus aulas</p>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-black">
                    {students.length} alumnos
                  </span>
                </div>

                {students.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {students.map(std => {
                      const avInfo = AVATARS.find(a => a.id === std.avatar);
                      const currentSubmissions = submissions.filter(s => s.studentId === std.id);
                      return (
                        <div
                          key={std.id}
                          className="bg-white border-2 border-slate-100 hover:border-indigo-400 p-5 rounded-3xl shadow-sm transition-all flex flex-col justify-between hover:shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${std.avatarColor || 'bg-slate-200'}`}>
                                {avInfo?.emoji || '👶'}
                              </span>
                              <div>
                                <h3 className="font-extrabold text-slate-900 leading-tight">{std.name}</h3>
                                <p className="text-[10px] text-slate-400 font-extrabold block mt-0.5 uppercase tracking-wide">
                                  Usuario: <span className="text-indigo-600 font-black">@{std.username}</span>
                                </p>
                                <span className="inline-block bg-amber-100 text-amber-950 font-black text-[9px] rounded-full px-2.5 py-0.5 uppercase mt-1">
                                  {std.grade || 'Sin Grado'}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteStudent(std.id, std.name)}
                              className="text-slate-300 hover:text-rose-500 p-1.5 rounded-full transition-all cursor-pointer"
                              title="Dar de baja estudiante"
                            >
                              <Trash className="w-4.5 h-4.5" />
                            </button>
                          </div>

                          <div className="mt-4 pt-3 border-t border-dashed border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                            <div className="flex items-center gap-2">
                              <span className="bg-amber-50 text-amber-700 font-black rounded px-2 py-0.5">🌟 {std.stars || 1} Stars</span>
                              <span className="bg-indigo-50 text-indigo-700 font-black rounded px-2 py-0.5">🎒 {std.points || 0} XP</span>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedStudentForTracking(std.id);
                                setActiveTab('tracking');
                              }}
                              className="text-xs font-black text-indigo-600 hover:underline"
                            >
                              Ver Expediente →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center bg-white border border-dashed py-12 rounded-3xl">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-2 animate-bounce" />
                    <p className="font-black text-slate-500 uppercase">Aún no hay alumnos creados</p>
                    <p className="text-xs text-slate-400 mt-1">¡Crea tu primer alumno usando el formulario de la derecha!</p>
                  </div>
                )}
              </div>

              {/* Add Student Form */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dashed">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-slate-900 uppercase text-sm">Registrar Nuevo Alumno</h3>
                </div>

                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1">Nombre Completo:</label>
                    <input
                      type="text"
                      required
                      placeholder="ej: Sofía Díaz, Hugo López"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1">Usuario de Acceso (Login):</label>
                    <input
                      type="text"
                      required
                      placeholder="ej: sofi, hugo"
                      value={newStudentUsername}
                      onChange={(e) => setNewStudentUsername(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1">Contraseña:</label>
                    <input
                      type="text"
                      required
                      placeholder="ej: 123"
                      value={newStudentPassword}
                      onChange={(e) => setNewStudentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1.5">Grado del Estudiante:</label>
                    <select
                      value={newStudentGrade}
                      onChange={(e) => setNewStudentGrade(e.target.value as any)}
                      className="w-full px-3 py-2.5 text-sm font-bold border rounded-xl bg-white focus:outline-none focus:border-indigo-400 text-slate-800"
                    >
                      <option value="Primer Grado">Primer Grado 🌱</option>
                      <option value="Segundo Grado">Segundo Grado 🌿</option>
                      <option value="Tercer Grado">Tercer Grado 🌳</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1.5">Mascota Protectora:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {AVATARS.map(av => (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => { sounds.playClick(); setNewStudentAvatar(av.id); }}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            newStudentAvatar === av.id
                              ? 'border-indigo-600 bg-indigo-50 shadow-sm font-bold scale-102'
                              : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xl">{av.emoji}</span>
                          <span className="text-[7px] font-black text-slate-400 mt-1 uppercase leading-none">{av.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1.5">Color de Poder:</label>
                    <div className="flex gap-2 justify-center">
                      {COLORS.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { sounds.playClick(); setNewStudentColor(c.class); }}
                          className={`w-6 h-6 rounded-full border shadow-xs transition-all cursor-pointer ${c.class} ${
                            newStudentColor === c.class ? 'scale-115 ring-2 ring-indigo-500 ring-offset-1' : ''
                          }`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs uppercase rounded-2xl shadow border-b-4 border-emerald-700 active:scale-95 transition-all cursor-pointer leading-none"
                  >
                    Guardar Nuevo Estudiante 📝
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {/* TAB 4: EXAM MANAGER & ASSIGNMENTS */}
          {activeTab === 'exams' && (
            <motion.div
              key="exams"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid lg:grid-cols-3 gap-8 items-start"
            >
              {/* Exams Listing & Assignment Manager */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Published Exámenes list */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="font-black text-slate-800 uppercase text-sm mb-4">Exámenes Publicados ({quizzes.length})</h3>
                  
                  {quizzes.length > 0 ? (
                    <div className="space-y-3">
                      {quizzes.map(q => {
                        const isSelected = selectedQuizIdForManage === q.id;
                        return (
                          <div
                            key={q.id}
                            onClick={() => {
                              sounds.playClick();
                              setSelectedQuizIdForManage(q.id);
                            }}
                            className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-50/50 border-indigo-400 shadow-sm ring-2 ring-indigo-500/10'
                                : 'bg-white border-slate-100 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">
                                {q.subject === 'math' ? '🧮' : q.subject === 'language' ? '📚' : '🧪'}
                              </span>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-800">{q.title}</h4>
                                <p className="text-[10px] text-slate-400 font-extrabold leading-normal uppercase">
                                  Materia: <span className="text-slate-600 font-black capitalize">{q.subject === 'language' ? 'Lengua' : q.subject === 'math' ? 'Matemáticas' : 'Ciencias'}</span> • {q.questions.length} ejercicios
                                </p>
                                {q.dueDate && (
                                  <span className="text-[10px] text-amber-700 font-black block mt-0.5">
                                    📅 Fecha límite: {new Date(q.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <span className="text-[10px] text-indigo-600 bg-white font-black px-2.5 py-1 rounded-full border border-indigo-200 animate-pulse">
                                  Gestionando asignaciones ⚙️
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteQuiz(q.id);
                                }}
                                className="bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white p-2 rounded-xl transition-all cursor-pointer"
                                title="Eliminar examen"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center bg-slate-50 py-10 rounded-2xl border border-dashed">
                      <Clock className="w-8 h-8 text-slate-300 mx-auto mb-1 animate-pulse" />
                      <p className="text-xs font-bold text-slate-500">No hay exámenes publicados en el aula virtual</p>
                    </div>
                  )}
                </div>

                {/* EXPLICIT PERMISSION MANAGER */}
                {selectedQuizIdForManage && quizzes.find(q => q.id === selectedQuizIdForManage) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-3xl border-2 border-indigo-200 shadow-sm"
                  >
                    {(() => {
                      const activeQ = quizzes.find(q => q.id === selectedQuizIdForManage)!;
                      const isAllAssigned = activeQ.assignedTo.includes('all');
                      
                      return (
                        <>
                          <div className="pb-4 mb-4 border-b">
                            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-wider block">
                              Gestión de Asignación de Exámenes
                            </span>
                            <h3 className="font-black text-slate-800 text-sm">
                              Asignar Alumnos a: <span className="text-indigo-950 font-black">"{activeQ.title}"</span>
                            </h3>
                          </div>

                          {students.length > 0 ? (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                              {students.map(std => {
                                const isAssigned = isAllAssigned || activeQ.assignedTo.includes(std.id);
                                const avInfo = AVATARS.find(a => a.id === std.avatar);
                                
                                return (
                                  <div
                                    key={std.id}
                                    className="p-3 border border-slate-100 bg-slate-50/50 rounded-2xl flex items-center justify-between shadow-xs"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${std.avatarColor || 'bg-slate-200'}`}>
                                        {avInfo?.emoji || '👶'}
                                      </span>
                                      <div>
                                        <p className="font-extrabold text-xs text-slate-800 leading-none">{std.name}</p>
                                        <span className="text-[8px] text-amber-600 font-black block mt-0.5 uppercase">
                                          {std.grade || 'Sin Grado'} • @{std.username}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {isAssigned ? (
                                        <>
                                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 rounded-full px-2.5 py-0.5 flex items-center gap-0.5 shrink-0">
                                            <UserCheck className="w-3 h-3" /> Asignado
                                          </span>
                                          <button
                                            onClick={() => handleRemoveStudentFromExam(activeQ.id, std.id)}
                                            className="bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl border border-rose-100 hover:border-rose-500 shadow-sm transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                                          >
                                            <UserMinus className="w-3 h-3" /> Quitar
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-[10px] font-black text-slate-400 bg-slate-100 rounded-full px-2.5 py-0.5 shrink-0">
                                            Excluido
                                          </span>
                                          <button
                                            onClick={() => handleAddStudentToExam(activeQ.id, std.id)}
                                            className="bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl border border-indigo-100 hover:border-indigo-600 shadow-sm transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                                          >
                                            <UserCheck className="w-3 h-3" /> Agregar
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-center text-slate-400 text-xs py-4">No hay estudiantes creados para asignar.</p>
                          )}
                        </>
                      );
                    })()}
                  </motion.div>
                )}
              </div>

              {/* Creator of a new Quiz Examen */}
              <form onSubmit={handlePublishQuiz} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="pb-3 border-b border-dashed">
                  <h3 className="font-black text-slate-800 uppercase text-sm flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-indigo-600" /> Redactar Nueva Evaluación
                  </h3>
                  <p className="text-[10px] text-slate-450 font-semibold uppercase mt-0.5">Define preguntas, respuestas y fecha límite</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1">Título del Examen / Evaluación:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Examen de Comprensión LECTORA 📖"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1">Materia Académica:</label>
                    <select
                      value={quizSubject}
                      onChange={(e) => setQuizSubject(e.target.value as any)}
                      className="w-full px-3 py-2.5 text-sm font-bold border rounded-xl bg-white focus:outline-none focus:border-indigo-400 text-slate-800"
                    >
                      <option value="math">🧮 Matemáticas Mágicas</option>
                      <option value="language">📚 Lengua y Literatura</option>
                      <option value="science">🧪 Ciencias Sorpresa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-600 uppercase mb-1">Fecha Límite de Entrega (Opcional):</label>
                    <input
                      type="date"
                      value={quizDueDate}
                      onChange={(e) => setQuizDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border rounded-xl bg-slate-50 text-slate-800"
                    />
                  </div>
                </div>

                {/* Exercises Builder */}
                <div className="space-y-4 pt-4 border-t border-dashed">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black text-slate-500 uppercase">Preguntas ({quizQuestions.length})</span>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="text-[10px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg flex items-center gap-0.5 cursor-pointer"
                    >
                      + Agregar Pregunta
                    </button>
                  </div>

                  {quizQuestions.map((questionItem, qIdx) => (
                    <div key={qIdx} className="bg-slate-50 p-4 border rounded-2xl relative space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-indigo-800 uppercase">Pregunta #{qIdx + 1}</span>
                        {quizQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-rose-500 hover:text-rose-700 font-extrabold text-[10px] uppercase cursor-pointer"
                          >
                            Quitar
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Escribe la pregunta (ej: ¿Cuál es el ecosistema de los peces?)"
                        value={questionItem.question}
                        onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold border rounded-xl text-slate-800"
                      />

                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Opciones (Marca la respuesta correcta):</p>
                        <div className="space-y-1.5">
                          {questionItem.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-1.5">
                              <input
                                type="text"
                                required
                                placeholder={`Opción ${optIdx + 1}`}
                                value={opt}
                                onChange={(e) => updateQuestionOption(qIdx, optIdx, e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs font-semibold border rounded-xl text-slate-800"
                              />
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                required
                                checked={questionItem.correctAnswer === opt && opt !== ''}
                                onChange={() => updateQuestionCorrect(qIdx, opt)}
                                className="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
                                title="Fijar como respuesta correcta"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-dashed">
                  <div className="mb-4">
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Asignación Inicial:</label>
                    <select
                      value={assignedStudentId}
                      onChange={(e) => setAssignedStudentId(e.target.value)}
                      className="px-3 py-1.5 text-xs font-bold border rounded-xl bg-white focus:outline-none text-slate-800 w-full"
                    >
                      <option value="all">Asignar a todos los estudiantes 🎒</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase rounded-xl border-b-4 border-indigo-800 shadow-sm cursor-pointer"
                  >
                    Publicar Examen 🚀
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 5: CORRECT & PUBLISH SUBMISSIONS */}
          {activeTab === 'grading' && (
            <motion.div
              key="grading"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h2 className="font-black text-slate-800 text-lg uppercase">Bandeja de Entregas y Publicación de Notas</h2>
                  <p className="text-xs text-slate-450 font-semibold mt-0.5">Corrige, asigna observaciones personalizadas y publica la calificación final al estudiante.</p>
                </div>
                <span className="bg-amber-100 text-amber-900 font-black text-xs px-3 py-1.5 rounded-full">
                  {teacherGradingSubmissions.filter(s => !s.isGraded).length} Pendientes
                </span>
              </div>

              {teacherGradingSubmissions.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {teacherGradingSubmissions.map(sub => {
                    const student = students.find(s => s.id === sub.studentId);
                    const quiz = quizzes.find(q => q.id === sub.quizId);

                    if (!quiz) return null;

                    return (
                      <div
                        key={sub.id}
                        className={`p-5 rounded-3xl border-2 shadow-sm transition-all relative ${
                          sub.isGraded
                            ? 'bg-slate-50 border-slate-200 opacity-90'
                            : 'bg-white border-yellow-300 ring-4 ring-yellow-400/5 shadow-md'
                        }`}
                      >
                        <span className={`absolute top-4 right-4 text-[9px] font-black rounded-full px-2.5 py-0.5 uppercase ${
                          sub.isPublished ? 'bg-emerald-500 text-white' : sub.isGraded ? 'bg-indigo-500 text-white' : 'bg-yellow-400 text-yellow-950 animate-pulse'
                        }`}>
                          {sub.isPublished ? '✓ Publicada' : sub.isGraded ? 'Guardada (Borrador)' : '★ Por Corregir'}
                        </span>

                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="text-3xl">🎒</span>
                          <div>
                            <h4 className="font-black text-slate-900">{student ? student.name : 'Estudiante registrado'}</h4>
                            <p className="text-[10px] text-indigo-600 font-extrabold uppercase mt-0.5">
                              Examen: <span className="text-slate-800 font-black">{quiz.title}</span>
                            </p>
                          </div>
                        </div>

                        {/* Questions review box */}
                        <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1.5 border border-dashed border-slate-200 mb-4 font-bold">
                          <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Informe de Respuestas Enviadas:</p>
                          {quiz.questions.map((q, idx) => {
                            const given = sub.answers[q.id];
                            const isCorrect = given === q.correctAnswer;
                            return (
                              <div key={idx} className="flex justify-between items-start pt-1 border-t border-slate-100 gap-2">
                                <span className="text-slate-650 leading-tight">Q{idx + 1}: "{q.question.substring(0, 40)}..."</span>
                                <span className={`shrink-0 font-extrabold flex items-center gap-0.5 ${isCorrect ? 'text-emerald-600' : 'text-rose-500'}`}>
                                  {isCorrect ? '✓ Correcto' : '❌ Incorrecto'} ({given || 'En blanco'})
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between border-t pt-3 flex-wrap gap-2">
                          <div className="text-xs">
                            <span className="font-extrabold text-indigo-700 text-xs">Score Auto: {sub.score}%</span>
                            {sub.isGraded && (
                              <p className="text-slate-800 font-black text-xs mt-1">Nota: <span className="text-emerald-600">{sub.grade}</span></p>
                            )}
                          </div>

                          <button
                            onClick={() => handleOpenGradingDialog(sub)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl border-b-2 border-indigo-800 shadow active:scale-95 transition-all cursor-pointer uppercase"
                          >
                            {sub.isGraded ? 'Editar / Publicar Nota ✍️' : 'Evaluar Entrega ✍️'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center bg-white border border-dashed py-12 rounded-3xl">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="font-black text-slate-500 uppercase">Sin entregas por corregir</p>
                  <p className="text-xs text-slate-400 mt-1">Los exámenes resueltos por estudiantes aparecerán aquí.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* --- TAB 7: ENVIAR ASISTENCIA AL ADMINISTRADOR --- */}
          {activeTab === 'attendance' && (
              <motion.div
                key="attendance-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md border-2 border-indigo-700 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-black uppercase px-3 py-1 rounded-full">
                      📋 Registro Diario
                    </span>
                    <h2 className="text-2xl font-black mt-2">Tomar y Enviar Asistencia al Administrador</h2>
                    <p className="text-xs text-indigo-200 mt-1 max-w-xl">
                      Marca la presencia de los estudiantes por grado y transfiere automáticamente el reporte oficial a la Dirección.
                    </p>
                  </div>
                </div>

                {attendanceSentMsg && (
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-950 font-black text-xs flex items-center justify-between">
                    <span>{attendanceSentMsg}</span>
                    <button onClick={() => setAttendanceSentMsg('')} className="text-emerald-800 underline text-xs">Aceptar</button>
                  </div>
                )}

                <form onSubmit={handleSendAttendanceToAdmin} className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                        Grado Escolar
                      </label>
                      <select
                        value={attendanceGrade}
                        onChange={(e) => setAttendanceGrade(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                      >
                        <option value="Primer Grado">Primer Grado</option>
                        <option value="Segundo Grado">Segundo Grado</option>
                        <option value="Tercer Grado">Tercer Grado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                        Fecha de la Clase
                      </label>
                      <input
                        type="date"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                      Lista de Alumnos ({students.filter(s => s.grade === attendanceGrade || !s.grade).length})
                    </h3>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {students.filter(s => s.grade === attendanceGrade || !s.grade).map(student => {
                        const isPresent = attendanceMap[student.id] !== false;

                        return (
                          <div
                            key={student.id}
                            onClick={() => {
                              sounds.playClick();
                              setAttendanceMap({
                                ...attendanceMap,
                                [student.id]: !isPresent
                              });
                            }}
                            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                              isPresent
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                : 'bg-rose-50 border-rose-300 text-rose-950'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">🎒</span>
                              <div>
                                <h4 className="font-black text-xs">{student.name}</h4>
                                <span className="text-[10px] opacity-75 font-bold block">{student.grade || 'Sin Grado'}</span>
                              </div>
                            </div>

                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                              isPresent ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                            }`}>
                              {isPresent ? 'Presente ✓' : 'Ausente ✗'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl border-b-4 border-indigo-800 shadow active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Asistencia al Administrador 📤</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* TAB: VIRTUAL ROOMS WITH ACCESS CODES */}
            {activeTab === 'virtual-rooms' && (
              <motion.div
                key="virtual-rooms"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
              >
                <TeacherVirtualRooms currentUser={currentUser} quizzes={quizzes} />
              </motion.div>
            )}
          </AnimatePresence>
      </main>

      {/* Grading Center Dialog Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] border-4 border-indigo-200 shadow-2xl p-6 w-full max-w-lg relative space-y-4"
          >
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Evaluación y Publicación de Nota ✍️</h3>
            <p className="text-xs text-slate-500 font-bold">Asigna la calificación cualitativa, comentarios personalizados y publícala en el panel del estudiante.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">Calificación Final:</label>
                <select
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold border rounded-xl bg-white text-slate-800"
                >
                  <option value="10 / 10 (Excelente) ⭐">10 / 10 (Excelente) ⭐</option>
                  <option value="9 / 10 (Muy buen trabajo) 👍">9 / 10 (Muy buen trabajo) 👍</option>
                  <option value="8 / 10 (Buen esfuerzo) 🙂">8 / 10 (Buen esfuerzo) 🙂</option>
                  <option value="7 / 10 (Aprobado)">7 / 10 (Aprobado)</option>
                  <option value="Repetir prueba para aprender más 🔄">Repetir prueba para aprender más 🔄</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 uppercase mb-1">Observaciones / Retroalimentación al Alumno:</label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Escribe observaciones motivadoras o recomendaciones de repaso..."
                  className="w-full px-4 py-2 text-sm font-bold bg-slate-50 border rounded-xl text-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="flex-1 py-2.5 text-xs font-black text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeacherGrade}
                  className="flex-1 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl border-b-2 border-emerald-800 shadow transition-all uppercase cursor-pointer flex items-center justify-center gap-1"
                >
                  <Send className="w-4 h-4" />
                  <span>Publicar Nota Final 📬</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
