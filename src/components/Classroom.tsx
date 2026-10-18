/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { sounds } from '../utils/sound';
import { UserAccount, Quiz, QuizSubmission, Subject, SchoolRole, Room, RoomInvitation, InvitationStatus } from '../types';
import {
  Users,
  UserPlus,
  Plus,
  BookOpen,
  Award,
  Trash,
  CheckCircle2,
  XCircle,
  FileText,
  Volume2,
  Send,
  Sparkles,
  Trophy,
  ArrowRight,
  GraduationCap,
  Play,
  RotateCcw,
  Check,
  AlertCircle,
  Clock,
  HelpCircle,
  Mail,
  DoorOpen,
  Lock,
  ShieldAlert,
  CheckCircle,
  CheckSquare,
  Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Custom interface for adding questions in creator
interface FormQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const Classroom: React.FC = () => {
  // --- SYSTEM STATES ---
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [students, setStudents] = useState<UserAccount[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [invitations, setInvitations] = useState<RoomInvitation[]>([]);

  // System roles/view toggle
  const [role, setRole] = useState<SchoolRole>('teacher');

  // --- TEACHER TAB CONTROLS ---
  const [teacherTab, setTeacherTab] = useState<'roster' | 'creator' | 'grading' | 'rooms'>('roster');

  // --- STUDENT TAB CONTROLS ---
  const [studentTab, setStudentTab] = useState<'invitations' | 'my_rooms' | 'quizzes'>('invitations');

  // --- ROOMS & INVITATION STATES ---
  const [newRoomName, setNewRoomName] = useState<string>('');
  const [newRoomDesc, setNewRoomDesc] = useState<string>('');
  const [selectedStudentsForRoom, setSelectedStudentsForRoom] = useState<string[]>([]);
  const [unauthorizedAlert, setUnauthorizedAlert] = useState<string | null>(null);
  const [enteredRoom, setEnteredRoom] = useState<Room | null>(null);
  const [manualRoomInput, setManualRoomInput] = useState<string>('');
  const [whiteboardNotes, setWhiteboardNotes] = useState<string>('¡Bienvenidos a la sala virtual! Escriban sus dudas y ejercicios aquí.');


  // --- NEW STUDENT FORM ---
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentAvatar, setNewStudentAvatar] = useState<string>('pand');
  const [newStudentColor, setNewStudentColor] = useState<string>('bg-emerald-400');

  // --- NEW QUIZ CREATOR FORM ---
  const [quizTitle, setQuizTitle] = useState<string>('');
  const [quizSubject, setQuizSubject] = useState<'math' | 'language' | 'science'>('math');
  const [quizQuestions, setQuizQuestions] = useState<FormQuestion[]>([
    { question: '', options: ['', '', ''], correctAnswer: '' }
  ]);
  const [assignedStudentId, setAssignedStudentId] = useState<string>('all');

  // --- STUDENT ACTIVE QUIZ TAKING ---
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [studentAnswers, setStudentAnswers] = useState<{ [qId: string]: string }>({});

  // --- TEACHER GRADING DIALOG ---
  const [gradingSubmission, setGradingSubmission] = useState<QuizSubmission | null>(null);
  const [gradeValue, setGradeValue] = useState<string>('10 / 10 (Excelente) ⭐');
  const [feedbackText, setFeedbackText] = useState<string>('');

  const AVATARS = [
    { id: 'pand', emoji: '🐼', name: 'Panda' },
    { id: 'buho', emoji: '🦉', name: 'Búho' },
    { id: 'leon', emoji: '🦁', name: 'León' },
    { id: 'gato', emoji: '🐱', name: 'Gatito' },
    { id: 'zorros', emoji: '🦊', name: 'Zorrito' },
    { id: 'ping', emoji: '🐧', name: 'Pingüino' },
  ];

  const COLORS = [
    { class: 'bg-emerald-400 border-emerald-500', label: 'Verde Poder' },
    { class: 'bg-sky-400 border-sky-500', label: 'Celeste Mágico' },
    { class: 'bg-yellow-400 border-yellow-500', label: 'Amarillo Brillante' },
    { class: 'bg-purple-400 border-purple-500', label: 'Púrpura Sabio' },
    { class: 'bg-rose-400 border-rose-500', label: 'Rosado Entusiasta' },
  ];

  // --- PRESET QUIZZES DATA ---
  const PRESET_QUIZZES = [
    {
      title: 'Prueba Relámpago de Sumas y Restas 🧠',
      subject: 'math' as const,
      questions: [
        { question: 'Si tienes 12 manzanas coloradas y le regalas 5 a Sofía, ¿cuántas te quedan?', options: ['5', '7', '8'], correctAnswer: '7' },
        { question: '¿Cuál es el doble del número 9?', options: ['18', '20', '15'], correctAnswer: '18' },
        { question: 'Completa la secuencia: 5, 10, 15, ¿?', options: ['18', '20', '25'], correctAnswer: '20' }
      ]
    },
    {
      title: 'Desafío del Vocabulario y Letras 📚',
      subject: 'language' as const,
      questions: [
        { question: '¿Cuál es un sinónimo de la palabra "Enorme"?', options: ['Gigante', 'Pequeño', 'Luminoso'], correctAnswer: 'Gigante' },
        { question: '¿Cuál es el antónimo (contrario) de "Valiente"?', options: ['Fuerte', 'Aventurero', 'Temeroso'], correctAnswer: 'Temeroso' },
        { question: '¿Cómo se escribe correctamente la palabra?', options: ['Ecsamen', 'Examen', 'Esámen'], correctAnswer: 'Examen' }
      ]
    },
    {
      title: 'Misión Ecosistemas y Naturaleza 🌋',
      subject: 'science' as const,
      questions: [
        { question: '¿En qué hábitat de la Tierra vive el Camello adaptado al calor?', options: ['El Océano', 'El Desierto', 'El Bosque'], correctAnswer: 'El Desierto' },
        { question: '¿Cuál es el órgano principal que late y bombea sangre a todo tu cuerpo?', options: ['El Cerebro', 'Los Pulmones', 'El Corazón'], correctAnswer: 'El Corazón' },
        { question: 'Para hacer erupcionar un volcán químico casero seguro, mezclamos Vinagre con...', options: ['Azúcar', 'Sal marina', 'Bicarbonato de sodio'], correctAnswer: 'Bicarbonato de sodio' }
      ]
    }
  ];

  // --- INITIALIZE & PERSISTENCE ---
  useEffect(() => {
    // 1. Load active session first if present
    const activeSession = localStorage.getItem('enigmakids_active_session');
    if (activeSession) {
      try {
        const parsed: UserAccount = JSON.parse(activeSession);
        setCurrentUser(parsed);
        setRole(parsed.role);
      } catch (e) {
        console.error("Failed to parse active session in Classroom", e);
      }
    }

    // 2. Load data from LocalStorage
    const storedStudents = localStorage.getItem('enigmakids_school_students');
    const storedQuizzes = localStorage.getItem('enigmakids_school_quizzes');
    const storedSubmissions = localStorage.getItem('enigmakids_school_submissions');

    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    } else {
      // Bootstrapping initial mock students for direct classroom simulation
      const mockStudents: UserAccount[] = [
        { id: 'std-hugo', name: 'Hugo López', role: 'student', avatar: 'leon', avatarColor: 'bg-emerald-400', points: 150, stars: 2, unlockedBadges: ['math_bronze', 'eco_ranger'] },
        { id: 'std-sofi', name: 'Sofía Díaz', role: 'student', avatar: 'gato', avatarColor: 'bg-purple-400', points: 280, stars: 4, unlockedBadges: ['math_silver', 'vocabulary_wizard'] },
        { id: 'std-mateo', name: 'Mateo Ruíz', role: 'student', avatar: 'pand', avatarColor: 'bg-yellow-400', points: 90, stars: 1, unlockedBadges: [] }
      ];
      setStudents(mockStudents);
      localStorage.setItem('enigmakids_school_students', JSON.stringify(mockStudents));
    }

    if (storedQuizzes) {
      setQuizzes(JSON.parse(storedQuizzes));
    } else {
      // Initial preset quiz available to test immediately
      const initialQuiz: Quiz = {
        id: 'quiz-init-math',
        title: 'Prueba Básica de Operaciones ➕',
        subject: 'math',
        teacherId: 'all',
        questions: [
          { id: 'q1', question: '¿Cuánto es 4 × 5?', options: ['15', '20', '25'], correctAnswer: '20' },
          { id: 'q2', question: '¿Cuál es la resta de 15 - 6?', options: ['9', '8', '7'], correctAnswer: '9' }
        ],
        assignedTo: ['all'],
        createdAt: new Date().toISOString()
      };
      setQuizzes([initialQuiz]);
      localStorage.setItem('enigmakids_school_quizzes', JSON.stringify([initialQuiz]));
    }

    if (storedSubmissions) {
      setSubmissions(JSON.parse(storedSubmissions));
    } else {
      // Bootstrapping custom finished submission ready to show the grading workflow
      const mockSubmission: QuizSubmission = {
        id: 'sub-init-1',
        quizId: 'quiz-init-math',
        studentId: 'std-hugo',
        answers: { 'q1': '20', 'q2': '8' }, // 1 correct, 1 incorrect
        isGraded: false,
        submittedAt: new Date().toISOString()
      };
      setSubmissions([mockSubmission]);
      localStorage.setItem('enigmakids_school_submissions', JSON.stringify([mockSubmission]));
    }

    // 3. Load Rooms & Invitations
    const storedRooms = localStorage.getItem('enigmakids_rooms');
    const storedInvitations = localStorage.getItem('enigmakids_room_invitations');

    if (storedRooms) {
      try { setRooms(JSON.parse(storedRooms)); } catch (e) { setRooms([]); }
    } else {
      const defaultRooms: Room[] = [
        {
          id: 'room-init-1',
          name: 'Sala de Matemáticas Mágicas 🧠',
          description: 'Espacio de resolución de problemas en equipo y cálculo mental.',
          subject: 'math',
          teacherId: 'teacher-main',
          teacherName: 'Profesor (Maestro/a) 🎓',
          createdAt: new Date().toISOString()
        }
      ];
      setRooms(defaultRooms);
      localStorage.setItem('enigmakids_rooms', JSON.stringify(defaultRooms));
    }

    if (storedInvitations) {
      try { setInvitations(JSON.parse(storedInvitations)); } catch (e) { setInvitations([]); }
    } else {
      const defaultInvitations: RoomInvitation[] = [
        {
          id: 'inv-init-1',
          roomId: 'room-init-1',
          roomName: 'Sala de Matemáticas Mágicas 🧠',
          teacherId: 'teacher-main',
          teacherName: 'Profesor (Maestro/a) 🎓',
          studentId: 'std-hugo',
          studentName: 'Hugo López',
          status: 'Pendiente',
          createdAt: new Date().toISOString()
        },
        {
          id: 'inv-init-2',
          roomId: 'room-init-1',
          roomName: 'Sala de Matemáticas Mágicas 🧠',
          teacherId: 'teacher-main',
          teacherName: 'Profesor (Maestro/a) 🎓',
          studentId: 'std-sofi',
          studentName: 'Sofía Díaz',
          status: 'Aceptada',
          createdAt: new Date().toISOString()
        }
      ];
      setInvitations(defaultInvitations);
      localStorage.setItem('enigmakids_room_invitations', JSON.stringify(defaultInvitations));
    }
  }, []);

  // Save utility triggers
  const saveStudents = (list: UserAccount[]) => {
    setStudents(list);
    localStorage.setItem('enigmakids_school_students', JSON.stringify(list));
  };

  const saveQuizzes = (list: Quiz[]) => {
    setQuizzes(list);
    localStorage.setItem('enigmakids_school_quizzes', JSON.stringify(list));
  };

  const saveSubmissions = (list: QuizSubmission[]) => {
    setSubmissions(list);
    localStorage.setItem('enigmakids_school_submissions', JSON.stringify(list));
  };

  const saveRooms = (list: Room[]) => {
    setRooms(list);
    localStorage.setItem('enigmakids_rooms', JSON.stringify(list));
  };

  const saveInvitations = (list: RoomInvitation[]) => {
    setInvitations(list);
    localStorage.setItem('enigmakids_room_invitations', JSON.stringify(list));
  };

  // --- ROOMS & INVITATIONS ACTIONS ---
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      alert('Por favor ingresa un nombre para la sala.');
      return;
    }

    if (selectedStudentsForRoom.length === 0) {
      alert('Por favor selecciona al menos un estudiante para invitar a la sala.');
      return;
    }

    sounds.playLevelUp();
    const roomId = `room-${Date.now()}`;
    const teacherName = currentUser?.name || 'Profesor 🎓';
    const teacherId = currentUser?.id || 'teacher-main';

    const newRoom: Room = {
      id: roomId,
      name: newRoomName.trim(),
      description: newRoomDesc.trim(),
      teacherId,
      teacherName,
      createdAt: new Date().toISOString()
    };

    const newInvs: RoomInvitation[] = selectedStudentsForRoom.map((stdId, idx) => {
      const std = students.find(s => s.id === stdId);
      return {
        id: `inv-${Date.now()}-${idx}`,
        roomId,
        roomName: newRoom.name,
        teacherId,
        teacherName,
        studentId: stdId,
        studentName: std ? std.name : 'Estudiante',
        status: 'Pendiente',
        createdAt: new Date().toISOString()
      };
    });

    const updatedRooms = [...rooms, newRoom];
    const updatedInvitations = [...invitations, ...newInvs];

    saveRooms(updatedRooms);
    saveInvitations(updatedInvitations);

    sounds.speak(`¡Sala "${newRoom.name}" creada con éxito! Se enviaron ${newInvs.length} invitaciones a los estudiantes.`);

    // Reset form
    setNewRoomName('');
    setNewRoomDesc('');
    setSelectedStudentsForRoom([]);
    setTeacherTab('rooms');
  };

  const toggleStudentSelectionForRoom = (studentId: string) => {
    sounds.playClick();
    if (selectedStudentsForRoom.includes(studentId)) {
      setSelectedStudentsForRoom(selectedStudentsForRoom.filter(id => id !== studentId));
    } else {
      setSelectedStudentsForRoom([...selectedStudentsForRoom, studentId]);
    }
  };

  const toggleSelectAllStudentsForRoom = () => {
    sounds.playClick();
    if (selectedStudentsForRoom.length === students.length) {
      setSelectedStudentsForRoom([]);
    } else {
      setSelectedStudentsForRoom(students.map(s => s.id));
    }
  };

  const handleSendAdditionalInvitation = (roomId: string, studentId: string) => {
    sounds.playClick();
    const targetRoom = rooms.find(r => r.id === roomId);
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetRoom || !targetStudent) return;

    // Check if already invited
    const existing = invitations.find(i => i.roomId === roomId && i.studentId === studentId);
    if (existing) {
      alert(`El estudiante ${targetStudent.name} ya tiene una invitación para esta sala.`);
      return;
    }

    const newInv: RoomInvitation = {
      id: `inv-${Date.now()}`,
      roomId,
      roomName: targetRoom.name,
      teacherId: targetRoom.teacherId,
      teacherName: targetRoom.teacherName,
      studentId,
      studentName: targetStudent.name,
      status: 'Pendiente',
      createdAt: new Date().toISOString()
    };

    saveInvitations([...invitations, newInv]);
    sounds.speak(`Invitación enviada a ${targetStudent.name} para la sala ${targetRoom.name}.`);
  };

  const handleAcceptInvitation = (inv: RoomInvitation) => {
    sounds.playLevelUp();
    const updated = invitations.map(i => {
      if (i.id === inv.id) {
        return { ...i, status: 'Aceptada' as InvitationStatus, updatedAt: new Date().toISOString() };
      }
      return i;
    });
    saveInvitations(updated);
    sounds.speak(`¡Has aceptado la invitación a la sala "${inv.roomName}"! La sala ya está disponible en tu Aula Virtual.`);
    setUnauthorizedAlert(null);
  };

  const handleRejectInvitation = (inv: RoomInvitation) => {
    sounds.playClick();
    const updated = invitations.map(i => {
      if (i.id === inv.id) {
        return { ...i, status: 'Rechazada' as InvitationStatus, updatedAt: new Date().toISOString() };
      }
      return i;
    });
    saveInvitations(updated);
    sounds.speak(`Has rechazado la invitación a la sala "${inv.roomName}".`);
  };

  const handleAttemptEnterRoom = (room: Room) => {
    setUnauthorizedAlert(null);

    // Teacher / Creator entry
    if (currentUser?.role === 'teacher') {
      setEnteredRoom(room);
      sounds.playClick();
      sounds.speak(`Has ingresado a la sala "${room.name}" como profesor.`);
      return;
    }

    // Student permission check: MUST have status === 'Aceptada'
    const studentInv = invitations.find(
      i => i.roomId === room.id && i.studentId === currentUser?.id
    );

    if (!studentInv || studentInv.status !== 'Aceptada') {
      sounds.playIncorrect();
      sounds.speak(`Acceso denegado. No tienes autorización para ingresar a esta sala. Debes aceptar la invitación del profesor primero.`);
      setUnauthorizedAlert(`⛔ Acceso no autorizado a "${room.name}": Solo los estudiantes que hayan aceptado la invitación del profesor pueden ingresar a esta sala.`);
      return;
    }

    // Authorized
    sounds.playClick();
    sounds.speak(`¡Bienvenido a la sala "${room.name}"!`);
    setEnteredRoom(room);
  };

  const handleManualEntryAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    setUnauthorizedAlert(null);
    if (!manualRoomInput.trim()) return;

    const query = manualRoomInput.trim().toLowerCase();
    const targetRoom = rooms.find(
      r => r.id.toLowerCase() === query || r.name.toLowerCase().includes(query)
    );

    if (!targetRoom) {
      sounds.playIncorrect();
      setUnauthorizedAlert(`❌ Sala no encontrada. Verifica el ID o nombre e inténtalo de nuevo.`);
      return;
    }

    handleAttemptEnterRoom(targetRoom);
  };


  // --- ACTIONS ---

  // Handle local user role setup
  const selectUser = (user: UserAccount | null) => {
    sounds.playClick();
    setCurrentUser(user);
    if (user) {
      sounds.speak(`¡Bienvenido al Aula Virtual, ${user.name}! Ingresaste con el rol de ${user.role === 'teacher' ? 'profesor' : 'estudiante'}.`);
    } else {
      sounds.speak('Cerraste sesión. Elige una cuenta para ingresar.');
    }
    // reset status
    setActiveQuiz(null);
    setGradingSubmission(null);
  };

  // Register student trigger
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    sounds.playLevelUp();
    const newStudent: UserAccount = {
      id: `std-${Date.now()}`,
      name: newStudentName.trim(),
      role: 'student',
      avatar: newStudentAvatar,
      avatarColor: newStudentColor,
      points: 20, // initial gift
      stars: 1,
      unlockedBadges: [],
      mathLevels: { suma: 1, resta: 1, multiplicacion: 1, division: 1 },
      teacherId: currentUser?.id,
      registeredByTeacherId: currentUser?.id,
      registeredBy: currentUser?.id,
    };

    if (currentUser?.id) {
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
    }

    const updatedList = [...students, newStudent];
    saveStudents(updatedList);
    sounds.speak(`Se ha creado con éxito el estudiante ${newStudent.name}. Ya puede ingresar al aula virtual.`);
    setNewStudentName('');
  };

  // Delete student
  const handleDeleteStudent = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al alumno ${name}? Se borrarán también sus datos.`)) {
      sounds.playClick();
      const updated = students.filter(s => s.id !== id);
      saveStudents(updated);
      // clean submissions belonging to this student
      const updatedSub = submissions.filter(sub => sub.studentId !== id);
      saveSubmissions(updatedSub);

      if (currentUser?.id) {
        try {
          const teacherKey = `enigmakids_teacher_students_${currentUser.id}`;
          const stored = localStorage.getItem(teacherKey);
          if (stored) {
            const ids: string[] = JSON.parse(stored);
            const remaining = ids.filter(sid => sid !== id);
            localStorage.setItem(teacherKey, JSON.stringify(remaining));
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  // Quiz Creator handlers
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

  // Auto populate a template preset quiz
  const applyPresetQuiz = (presetIdx: number) => {
    sounds.playClick();
    const preset = PRESET_QUIZZES[presetIdx];
    setQuizTitle(preset.title);
    setQuizSubject(preset.subject);
    
    // convert preset questions
    const converted = preset.questions.map(q => ({
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer
    }));
    setQuizQuestions(converted);
    sounds.speak(`Se ha precargado la plantilla: ${preset.title}. Puedes editar los ejercicios o asignarla directamente.`);
  };

  // Save Quiz trigger
  const handlePublishQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      alert('Ingresa el título para la prueba.');
      return;
    }

    // validate all questions have correct answer defined
    const hasUnsetCorrect = quizQuestions.some(q => !q.correctAnswer || !q.question);
    if (hasUnsetCorrect) {
      alert('Por favor, completa todas las preguntas y selecciona la respuesta correcta para cada una.');
      return;
    }

    sounds.playLevelUp();
    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: quizTitle.trim(),
      subject: quizSubject,
      teacherId: currentUser?.id || 'manual',
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
    saveQuizzes(updated);
    sounds.speak(`¡Has publicado con éxito la prueba: ${newQuiz.title}! Ha sido asignada para su realización.`);
    
    // Reset form
    setQuizTitle('');
    setQuizQuestions([{ question: '', options: ['', '', ''], correctAnswer: '' }]);
    setTeacherTab('roster');
  };

  // Delete an assigned Quiz
  const handleDeleteQuiz = (id: string) => {
    if (window.confirm('¿Deseas eliminar esta prueba asignada? Los estudiantes ya no podrán realizarla.')) {
      sounds.playClick();
      const updated = quizzes.filter(q => q.id !== id);
      saveQuizzes(updated);
      // clean submissions
      const updatedSub = submissions.filter(s => s.quizId !== id);
      saveSubmissions(updatedSub);
    }
  };

  // --- STUDENT TEST TAKING FLOW ---
  const handleStartQuiz = (quiz: Quiz) => {
    sounds.playClick();
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setStudentAnswers({});
    sounds.speak(`Iniciando prueba: ${quiz.title}. Mucha concentración, lee detenidamente cada pregunta.`);
  };

  const handleSelectAnswer = (option: string) => {
    sounds.playClick();
    const currentQ = activeQuiz!.questions[currentQuestionIndex];
    setStudentAnswers({
      ...studentAnswers,
      [currentQ.id]: option
    });
  };

  const handleNextQuestion = () => {
    sounds.playClick();
    if (currentQuestionIndex < activeQuiz!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    sounds.playClick();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Submit completed Test
  const handleSubmitQuizAnswers = () => {
    sounds.playLevelUp();
    
    const countTotal = activeQuiz!.questions.length;
    let correctCount = 0;
    activeQuiz!.questions.forEach(q => {
      if (studentAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percentScore = Math.round((correctCount / countTotal) * 100);

    const submission: QuizSubmission = {
      id: `sub-${Date.now()}`,
      quizId: activeQuiz!.id,
      studentId: currentUser!.id,
      answers: studentAnswers,
      isGraded: false, // will be reviewed & rated by teacher
      score: percentScore, // auto-evaluated helper (can be overwritten or verified)
      submittedAt: new Date().toISOString()
    };

    const updated = [...submissions, submission];
    saveSubmissions(updated);

    sounds.speak(`¡Excelente trabajo, ${currentUser!.name}! Tu prueba ha sido entregada a la bandeja del profesor con un resultado preliminar del ${percentScore} por ciento. ¡Pronto tu profesor la calificará!`);
    
    setActiveQuiz(null);
  };

  // --- GRADING / COMMENTING CENTER ---
  const handleOpenGradingDialog = (sub: QuizSubmission) => {
    sounds.playClick();
    setGradingSubmission(sub);
    
    // Predict a default grade based on auto-calculated scoring or previous custom grades
    const autoScore = sub.score || 0;
    let pred = '5 / 10';
    if (autoScore >= 95) pred = '10 / 10 (Excelente) ⭐';
    else if (autoScore >= 80) pred = '9 / 10 (Super bien) 👍';
    else if (autoScore >= 60) pred = '7 / 10 (Aprobado)';
    else if (autoScore >= 40) pred = '5 / 10 (Sigue intentándolo)';
    else pred = 'Repetir la prueba para mejorar';

    setGradeValue(pred);
    setFeedbackText('¡Felicidades por completar la prueba! Has hecho un gran esfuerzo.');
  };

  const handleSaveTeacherGrade = () => {
    if (!gradingSubmission) return;

    sounds.playLevelUp();
    const updatedSubmissions = submissions.map(sub => {
      if (sub.id === gradingSubmission.id) {
        return {
          ...sub,
          isGraded: true,
          grade: gradeValue,
          teacherFeedback: feedbackText
        };
      }
      return sub;
    });

    saveSubmissions(updatedSubmissions);

    // Reward student with extra points and stars in their primary record
    const targetStudentId = gradingSubmission.studentId;
    const isPass = !gradeValue.toLowerCase().includes('repetir');
    
    const updatedStudentsList = students.map(student => {
      if (student.id === targetStudentId) {
        const extraPoints = isPass ? 100 : 30; // bonus for passing
        const updatedPoints = (student.points || 0) + extraPoints;
        const extraStars = isPass ? 2 : 1;
        return {
          ...student,
          points: updatedPoints,
          stars: (student.stars || 0) + extraStars
        };
      }
      return student;
    });

    saveStudents(updatedStudentsList);
    sounds.speak(`¡Prueba calificada con éxito! Hemos enviado un mensaje de felicitación y puntos adicionales para el estudiante.`);
    setGradingSubmission(null);
  };

  // Speak aloud the submission feedback
  const handleSpeakFeedback = (feedback: string, grade: string) => {
    sounds.speak(`Calificación de tu profesor: ${grade}. Mensaje del profesor: ${feedback}`);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-4 border-indigo-300 p-6 md:p-8 max-w-5xl mx-auto overflow-hidden">
      
      {/* Visual Header Flag */}
      <div className="flex flex-wrap items-center justify-between mb-8 pb-6 border-b border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-600">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-indigo-950 flex items-center gap-2">
              Aula Virtual de Pruebas 🏫
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              Crea cuentas, aplica pruebas, responde ejercicios e interactúa en tu escuela Enigmakids
            </p>
          </div>
        </div>

        {/* Floating User State Indicator */}
        {currentUser ? (
          <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-150">
            <span className="text-2xl">
              {AVATARS.find(a => a.id === currentUser.avatar)?.emoji || '🧠'}
            </span>
            <div className="text-left font-bold text-xs">
              <span className="text-slate-400 block uppercase font-black text-[9px]">
                Sesión Activa: {currentUser.role === 'teacher' ? 'Profesor' : 'Estudiante'}
              </span>
              <p className="text-indigo-900 leading-tight">{currentUser.name}</p>
            </div>
            <button
              id="btn-logout-school"
              onClick={() => selectUser(null)}
              className="text-[10px] text-rose-500 hover:text-white bg-white hover:bg-rose-500 border border-rose-200 px-2.5 py-1 rounded-full transition-all uppercase font-black leading-none"
            >
              Cerrar 🚪
            </button>
          </div>
        ) : (
          <span className="text-xs bg-slate-100 border border-slate-200 text-slate-500 px-3 py-1.5 rounded-full font-bold">
            🔒 Inicia sesión abajo para comenzar
          </span>
        )}
      </div>

      {/* --- LEVEL 1: USER ROLE GATE & ACCOUNT PICKER --- */}
      {!currentUser && (
        <div className="py-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-extrabold text-slate-800">👉 Elige tu rol escolar para ingresar</h3>
            <p className="text-xs text-slate-400 font-bold uppercase mt-1">Simula ser el profesor creador o un estudiante solucionador</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            
            {/* TEACHER ACCOUNT BOX */}
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-6 text-center shadow-inner hover:-translate-y-1 transition-all duration-300">
              <div className="text-5xl mb-3 animate-bounce">👩‍🏫</div>
              <h4 className="text-lg font-black text-indigo-950 uppercase tracking-tight">Soy el Profesor del Curso</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-bold mt-2 mb-6">
                Como profesor, podrás registrar nuevos alumnos, redactar y publicar pruebas (preset o personalizadas) de matemáticas, lenguaje y ciencias naturales, y calificar las entregas de tus estudiantes guardando comentarios constructivos.
              </p>
              
              <button
                id="btn-login-as-teacher"
                onClick={() => selectUser({
                  id: 'teacher-main',
                  name: 'Profesor (Maestro/a) 🎓',
                  role: 'teacher',
                  avatar: 'buho',
                  avatarColor: 'bg-indigo-500'
                })}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-md border-b-4 border-indigo-800 active:scale-95 transition-all cursor-pointer"
              >
                Ingresar como Profesor 👩‍🏫
              </button>
            </div>

            {/* STUDENT ROSTER LIST SELECTOR BOX */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-3xl p-6 shadow-inner hover:-translate-y-1 transition-all duration-300">
              <div className="text-center">
                <div className="text-5xl mb-3">🎒</div>
                <h4 className="text-lg font-black text-amber-950 uppercase tracking-tight">Soy un Estudiante del Aula</h4>
                <p className="text-xs text-amber-900/70 leading-normal font-bold mt-2 mb-5">
                  Haz clic sobre tu nombre o avatar para iniciar sesión. Verás las tareas pendientes asignadas por tu maestro, resolverás las misiones y recibirás las notas con medallas.
                </p>
              </div>

              {students.length > 0 ? (
                <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
                  {students.map(s => {
                    const avInfo = AVATARS.find(a => a.id === s.avatar);
                    return (
                      <button
                        key={s.id}
                        id={`btn-login-student-${s.id}`}
                        onClick={() => selectUser(s)}
                        className="w-full text-left bg-white hover:bg-yellow-100 border border-yellow-200 hover:border-yellow-400 p-3 rounded-2xl flex items-center justify-between shadow-sm transition-all text-slate-800"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${s.avatarColor}`}>
                            {avInfo?.emoji || '🐼'}
                          </span>
                          <div>
                            <p className="font-extrabold text-sm">{s.name}</p>
                            <span className="text-[10px] text-amber-600 font-bold block leading-none">Estudiante Escolar • {s.points || 0} xp</span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                          ⭐ {s.stars || 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-slate-400 bg-white/70 py-6 rounded-2xl border border-dashed border-yellow-300">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto mb-1 animate-pulse" />
                  <p className="text-xs font-bold leading-snug text-slate-500">¿No hay alumnos creados aún?</p>
                  <button
                    id="btn-quick-init-students"
                    onClick={() => {
                      sounds.playClick();
                      const items = [
                        { id: 'std-hugo', name: 'Hugo López', role: 'student' as const, avatar: 'leon', avatarColor: 'bg-emerald-400', points: 150, stars: 2, unlockedBadges: [] },
                        { id: 'std-sofi', name: 'Sofía Díaz', role: 'student' as const, avatar: 'gato', avatarColor: 'bg-purple-400', points: 280, stars: 4, unlockedBadges: [] }
                      ];
                      saveStudents(items);
                    }}
                    className="text-xs text-indigo-600 hover:underline font-black mt-2 inline-block"
                  >
                    Cargar Alumnos Rápidos 🧬
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* --- LEVEL 2: ACTIVE TEACHER PORTAL --- */}
      {currentUser && currentUser.role === 'teacher' && (
        <div>
          {/* Internal Teacher Navigation Tabs */}
          <div className="flex gap-2 mb-6 border-b border-slate-100 pb-4">
            <button
              id="tab-teacher-roster"
              onClick={() => { sounds.playClick(); setTeacherTab('roster'); }}
              className={`py-2 px-4 rounded-xl font-black text-xs md:text-sm border flex items-center gap-1.5 transition-all uppercase ${
                teacherTab === 'roster'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Lista de Alumnos ({students.length})</span>
            </button>

            <button
              id="tab-teacher-creator"
              onClick={() => { sounds.playClick(); setTeacherTab('creator'); }}
              className={`py-2 px-4 rounded-xl font-black text-xs md:text-sm border flex items-center gap-1.5 transition-all uppercase ${
                teacherTab === 'creator'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Escribir Prueba / Prácticas</span>
            </button>

            <button
              id="tab-teacher-grading"
              onClick={() => { sounds.playClick(); setTeacherTab('grading'); }}
              className={`py-2 px-4 rounded-xl font-black text-xs md:text-sm border flex items-center gap-1.5 transition-all uppercase relative ${
                teacherTab === 'grading'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Calificar Entregas</span>
              {submissions.filter(s => !s.isGraded).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {submissions.filter(s => !s.isGraded).length}
                </span>
              )}
            </button>

            <button
              id="tab-teacher-rooms"
              onClick={() => { sounds.playClick(); setTeacherTab('rooms'); }}
              className={`py-2 px-4 rounded-xl font-black text-xs md:text-sm border flex items-center gap-1.5 transition-all uppercase relative ${
                teacherTab === 'rooms'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <DoorOpen className="w-4 h-4" />
              <span>Salas e Invitaciones ({rooms.length})</span>
            </button>
          </div>

          {/* T1: STUDENT LIST / REGISTER FORM */}
          {teacherTab === 'roster' && (
            <div className="grid md:grid-cols-3 gap-8 items-start">
              
              {/* List of active registered students */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border">
                  <h3 className="font-extrabold text-slate-800 text-base uppercase">Alumnos en Aula</h3>
                  <span className="text-xs text-indigo-600 font-extrabold">Haz clic para ver calificaciones</span>
                </div>

                {students.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {students.map(std => {
                      const avInfo = AVATARS.find(a => a.id === std.avatar);
                      // Calculate completed submissions statistics
                      const finishedQuizSubmitted = submissions.filter(s => s.studentId === std.id);
                      const gradedQuiz = finishedQuizSubmitted.filter(s => s.isGraded);

                      return (
                        <div
                          key={std.id}
                          className="bg-white border-2 border-slate-200 hover:border-indigo-400 p-4 rounded-2xl shadow-sm transition-all flex flex-col justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${std.avatarColor}`}>
                              {avInfo?.emoji || '🐶'}
                            </span>
                            <div>
                              <h4 className="font-extrabold text-slate-800">{std.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold leading-normal uppercase">Rango: Sabio Escolar</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-black text-amber-600 bg-amber-50 rounded px-1.5 py-0.5">🌟 {std.stars || 1} Estrellas</span>
                                <span className="text-xs font-black text-indigo-700 bg-indigo-50 rounded px-1.5 py-0.5">🎒 {std.points || 0} XP</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-dashed border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                            <div>
                              <p>Pruebas hechas: <span className="text-slate-800 font-black">{finishedQuizSubmitted.length}</span></p>
                              <p>Calificadas: <span className="text-emerald-600 font-black">{gradedQuiz.length}</span></p>
                            </div>

                            <button
                              id={`delete-student-btn-${std.id}`}
                              onClick={() => handleDeleteStudent(std.id, std.name)}
                              className="text-slate-350 hover:text-rose-600 p-1 rounded-full transition-all"
                              title="Dar de baja estudiante"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-slate-400 py-10 bg-slate-50/50 rounded-2xl border-2 border-dashed">No hay alumnos agregados en este momento.</p>
                )}

                {/* List of active published quizzes */}
                <div className="mt-6">
                  <h3 className="font-black text-slate-800 uppercase mb-3">Pruebas Publicadas Actuales ({quizzes.length})</h3>
                  {quizzes.length > 0 ? (
                    <div className="space-y-3">
                      {quizzes.map(q => (
                        <div key={q.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {q.subject === 'math' ? '🧮' : q.subject === 'language' ? '📚' : '🧪'}
                            </span>
                            <div>
                              <h4 className="font-extrabold text-sm text-slate-800">{q.title}</h4>
                              <p className="text-xs text-slate-400 font-bold leading-normal">
                                Materia: <span className="text-slate-600 font-black capitalize">{q.subject === 'language' ? 'Lengua y Literatura' : q.subject === 'math' ? 'Matemáticas' : 'Ciencias'}</span> • {q.questions.length} ejercicios creados
                              </p>
                            </div>
                          </div>
                          <button
                            id={`delete-quiz-${q.id}`}
                            onClick={() => handleDeleteQuiz(q.id)}
                            className="bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white p-2 rounded-xl transition-all"
                            title="Eliminar prueba"
                          >
                            <Trash className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No hay pruebas publicadas aún.</p>
                  )}
                </div>

              </div>

              {/* REGISTRATION CARD FOR NEW STUDENTS */}
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-indigo-950 uppercase text-sm">Registrar Nuevo Alumno</h3>
                </div>

                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-indigo-900 uppercase mb-1.5">Nombre Completo:</label>
                    <input
                      id="input-school-student-name"
                      type="text"
                      required
                      placeholder="Ej. Sofía Díaz..."
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm font-bold bg-white border border-indigo-200 rounded-2xl focus:border-indigo-400 focus:outline-none transition-all text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-indigo-900 uppercase mb-1.5 font-sans">Especie Mascota Avatar:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {AVATARS.map(av => (
                        <button
                          key={av.id}
                          type="button"
                          id={`student-avatar-${av.id}`}
                          onClick={() => { sounds.playClick(); setNewStudentAvatar(av.id); }}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                            newStudentAvatar === av.id
                              ? 'border-indigo-600 bg-white scale-105 shadow-xs font-bold'
                              : 'border-indigo-100 bg-indigo-50/50 hover:bg-indigo-105'
                          }`}
                        >
                          <span className="text-2xl">{av.emoji}</span>
                          <span className="text-[8px] font-black text-slate-400 mt-1 uppercase">{av.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-indigo-900 uppercase mb-1.5">Color Favorito:</label>
                    <div className="flex gap-2 justify-center">
                      {COLORS.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          id={`newstudent-color-${i}`}
                          onClick={() => { sounds.playClick(); setNewStudentColor(c.class); }}
                          className={`w-7 h-7 rounded-full border shadow transition-all ${c.class} ${
                            newStudentColor === c.class ? 'scale-115 ring-2 ring-indigo-500 ring-offset-2' : ''
                          }`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    id="btn-submit-student"
                    type="submit"
                    disabled={!newStudentName.trim()}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs uppercase rounded-2xl shadow border-b-2 border-emerald-700 active:scale-95 transition-all cursor-pointer leading-none"
                  >
                    Guardar Estudiante Alumno 📝
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* T2: INTERACTIVE QUIZ DESIGN LAB */}
          {teacherTab === 'creator' && (
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              
              {/* Preset template selector trigger list */}
              <div className="bg-yellow-50 border border-yellow-250 rounded-3xl p-5 shadow-xs lg:col-span-1">
                <div className="flex items-center gap-1.5 text-amber-900 font-extrabold mb-3">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs uppercase font-black tracking-wide">Cargar Plantillas Rápidas</h4>
                </div>
                <p className="text-[11px] text-amber-950/70 font-medium leading-relaxed mb-4">
                  Para asignaciones rápidas, haz clic sobre cualquiera de las actividades prediseñadas e inscríbelo antes de editarlo:
                </p>

                <div className="space-y-2.5">
                  {PRESET_QUIZZES.map((pq, idx) => (
                    <button
                      key={idx}
                      id={`preset-quiz-${idx}`}
                      onClick={() => applyPresetQuiz(idx)}
                      className="w-full text-left bg-white hover:bg-yellow-100 border border-yellow-200 p-3 rounded-2xl shadow-xs transition-all text-xs"
                    >
                      <span className="font-extrabold block text-slate-800 leading-tight mb-1">{pq.title}</span>
                      <span className="inline-block py-0.5 px-2 bg-yellow-400 text-yellow-950 font-black text-[9px] rounded uppercase uppercase tracking-wider">
                        {pq.subject === 'math' ? 'Matemáticas' : pq.subject === 'language' ? 'Lengua' : 'Ciencias'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz interactive author form */}
              <form onSubmit={handlePublishQuiz} className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-black text-slate-800 uppercase text-sm mb-4">Creador de Evaluación de Pruebas 🧪</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">Nombre Título Evaluación:</label>
                      <input
                        id="form-quiz-title"
                        type="text"
                        required
                        placeholder="Ej. Prueba Semanal de Multiplicar"
                        value={quizTitle}
                        onChange={(e) => setQuizTitle(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm font-bold border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">Elegir Materia del Quiz:</label>
                      <select
                        id="form-quiz-subject"
                        value={quizSubject}
                        onChange={(e) => setQuizSubject(e.target.value as Subject)}
                        className="w-full px-4 py-2.5 text-sm font-bold border border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none bg-white transition-all text-slate-800"
                      >
                        <option value="math">🧮 Matemáticas Mágicas</option>
                        <option value="language">📚 Lengua y Literatura</option>
                        <option value="science">🧪 Ciencias Sorpresa</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Questions editor block */}
                <div className="space-y-5">
                  <div className="flex justify-between items-center border-b border-dashed pb-2">
                    <span className="text-xs font-black text-slate-700 uppercase">Ejercicios de la Evaluación ({quizQuestions.length})</span>
                    <button
                      type="button"
                      id="btn-add-exercise"
                      onClick={handleAddQuestion}
                      className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full"
                    >
                      <Plus className="w-3.5 h-3.5" /> Agregar Ejercicio
                    </button>
                  </div>

                  {quizQuestions.map((questionItem, qIdx) => (
                    <div key={qIdx} className="bg-slate-50 p-4 border border-slate-200 rounded-2xl relative space-y-3 shadow-inner">
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-indigo-800 uppercase">Ejercicio #{qIdx + 1}:</span>
                        {quizQuestions.length > 1 && (
                          <button
                            type="button"
                            id={`btn-remove-exercise-${qIdx}`}
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-rose-500 hover:text-rose-700 font-bold text-xs"
                          >
                            Eliminar X
                          </button>
                        )}
                      </div>

                      {/* Question prompt */}
                      <div>
                        <input
                          type="text"
                          placeholder="Escribe la pregunta o problema (Ej. ¿Cuánto es 12 + 15?)"
                          required
                          value={questionItem.question}
                          onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                          className="w-full px-3 py-2 text-xs font-bold border rounded-xl"
                        />
                      </div>

                      {/* Options & answers selection */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Respuestas posibles / Señala la correcta:</p>
                        
                        <div className="grid md:grid-cols-3 gap-2">
                          {questionItem.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder={`Opción ${optIdx + 1}`}
                                required
                                value={opt}
                                onChange={(e) => updateQuestionOption(qIdx, optIdx, e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs font-semibold border rounded-xl"
                              />

                              <input
                                id={`radio-correct-${qIdx}-${optIdx}`}
                                type="radio"
                                name={`correct-${qIdx}`}
                                required
                                checked={questionItem.correctAnswer === opt && opt !== ''}
                                onChange={() => updateQuestionCorrect(qIdx, opt)}
                                className="w-4 h-4 accent-emerald-500 shrink-0 cursor-pointer"
                                title="Fijar como respuesta correcta"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

                {/* Target assign choice */}
                <div className="border-t pt-4">
                  <div className="flex md:items-center justify-between flex-wrap gap-3">
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase mb-1">Cuentas que harán la prueba:</label>
                      <select
                        id="select-students-assign"
                        value={assignedStudentId}
                        onChange={(e) => setAssignedStudentId(e.target.value)}
                        className="px-3 py-1.5 text-xs font-bold border rounded-xl bg-white focus:outline-none"
                      >
                        <option value="all">Asignar a todos los alumnos 🎒</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      id="btn-publish-quiz"
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm px-6 py-3 rounded-xl border-b-4 border-indigo-800 shadow-md flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Publicar y Enviar Evaluación 📬</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          )}

          {/* T3: WORK SUBMISSION GRADER / REVIEW TABLE */}
          {teacherTab === 'grading' && (() => {
            const isStudentRegisteredByTeacher = (studentId: string): boolean => {
              const testAccounts = ['std-hugo', 'std-sofi', 'std-mateo'];
              if (testAccounts.includes(studentId)) return false;
              const std = students.find((s) => s.id === studentId);
              if (currentUser && std && (std.teacherId === currentUser.id || std.registeredByTeacherId === currentUser.id || std.registeredBy === currentUser.id)) {
                return true;
              }
              if (currentUser) {
                try {
                  const stored = localStorage.getItem(`enigmakids_teacher_students_${currentUser.id}`);
                  if (stored) {
                    const ids: string[] = JSON.parse(stored);
                    if (ids.includes(studentId)) return true;
                  }
                } catch {
                  // ignore
                }
              }
              return false;
            };

            const teacherSubmissions = submissions.filter(sub => isStudentRegisteredByTeacher(sub.studentId));

            return (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border">
                  <h3 className="font-extrabold text-slate-800 text-base uppercase">Bandeja de Tareas Recibidas ({teacherSubmissions.length})</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Corrige las respuestas, asigna calificaciones y felicita al estudiante</p>
                </div>

                {teacherSubmissions.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {teacherSubmissions.map(sub => {
                    const student = students.find(s => s.id === sub.studentId);
                    const quiz = quizzes.find(q => q.id === sub.quizId);

                    if (!quiz) return null;

                    return (
                      <div
                        key={sub.id}
                        className={`p-5 rounded-2xl border-2 shadow-xs transition-all relative ${
                          sub.isGraded
                            ? 'bg-slate-50/50 border-slate-200 opacity-85'
                            : 'bg-white border-yellow-300 shadow-md ring-4 ring-yellow-500/10'
                        }`}
                      >
                        {/* Graded success flag badge */}
                        <span className={`absolute top-2 right-2 text-[10px] font-black rounded-full px-2.5 py-1 uppercase uppercase tracking-wider ${
                          sub.isGraded
                            ? 'bg-emerald-500 text-white'
                            : 'bg-yellow-400 text-yellow-950 animate-pulse'
                        }`}>
                          {sub.isGraded ? '✓ Calificado' : '★ Por corregir'}
                        </span>

                        <div className="flex items-center gap-2.5 mb-3">
                          <span className="text-2xl">🎒</span>
                          <div>
                            <h4 className="font-black text-sm text-slate-800">{student ? student.name : 'Estudiante Graduado'}</h4>
                            <p className="text-[10px] text-slate-400 font-bold leading-normal uppercase">
                              Evaluación: <span className="text-slate-600 font-black">{quiz.title}</span>
                            </p>
                          </div>
                        </div>

                        {/* Answers diagnostic list preview */}
                        <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1.5 border border-dashed border-slate-200 mb-4 font-bold">
                          <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Informe de respuestas:</p>
                          {quiz.questions.map((q, idx) => {
                            const given = sub.answers[q.id];
                            const isCorrect = given === q.correctAnswer;
                            return (
                              <div key={idx} className="flex justify-between items-start pt-1 border-t border-slate-100 gap-2">
                                <span className="text-slate-600 leading-tight">Q{idx + 1}: "{q.question.substring(0, 30)}..."</span>
                                <span className={`shrink-0 font-extrabold flex items-center gap-0.5 ${isCorrect ? 'text-emerald-600' : 'text-rose-500'}`}>
                                  {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 inline" /> : <XCircle className="w-3.5 h-3.5 inline" />}
                                  {given || 'Vacía'}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Scoring feedback panel */}
                        <div className="flex items-center justify-between border-t pt-3 flex-wrap gap-2">
                          <div className="text-xs">
                            <span className="text-slate-400 font-bold block uppercase text-[9px] leading-none">Auto Evaluación:</span>
                            <span className="font-extrabold text-indigo-700 text-sm">Puntaje base: {sub.score}%</span>
                            {sub.isGraded && (
                              <p className="text-slate-800 font-black text-xs mt-1">Calificación final: <span className="text-emerald-600">{sub.grade}</span></p>
                            )}
                          </div>

                          {!sub.isGraded ? (
                            <button
                              id={`btn-open-grade-${sub.id}`}
                              onClick={() => handleOpenGradingDialog(sub)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                            >
                              Corregir y Evaluar ✍️
                            </button>
                          ) : (
                            <button
                              id={`btn-listen-feedback-${sub.id}`}
                              onClick={() => handleSpeakFeedback(sub.teacherFeedback || '', sub.grade || '')}
                              className="text-[10px] uppercase font-black text-slate-500 hover:text-indigo-600 flex items-center gap-1"
                              title="Escuchar audio de la nota"
                            >
                              <Volume2 className="w-3.5 h-3.5" /> Escuchar Mensaje
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-10 italic">No se han recibido entregas de exámenes todavía.</p>
              )}
            </div>
          );
        })()}

          {/* T4: ROOM CREATOR AND INVITATION TRACKER */}
          {teacherTab === 'rooms' && (
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              
              {/* Form to create room & invite students */}
              <div className="bg-white border-2 border-indigo-200 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b pb-3">
                  <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center font-black">
                    🚪
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">Crear Sala e Invitar Alumnos</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Envía solicitudes directas a tus estudiantes</p>
                  </div>
                </div>

                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Nombre de la Sala / Grupo:</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Sala de Desafíos Matemáticos 🧠"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Descripción de la Sala (opcional):</label>
                    <input
                      type="text"
                      placeholder="Ej. Repaso interactivo previo al examen semanal"
                      value={newRoomDesc}
                      onChange={(e) => setNewRoomDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </div>

                  {/* Student Multi-Select Checklist */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-black text-slate-500 uppercase">
                        Selecciona Estudiantes a Invitar ({selectedStudentsForRoom.length}/{students.length}):
                      </label>
                      {students.length > 0 && (
                        <button
                          type="button"
                          onClick={toggleSelectAllStudentsForRoom}
                          className="text-[10px] font-black text-indigo-600 hover:underline uppercase"
                        >
                          {selectedStudentsForRoom.length === students.length ? 'Desmarcar Todos' : 'Seleccionar Todos'}
                        </button>
                      )}
                    </div>

                    {students.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-xl bg-slate-50">
                        {students.map(s => {
                          const isSelected = selectedStudentsForRoom.includes(s.id);
                          const avInfo = AVATARS.find(a => a.id === s.avatar);
                          return (
                            <div
                              key={s.id}
                              onClick={() => toggleStudentSelectionForRoom(s.id)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-black shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${s.avatarColor}`}>
                                  {avInfo?.emoji || '🐼'}
                                </span>
                                <span className="text-xs">{s.name}</span>
                              </div>
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-xl text-center italic">
                        No hay alumnos registrados para invitar. Regístralos en la pestaña "Lista de Alumnos".
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase py-3 rounded-xl shadow-md border-b-4 border-indigo-800 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Crear Sala y Enviar Invitación 📩</span>
                  </button>
                </form>
              </div>

              {/* Created Rooms & Student Invitations Tracker */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base uppercase">Salas Creadas y Estado de Invitaciones</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase">Supervisa quiénes aceptaron o rechazaron cada solicitud</p>
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-800 font-black px-3 py-1 rounded-full">
                    {rooms.length} Salas Activas
                  </span>
                </div>

                {rooms.length > 0 ? (
                  <div className="space-y-6">
                    {rooms.map(room => {
                      const roomInvs = invitations.filter(i => i.roomId === room.id);
                      const acceptedCount = roomInvs.filter(i => i.status === 'Aceptada').length;
                      const pendingCount = roomInvs.filter(i => i.status === 'Pendiente').length;
                      const rejectedCount = roomInvs.filter(i => i.status === 'Rechazada').length;

                      return (
                        <div key={room.id} className="bg-white border-2 border-slate-200 p-5 rounded-3xl shadow-sm space-y-4">
                          <div className="flex justify-between items-start flex-wrap gap-2 border-b pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">🏫</span>
                                <h4 className="font-black text-base text-slate-850">{room.name}</h4>
                              </div>
                              {room.description && (
                                <p className="text-xs text-slate-500 font-medium mt-1">{room.description}</p>
                              )}
                              <span className="text-[10px] text-slate-400 font-bold block mt-1">
                                Creada por: {room.teacherName} • {new Date(room.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <button
                              onClick={() => handleAttemptEnterRoom(room)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow border-b-2 border-emerald-700 flex items-center gap-1.5 cursor-pointer"
                            >
                              <DoorOpen className="w-4 h-4" />
                              <span>Ingresar a la Sala</span>
                            </button>
                          </div>

                          {/* Invitation Statuses list for this room */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-xs font-black text-slate-600 uppercase flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-indigo-500" />
                                Estudiantes Invitados ({roomInvs.length}):
                              </h5>
                              <div className="flex gap-2 text-[10px] font-black">
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                  ✅ {acceptedCount} Aceptadas
                                </span>
                                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                  ⏳ {pendingCount} Pendientes
                                </span>
                                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                                  ❌ {rejectedCount} Rechazadas
                                </span>
                              </div>
                            </div>

                            {roomInvs.length > 0 ? (
                              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                {roomInvs.map(inv => {
                                  const std = students.find(s => s.id === inv.studentId);
                                  const avInfo = AVATARS.find(a => a.id === std?.avatar);

                                  return (
                                    <div
                                      key={inv.id}
                                      className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs ${
                                        inv.status === 'Aceptada'
                                          ? 'bg-emerald-50/70 border-emerald-250'
                                          : inv.status === 'Rechazada'
                                          ? 'bg-rose-50/70 border-rose-250'
                                          : 'bg-amber-50/70 border-amber-250'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${std?.avatarColor || 'bg-slate-200'}`}>
                                          {avInfo?.emoji || '👤'}
                                        </span>
                                        <span className="font-extrabold text-slate-800 text-xs">{inv.studentName}</span>
                                      </div>

                                      {inv.status === 'Aceptada' && (
                                        <span className="bg-emerald-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                          ✓ Aceptada
                                        </span>
                                      )}

                                      {inv.status === 'Rechazada' && (
                                        <span className="bg-rose-500 text-white font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                          ✕ Rechazada
                                        </span>
                                      )}

                                      {inv.status === 'Pendiente' && (
                                        <span className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                                          ⏳ Pendiente
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl text-center">
                                No se han invitado estudiantes a esta sala.
                              </p>
                            )}

                            {/* Option to invite uninvited students */}
                            {students.filter(s => !roomInvs.some(i => i.studentId === s.id)).length > 0 && (
                              <div className="mt-3 pt-3 border-t border-dashed border-slate-150 flex items-center gap-2 flex-wrap text-xs">
                                <span className="font-bold text-slate-500">Invitar más estudiantes:</span>
                                {students
                                  .filter(s => !roomInvs.some(i => i.studentId === s.id))
                                  .map(s => (
                                    <button
                                      key={s.id}
                                      onClick={() => handleSendAdditionalInvitation(room.id, s.id)}
                                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                    >
                                      <span>+ {s.name}</span>
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-slate-400 py-12 bg-white rounded-3xl border-2 border-dashed">
                    No has creado ninguna sala virtual aún. Completa el formulario de la izquierda para comenzar.
                  </p>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* --- LEVEL 3: ACTIVE STUDENT PORTAL --- */}
      {currentUser && currentUser.role === 'student' && (
        <div className="space-y-8">
          
          {/* Welcome Card & Level indicators */}
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-3xl p-6 border-2 border-dashed border-indigo-300 text-center relative shadow-inner">
            <span className="absolute top-2 right-3 text-[10px] font-black uppercase text-indigo-600 tracking-wider">
              Grado: Súper Estudiante Enigmakids
            </span>
            <div className="text-5xl mb-2 animate-bounce">
              {AVATARS.find(a => a.id === currentUser.avatar)?.emoji || '🦁'}
            </div>
            <h2 className="text-2xl font-black text-indigo-950">¡Hola {currentUser.name}! 🌟</h2>
            <p className="text-xs text-slate-550 max-w-sm mx-auto font-medium leading-relaxed mt-1">
              Gestiona tus invitaciones a salas, ingresa a tus aulas virtuales o realiza tus evaluaciones asignadas.
            </p>
          </div>

          {/* PUBLISHED GRADE NOTIFICATION BANNER */}
          {(() => {
            const newlyPublishedSubs = submissions.filter(s => s.studentId === currentUser.id && s.isGraded && s.isPublished);
            if (newlyPublishedSubs.length === 0) return null;

            return (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md border-2 border-emerald-400">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white text-emerald-700 flex items-center justify-center font-black text-xl shrink-0 shadow-sm animate-bounce">
                    📬
                  </div>
                  <div>
                    <p className="font-black text-xs md:text-sm uppercase tracking-wide">
                      ¡Tu profesor ha publicado tus calificaciones!
                    </p>
                    <p className="text-[11px] text-emerald-100 font-medium mt-0.5">
                      Tienes {newlyPublishedSubs.length} evaluación{newlyPublishedSubs.length > 1 ? 'es' : ''} revisada{newlyPublishedSubs.length > 1 ? 's' : ''}. Revisa la pestaña "Mis Evaluaciones" para ver tus notas y observaciones.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => { sounds.playClick(); setStudentTab('quizzes'); }}
                  className="bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-black px-4 py-2 rounded-xl transition-all shadow shrink-0 cursor-pointer"
                >
                  Ver Notas →
                </button>
              </div>
            );
          })()}

          {/* UNAUTHORIZED ALERT BANNER */}
          <AnimatePresence>
            {unauthorizedAlert && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-rose-100 border-2 border-rose-400 text-rose-950 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 animate-bounce" />
                  <div>
                    <p className="font-extrabold text-xs md:text-sm">{unauthorizedAlert}</p>
                    <p className="text-[11px] text-rose-800 font-medium">
                      Para ingresar, debes aceptar primero la solicitud enviada por el profesor en la pestaña "Mis Invitaciones".
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUnauthorizedAlert(null)}
                  className="text-xs font-black bg-rose-200 hover:bg-rose-300 text-rose-950 px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer"
                >
                  Entendido ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ACTIVE ROOM VIEW (WHEN INSIDE A ROOM) */}
          {enteredRoom ? (
            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border-4 border-indigo-500 shadow-2xl space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-3 border-b border-slate-700 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-800">
                    🟢 En Vivo • Sala Virtual Activa
                  </span>
                  <h3 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                    <span>🏫 {enteredRoom.name}</span>
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Profesor a cargo: <span className="font-bold text-yellow-300">{enteredRoom.teacherName}</span>
                  </p>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    sounds.speak('Has salido de la sala virtual.');
                    setEnteredRoom(null);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <DoorOpen className="w-4 h-4" />
                  <span>Salir de la Sala 🚪</span>
                </button>
              </div>

              {/* Interactive Whiteboard / Pizarra */}
              <div className="bg-slate-800 border-2 border-slate-700 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Pizarra Digital Interactiva y Anotaciones
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold">Modo Colaborativo</span>
                </div>

                <textarea
                  value={whiteboardNotes}
                  onChange={(e) => setWhiteboardNotes(e.target.value)}
                  className="w-full bg-slate-950 text-emerald-300 p-4 rounded-xl border border-slate-700 font-mono text-xs focus:outline-none focus:border-indigo-500 h-32 leading-relaxed"
                  placeholder="Escribe notas de la clase aquí..."
                />
              </div>

              {/* Room participants list */}
              <div>
                <h4 className="text-xs font-black text-slate-300 uppercase mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Participantes Autorizados en esta Sala:
                </h4>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-indigo-900/80 border border-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold text-yellow-300 flex items-center gap-1.5">
                    <span>🎓 {enteredRoom.teacherName} (Profesor)</span>
                  </div>
                  {invitations
                    .filter(i => i.roomId === enteredRoom.id && i.status === 'Aceptada')
                    .map(inv => (
                      <div key={inv.id} className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span>🎒 {inv.studentName}</span>
                        <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-black">Autorizado</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : activeQuiz ? (
            /* ACTIVE QUIZ RUNNING VIEW */
            <div className="bg-slate-50 border-4 border-yellow-300 rounded-3xl p-6 md:p-8 relative shadow-lg">
              
              {/* Counter progress */}
              <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 mb-6">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wide leading-none">Evaluación en progreso:</span>
                  <p className="text-sm font-extrabold text-slate-800">{activeQuiz.title}</p>
                </div>
                <div className="bg-indigo-50 px-3 py-1.5 rounded-full text-indigo-700 text-xs font-black shrink-0">
                  Pregunta {currentQuestionIndex + 1} de {activeQuiz.questions.length}
                </div>
              </div>

              {/* Progress Bar visual */}
              <div className="w-full bg-slate-200 h-2 rounded-full mb-6 overflow-hidden">
                <div
                  className="bg-indigo-500 h-2 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Active question card and answers choice inside taking quiz */}
              <div className="bg-white p-6 border border-slate-250 rounded-2xl shadow-sm text-center mb-6 min-h-[120px] flex flex-col justify-center">
                <h3 className="text-lg md:text-xl font-extrabold text-slate-800 leading-normal">
                  {activeQuiz.questions[currentQuestionIndex].question}
                </h3>
              </div>

              {/* Multiple Options options buttons layout */}
              <div className="grid md:grid-cols-3 gap-3">
                {activeQuiz.questions[currentQuestionIndex].options.map((opt, oIdx) => {
                  const isSelected = studentAnswers[activeQuiz.questions[currentQuestionIndex].id] === opt;
                  return (
                    <button
                      key={oIdx}
                      id={`quiz-option-btn-${oIdx}`}
                      onClick={() => handleSelectAnswer(opt)}
                      className={`py-4 px-6 text-sm font-black border-2 rounded-2xl shadow-sm transition-all duration-150 relative ${
                        isSelected
                          ? 'bg-indigo-500 border-indigo-600 text-white shadow'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {opt}
                      {isSelected && (
                        <Check className="w-5 h-5 absolute top-2 right-2 fill-emerald-500 text-white stroke-[3px]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next and back sliders control footer */}
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200">
                <button
                  id="btn-quiz-prev"
                  disabled={currentQuestionIndex === 0}
                  onClick={handlePrevQuestion}
                  className={`text-xs font-black uppercase py-2 px-4 rounded-xl border ${
                    currentQuestionIndex === 0 ? 'text-slate-300 border-slate-100 bg-slate-50' : 'bg-white text-slate-600 hover:bg-slate-100 transition-all'
                  }`}
                >
                  Regresar Anterior
                </button>

                {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    id="btn-quiz-next"
                    disabled={!studentAnswers[activeQuiz.questions[currentQuestionIndex].id]}
                    onClick={handleNextQuestion}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase py-2.5 px-5 rounded-xl transition-all shadow border-b-2 border-indigo-800 active:scale-95 disabled:opacity-50"
                  >
                    Siguiente Pregunta ➔
                  </button>
                ) : (
                  <button
                    id="btn-quiz-submit"
                    disabled={Object.keys(studentAnswers).length < activeQuiz.questions.length}
                    onClick={handleSubmitQuizAnswers}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm uppercase py-3 px-6 rounded-2xl shadow-md border-b-4 border-emerald-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    ¡Entregar Mi Examen! 📬
                  </button>
                )}
              </div>

            </div>
          ) : (
            
            // STUDENT GENERAL HUB VIEW
            <div className="space-y-6">
              
              {/* STUDENT TABS */}
              <div className="flex gap-2 border-b border-slate-200 pb-3 flex-wrap">
                {/* INVITATIONS TAB BUTTON WITH PENDING BADGE */}
                {(() => {
                  const pendingCount = invitations.filter(
                    i => i.studentId === currentUser.id && i.status === 'Pendiente'
                  ).length;

                  return (
                    <button
                      onClick={() => { sounds.playClick(); setStudentTab('invitations'); }}
                      className={`py-2.5 px-4 rounded-2xl font-black text-xs md:text-sm border-2 transition-all flex items-center gap-2 relative cursor-pointer ${
                        studentTab === 'invitations'
                          ? 'bg-indigo-600 border-indigo-700 text-white shadow-md'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      <span>💌 Mis Invitaciones / Solicitudes</span>
                      {pendingCount > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                          {pendingCount} NUEVA{pendingCount > 1 ? 'S' : ''}
                        </span>
                      )}
                    </button>
                  );
                })()}

                {/* MY ROOMS TAB BUTTON */}
                <button
                  onClick={() => { sounds.playClick(); setStudentTab('my_rooms'); }}
                  className={`py-2.5 px-4 rounded-2xl font-black text-xs md:text-sm border-2 transition-all flex items-center gap-2 cursor-pointer ${
                    studentTab === 'my_rooms'
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50'
                  }`}
                >
                  <DoorOpen className="w-4 h-4" />
                  <span>🏫 Mis Salas Aceptadas ({
                    invitations.filter(i => i.studentId === currentUser.id && i.status === 'Aceptada').length
                  })</span>
                </button>

                {/* QUIZZES TAB BUTTON */}
                <button
                  onClick={() => { sounds.playClick(); setStudentTab('quizzes'); }}
                  className={`py-2.5 px-4 rounded-2xl font-black text-xs md:text-sm border-2 transition-all flex items-center gap-2 cursor-pointer ${
                    studentTab === 'quizzes'
                      ? 'bg-indigo-600 border-indigo-700 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>📝 Mis Evaluaciones</span>
                </button>
              </div>

              {/* S1: INVITATIONS TAB */}
              {studentTab === 'invitations' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-indigo-950 text-base">Bandeja de Solicitudes de Ingreso</h3>
                      <p className="text-xs text-indigo-700 font-medium">
                        Aquí verás las invitaciones que tu profesor te ha enviado para ingresar a sus salas de clase.
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const myInvitations = invitations.filter(i => i.studentId === currentUser.id);

                    if (myInvitations.length === 0) {
                      return (
                        <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center space-y-2">
                          <Mail className="w-10 h-10 text-slate-300 mx-auto" />
                          <p className="text-sm font-extrabold text-slate-600">No tienes invitaciones de salas por ahora.</p>
                          <p className="text-xs text-slate-400">Pide a tu profesor que te envíe una invitación desde la cuenta de Maestro.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid md:grid-cols-2 gap-4">
                        {myInvitations.map(inv => {
                          const roomObj = rooms.find(r => r.id === inv.roomId);

                          return (
                            <div
                              key={inv.id}
                              className={`bg-white border-2 p-5 rounded-3xl shadow-sm space-y-3 transition-all relative ${
                                inv.status === 'Pendiente'
                                  ? 'border-amber-300 ring-4 ring-amber-400/10'
                                  : inv.status === 'Aceptada'
                                  ? 'border-emerald-300'
                                  : 'border-slate-200 opacity-80'
                              }`}
                            >
                              {/* Status Badge header */}
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">🏫</span>
                                  <div>
                                    <h4 className="font-black text-base text-slate-850">{inv.roomName}</h4>
                                    <p className="text-xs text-slate-500 font-bold">
                                      Profesor: <span className="text-indigo-700 font-black">{inv.teacherName}</span>
                                    </p>
                                  </div>
                                </div>

                                {inv.status === 'Pendiente' && (
                                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">
                                    ⏳ Pendiente
                                  </span>
                                )}

                                {inv.status === 'Aceptada' && (
                                  <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                                    ✓ Aceptada
                                  </span>
                                )}

                                {inv.status === 'Rechazada' && (
                                  <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                                    ✕ Rechazada
                                  </span>
                                )}
                              </div>

                              {/* Invitation Details: Date and time */}
                              <div className="bg-slate-50 p-2.5 rounded-xl text-xs font-semibold text-slate-500 flex justify-between items-center border">
                                <span>Fecha y Hora de la solicitud:</span>
                                <span className="font-bold text-slate-700">
                                  {new Date(inv.createdAt).toLocaleString('es-ES', {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                  })}
                                </span>
                              </div>

                              {/* Action Buttons: Aceptar / Rechazar */}
                              <div className="pt-2 border-t flex items-center gap-2 flex-wrap justify-end">
                                {inv.status === 'Pendiente' && (
                                  <>
                                    <button
                                      onClick={() => handleRejectInvitation(inv)}
                                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      <span>Rechazar</span>
                                    </button>

                                    <button
                                      onClick={() => handleAcceptInvitation(inv)}
                                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-5 py-2 rounded-xl transition-all shadow border-b-2 border-emerald-700 cursor-pointer flex items-center gap-1 active:scale-95"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Aceptar Invitación</span>
                                    </button>
                                  </>
                                )}

                                {inv.status === 'Aceptada' && (
                                  <div className="flex items-center gap-2 w-full justify-between">
                                    <button
                                      onClick={() => handleRejectInvitation(inv)}
                                      className="text-[11px] font-bold text-slate-400 hover:text-rose-600 underline"
                                    >
                                      Cambiar a Rechazar
                                    </button>

                                    <button
                                      onClick={() => roomObj && handleAttemptEnterRoom(roomObj)}
                                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <DoorOpen className="w-4 h-4" />
                                      <span>Ingresar a la Sala</span>
                                    </button>
                                  </div>
                                )}

                                {inv.status === 'Rechazada' && (
                                  <button
                                    onClick={() => handleAcceptInvitation(inv)}
                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Aceptar ahora</span>
                                  </button>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* S2: MY ACCEPTED ROOMS TAB */}
              {studentTab === 'my_rooms' && (
                <div className="space-y-6">
                  <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h3 className="font-extrabold text-emerald-950 text-base">Mis Salas Virtuales Autorizadas</h3>
                      <p className="text-xs text-emerald-800 font-medium">
                        Salas a las que has aceptado invitación. Haz clic en "Ingresar" para unirte a la clase.
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const acceptedInvs = invitations.filter(
                      i => i.studentId === currentUser.id && i.status === 'Aceptada'
                    );

                    if (acceptedInvs.length === 0) {
                      return (
                        <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-slate-200 text-center space-y-2">
                          <DoorOpen className="w-10 h-10 text-slate-300 mx-auto" />
                          <p className="text-sm font-extrabold text-slate-600">No tienes salas aceptadas por el momento.</p>
                          <p className="text-xs text-slate-400">Revisa la pestaña "Mis Invitaciones" para aceptar las solicitudes pendientes.</p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid md:grid-cols-2 gap-4">
                        {acceptedInvs.map(inv => {
                          const roomObj = rooms.find(r => r.id === inv.roomId);

                          return (
                            <div key={inv.id} className="bg-white border-2 border-emerald-200 p-5 rounded-3xl shadow-sm space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">🏫</span>
                                <div>
                                  <h4 className="font-black text-base text-slate-850">{inv.roomName}</h4>
                                  <p className="text-xs text-slate-500 font-bold">
                                    Profesor: <span className="text-indigo-700 font-black">{inv.teacherName}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="pt-3 border-t flex justify-between items-center">
                                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                                  ✓ Acceso Permitido
                                </span>

                                <button
                                  onClick={() => roomObj && handleAttemptEnterRoom(roomObj)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow border-b-2 border-emerald-700 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <DoorOpen className="w-4 h-4" />
                                  <span>Ingresar a la Sala 🚪</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* MANUAL ENTRY TEST FORM (TEST AUTHORIZATION BLOCKING RULE) */}
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-indigo-500" />
                      Probar Verificación de Permisos / Ingreso Manual de Sala:
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Intenta ingresar escribiendo el nombre o ID de una sala. Si no has aceptado la invitación, el sistema bloqueará el acceso y mostrará un mensaje de no autorización.
                    </p>

                    <form onSubmit={handleManualEntryAttempt} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Escribe ID o Nombre de Sala..."
                        value={manualRoomInput}
                        onChange={(e) => setManualRoomInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs font-bold border rounded-xl bg-white text-slate-800 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow transition-all cursor-pointer"
                      >
                        Probar Ingreso
                      </button>
                    </form>
                  </div>

                </div>
              )}

              {/* S3: QUIZZES TAB */}
              {studentTab === 'quizzes' && (
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  
                  {/* Assigned Pending Quizzes */}
                  <div className="bg-white border-2 border-slate-100 rounded-3xl p-6">
                    <h3 className="font-black text-slate-800 uppercase text-sm mb-4 border-b border-dashed pb-2 flex items-center gap-1.5">
                      <Clock className="w-4.5 h-4.5 text-indigo-500 animate-spin" />
                      <span>Mis Pruebas Pendientes</span>
                    </h3>

                    {quizzes.filter(q => q.assignedTo.includes('all') || q.assignedTo.includes(currentUser.id)).length > 0 ? (
                      <div className="space-y-3">
                        {quizzes
                          .filter(q => q.assignedTo.includes('all') || q.assignedTo.includes(currentUser.id))
                          .map(q => {
                            const isDone = submissions.some(sub => sub.quizId === q.id && sub.studentId === currentUser.id);
                            
                            return (
                              <div key={q.id} className="bg-slate-50 border p-4 rounded-2xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-2xl">
                                    {q.subject === 'math' ? '🧮' : q.subject === 'language' ? '📚' : '🧪'}
                                  </span>
                                  <div>
                                    <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{q.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase block mt-1">Materia: {q.subject === 'language' ? 'Lengua' : q.subject === 'math' ? 'Matemáticas' : 'Ciencias'}</p>
                                  </div>
                                </div>

                                {isDone ? (
                                  <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-black flex items-center gap-1 shrink-0">
                                    ✓ Entregada
                                  </span>
                                ) : (
                                  <button
                                    id={`btn-start-quiz-${q.id}`}
                                    onClick={() => handleStartQuiz(q)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow border-b-2 border-indigo-800 hover:scale-105"
                                  >
                                    Iniciar Prueba 📝
                                  </button>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-center text-slate-400 py-10 italic">No tienes evaluaciones asignadas. ¡Buen momento para repasar!</p>
                    )}
                  </div>

                  {/* Submitted & Graded Quizzes history */}
                  <div className="bg-white border-2 border-slate-100 rounded-3xl p-6">
                    <h3 className="font-black text-slate-800 uppercase text-sm mb-4 border-b border-dashed pb-2 flex items-center gap-1.5">
                      <Award className="w-5 h-5 text-amber-500" />
                      <span>Mis Resultados del Aula</span>
                    </h3>

                    {submissions.filter(s => s.studentId === currentUser.id).length > 0 ? (
                      <div className="space-y-3">
                        {submissions
                          .filter(s => s.studentId === currentUser.id)
                          .map(subHistory => {
                            const qInfo = quizzes.find(q => q.id === subHistory.quizId);
                            if (!qInfo) return null;

                            return (
                              <div
                                key={subHistory.id}
                                className={`p-4 rounded-2xl border-2 shadow-xs ${
                                  subHistory.isGraded
                                    ? 'bg-emerald-50/50 border-emerald-250'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <h4 className="font-extrabold text-xs text-slate-800 leading-tight">{qInfo.title}</h4>
                                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Fecha: {new Date(subHistory.submittedAt).toLocaleDateString()}</span>
                                  </div>
                                  
                                  <span className={`text-[10px] font-black rounded-full px-2.5 py-1 uppercase ${
                                    subHistory.isGraded ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
                                  }`}>
                                    {subHistory.isGraded ? 'Calificada' : 'Esperando corrección'}
                                  </span>
                                </div>

                                {subHistory.isGraded ? (
                                  <div className="mt-3 pt-3 border-t border-slate-100 border-dashed space-y-2">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                      <p className="text-xs font-black text-slate-800 bg-white/70 px-2 py-1 rounded border">
                                        Nota recibida: <span className="text-emerald-700">{subHistory.grade}</span>
                                      </p>

                                      <button
                                        id={`speak-feedback-${subHistory.id}`}
                                        onClick={() => handleSpeakFeedback(subHistory.teacherFeedback || '', subHistory.grade || '')}
                                        className="text-[10px] uppercase font-black text-indigo-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                                      >
                                        <Volume2 className="w-3.5 h-3.5" /> Escuchar Mensaje
                                      </button>
                                    </div>

                                    {subHistory.teacherFeedback && (
                                      <div className="bg-white p-2.5 rounded-xl text-xs text-slate-650 italic font-bold border leading-tight">
                                        " {subHistory.teacherFeedback} "
                                      </div>
                                    )}

                                    {/* Detailed question analysis */}
                                    <div className="bg-white/80 p-2.5 rounded-xl border space-y-1 text-[11px] font-semibold text-slate-700">
                                      <p className="text-[9px] font-black uppercase text-indigo-600 mb-1">Revisión de respuestas:</p>
                                      {qInfo.questions.map((q, idx) => {
                                        const stdAns = subHistory.answers[q.id];
                                        const isCorrect = stdAns === q.correctAnswer;
                                        return (
                                          <div key={idx} className="flex justify-between items-center py-0.5 border-b border-slate-100 last:border-0">
                                            <span className="truncate max-w-[180px]">P{idx + 1}: {q.question}</span>
                                            <span className={`font-black text-[10px] ${isCorrect ? 'text-emerald-600' : 'text-rose-500'}`}>
                                              {isCorrect ? '✓ Correcto' : `❌ (${stdAns || 'Sin resp.'}) -> Correcta: ${q.correctAnswer}`}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-450 mt-3 pt-3 border-t border-dashed border-slate-150">
                                    ⏳ Tu profesor está revisando y asignando tus puntos de felicitación. ¡Sigue concentrado!
                                  </p>
                                )}

                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <p className="text-center text-slate-400 py-10 italic">No tienes entregas realizadas.</p>
                    )}

                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* Interactive Socratic Classroom Tips */}
      <div className="flex gap-2 items-start text-xs text-slate-400 mt-8 bg-slate-50 p-4 rounded-2xl border border-slate-150">
        <HelpCircle className="w-4.5 h-4.5 text-indigo-500 mt-0.5 shrink-0" />
        <p className="leading-snug">
          <strong>¿Cómo usar el sistema escolar?</strong> La cuenta escolar permite experimentar el flujo completo del maestro y estudiante. <strong>Para simular:</strong> ingresa como profesor, crea cuestionarios personalizados o carga plantillas rápidas. Luego, cierra sesión, ingresa con cualquiera de las cuentas de tus alumnos, completa la prueba activa ¡y regresa a la cuenta de profesor para ver los resultados finales asignando las divertidas estrellas!
        </p>
      </div>

      {/* GRADING COMPACT CENTER MODAL DIALOG */}
      <AnimatePresence>
        {gradingSubmission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 rounded-none h-full w-full"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white p-6 rounded-3xl border-4 border-indigo-400 max-w-lg w-full shadow-2xl relative space-y-4 text-slate-850"
            >
              <button
                id="btn-close-grading-modal"
                onClick={() => setGradingSubmission(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full transition-all"
              >
                ✕
              </button>

              <h4 className="text-base font-black text-indigo-950 uppercase">Evaluación y Calificación 🧑‍🏫</h4>
              
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Nota Calificación Cualitativa / Puntaje:</p>
                <select
                  id="select-grade-rate"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-semibold border rounded-xl bg-white text-slate-800"
                >
                  <option value="10 / 10 (Excelente) ⭐">10 / 10 (Excelente) ⭐</option>
                  <option value="9 / 10 (Muy buen trabajo) 👍">9 / 10 (Muy buen trabajo) 👍</option>
                  <option value="8 / 10 (Buen esfuerzo) 🙂">8 / 10 (Buen esfuerzo) 🙂</option>
                  <option value="7 / 10 (Aprobado)">7 / 10 (Aprobado)</option>
                  <option value="Repetir prueba para aprender más">Repetir prueba para aprender más 🔄</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase mb-1">Retroalimentación / Mensaje al estudiante:</label>
                <textarea
                  id="textarea-feedback"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border rounded-xl h-24 text-slate-800"
                  placeholder="¡Estrellita dorada te espera! Escribe una nota entusiasta."
                />
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t">
                <button
                  id="btn-cancel-grading"
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold px-4 py-2 rounded-xl"
                >
                  Cancelar
                </button>
                
                <button
                  id="btn-save-grading"
                  type="button"
                  onClick={handleSaveTeacherGrade}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-5 py-2 rounded-xl transition-all border-b-2 border-emerald-700 shadow shadow-emerald-250 active:scale-95"
                >
                  Confirmar y Guardar Calificación 📬
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
