/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, VirtualRoom, VirtualRoomParticipant } from '../types';
import { sounds } from '../utils/sound';
import {
  DoorOpen,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  ShieldCheck,
  RefreshCw,
  LogOut,
  MessageSquare,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudentVirtualRoomsProps {
  currentUser: UserAccount;
  onNavigateToQuiz?: (quizId: string) => void;
}

export const StudentVirtualRooms: React.FC<StudentVirtualRoomsProps> = ({ currentUser, onNavigateToQuiz }) => {
  // Join code input state
  const [accessCode, setAccessCode] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  // Student's joined rooms ("Mis clases")
  const [myRooms, setMyRooms] = useState<VirtualRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);

  // Active view: currently inside a specific room
  const [activeRoom, setActiveRoom] = useState<VirtualRoom | null>(null);

  // Whiteboard / collaborative notes inside active room
  const [roomNotes, setRoomNotes] = useState<string>('¡Hola compañeros y profesor! Escriban aquí sus apuntes.');

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load "Mis clases" from the shared backend
  const fetchMyClasses = async (silent = false) => {
    try {
      if (!silent) setLoadingRooms(true);
      const res = await fetch(`/api/virtual-rooms?studentId=${encodeURIComponent(currentUser.id)}`);
      if (!res.ok) {
        throw new Error('No se pudieron cargar tus clases.');
      }
      const data: VirtualRoom[] = await res.json();
      setMyRooms(data);

      // If currently inside a room, update its data
      if (activeRoom) {
        const refreshed = data.find((r) => r.id === activeRoom.id);
        if (refreshed) {
          setActiveRoom(refreshed);
        }
      }
    } catch (err) {
      console.error('Error fetching student classes:', err);
    } finally {
      if (!silent) setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, [currentUser.id]);

  // Real-time polling when inside an active room (every 3s)
  useEffect(() => {
    if (!activeRoom) return;

    const pollRoom = async () => {
      try {
        const res = await fetch(`/api/virtual-rooms/${activeRoom.id}/participants`);
        if (res.ok) {
          const liveData = await res.json();
          setActiveRoom((prev) =>
            prev
              ? {
                  ...prev,
                  status: liveData.status,
                  participants: liveData.participants,
                }
              : null
          );
        }
      } catch (err) {
        // Silent poll
      }
    };

    pollingRef.current = setInterval(pollRoom, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeRoom?.id]);

  // Handle joining room with code
  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    setJoinSuccess(null);

    // Normalize code: remove all internal and leading/trailing whitespace, uppercase
    const cleanCode = accessCode.replace(/\s+/g, '').toUpperCase();

    if (!cleanCode) {
      setJoinError('Por favor escribe el código de la sala que te dio tu profesor.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/virtual-rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: cleanCode,
          studentId: currentUser.id,
          studentName: currentUser.name,
          studentUsername: currentUser.username,
          studentRole: currentUser.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        sounds.playIncorrect();
        throw new Error(data.error || 'No se pudo conectar con el servidor. Inténtalo nuevamente.');
      }

      sounds.playLevelUp();
      sounds.speak(`¡Genial! Has ingresado a la sala ${data.room.name}.`);

      setJoinSuccess(data.message || '¡Te has unido exitosamente!');
      setActiveRoom(data.room);
      setAccessCode('');

      // Refresh "Mis clases"
      fetchMyClasses(true);
    } catch (err: any) {
      setJoinError(err.message || 'No se pudo conectar con el servidor. Inténtalo nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ACTIVE ROOM VIEW (If student entered a room) */}
      <AnimatePresence mode="wait">
        {activeRoom ? (
          <motion.div
            key="inside-room"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white border-4 border-indigo-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6"
          >
            {/* ROOM BANNER */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-3xl shadow-md shrink-0">
                  🏫
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-indigo-100 text-indigo-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      {activeRoom.type === 'evaluacion' ? '📝 Evaluación' : activeRoom.type === 'actividad' ? '🎯 Actividad' : '📚 Clase'}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        activeRoom.status === 'activa'
                          ? 'bg-emerald-100 text-emerald-900'
                          : activeRoom.status === 'cerrada'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          activeRoom.status === 'activa'
                            ? 'bg-emerald-500 animate-pulse'
                            : activeRoom.status === 'cerrada'
                            ? 'bg-amber-500'
                            : 'bg-slate-500'
                        }`}
                      />
                      {activeRoom.status === 'activa' ? 'En Vivo' : activeRoom.status === 'cerrada' ? 'Ingreso Cerrado' : 'Finalizada'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">{activeRoom.name}</h2>
                  <p className="text-xs text-indigo-700 font-extrabold mt-0.5">
                    Docente responsable: <strong className="text-slate-900">{activeRoom.teacherName}</strong> • Código: <span className="font-mono bg-indigo-50 px-2 py-0.5 rounded">{activeRoom.code}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveRoom(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir de la Sala</span>
              </button>
            </div>

            {/* IF ROOM IS CLOSED WARNING */}
            {activeRoom.status === 'cerrada' && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-xs font-bold text-amber-900 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>El profesor ha cerrado temporalmente el ingreso de nuevos participantes a esta sala. Los alumnos ya conectados pueden continuar.</span>
              </div>
            )}

            {/* CLASSROOM WORKSPACE: WHITEBOARD + LIVE PARTICIPANTS */}
            <div className="grid md:grid-cols-12 gap-6 items-start">
              {/* WHITEBOARD & ACTIVITY (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-lg border-4 border-slate-800">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 uppercase">
                      <Sparkles className="w-4 h-4" /> Pizarra Interactiva del Salón
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Espacio Colaborativo</span>
                  </div>
                  <textarea
                    value={roomNotes}
                    onChange={(e) => setRoomNotes(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-400 resize-none"
                    placeholder="Escribe tus notas, preguntas y respuestas aquí..."
                  />
                  <p className="text-[10px] text-slate-400 mt-2 font-bold">
                    ✏️ Puedes tomar apuntes de las explicaciones del profesor durante la sesión en vivo.
                  </p>
                </div>

                {/* LINKED QUIZ IF ROOM HAS ONE */}
                {activeRoom.assignedQuizId && (
                  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
                    <div>
                      <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        Tarea / Examen Asignado
                      </span>
                      <h4 className="text-base font-black mt-1">Evaluación de la Sala</h4>
                      <p className="text-xs text-purple-100 mt-0.5">El docente ha preparado un examen para esta clase.</p>
                    </div>
                    {onNavigateToQuiz && (
                      <button
                        onClick={() => onNavigateToQuiz(activeRoom.assignedQuizId!)}
                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-black text-xs rounded-xl shadow cursor-pointer transition-all active:scale-95"
                      >
                        Abrir Examen 📝
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* PARTICIPANTS LIST (5 cols) */}
              <div className="md:col-span-5 bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-black text-slate-800 text-xs uppercase">
                      Compañeros Conectados ({activeRoom.participants?.length || 0})
                    </h4>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {activeRoom.participants && activeRoom.participants.length > 0 ? (
                    activeRoom.participants.map((p, idx) => {
                      const isMe = p.studentId === currentUser.id;
                      return (
                        <div
                          key={p.studentId || idx}
                          className={`p-3 rounded-2xl border flex items-center justify-between ${
                            isMe ? 'bg-indigo-50 border-indigo-200 font-black' : 'bg-white border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">👶</span>
                            <div>
                              <p className="text-xs font-black text-slate-800">
                                {p.studentName} {isMe && <span className="text-indigo-600 font-extrabold">(Tú)</span>}
                              </p>
                              {p.studentUsername && (
                                <p className="text-[10px] text-slate-400 font-semibold leading-none">
                                  @{p.studentUsername}
                                </p>
                              )}
                            </div>
                          </div>

                          <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {p.status || 'Activo'}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No hay participantes aún.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* JOIN CODE SECTION (Primary child-friendly card) */}
      <div className="bg-white border-4 border-amber-300 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-400 text-amber-950 flex items-center justify-center text-3xl mx-auto shadow-md">
            🔑
          </div>

          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Unirse a una sala
            </h2>
            <p className="text-sm font-extrabold text-slate-500 mt-1">
              Introduce el código de acceso que te compartió tu profesor para ingresar a la clase virtual.
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleJoinWithCode} className="max-w-md mx-auto space-y-3 pt-2">
            <div className="relative">
              <input
                id="input-virtual-room-code"
                type="text"
                placeholder="Ejemplo: EK-4921"
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setJoinError(null);
                }}
                className="w-full text-center py-4 px-6 text-2xl md:text-3xl font-mono font-black tracking-widest text-slate-900 bg-amber-50/60 border-4 border-amber-300 rounded-2xl focus:border-indigo-600 focus:bg-white focus:outline-none transition-all placeholder:text-slate-300 placeholder:text-base uppercase"
                maxLength={12}
                disabled={submitting}
              />
            </div>

            <button
              id="btn-join-virtual-room"
              type="submit"
              disabled={submitting || !accessCode.trim()}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm uppercase rounded-2xl shadow-lg border-b-4 border-indigo-900 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 tracking-wider"
            >
              <span>{submitting ? 'Comprobando código...' : 'Ingresar a la sala'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* ERROR OR SUCCESS FEEDBACK */}
          <AnimatePresence>
            {joinError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs font-black text-rose-800 flex items-center gap-2 text-left shadow-xs"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{joinError}</span>
              </motion.div>
            )}

            {joinSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-md mx-auto p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs font-black text-emerald-800 flex items-center gap-2 text-left shadow-xs"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{joinSuccess}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SECTION: "MIS CLASES" */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl">
              🎒
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Mis clases</h3>
              <p className="text-xs text-slate-500 font-extrabold">
                Salas y aulas virtuales a las que te has unido con tus códigos.
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchMyClasses()}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Refrescar clases"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loadingRooms ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
            <p className="text-xs font-black text-slate-500">Cargando tus clases...</p>
          </div>
        ) : myRooms.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myRooms.map((room) => {
              const isClosed = room.status === 'cerrada';
              const isFinished = room.status === 'finalizada';

              return (
                <div
                  key={room.id}
                  className="bg-slate-50 hover:bg-white border-2 border-slate-200 hover:border-indigo-400 p-5 rounded-3xl shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                        {room.type === 'evaluacion' ? '📝 Evaluación' : room.type === 'actividad' ? '🎯 Actividad' : '📚 Clase'}
                      </span>

                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isFinished
                            ? 'bg-slate-200 text-slate-700'
                            : isClosed
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {isFinished ? 'Finalizada' : isClosed ? 'Cerrada' : 'Activa'}
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900 text-base leading-snug">{room.name}</h4>
                    {room.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{room.description}</p>
                    )}

                    <div className="mt-3 text-xs font-bold text-slate-600">
                      <p className="text-[11px] text-slate-400 font-extrabold uppercase leading-none">Profesor:</p>
                      <p className="text-slate-800 font-black">{room.teacherName}</p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {room.code}
                    </span>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        setActiveRoom(room);
                      }}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow cursor-pointer transition-all active:scale-95"
                    >
                      Entrar a la Sala →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-black text-slate-700 text-sm">Aún no te has unido a ninguna clase</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Pídele a tu profesor el código de su sala virtual e introdúcelo en el recuadro superior para comenzar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
