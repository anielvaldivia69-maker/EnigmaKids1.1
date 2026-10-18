/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, VirtualRoom, VirtualRoomType, VirtualRoomStatus, Quiz } from '../types';
import { sounds } from '../utils/sound';
import {
  DoorOpen,
  Plus,
  Copy,
  Check,
  Users,
  Clock,
  Sparkles,
  Lock,
  Unlock,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  X,
  PlayCircle,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TeacherVirtualRoomsProps {
  currentUser: UserAccount;
  quizzes?: Quiz[];
}

export const TeacherVirtualRooms: React.FC<TeacherVirtualRoomsProps> = ({ currentUser, quizzes = [] }) => {
  const [rooms, setRooms] = useState<VirtualRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter: 'activas' | 'historial'
  const [filterView, setFilterView] = useState<'activas' | 'historial'>('activas');

  // Selected Room for detailed management / live participants
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Create Room modal state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>('');
  const [roomDescription, setRoomDescription] = useState<string>('');
  const [roomType, setRoomType] = useState<VirtualRoomType>('clase');
  const [associatedQuizId, setAssociatedQuizId] = useState<string>('');
  const [creating, setCreating] = useState<boolean>(false);

  // Polling ref to clean up on unmount
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch rooms owned by this teacher
  const fetchRooms = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`/api/virtual-rooms?teacherId=${encodeURIComponent(currentUser.id)}`);
      if (!res.ok) {
        throw new Error('No se pudo cargar la lista de salas desde el servidor.');
      }
      const data: VirtualRoom[] = await res.json();
      setRooms(data);
      // Auto select first room if none selected
      if (data.length > 0 && !selectedRoomId) {
        setSelectedRoomId(data[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching teacher rooms:', err);
      if (!silent) {
        setErrorMsg(err.message || 'Error de conexión con el servidor.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [currentUser.id]);

  // Real-time polling for the selected room's participants (every 3 seconds)
  useEffect(() => {
    if (!selectedRoomId) return;

    const pollParticipants = async () => {
      try {
        const res = await fetch(`/api/virtual-rooms/${selectedRoomId}/participants`);
        if (res.ok) {
          const liveData = await res.json();
          setRooms((prev) =>
            prev.map((r) =>
              r.id === selectedRoomId
                ? { ...r, participants: liveData.participants, status: liveData.status }
                : r
            )
          );
        }
      } catch (err) {
        // Silent catch for background poll
      }
    };

    pollingRef.current = setInterval(pollParticipants, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedRoomId]);

  // Copy code helper with feedback
  const handleCopyCode = (code: string) => {
    sounds.playClick();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    sounds.speak(`Código copiado: ${code}`);
    setTimeout(() => {
      setCopiedCode((current) => (current === code ? null : current));
    }, 2500);
  };

  // Create Room submit
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      alert('Por favor introduce un nombre para la sala.');
      return;
    }

    try {
      setCreating(true);
      const res = await fetch('/api/virtual-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName.trim(),
          description: roomDescription.trim(),
          type: roomType,
          teacherId: currentUser.id,
          teacherName: currentUser.name,
          assignedQuizId: associatedQuizId || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'No se pudo crear la sala.');
      }

      const created: VirtualRoom = await res.json();
      sounds.playLevelUp();
      sounds.speak(`¡Sala creada con éxito! El código de acceso es ${created.code}.`);
      setRooms((prev) => [created, ...prev]);
      setSelectedRoomId(created.id);
      setShowCreateModal(false);
      setRoomName('');
      setRoomDescription('');
      setRoomType('clase');
      setAssociatedQuizId('');
    } catch (err: any) {
      alert(err.message || 'Error al crear la sala virtual.');
    } finally {
      setCreating(false);
    }
  };

  // Change room status (activa, cerrada, finalizada)
  const handleUpdateStatus = async (roomId: string, newStatus: VirtualRoomStatus) => {
    sounds.playClick();
    try {
      const res = await fetch(`/api/virtual-rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          teacherId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'No se pudo actualizar el estado de la sala.');
      }

      const updated: VirtualRoom = await res.json();
      setRooms((prev) => prev.map((r) => (r.id === roomId ? updated : r)));

      if (newStatus === 'cerrada') {
        sounds.speak('El ingreso a la sala ha sido cerrado temporalmente.');
      } else if (newStatus === 'activa') {
        sounds.speak('La sala ha sido abierta nuevamente para recibir alumnos.');
      } else if (newStatus === 'finalizada') {
        sounds.speak('La sala ha sido finalizada.');
      }
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado de la sala.');
    }
  };

  // Filtered rooms list
  const activeRooms = rooms.filter((r) => r.status !== 'finalizada');
  const pastRooms = rooms.filter((r) => r.status === 'finalizada');
  const displayedRooms = filterView === 'activas' ? activeRooms : pastRooms;
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || (displayedRooms.length > 0 ? displayedRooms[0] : null);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
            🏫
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Salas Virtuales con Códigos de Acceso
            </h2>
            <p className="text-xs text-slate-500 font-extrabold mt-0.5">
              Crea salas con códigos únicos para que tus alumnos se conecten desde sus dispositivos en tiempo real.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => fetchRooms()}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl transition-all cursor-pointer shadow-xs"
            title="Refrescar lista de salas"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            id="btn-create-virtual-room"
            onClick={() => {
              sounds.playClick();
              setShowCreateModal(true);
            }}
            className="flex-1 md:flex-none bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs px-5 py-3 rounded-2xl shadow border-b-4 border-indigo-800 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Sala</span>
          </button>
        </div>
      </div>

      {/* FILTER BUTTONS & STATS */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              sounds.playClick();
              setFilterView('activas');
            }}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              filterView === 'activas'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Salas Activas ({activeRooms.length})
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setFilterView('historial');
            }}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
              filterView === 'historial'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Salas Anteriores / Finalizadas ({pastRooms.length})
          </button>
        </div>

        <div className="text-xs font-extrabold text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sincronización en tiempo real activa</span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN VIEW */}
      {loading ? (
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-12 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-black text-slate-700">Cargando tus salas virtuales...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 text-center text-rose-800">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-black">{errorMsg}</p>
          <button
            onClick={() => fetchRooms()}
            className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-black cursor-pointer shadow"
          >
            Reintentar conexión
          </button>
        </div>
      ) : displayedRooms.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto mb-3">
            🏫
          </div>
          <h3 className="text-lg font-black text-slate-800">
            {filterView === 'activas' ? 'No tienes salas virtuales activas' : 'No tienes salas finalizadas en el historial'}
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-1 max-w-md mx-auto">
            {filterView === 'activas'
              ? 'Pulsa en «Crear Sala» para generar un nuevo espacio con código de acceso para tus alumnos.'
              : 'Cuando finalices una sala, aparecerá aquí como registro de clases anteriores.'}
          </p>
          {filterView === 'activas' && (
            <button
              onClick={() => {
                sounds.playClick();
                setShowCreateModal(true);
              }}
              className="mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow cursor-pointer border-b-2 border-indigo-800"
            >
              + Crear Primera Sala
            </button>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* ROOMS LIST (5 columns) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
              {filterView === 'activas' ? 'Tus Salas Abiertas' : 'Historial de Salas'}
            </h3>

            {displayedRooms.map((r) => {
              const isSelected = selectedRoom?.id === r.id;
              const isClosed = r.status === 'cerrada';
              const isFinished = r.status === 'finalizada';

              return (
                <div
                  key={r.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedRoomId(r.id);
                  }}
                  className={`p-5 rounded-3xl border-2 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-indigo-50/60 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            r.type === 'evaluacion'
                              ? 'bg-rose-100 text-rose-800'
                              : r.type === 'actividad'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {r.type === 'evaluacion' ? '📝 Evaluación' : r.type === 'actividad' ? '🎯 Actividad' : '📚 Clase'}
                        </span>

                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            isFinished
                              ? 'bg-slate-200 text-slate-700'
                              : isClosed
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isFinished ? 'bg-slate-500' : isClosed ? 'bg-amber-600' : 'bg-emerald-600'
                            }`}
                          />
                          {isFinished ? 'Finalizada' : isClosed ? 'Cerrada' : 'Activa'}
                        </span>
                      </div>

                      <h4 className="font-black text-slate-900 text-base leading-snug">{r.name}</h4>
                      {r.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{r.description}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="bg-indigo-900 text-white font-mono font-black text-sm px-3 py-1.5 rounded-xl tracking-wider shadow-xs border border-indigo-950 flex items-center gap-1.5">
                        <span>{r.code}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <strong className="text-slate-800 font-black">{r.participants?.length || 0}</strong>{' '}
                      {r.participants?.length === 1 ? 'alumno' : 'alumnos'}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ROOM MANAGEMENT & LIVE PARTICIPANTS (7 columns) */}
          <div className="lg:col-span-7">
            {selectedRoom ? (
              <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                {/* ROOM HEADER INFO & CODE CARD */}
                <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                          {selectedRoom.type === 'evaluacion' ? '📝 Evaluación' : selectedRoom.type === 'actividad' ? '🎯 Actividad' : '📚 Clase'}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            selectedRoom.status === 'finalizada'
                              ? 'bg-slate-500/50 text-slate-200'
                              : selectedRoom.status === 'cerrada'
                              ? 'bg-amber-400 text-amber-950'
                              : 'bg-emerald-400 text-emerald-950'
                          }`}
                        >
                          {selectedRoom.status === 'finalizada'
                            ? 'Sala Finalizada'
                            : selectedRoom.status === 'cerrada'
                            ? 'Ingreso Cerrado'
                            : 'Sala Abierta'}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black">{selectedRoom.name}</h3>
                      {selectedRoom.description && (
                        <p className="text-xs text-indigo-200 mt-1">{selectedRoom.description}</p>
                      )}
                      <p className="text-[11px] text-indigo-300 mt-2 font-mono">
                        Creada: {new Date(selectedRoom.createdAt).toLocaleString('es-ES')}
                      </p>
                    </div>

                    {/* BIG ACCESS CODE BOX WITH COPY BUTTON */}
                    <div className="bg-white/10 border-2 border-white/20 rounded-2xl p-4 text-center backdrop-blur-md shrink-0">
                      <p className="text-[10px] uppercase font-black text-indigo-200 tracking-wider">
                        Código de Acceso
                      </p>
                      <p className="text-3xl font-black font-mono tracking-widest text-yellow-300 mt-0.5">
                        {selectedRoom.code}
                      </p>
                      <button
                        id="btn-copy-room-code"
                        onClick={() => handleCopyCode(selectedRoom.code)}
                        className="mt-2 w-full py-1.5 px-3 bg-white text-indigo-950 hover:bg-yellow-300 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer active:scale-95"
                      >
                        {copiedCode === selectedRoom.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Código</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ROOM MANAGEMENT CONTROLS */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-indigo-200 font-extrabold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Administrada exclusivamente por {currentUser.name}
                    </span>

                    <div className="flex items-center gap-2">
                      {selectedRoom.status === 'activa' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedRoom.id, 'cerrada')}
                          className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-black px-3 py-1.5 rounded-xl shadow cursor-pointer transition-all flex items-center gap-1"
                          title="Cierra temporalmente la admisión de nuevos alumnos"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Cerrar Ingreso</span>
                        </button>
                      )}

                      {selectedRoom.status === 'cerrada' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedRoom.id, 'activa')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-3 py-1.5 rounded-xl shadow cursor-pointer transition-all flex items-center gap-1"
                          title="Vuelve a admitir nuevos alumnos"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Reabrir Ingreso</span>
                        </button>
                      )}

                      {selectedRoom.status !== 'finalizada' && (
                        <button
                          onClick={() => {
                            if (window.confirm('¿Deseas finalizar esta sala? Los alumnos ya no podrán unirse y pasará al historial.')) {
                              handleUpdateStatus(selectedRoom.id, 'finalizada');
                            }
                          }}
                          className="bg-rose-500 hover:bg-rose-600 text-white font-black px-3 py-1.5 rounded-xl shadow cursor-pointer transition-all flex items-center gap-1"
                        >
                          <span>Finalizar Sala 🏁</span>
                        </button>
                      )}

                      {selectedRoom.status === 'finalizada' && (
                        <button
                          onClick={() => handleUpdateStatus(selectedRoom.id, 'activa')}
                          className="bg-indigo-500 hover:bg-indigo-600 text-white font-black px-3 py-1.5 rounded-xl shadow cursor-pointer transition-all flex items-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reactivar Sala</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ASSOCIATED QUIZ INFO (IF ANY) */}
                {selectedRoom.assignedQuizId && (
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📝</span>
                      <div>
                        <p className="text-[10px] font-black uppercase text-indigo-700">Evaluación Vinculada</p>
                        <h4 className="font-extrabold text-sm text-slate-800">
                          {quizzes.find((q) => q.id === selectedRoom.assignedQuizId)?.title || 'Examen activo'}
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-black text-indigo-600 bg-white px-3 py-1 rounded-full border border-indigo-200">
                      Asignada a esta sala
                    </span>
                  </div>
                )}

                {/* PARTICIPANTS SECTION */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-black text-slate-800 text-base">
                        Alumnos en la Sala ({selectedRoom.participants?.length || 0})
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Actualización automática en vivo
                      </span>
                    </div>
                  </div>

                  {selectedRoom.participants && selectedRoom.participants.length > 0 ? (
                    <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
                      {selectedRoom.participants.map((p, idx) => (
                        <div key={p.studentId || idx} className="py-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg">
                              👶
                            </div>
                            <div>
                              <h5 className="font-black text-slate-800 text-sm">{p.studentName}</h5>
                              <p className="text-[10px] text-slate-400 font-extrabold">
                                ID: <span className="font-mono text-slate-600">{p.studentId}</span>
                                {p.studentUsername && (
                                  <>
                                    {' '}• Usuario: <span className="text-indigo-600 font-bold">@{p.studentUsername}</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              {p.status || 'Activo'}
                            </span>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Ingresó: {new Date(p.joinedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl py-10 px-4">
                      <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2 animate-pulse" />
                      <p className="font-black text-slate-700 text-sm">Esperando a que los alumnos se unan...</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Comparte el código <span className="font-mono font-black text-indigo-700 text-sm bg-indigo-100 px-2 py-0.5 rounded">{selectedRoom.code}</span> con tus estudiantes. Cuando lo introduzcan desde sus dispositivos, aparecerán aquí automáticamente.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* CREATE ROOM MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border-4 border-indigo-200 relative"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6 pb-3 border-b">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl">
                  🏫
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Crear Nueva Sala Virtual</h3>
                  <p className="text-xs text-slate-500 font-extrabold">
                    Se generará automáticamente un código único para tus alumnos.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Nombre de la Sala: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Clase de Matemáticas Divertidas, Repaso de Ciencias"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all text-slate-800"
                    maxLength={90}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                    Descripción (Opcional):
                  </label>
                  <textarea
                    placeholder="ej: Resolveremos retos de cálculo y preguntas de misterio."
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all text-slate-800 resize-none"
                    maxLength={250}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase mb-1.5">
                    Tipo de Sala:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRoomType('clase')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-black flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        roomType === 'clase'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl">📚</span>
                      <span>Clase</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoomType('actividad')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-black flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        roomType === 'actividad'
                          ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl">🎯</span>
                      <span>Actividad</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoomType('evaluacion')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-black flex flex-col items-center gap-1 cursor-pointer transition-all ${
                        roomType === 'evaluacion'
                          ? 'border-rose-600 bg-rose-50 text-rose-900 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xl">📝</span>
                      <span>Evaluación</span>
                    </button>
                  </div>
                </div>

                {/* Optional Quiz association if quizzes exist */}
                {quizzes.length > 0 && (
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase mb-1">
                      Asociar Examen / Evaluación (Opcional):
                    </label>
                    <select
                      value={associatedQuizId}
                      onChange={(e) => setAssociatedQuizId(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs font-bold border rounded-xl bg-white focus:outline-none focus:border-indigo-400 text-slate-800"
                    >
                      <option value="">-- Ninguno (Solo clase interactiva) --</option>
                      {quizzes.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.title} ({q.questions?.length || 0} ejercicios)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-[11px] text-amber-900 font-extrabold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>El sistema generará un código seguro como «EK-XXXX» no repetible.</span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 text-xs font-black text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow border-b-4 border-indigo-800 active:scale-95 transition-all cursor-pointer uppercase tracking-wider disabled:opacity-50"
                  >
                    {creating ? 'Creando...' : 'Confirmar y Generar Código 🚀'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
