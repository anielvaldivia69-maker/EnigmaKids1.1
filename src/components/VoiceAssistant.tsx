/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../utils/sound';
import { Mic, MicOff, MessageSquare, Volume2, X, Check, Compass, HelpCircle, Sparkles, Brain, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceAssistantProps {
  activeSubject: string;
  setActiveSubject: (subject: any) => void;
  soundOn: boolean;
  toggleSound: () => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  activeSubject,
  setActiveSubject,
  soundOn,
  toggleSound,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('¡Hola! Soy Ollie, tu búho consejero. ¡Pregúntame algo, dime adónde ir o toca una pregunta rápida abajo!');
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState<boolean>(false);
  
  const recognitionRef = useRef<any>(null);

  // Maps of human friendly names for internal screen subjects
  const subjectNames: Record<string, string> = {
    math: 'Matemáticas Mágicas 🧮',
    language: 'Lengua y Literatura 📚',
    science: 'Ciencias Sorpresa 🧪',
    philosophy_curiosities: 'Filosofía y Secretos 💭',
    classroom: 'Aula Virtual 🏫',
    painting_drawing: 'Taller de Pintar y Dibujar 🎨',
    badges: 'Sala de Medallas 🏆',
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'es-ES';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setFeedbackMsg('Te escucho con atención canora...');
    };

    rec.onresult = (event: any) => {
      let currentResult = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentResult += event.results[i][0].transcript;
      }
      setTranscript(currentResult);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setFeedbackMsg('Micrófono bloqueado. Por favor dale permiso en el navegador.');
      } else {
        setFeedbackMsg('¡Ups amiguito! Olvidé mis tapones. ¿Podrías volver a hablar fuerte?');
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Process completed speech transcripts and trigger corresponding commands
  useEffect(() => {
    if (isListening || !transcript) return;

    const query = transcript.toLowerCase().trim();
    console.log('Voice Command received:', query);

    let matchFound = false;

    // Command maps (Spanish keywords matched flexibly)
    if (
      query.includes('matematica') ||
      query.includes('matemática') ||
      query.includes('sumar') ||
      query.includes('número') ||
      query.includes('numeros') ||
      query.includes('suma') ||
      query.includes('resta')
    ) {
      setActiveSubject('math');
      sounds.playLevelUp();
      sounds.speak('¡Claro que sí! Vamos a jugar con las matemáticas mágicas.');
      setFeedbackMsg('¡Abriendo Matemáticas Mágicas! 🧮');
      matchFound = true;
    } else if (
      query.includes('lengua') ||
      query.includes('idioma') ||
      query.includes('letras') ||
      query.includes('escribir') ||
      query.includes('lectura') ||
      query.includes('leer') ||
      query.includes('literatura')
    ) {
      setActiveSubject('language');
      sounds.playLevelUp();
      sounds.speak('¡Excelente! Vamos al rincón de Lengua e Idioma.');
      setFeedbackMsg('¡Abriendo Lengua y Literatura! 📚');
      matchFound = true;
    } else if (
      query.includes('ciencia') ||
      query.includes('ciencias') ||
      query.includes('animales') ||
      query.includes('experimento') ||
      query.includes('planeta') ||
      query.includes('naturaleza')
    ) {
      setActiveSubject('science');
      sounds.playLevelUp();
      sounds.speak('¡Súper! Investigamos el laboratorio de ciencias.');
      setFeedbackMsg('¡Abriendo Ciencias Sorpresa! 🧪');
      matchFound = true;
    } else if (
      query.includes('filosofia') ||
      query.includes('filosofía') ||
      query.includes('pensar') ||
      query.includes('socrates') ||
      query.includes('pregunta') ||
      query.includes('preguntas') ||
      query.includes('misterio') ||
      query.includes('secretos')
    ) {
      setActiveSubject('philosophy_curiosities');
      sounds.playLevelUp();
      sounds.speak('¡Hora de reflexionar! Vamos a Filosofía.');
      setFeedbackMsg('¡Abriendo Filosofía y Secretos! 💭');
      matchFound = true;
    } else if (
      query.includes('aula') ||
      query.includes('clase') ||
      query.includes('escuela') ||
      query.includes('profesor') ||
      query.includes('salón') ||
      query.includes('salon')
    ) {
      setActiveSubject('classroom');
      sounds.playLevelUp();
      sounds.speak('¡Perfecto! Nos dirigimos al aula virtual.');
      setFeedbackMsg('¡Entrando al Aula Virtual! 🏫');
      matchFound = true;
    } else if (
      query.includes('medalla') ||
      query.includes('medallas') ||
      query.includes('trofeo') ||
      query.includes('trofeos') ||
      query.includes('logros') ||
      query.includes('premios')
    ) {
      setActiveSubject('badges');
      sounds.playLevelUp();
      sounds.speak('¡Excelente! Veamos tu sala de trofeos.');
      setFeedbackMsg('¡Abriendo tu Sala de Medallas! 🏆');
      matchFound = true;
    } else if (
      query.includes('pintar') ||
      query.includes('dibujar') ||
      query.includes('dibujo') ||
      query.includes('pincel') ||
      query.includes('arte') ||
      query.includes('colorear') ||
      query.includes('princesa') ||
      query.includes('superheroe') ||
      query.includes('superhéroe')
    ) {
      setActiveSubject('painting_drawing');
      sounds.playLevelUp();
      sounds.speak('¡Bienvenido a la sección de arte! Elige tu animalito favorito para comenzar a pintar o dibujar.');
      setFeedbackMsg('¡Abriendo la Sección de Arte! 🎨');
      matchFound = true;
    } else if (
      query.includes('silencio') ||
      query.includes('silenciar') ||
      query.includes('desactivar sonido') ||
      query.includes('mutear') ||
      query.includes('quitar sonido')
    ) {
      if (soundOn) {
        toggleSound();
        setFeedbackMsg('Sonido desactivado 🔇');
        matchFound = true;
      } else {
        setFeedbackMsg('El sonido ya estaba silencioso.');
        matchFound = true;
      }
    } else if (
      query.includes('activar sonido') ||
      query.includes('poner sonido') ||
      query.includes('prendido') ||
      query.includes('habilitar sonido')
    ) {
      if (!soundOn) {
        toggleSound();
        setFeedbackMsg('¡Sonido activado de nuevo! 🔊');
        matchFound = true;
      } else {
        setFeedbackMsg('Sonido ya activado.');
        matchFound = true;
      }
    } else if (query.includes('hola') || query.includes('saludo')) {
      sounds.playLevelUp();
      sounds.speak('¡Hola amiguito! ¿Listo para aprender y recibir consejos inteligentes hoy?');
      setFeedbackMsg('¡Hola amiguito! ¿Listo para aprender hoy? 🦉');
      matchFound = true;
    }

    // AI dynamic fallback for generic educational advice & queries
    if (!matchFound && query.length > 2) {
      handleAISmartQuery(query);
    }

  }, [isListening, transcript]);

  // Request advice or details from Gemini AI
  const handleAISmartQuery = async (questionText: string) => {
    setIsLoadingAdvice(true);
    setFeedbackMsg('🦉 Ollie está concentrando su sabiduría de búho... ¡Espera un segundito!');
    sounds.playClick();

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionText,
          currentSubject: activeSubject,
        }),
      });

      const data = await response.json();
      if (data.text) {
        setFeedbackMsg(data.text);
        sounds.playCorrect();
        sounds.speak(data.text);
      } else {
        setFeedbackMsg('¡Ups! Siento una pequeña tormenta en mi cerebro de búho. ¿Puedes preguntarme de nuevo?');
      }
    } catch (err) {
      console.error('Error fetching dynamic advice from Gemini:', err);
      // Friendly local fallback
      const localTips: Record<string, string> = {
        math: '¡Desafía tu mente! En Matemáticas Mágicas tienes sumas, restas, multiplicaciones y divisiones. ¡Consigue más de 100 puntos para tener tu primera medalla!',
        language: '📚 ¡Prueba entrenar tus superpoderes lingüísticos participando en la sección de "Lectura Alaud" para una oratoria impecable!',
        science: '🧪 ¡Mézclalo todo en ciencias naturales! Te aconsejo mezclar imanes y ver la física secreta, o vinagre con bicarbonato.',
        philosophy_curiosities: '💭 Sócrates nos invita a dudar de todo. Hazle preguntas sabias para descubrir los secretos de Enigmakids.',
        classroom: '🏫 La pizarra es tu amiga. Anota todas las dudas para repasar con tu tutor de estudio.',
        painting_drawing: '🎨 ¡Toca o desliza en pintar y dibujar personajes! Consigue la medalla especial de Pequeño Da Vinci pintando con cariño tus personajes favoritos.',
        badges: '🏆 ¡Cada logro te otorga 50 puntos mágicos y una estrella extra! Intenta ganarlos todos para coronarte.',
      };
      const fallbackMsg = localTips[activeSubject] || '¡Sigue divirtiéndote y entrenando tu cerebro con cada juego!';
      setFeedbackMsg(`Aquí tienes mi sabio consejo local: ${fallbackMsg}`);
      sounds.speak(fallbackMsg);
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const toggleListen = () => {
    if (!isSupported) {
      sounds.speak('El asistente de voz no es compatible con este navegador. Por favor prueba con Google Chrome.');
      return;
    }

    if (isListening) {
      sounds.playClick();
      recognitionRef.current?.stop();
    } else {
      sounds.playClick();
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error('Error starting translation mic:', e);
      }
    }
  };

  return (
    <>
      {/* Floating launcher bar button */}
      <div className="fixed bottom-4 left-4 z-50">
        <motion.button
          id="btn-voice-assistant-launcher"
          onClick={() => {
            sounds.playClick();
            setIsOpen(!isOpen);
            if (!isOpen) {
              sounds.speak('¡Hola amiguito! Soy Ollie. Dime adónde ir o pregúntame por consejos y sabiduría.');
            }
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`flex items-center gap-2.5 px-4.5 py-3 rounded-full shadow-lg border-2 font-black text-sm text-slate-800 transition-all ${
            isOpen
              ? 'bg-rose-500 border-rose-600 text-white'
              : 'bg-white border-yellow-300 hover:bg-yellow-100 z-50'
          } cursor-pointer`}
        >
          {isOpen ? (
            <X className="w-5 h-5 animate-spin" />
          ) : (
            <div className="relative">
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />
              <Mic className="w-5 h-5 text-indigo-600 animate-pulse" />
            </div>
          )}
          <span>{isOpen ? 'Cerrar Consejos' : '🦉 Micrófono Inteligente'}</span>
        </motion.button>
      </div>

      {/* Main voice commander drawer modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            className="fixed bottom-20 left-4 z-[9999] w-full max-w-sm bg-white rounded-3xl border-4 border-yellow-300 shadow-2xl p-5 overflow-hidden font-sans"
          >
            {/* Header / Mascot Owl */}
            <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-3">
              <div className="bg-yellow-100 rounded-full p-2 shrink-0">
                <svg viewBox="0 0 140 140" className="w-[45px] h-[45px]">
                  <ellipse cx="70" cy="80" rx="30" ry="34" fill="#6366F1" stroke="#4338CA" strokeWidth="2.5" />
                  <ellipse cx="70" cy="86" rx="18" ry="19" fill="#FFFFFF" />
                  <ellipse cx="58" cy="74" r="10" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
                  <ellipse cx="82" cy="74" r="10" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
                  <circle cx="58" cy="74" r="4.5" fill="#000" />
                  <circle cx="82" cy="74" r="4.5" fill="#000" />
                  <polygon points="70,81 66,77 74,77" fill="#F59E0B" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-black text-slate-850 text-sm tracking-tight flex items-center gap-1 text-indigo-950">
                  <span>🦉 Micrófono de Ollie Sabio</span>
                  <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-full uppercase font-extrabold animate-pulse whitespace-nowrap">AI Inteligente</span>
                </h3>
                <p className="text-[9px] text-indigo-500 font-extrabold mt-0.5 uppercase tracking-wider truncate">
                  Viendo: {subjectNames[activeSubject] || activeSubject}
                </p>
              </div>

              <button
                id="btn-voice-close-drawer"
                className="ml-auto text-slate-450 hover:text-slate-600 border border-slate-200 rounded-full p-1 cursor-pointer shrink-0"
                onClick={() => {
                  sounds.playClick();
                  setIsOpen(false);
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bubble dialog conversation view */}
            <div className="my-4 bg-indigo-50/70 rounded-2xl p-4 border border-indigo-100 text-center relative shadow-inner">
              {isLoadingAdvice ? (
                <div className="flex flex-col items-center justify-center py-2.5 space-y-2">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-xs font-black text-indigo-800 animate-pulse">
                    Ollie está consultando su gran enciclopedia de las estrellas...
                  </p>
                </div>
              ) : (
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {feedbackMsg}
                </p>
              )}
              
              {/* Show Live transcription if existing */}
              {transcript && !isLoadingAdvice && (
                <div className="mt-2.5 pt-2 border-t border-indigo-100 text-[11px] text-slate-500 italic font-medium leading-tight text-center">
                  <div className="font-extrabold text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">Te escuché decir:</div>
                  "{transcript}"
                </div>
              )}
            </div>

            {/* Interaction area: Microphone */}
            <div className="flex flex-col items-center justify-center p-3.5 bg-slate-50 rounded-2xl border border-slate-150 relative">
              {isListening && (
                <div className="absolute inset-0 bg-red-500/5 animate-pulse rounded-2xl pointer-events-none" />
              )}

              {/* Glowing ring animation while recording */}
              <div className="relative">
                {isListening && (
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 bg-red-400/30 rounded-full blur-md animate-pulse"
                  />
                )}
                
                <button
                  id="btn-toggle-mic-cmd-smart"
                  onClick={toggleListen}
                  disabled={!isSupported || isLoadingAdvice}
                  className={`w-16 h-16 rounded-full flex items-center justify-center border-b-4 border-2 shadow-lg transition-all ${
                    isListening
                      ? 'bg-red-500 border-red-700 hover:bg-red-650 text-white'
                      : 'bg-white border-yellow-350 hover:bg-yellow-50 text-indigo-650'
                  } cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50`}
                >
                  {isListening ? (
                    <MicOff className="w-7 h-7 stroke-[2.5]" />
                  ) : (
                    <Mic className="w-7 h-7 text-indigo-600 stroke-[2.5]" />
                  )}
                </button>
              </div>

              <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest mt-2 px-1 text-center leading-normal">
                {isListening ? '🔴 GRABANDO... CLIC PARA PROCESAR' : '🟢 ENCIENDE Y HÁBLAME DE CUALQUIER TEMA'}
              </span>
            </div>

            {/* AI Prompts block (Clickable questions of wisdom / advice) */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <h4 className="text-[10px] font-black uppercase text-indigo-900 tracking-wider mb-2 flex items-center gap-1.5 justify-center">
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-spin-pulse" />
                <span>¿Dificultad? Toca para Consultar a Ollie:</span>
              </h4>
              <div className="grid grid-cols-1 gap-1.5 font-bold">
                <button
                  id="btn-ask-ollie-explain"
                  onClick={() => handleAISmartQuery(`¿Qué puedo hacer de forma divertida en la sección de ${subjectNames[activeSubject] || activeSubject}?`)}
                  disabled={isLoadingAdvice}
                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-850 p-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer text-left w-full disabled:opacity-50"
                >
                  <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-black tracking-wider text-indigo-400">¿Qué hago aquí?</p>
                    <p className="text-[11px] font-extrabold truncate">Ver guía de {subjectNames[activeSubject] || activeSubject}</p>
                  </div>
                </button>

                <button
                  id="btn-ask-ollie-advice"
                  onClick={() => handleAISmartQuery(`Dame un consejo de estudio, un truco mental o un dato curioso de aprendizaje sobre la materia de ${subjectNames[activeSubject] || activeSubject}`)}
                  disabled={isLoadingAdvice}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 p-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer text-left w-full disabled:opacity-50"
                >
                  <Brain className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-black tracking-wider text-emerald-500">Dame sabiduría</p>
                    <p className="text-[11px] font-extrabold truncate">Dame un consejo inteligente de {subjectNames[activeSubject] || activeSubject}</p>
                  </div>
                </button>

                <button
                  id="btn-ask-ollie-challenge"
                  onClick={() => handleAISmartQuery(`Dame un desafío interactivo rápido o enigma fácil de ${subjectNames[activeSubject] || activeSubject} para mi edad`)}
                  disabled={isLoadingAdvice}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 p-2 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer text-left w-full disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-black tracking-wider text-amber-500">Reto instantáneo</p>
                    <p className="text-[11px] font-extrabold truncate">Reto del día para mi mente</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Footer navigational hints list */}
            <div className="mt-4 border-t border-slate-100 pt-2 flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Navega diciendo: "Ir a Ciencias"</span>
              <span>Ollie AI v1.5</span>
            </div>

            {/* Non-supported alert */}
            {!isSupported && (
              <div className="mt-3 p-2 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-250 text-[10px] font-semibold text-center uppercase tracking-wide">
                🚫 Tu navegador no posee reconocimiento de voz compatible. Por favor, sé fuerte y usa Chrome o Edge.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
