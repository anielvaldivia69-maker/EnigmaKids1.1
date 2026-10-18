/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlayerProfile {
  name: string;
  avatar: string;
  avatarColor: string;
  points: number;
  streak: number;
  stars: number;
  completedActivities: string[];
  unlockedBadges: string[];
  mathScores: {
    suma: number;
    resta: number;
    multiplicacion: number;
    division: number;
  };
  mathLevels: {
    suma: number;
    resta: number;
    multiplicacion: number;
    division: number;
  };
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  pointsRequired: number;
}

export type Subject = 'math' | 'language' | 'science' | 'philosophy_curiosities' | 'painting_drawing';

export interface MathQuestion {
  question: string;
  answer: number;
  options: number[];
  difficulty: 'easy' | 'medium' | 'hard' | 'genius';
}

export interface WordChallenge {
  word: string;
  scrambled: string;
  clue: string;
  options: string[];
  correctType: string;
}

export interface EcosystemItem {
  id: string;
  name: string;
  emoji: string;
  correctEcosystem: 'ocean' | 'desert' | 'jungle' | 'forest';
}

export interface OrganItem {
  id: string;
  name: string;
  function: string;
  emoji: string;
  x: number; // relative placement on silhouette
  y: number;
}

export type SchoolRole = 'student' | 'teacher' | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  role: SchoolRole;
  avatar: string;
  avatarColor: string;
  username?: string; // unique username for login
  password?: string; // password for simple local authentication
  active?: boolean; // account active/deactivated status
  grade?: 'Primer Grado' | 'Segundo Grado' | 'Tercer Grado' | null; // grade level for students
  assignedCourses?: string[]; // list of assigned course ids
  assignedGrades?: string[]; // list of assigned grade strings for teachers
  points?: number; // for students
  stars?: number; // for students
  unlockedBadges?: string[]; // for students
  mathLevels?: {
    suma: number;
    resta: number;
    multiplicacion: number;
    division: number;
  };
  lastConnection?: string;
  studyTimeMinutes?: number;
  completedActivitiesCount?: number;
  completedGamesCount?: number;
  createdAt?: string;
  teacherId?: string; // ID of the teacher who registered this student
  registeredByTeacherId?: string;
  registeredBy?: string;
}

export interface TeacherQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  isOpenQuestion?: boolean; // For open/development questions
}

export interface Quiz {
  id: string;
  title: string;
  subject: 'math' | 'language' | 'science';
  teacherId: string;
  questions: TeacherQuizQuestion[];
  assignedTo: string[]; // student ids, or 'all'
  dueDate?: string; // Fecha límite de entrega
  createdAt: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  studentId: string;
  answers: { [questionId: string]: string };
  isGraded: boolean;
  isPublished?: boolean; // Indicar si la nota ha sido publicada al estudiante
  publishedAt?: string; // Fecha de publicación de la nota
  score?: number; // graded auto score e.g. 80
  grade?: string; // teacher's grade e.g. "Excelente (A+)", "10 / 10", "Aprobado"
  teacherFeedback?: string;
  submittedAt: string;
  customGrades?: { [questionId: string]: number };
}

export type InvitationStatus = 'Pendiente' | 'Aceptada' | 'Rechazada';

export interface Room {
  id: string;
  name: string;
  description?: string;
  subject?: 'math' | 'language' | 'science' | 'general';
  teacherId: string;
  teacherName: string;
  createdAt: string;
}

export interface RoomInvitation {
  id: string;
  roomId: string;
  roomName: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  status: InvitationStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  courseOrGrade: string;
  date: string;
  submittedAt: string;
  status: 'Aprobado' | 'Pendiente' | 'Revisado';
  records: {
    studentId: string;
    studentName: string;
    present: boolean;
    notes?: string;
  }[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: SchoolRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface CourseItem {
  id: string;
  name: string;
  grade: 'Primer Grado' | 'Segundo Grado' | 'Tercer Grado' | 'Multigrado';
  subject: Subject | 'general';
  teacherId: string;
  teacherName: string;
  status: 'Activo' | 'Finalizado' | 'Inactivo';
  studentsCount: number;
  description: string;
  createdAt: string;
}

export interface PlatformConfig {
  schoolYear: string;
  institutionalName: string;
  maintenanceMode: boolean;
  maxStudentsPerGrade: number;
  autoApproveAttendance: boolean;
  notificationsEnabled: boolean;
  systemBackupDate: string;
}

export type VirtualRoomType = 'clase' | 'actividad' | 'evaluacion';
export type VirtualRoomStatus = 'activa' | 'cerrada' | 'finalizada';

export interface VirtualRoomParticipant {
  studentId: string;
  studentName: string;
  studentUsername?: string;
  joinedAt: string;
  status: 'Activo' | 'Desconectado';
}

export interface VirtualRoom {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: VirtualRoomType;
  status: VirtualRoomStatus;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  updatedAt?: string;
  participants: VirtualRoomParticipant[];
  assignedQuizId?: string;
}



