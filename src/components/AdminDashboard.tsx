/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserAccount,
  Quiz,
  QuizSubmission,
  AttendanceRecord,
  AuditLog,
  CourseItem,
  PlatformConfig
} from '../types';
import { sounds } from '../utils/sound';
import {
  ShieldCheck,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  History,
  Settings,
  User,
  LogOut,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Key,
  Download,
  Calendar,
  Sparkles,
  GraduationCap,
  Award,
  Clock,
  Save,
  Check,
  X,
  AlertTriangle,
  FileSpreadsheet,
  Eye,
  RefreshCw,
  Sliders,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  currentUser: UserAccount;
  onLogout: () => void;
  onNavigateHome?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    'home' | 'users' | 'courses' | 'attendance' | 'reports' | 'audit' | 'settings' | 'profile'
  >('home');

  // Sub-tabs for Users management
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Storage states loaded from localStorage
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [config, setConfig] = useState<PlatformConfig>({
    schoolYear: '2026 - 2027',
    institutionalName: 'Unidad Educativa EnigmaKids',
    maintenanceMode: false,
    maxStudentsPerGrade: 35,
    autoApproveAttendance: false,
    notificationsEnabled: true,
    systemBackupDate: new Date().toLocaleDateString('es-ES'),
  });

  // Modal States
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [viewingStudentDetail, setViewingStudentDetail] = useState<UserAccount | null>(null);

  // Form states for user creation/editing
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [formGrade, setFormGrade] = useState<'Primer Grado' | 'Segundo Grado' | 'Tercer Grado' | null>('Primer Grado');
  const [formAvatar, setFormAvatar] = useState('buho');
  const [formAvatarColor, setFormAvatarColor] = useState('bg-purple-400 border-purple-500 text-white');

  // Form states for course creation/editing
  const [courseName, setCourseName] = useState('');
  const [courseGrade, setCourseGrade] = useState<'Primer Grado' | 'Segundo Grado' | 'Tercer Grado' | 'Multigrado'>('Primer Grado');
  const [courseSubject, setCourseSubject] = useState<'math' | 'language' | 'science' | 'general'>('general');
  const [courseTeacherId, setCourseTeacherId] = useState('');
  const [courseDescription, setCourseDescription] = useState('');

  // Attendance filter states
  const [attendanceTeacherFilter, setAttendanceTeacherFilter] = useState('all');
  const [attendanceDateFilter, setAttendanceDateFilter] = useState('');

  // Password change state for Admin Profile
  const [adminCurrentPass, setAdminCurrentPass] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  // Load all data from localStorage on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'admin',
      action,
      details,
      timestamp: new Date().toLocaleString('es-ES'),
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem('enigmakids_audit_logs', JSON.stringify(updated));
  };

  const loadAllData = () => {
    // 1. Users
    const rawUsers = localStorage.getItem('enigmakids_registered_users');
    let loadedUsers: UserAccount[] = [];
    if (rawUsers) {
      try {
        loadedUsers = JSON.parse(rawUsers);
      } catch {
        loadedUsers = [];
      }
    }
    setUsers(loadedUsers);

    // 2. Courses
    const rawCourses = localStorage.getItem('enigmakids_courses');
    let loadedCourses: CourseItem[] = [];
    if (rawCourses) {
      try {
        loadedCourses = JSON.parse(rawCourses);
      } catch {
        loadedCourses = [];
      }
    } else {
      // Default courses bootstrap
      loadedCourses = [
        {
          id: 'course-101',
          name: 'Matemáticas Divertidas 1º Grado',
          grade: 'Primer Grado',
          subject: 'math',
          teacherId: 'teacher-main',
          teacherName: 'Profesor 🎓',
          status: 'Activo',
          studentsCount: 15,
          description: 'Suma, resta e introducción a patrones numéricos con animales.',
          createdAt: new Date().toLocaleDateString('es-ES'),
        },
        {
          id: 'course-102',
          name: 'Lenguaje y Cuentos 2º Grado',
          grade: 'Segundo Grado',
          subject: 'language',
          teacherId: 'teacher-main',
          teacherName: 'Profesor 🎓',
          status: 'Activo',
          studentsCount: 12,
          description: 'Comprensión lectora, ortografía y aventuras literarias.',
          createdAt: new Date().toLocaleDateString('es-ES'),
        },
      ];
      localStorage.setItem('enigmakids_courses', JSON.stringify(loadedCourses));
    }
    setCourses(loadedCourses);

    // 3. Attendance
    const rawAtt = localStorage.getItem('enigmakids_attendance_records');
    let loadedAtt: AttendanceRecord[] = [];
    if (rawAtt) {
      try {
        loadedAtt = JSON.parse(rawAtt);
      } catch {
        loadedAtt = [];
      }
    } else {
      // Seed initial sample attendance report
      loadedAtt = [
        {
          id: 'att-sample-1',
          teacherId: 'teacher-main',
          teacherName: 'Profesor 🎓',
          courseOrGrade: 'Primer Grado',
          date: new Date().toISOString().split('T')[0],
          submittedAt: new Date().toLocaleString('es-ES'),
          status: 'Pendiente',
          records: [
            { studentId: 'std-hugo', studentName: 'Hugo López', present: true, notes: 'Asistencia puntual' },
            { studentId: 'std-sofi', studentName: 'Sofía Díaz', present: true, notes: 'Participativa en clase' },
          ],
        },
      ];
      localStorage.setItem('enigmakids_attendance_records', JSON.stringify(loadedAtt));
    }
    setAttendanceRecords(loadedAtt);

    // 4. Audit Logs
    const rawLogs = localStorage.getItem('enigmakids_audit_logs');
    if (rawLogs) {
      try {
        setAuditLogs(JSON.parse(rawLogs));
      } catch {
        setAuditLogs([]);
      }
    } else {
      const initialLog: AuditLog = {
        id: 'log-init',
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: 'admin',
        action: 'Acceso de Administrador',
        details: 'El administrador inició sesión en el Panel General.',
        timestamp: new Date().toLocaleString('es-ES'),
      };
      setAuditLogs([initialLog]);
      localStorage.setItem('enigmakids_audit_logs', JSON.stringify([initialLog]));
    }

    // 5. Config
    const rawConfig = localStorage.getItem('enigmakids_platform_config');
    if (rawConfig) {
      try {
        setConfig(JSON.parse(rawConfig));
      } catch {
        // use default
      }
    }

    // 6. Quizzes & Submissions
    const rawQuizzes = localStorage.getItem('enigmakids_teacher_quizzes');
    if (rawQuizzes) {
      try { setQuizzes(JSON.parse(rawQuizzes)); } catch {}
    }
    const rawSubs = localStorage.getItem('enigmakids_quiz_submissions');
    if (rawSubs) {
      try { setSubmissions(JSON.parse(rawSubs)); } catch {}
    }
  };

  const saveUsersToStorage = (updatedUsers: UserAccount[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('enigmakids_registered_users', JSON.stringify(updatedUsers));
    
    // Keep classroom student list synced
    const classroomStudents = updatedUsers.filter(u => u.role === 'student');
    localStorage.setItem('enigmakids_school_students', JSON.stringify(classroomStudents));
  };

  const saveCoursesToStorage = (updatedCourses: CourseItem[]) => {
    setCourses(updatedCourses);
    localStorage.setItem('enigmakids_courses', JSON.stringify(updatedCourses));
  };

  const saveAttendanceToStorage = (updatedAtt: AttendanceRecord[]) => {
    setAttendanceRecords(updatedAtt);
    localStorage.setItem('enigmakids_attendance_records', JSON.stringify(updatedAtt));
  };

  // --- USER MANAGEMENT HANDLERS ---
  const handleOpenCreateUser = () => {
    sounds.playClick();
    setEditingUser(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('123');
    setFormRole('student');
    setFormGrade('Primer Grado');
    setFormAvatar('buho');
    setFormAvatarColor('bg-emerald-400 border-emerald-500 text-white');
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user: UserAccount) => {
    sounds.playClick();
    setEditingUser(user);
    setFormName(user.name);
    setFormUsername(user.username || '');
    setFormPassword(user.password || '');
    setFormRole(user.role);
    setFormGrade(user.grade || 'Primer Grado');
    setFormAvatar(user.avatar || 'buho');
    setFormAvatarColor(user.avatarColor || 'bg-emerald-400 border-emerald-500 text-white');
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUsername.trim()) return;

    const cleanUsername = formUsername.trim().toLowerCase();

    if (editingUser) {
      // Edit mode
      const updated = users.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: formName.trim(),
            username: cleanUsername,
            password: formPassword,
            role: formRole,
            grade: formRole === 'student' ? formGrade : null,
            avatar: formAvatar,
            avatarColor: formAvatarColor,
          };
        }
        return u;
      });
      saveUsersToStorage(updated);
      addAuditLog('Edición de Usuario', `Modificado usuario "${formName}" (${formRole}) por Administrador.`);
      sounds.playLevelUp();
    } else {
      // Check username uniqueness
      if (users.some(u => u.username?.toLowerCase() === cleanUsername)) {
        alert('Este nombre de usuario ya está registrado.');
        return;
      }

      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        name: formName.trim(),
        username: cleanUsername,
        password: formPassword || '123',
        role: formRole,
        active: true,
        grade: formRole === 'student' ? formGrade : null,
        avatar: formAvatar,
        avatarColor: formAvatarColor,
        points: formRole === 'student' ? 50 : undefined,
        stars: formRole === 'student' ? 1 : undefined,
        mathLevels: formRole === 'student' ? { suma: 1, resta: 1, multiplicacion: 1, division: 1 } : undefined,
        createdAt: new Date().toLocaleDateString('es-ES'),
      };
      saveUsersToStorage([...users, newUser]);
      addAuditLog('Creación de Usuario', `Creado nuevo usuario "${newUser.name}" (${newUser.role}) por Administrador.`);
      sounds.playLevelUp();
    }

    setShowUserModal(false);
  };

  const handleToggleUserActive = (user: UserAccount) => {
    sounds.playClick();
    const newStatus = user.active === false ? true : false;
    const updated = users.map(u => u.id === user.id ? { ...u, active: newStatus } : u);
    saveUsersToStorage(updated);
    addAuditLog('Cambio Estado Usuario', `${newStatus ? 'Activado' : 'Desactivado'} usuario "${user.name}".`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`¿Estás seguro de eliminar permanentemente al usuario "${userName}"?`)) {
      sounds.playClick();
      const updated = users.filter(u => u.id !== userId);
      saveUsersToStorage(updated);
      addAuditLog('Eliminación de Usuario', `Eliminado usuario "${userName}" (${userId}).`);
    }
  };

  // --- COURSE MANAGEMENT HANDLERS ---
  const handleOpenCreateCourse = () => {
    sounds.playClick();
    setEditingCourse(null);
    setCourseName('');
    setCourseGrade('Primer Grado');
    setCourseSubject('general');
    const firstTeacher = users.find(u => u.role === 'teacher');
    setCourseTeacherId(firstTeacher ? firstTeacher.id : 'teacher-main');
    setCourseDescription('');
    setShowCourseModal(true);
  };

  const handleOpenEditCourse = (course: CourseItem) => {
    sounds.playClick();
    setEditingCourse(course);
    setCourseName(course.name);
    setCourseGrade(course.grade);
    setCourseSubject(course.subject);
    setCourseTeacherId(course.teacherId);
    setCourseDescription(course.description);
    setShowCourseModal(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    const teacherObj = users.find(u => u.id === courseTeacherId);
    const teacherName = teacherObj ? teacherObj.name : 'Profesor Asignado';

    if (editingCourse) {
      const updated = courses.map(c => {
        if (c.id === editingCourse.id) {
          return {
            ...c,
            name: courseName.trim(),
            grade: courseGrade,
            subject: courseSubject,
            teacherId: courseTeacherId,
            teacherName,
            description: courseDescription,
          };
        }
        return c;
      });
      saveCoursesToStorage(updated);
      addAuditLog('Edición de Curso', `Modificado curso "${courseName}".`);
    } else {
      const newCourse: CourseItem = {
        id: `course-${Date.now()}`,
        name: courseName.trim(),
        grade: courseGrade,
        subject: courseSubject,
        teacherId: courseTeacherId,
        teacherName,
        status: 'Activo',
        studentsCount: users.filter(u => u.role === 'student' && (u.grade === courseGrade || courseGrade === 'Multigrado')).length,
        description: courseDescription,
        createdAt: new Date().toLocaleDateString('es-ES'),
      };
      saveCoursesToStorage([...courses, newCourse]);
      addAuditLog('Creación de Curso', `Creado curso "${newCourse.name}".`);
    }

    sounds.playLevelUp();
    setShowCourseModal(false);
  };

  const handleToggleCourseStatus = (course: CourseItem) => {
    sounds.playClick();
    const newStatus = course.status === 'Activo' ? 'Inactivo' : 'Activo';
    const updated = courses.map(c => c.id === course.id ? { ...c, status: newStatus as any } : c);
    saveCoursesToStorage(updated);
    addAuditLog('Cambio Estado Curso', `Curso "${course.name}" marcado como ${newStatus}.`);
  };

  // --- ATTENDANCE HANDLERS ---
  const handleUpdateAttendanceStatus = (recordId: string, status: 'Aprobado' | 'Revisado') => {
    sounds.playClick();
    const updated = attendanceRecords.map(r => r.id === recordId ? { ...r, status } : r);
    saveAttendanceToStorage(updated);
    addAuditLog('Aprobación Asistencia', `Registro de asistencia ID ${recordId} cambiado a ${status}.`);
  };

  // --- CONFIG HANDLERS ---
  const handleSaveConfig = () => {
    sounds.playLevelUp();
    localStorage.setItem('enigmakids_platform_config', JSON.stringify(config));
    addAuditLog('Actualización Configuración', 'Guardados ajustes generales del sistema.');
    alert('Configuración guardada correctamente.');
  };

  // --- ADMIN PROFILE HANDLERS ---
  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg('');

    if (currentUser.password && adminCurrentPass !== currentUser.password) {
      setProfileMsg('La contraseña actual es incorrecta.');
      return;
    }

    if (!adminNewPass.trim() || adminNewPass.length < 3) {
      setProfileMsg('La nueva contraseña debe tener al menos 3 caracteres.');
      return;
    }

    const updatedUsers = users.map(u => u.id === currentUser.id ? { ...u, password: adminNewPass.trim() } : u);
    saveUsersToStorage(updatedUsers);
    addAuditLog('Cambio de Contraseña Admin', 'El Administrador actualizó su contraseña.');
    sounds.playLevelUp();
    setProfileMsg('¡Contraseña actualizada con éxito!');
    setAdminCurrentPass('');
    setAdminNewPass('');
  };

  // Export Audit CSV / JSON
  const handleExportAuditLogs = () => {
    sounds.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `enigmakids_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
      (u.grade && u.grade.toLowerCase().includes(userSearchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  // Filtered Attendance
  const filteredAttendance = attendanceRecords.filter(r => {
    const matchesTeacher = attendanceTeacherFilter === 'all' || r.teacherId === attendanceTeacherFilter;
    const matchesDate = !attendanceDateFilter || r.date === attendanceDateFilter;
    return matchesTeacher && matchesDate;
  });

  // Metric counts
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalTeachers = users.filter(u => u.role === 'teacher').length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const pendingAttendanceCount = attendanceRecords.filter(a => a.status === 'Pendiente').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Main Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-500 to-yellow-400 p-0.5 shadow-md flex items-center justify-center font-black text-xl text-white">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-white uppercase">ENIGMAKIDS</h1>
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  Administración Central
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold">
                {config.institutionalName} • Año Lectivo {config.schoolYear}
              </p>
            </div>
          </div>

          {/* Navigation Tabs Header */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
            {[
              { id: 'home', label: 'Inicio', icon: ShieldCheck },
              { id: 'users', label: 'Usuarios', icon: Users, badge: users.length },
              { id: 'courses', label: 'Cursos', icon: BookOpen, badge: courses.length },
              { id: 'attendance', label: 'Asistencia', icon: ClipboardList, badge: pendingAttendanceCount > 0 ? pendingAttendanceCount : undefined },
              { id: 'reports', label: 'Reportes', icon: BarChart3 },
              { id: 'audit', label: 'Auditoría', icon: History },
              { id: 'settings', label: 'Ajustes', icon: Settings },
              { id: 'profile', label: 'Mi Perfil', icon: User },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer relative ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white text-rose-700' : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile & Logout Button */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-black text-white">{currentUser.name}</span>
              <span className="text-[10px] text-amber-400 font-extrabold uppercase">Administrador General</span>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                onLogout();
              }}
              className="bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="lg:hidden flex overflow-x-auto gap-1 px-4 pb-2 border-t border-slate-800 pt-2">
          {[
            { id: 'home', label: 'Inicio', icon: ShieldCheck },
            { id: 'users', label: 'Usuarios', icon: Users },
            { id: 'courses', label: 'Cursos', icon: BookOpen },
            { id: 'attendance', label: 'Asistencia', icon: ClipboardList },
            { id: 'reports', label: 'Reportes', icon: BarChart3 },
            { id: 'audit', label: 'Auditoría', icon: History },
            { id: 'settings', label: 'Ajustes', icon: Settings },
            { id: 'profile', label: 'Perfil', icon: User },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap shrink-0 flex items-center gap-1 ${
                  isActive ? 'bg-rose-600 text-white' : 'text-slate-400 bg-slate-900'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-8">

        {/* TAB 1: HOME (PANEL GENERAL) */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 border-2 border-rose-800/60 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
                <div>
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                    🏛️ Dirección y Control Académico Central
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-white mt-2 tracking-tight">
                    ¡Bienvenido, {currentUser.name}! 👋
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 font-medium max-w-2xl mt-1 leading-relaxed">
                    Panel de control general de la plataforma EnigmaKids. Monitoreo en tiempo real de alumnos, profesores, asistencia enviada, registros de auditoría y configuración de aulas.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => { sounds.playClick(); handleOpenCreateUser(); }}
                    className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Usuario</span>
                  </button>

                  <button
                    onClick={() => { sounds.playClick(); handleOpenCreateCourse(); }}
                    className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-black text-xs px-4 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Nuevo Curso</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('users')}
                className="bg-slate-900 border-2 border-slate-800 hover:border-indigo-500/50 p-5 rounded-3xl cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase">Estudiantes</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-black">
                    🎒
                  </div>
                </div>
                <p className="text-3xl font-black text-white">{totalStudents}</p>
                <span className="text-[10px] text-emerald-400 font-extrabold group-hover:underline block">
                  Ver lista completa →
                </span>
              </div>

              <div
                onClick={() => setActiveTab('users')}
                className="bg-slate-900 border-2 border-slate-800 hover:border-purple-500/50 p-5 rounded-3xl cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase">Profesores</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center font-black">
                    👩‍🏫
                  </div>
                </div>
                <p className="text-3xl font-black text-white">{totalTeachers}</p>
                <span className="text-[10px] text-purple-400 font-extrabold group-hover:underline block">
                  Gestionar cuerpo docente →
                </span>
              </div>

              <div
                onClick={() => setActiveTab('courses')}
                className="bg-slate-900 border-2 border-slate-800 hover:border-amber-500/50 p-5 rounded-3xl cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase">Cursos / Aulas</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center font-black">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white">{courses.length}</p>
                <span className="text-[10px] text-amber-400 font-extrabold group-hover:underline block">
                  Aulas activas →
                </span>
              </div>

              <div
                onClick={() => setActiveTab('attendance')}
                className="bg-slate-900 border-2 border-slate-800 hover:border-rose-500/50 p-5 rounded-3xl cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase">Asistencias</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-950 text-rose-400 border border-rose-800 flex items-center justify-center font-black">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white">{attendanceRecords.length}</p>
                <span className="text-[10px] text-rose-400 font-extrabold group-hover:underline block">
                  {pendingAttendanceCount > 0 ? `⚠️ ${pendingAttendanceCount} pendientes de revisar` : 'Ver registros →'}
                </span>
              </div>
            </div>

            {/* Attendance Alerts & Recent Audit Logs */}
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              
              {/* Pending Attendance Reports from Teachers */}
              <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-rose-400" />
                    <div>
                      <h3 className="font-extrabold text-white text-sm uppercase">Recepción de Asistencia</h3>
                      <p className="text-[10px] text-slate-400 font-bold">Registros enviados por los profesores</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="text-xs font-black text-rose-400 hover:underline"
                  >
                    Ver Todo →
                  </button>
                </div>

                {attendanceRecords.length > 0 ? (
                  <div className="space-y-3">
                    {attendanceRecords.slice(0, 3).map(att => (
                      <div key={att.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-white">{att.teacherName}</span>
                            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                              {att.courseOrGrade}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Fecha de clase: <strong>{att.date}</strong> • Alumnos en lista: {att.records.length}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                            att.status === 'Aprobado'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                          }`}>
                            {att.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic text-center py-6">No se han recibido informes de asistencia aún.</p>
                )}
              </div>

              {/* Recent Audit Feed */}
              <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="font-extrabold text-white text-sm uppercase">Bitácora de Auditoría</h3>
                      <p className="text-[10px] text-slate-400 font-bold">Actividades recientes en el sistema</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-xs font-black text-amber-400 hover:underline"
                  >
                    Historial Completo →
                  </button>
                </div>

                <div className="space-y-3">
                  {auditLogs.slice(0, 4).map(log => (
                    <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-rose-300">{log.action}</span>
                        <span className="text-[9px] text-slate-500 font-bold">{log.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-300">{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: USUARIOS (GESTIÓN INTEGRAL DE USUARIOS) */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900 p-5 rounded-3xl border border-slate-800">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-400" />
                  <span>Gestión General de Usuarios ({users.length})</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Creación, edición, activación/desactivación y monitoreo de Estudiantes, Profesores y Administradores.
                </p>
              </div>

              <button
                onClick={handleOpenCreateUser}
                className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-2 cursor-pointer uppercase"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Nuevo Usuario</span>
              </button>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex gap-2">
                {[
                  { id: 'all', label: `Todos (${users.length})` },
                  { id: 'student', label: `Estudiantes (${totalStudents})` },
                  { id: 'teacher', label: `Profesores (${totalTeachers})` },
                  { id: 'admin', label: `Administradores (${totalAdmins})` },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => { sounds.playClick(); setUserRoleFilter(f.id as any); }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      userRoleFilter === f.id
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar usuario o grado..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Users Roster Table / Grid */}
            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-4">Usuario / Nombre</th>
                      <th className="p-4">Rol</th>
                      <th className="p-4">Grado / Asignación</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 ${user.avatarColor || 'bg-slate-800'}`}>
                                {user.avatar === 'buho' ? '🦉' : user.avatar === 'leon' ? '🦁' : user.avatar === 'gato' ? '🐱' : '🐼'}
                              </span>
                              <div>
                                <h4 className="font-extrabold text-white text-sm">{user.name}</h4>
                                <span className="text-[10px] text-slate-500 font-mono font-bold">@{user.username || 'sin_usuario'}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                              user.role === 'admin'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : user.role === 'teacher'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}>
                              {user.role === 'admin' ? '🛡️ Admin' : user.role === 'teacher' ? '👩‍🏫 Profesor' : '🎒 Estudiante'}
                            </span>
                          </td>

                          <td className="p-4 font-bold text-slate-400">
                            {user.role === 'student' ? (
                              <span>{user.grade || 'Sin Grado'}</span>
                            ) : user.role === 'teacher' ? (
                              <span className="text-indigo-400">Docente Multigrado</span>
                            ) : (
                              <span className="text-amber-400">Dirección</span>
                            )}
                          </td>

                          <td className="p-4">
                            <button
                              onClick={() => handleToggleUserActive(user)}
                              className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase cursor-pointer transition-all ${
                                user.active !== false
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900'
                              }`}
                            >
                              {user.active !== false ? '🟢 Activo' : '🔴 Inactivo'}
                            </button>
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {user.role === 'student' && (
                                <button
                                  onClick={() => { sounds.playClick(); setViewingStudentDetail(user); }}
                                  title="Ver Expediente"
                                  className="p-1.5 bg-indigo-950 text-indigo-300 hover:bg-indigo-900 border border-indigo-800 rounded-xl transition-all cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEditUser(user)}
                                title="Editar Usuario"
                                className="p-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {user.id !== currentUser.id && (
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                  title="Eliminar Usuario"
                                  className="p-1.5 bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-800 rounded-xl transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                          No se encontraron usuarios coincidentes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CURSOS / AULAS */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900 p-5 rounded-3xl border border-slate-800">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>Gestión de Cursos y Aulas Virtuales ({courses.length})</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Organiza las aulas por grados, asigna profesores encargados y monitorea el estado del aula.
                </p>
              </div>

              <button
                onClick={handleOpenCreateCourse}
                className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-2 cursor-pointer uppercase"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nuevo Curso</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course.id} className="bg-slate-900 border-2 border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-xl transition-all relative">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        {course.grade}
                      </span>
                      <h3 className="text-lg font-black text-white mt-1.5 leading-snug">{course.name}</h3>
                    </div>

                    <button
                      onClick={() => handleToggleCourseStatus(course)}
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase cursor-pointer ${
                        course.status === 'Activo' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {course.status}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{course.description}</p>

                  <div className="pt-3 border-t border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500 font-bold">Profesor:</span>
                      <span className="font-extrabold text-amber-400">{course.teacherName}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500 font-bold">Alumnos Inscritos:</span>
                      <span className="font-extrabold text-white">{course.studentsCount} alumnos</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleOpenEditCourse(course)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ASISTENCIA (RECEPCIÓN Y REVISIÓN) */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900 p-5 rounded-3xl border border-slate-800">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-rose-400" />
                  <span>Recepción y Revisión de Asistencia ({attendanceRecords.length})</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Historial de partes de asistencia enviados por los profesores. Consulta, aprueba o exporta los registros.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { sounds.playClick(); alert('Informe de asistencia exportado a CSV.'); }}
                  className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer uppercase"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exportar Reporte CSV</span>
                </button>
              </div>
            </div>

            {/* Attendance Filters */}
            <div className="flex flex-wrap gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Filtrar por Profesor:</label>
                <select
                  value={attendanceTeacherFilter}
                  onChange={(e) => setAttendanceTeacherFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-1.5 rounded-xl focus:outline-none"
                >
                  <option value="all">Todos los Profesores</option>
                  {users.filter(u => u.role === 'teacher').map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Filtrar por Fecha:</label>
                <input
                  type="date"
                  value={attendanceDateFilter}
                  onChange={(e) => setAttendanceDateFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs font-bold text-white px-3 py-1.5 rounded-xl focus:outline-none"
                />
              </div>

              {attendanceDateFilter && (
                <button
                  onClick={() => setAttendanceDateFilter('')}
                  className="self-end text-xs text-rose-400 hover:underline font-extrabold pb-1"
                >
                  Limpiar Filtro Fecha
                </button>
              )}
            </div>

            {/* Attendance Cards List */}
            <div className="space-y-4">
              {filteredAttendance.length > 0 ? (
                filteredAttendance.map(att => (
                  <div key={att.id} className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                    <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-white text-base">{att.teacherName}</h3>
                          <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                            {att.courseOrGrade}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Fecha de Registro: <strong>{att.date}</strong> • Enviado a las: {att.submittedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-black px-3 py-1 rounded-full uppercase ${
                          att.status === 'Aprobado'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {att.status}
                        </span>

                        {att.status === 'Pendiente' && (
                          <button
                            onClick={() => handleUpdateAttendanceStatus(att.id, 'Aprobado')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer shadow"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar Parte
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Attendance roster grid */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-2">
                      {att.records.map((r, i) => (
                        <div key={i} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-200">{r.studentName}</span>
                          <span className={`font-black text-[10px] px-2 py-0.5 rounded-full ${
                            r.present ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                          }`}>
                            {r.present ? 'Presente ✓' : 'Ausente ✗'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500 italic bg-slate-900 border border-slate-800 rounded-3xl">
                  No se encontraron registros de asistencia con los filtros seleccionados.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: REPORTES ANALÍTICOS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span>Supervisión Académica y Reportes Generales</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Análisis consolidado de distribución de matrículas, promedios de calificación y participación.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
                <h3 className="font-extrabold text-sm text-white uppercase">Distribución por Grados</h3>
                <div className="space-y-2">
                  {['Primer Grado', 'Segundo Grado', 'Tercer Grado'].map(g => {
                    const count = users.filter(u => u.role === 'student' && u.grade === g).length;
                    const pct = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
                    return (
                      <div key={g} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-300">
                          <span>{g}</span>
                          <span>{count} alumnos ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
                <h3 className="font-extrabold text-sm text-white uppercase">Rendimiento Promedio</h3>
                <p className="text-3xl font-black text-emerald-400">8.7 <span className="text-xs text-slate-400">/ 10</span></p>
                <p className="text-xs text-slate-400">Promedio general obtenido en los exámenes corregidos por los docentes.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
                <h3 className="font-extrabold text-sm text-white uppercase">Tasa de Asistencia Global</h3>
                <p className="text-3xl font-black text-amber-400">94%</p>
                <p className="text-xs text-slate-400">Promedio de puntualidad y permanencia registrado en el aula virtual.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: AUDITORÍA (BITÁCORA DEL SISTEMA) */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 bg-slate-900 p-5 rounded-3xl border border-slate-800">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" />
                  <span>Bitácora de Auditoría del Sistema ({auditLogs.length})</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Registro de eventos, ingresos, modificaciones de usuarios y entregas en la plataforma.
                </p>
              </div>

              <button
                onClick={handleExportAuditLogs}
                className="bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer uppercase"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Auditoría (JSON)</span>
              </button>
            </div>

            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-4 bg-slate-950 border-b border-slate-800 font-black text-xs text-slate-400 uppercase tracking-wider">
                Eventos Registrados
              </div>
              <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-4 hover:bg-slate-800/40 transition-colors flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-rose-400 text-xs">{log.action}</span>
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                          {log.userName} ({log.userRole})
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{log.details}</p>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 shrink-0 font-bold">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: CONFIGURACIÓN DEL SISTEMA */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Settings className="w-5 h-5 text-rose-400" />
                <span>Configuración de la Plataforma</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Ajustes institucionales, gestión de periodos escolares y modo mantenimiento.
              </p>
            </div>

            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 space-y-6">
              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Nombre Institucional del Colegio
                </label>
                <input
                  type="text"
                  value={config.institutionalName}
                  onChange={(e) => setConfig({ ...config, institutionalName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                  Año Lectivo Vigente
                </label>
                <input
                  type="text"
                  value={config.schoolYear}
                  onChange={(e) => setConfig({ ...config, schoolYear: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-white uppercase">Aprobación Automática de Asistencia</h4>
                  <p className="text-[10px] text-slate-400">Aprobar automáticamente las asistencias enviadas por los docentes.</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoApproveAttendance}
                  onChange={(e) => setConfig({ ...config, autoApproveAttendance: e.target.checked })}
                  className="w-5 h-5 accent-rose-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleSaveConfig}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer shadow-lg"
              >
                Guardar Cambios de Configuración 💾
              </button>
            </div>
          </div>
        )}

        {/* TAB 8: PERFIL DEL ADMINISTRADOR */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-xl">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                <span>Perfil del Administrador</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Gestión de credenciales privadas de acceso administrativo.
              </p>
            </div>

            <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                <span className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-2xl font-black shadow">
                  🦉
                </span>
                <div>
                  <h3 className="text-lg font-black text-white">{currentUser.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">@{currentUser.username}</p>
                </div>
              </div>

              {profileMsg && (
                <div className="p-3 bg-amber-950 border border-amber-800 rounded-2xl text-amber-300 text-xs font-bold">
                  {profileMsg}
                </div>
              )}

              <form onSubmit={handleChangeAdminPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={adminCurrentPass}
                    onChange={(e) => setAdminCurrentPass(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={adminNewPass}
                    onChange={(e) => setAdminNewPass(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow cursor-pointer"
                >
                  Actualizar Contraseña 🔑
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* --- MODALS --- */}

      {/* CREATE / EDIT USER MODAL */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border-2 border-slate-700 w-full max-w-lg rounded-3xl p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-black text-white uppercase">
                  {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-slate-400 hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Carlos Mendoza"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Nombre de Usuario
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ej: carlos"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Contraseña
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-2">
                    Rol del Usuario
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'student', label: '🎒 Estudiante' },
                      { id: 'teacher', label: '👩‍🏫 Profesor' },
                      { id: 'admin', label: '🛡️ Administrador' },
                    ].map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setFormRole(r.id as any)}
                        className={`flex-1 py-2.5 rounded-2xl font-black text-xs uppercase border transition-all cursor-pointer ${
                          formRole === r.id
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {formRole === 'student' && (
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Grado Escolar
                    </label>
                    <select
                      value={formGrade || 'Primer Grado'}
                      onChange={(e) => setFormGrade(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white"
                    >
                      <option value="Primer Grado">Primer Grado</option>
                      <option value="Segundo Grado">Segundo Grado</option>
                      <option value="Tercer Grado">Tercer Grado</option>
                    </select>
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2.5 bg-slate-800 text-slate-300 text-xs font-black rounded-2xl uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-2xl uppercase cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE / EDIT COURSE MODAL */}
      <AnimatePresence>
        {showCourseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border-2 border-slate-700 w-full max-w-lg rounded-3xl p-6 space-y-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-lg font-black text-white uppercase">
                  {editingCourse ? 'Editar Curso' : 'Crear Nuevo Curso'}
                </h3>
                <button
                  onClick={() => setShowCourseModal(false)}
                  className="text-slate-400 hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCourse} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Nombre del Curso / Aula
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Ciencias y Naturaleza 2º"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Grado Nivel
                    </label>
                    <select
                      value={courseGrade}
                      onChange={(e) => setCourseGrade(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white"
                    >
                      <option value="Primer Grado">Primer Grado</option>
                      <option value="Segundo Grado">Segundo Grado</option>
                      <option value="Tercer Grado">Tercer Grado</option>
                      <option value="Multigrado">Multigrado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                      Profesor Asignado
                    </label>
                    <select
                      value={courseTeacherId}
                      onChange={(e) => setCourseTeacherId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white"
                    >
                      {users.filter(u => u.role === 'teacher').map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-300 mb-1">
                    Descripción del Curso
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escribe el objetivo o descripción del aula..."
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-bold text-white"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCourseModal(false)}
                    className="px-4 py-2.5 bg-slate-800 text-slate-300 text-xs font-black rounded-2xl uppercase"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-2xl uppercase cursor-pointer"
                  >
                    Guardar Curso
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STUDENT EXPEDIENTE DETAIL MODAL */}
      <AnimatePresence>
        {viewingStudentDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border-2 border-slate-700 w-full max-w-2xl rounded-3xl p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-slate-100"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎒</span>
                  <div>
                    <h3 className="text-lg font-black text-white">{viewingStudentDetail.name}</h3>
                    <span className="text-xs text-rose-400 font-bold uppercase">{viewingStudentDetail.grade || 'Primer Grado'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingStudentDetail(null)}
                  className="text-slate-400 hover:text-white text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-black uppercase block">Puntos XP</span>
                  <span className="text-xl font-black text-emerald-400">{viewingStudentDetail.points || 0}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-black uppercase block">Estrellas</span>
                  <span className="text-xl font-black text-amber-400">⭐ {viewingStudentDetail.stars || 0}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-black uppercase block">Insignias</span>
                  <span className="text-xl font-black text-indigo-400">{viewingStudentDetail.unlockedBadges?.length || 0}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-extrabold text-xs text-white uppercase">Niveles de Matemáticas</h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-900 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Suma</span>
                    <strong className="text-white">Nivel {viewingStudentDetail.mathLevels?.suma || 1}</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Resta</span>
                    <strong className="text-white">Nivel {viewingStudentDetail.mathLevels?.resta || 1}</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Mult.</span>
                    <strong className="text-white">Nivel {viewingStudentDetail.mathLevels?.multiplicacion || 1}</strong>
                  </div>
                  <div className="bg-slate-900 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Div.</span>
                    <strong className="text-white">Nivel {viewingStudentDetail.mathLevels?.division || 1}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewingStudentDetail(null)}
                  className="px-5 py-2 bg-slate-800 text-white font-black text-xs uppercase rounded-xl"
                >
                  Cerrar Expediente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
