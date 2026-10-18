/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { sounds } from '../utils/sound';
import { HelpCircle, Star, Sparkles, BookOpen, Volume2, Globe, GraduationCap, ChevronLeft, ChevronRight, MessageSquareText, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorldMapCuriosities } from './WorldMapCuriosities';

interface PhilosophyCuriositiesProps {
  onAddPoints: (points: number) => void;
  onUnlockBadge: (badgeId: string) => void;
}

interface PhiloQuestion {
  id: string;
  question: string;
  intro: string;
  options: { text: string; reflection: string }[];
}

interface CuriosityCard {
  id: number;
  emoji: string;
  title: string;
  fact: string;
  topic: string;
}

const philoQuestions: PhiloQuestion[] = [
  {
    id: 'happiness',
    question: '🎯 ¿Qué es realmente ser feliz?',
    intro: 'El Búho Sabio se pregunta: ¿Es la felicidad tener un juguete nuevo gigante, o hay algo más secreto?',
    options: [
      {
        text: '🎁 Tener muchísimos juguetes y cosas nuevas.',
        reflection: '¡Los juguetes nuevos son geniales! Pero los filósofos descubrieron que las cosas se gastan rápido. La verdadera felicidad dura más cuando compartimos y hacemos cosas que nos apasionan.',
      },
      {
        text: '❤️ Compartir momentos divertidos con personas que queremos.',
        reflection: '¡Bingo! El filósofo Epicuro decía que la amistad y reír con seres queridos alimenta el alma más que cualquier montaña de oro. ¡Excelente reflexión!',
      },
      {
        text: '🎨 Aprender y crear cosas con mi mente.',
        reflection: '¡Qué gran pensamiento! Al activar nuestra curiosidad y crear arte o juegos, nuestra mente entra en un estado de felicidad que filósofos antiguos llamaban "Eudaimonía".',
      },
    ],
  },
  {
    id: 'rules',
    question: '🚦 ¿Para qué sirven las reglas de convivencia?',
    intro: '¿Crees que un mundo inventado de cero sin ninguna regla funcionaría, o sería un caos total?',
    options: [
      {
        text: '🛡️ Para cuidarnos y respetarnos entre todos.',
        reflection: '¡Así es! Las reglas no son límites aburridos; son puentes seguros para que todos podamos jugar, caminar y vivir tranquilos sabiendo que nos respetamos mutuamente.',
      },
      {
        text: '🔒 Solo para obligarnos a portarnos bien.',
        reflection: 'A veces se siente así, ¿verdad? Pero en filosofía social, aprendemos que las reglas las creamos juntos (un contrato social) para que los más fuertes ayuden a proteger a los más pequeños.',
      },
    ],
  },
  {
    id: 'imagination',
    question: '💭 ¿De dónde vienen tus ideas y sueños?',
    intro: 'Cuando cierras los ojos y vuelas a mundos de fantasía, ¿dónde estás viajando?',
    options: [
      {
        text: '🌍 De lo que observo en el mundo real mezclado con magia.',
        reflection: '¡Asombroso! Los empiristas decían que todo lo que imaginamos surge de piezas que vimos en la realidad, recortadas y reordenadas mágicamente por nuestra mente.',
      },
      {
        text: '🪄 De un lugar secreto en el cerebro que crea realidades.',
        reflection: '¡Precioso! Tu imaginación es ilimitada y puede resolver problemas de formas que nadie más ha pensado jamás. ¡La creatividad es tu superpoder más grande!',
      },
    ],
  },
];

const curiosityCards: CuriosityCard[] = [
  {
    id: 1,
    emoji: '🐙',
    topic: 'Biología Marina',
    title: 'El Pulpo y sus corazones',
    fact: '¡Los pulpos tienen 3 corazones enteros y su sangre es de color azul brillante debido al cobre en su cuerpo!',
  },
  {
    id: 2,
    emoji: '🗼',
    topic: 'Física y Calor',
    title: 'La Torre Eiffel crece',
    fact: 'En verano, debido al fuerte calor del sol, el metal de la Torre Eiffel se expande y ¡puede medir hasta 15 centímetros más de alto!',
  },
  {
    id: 3,
    emoji: '🍯',
    topic: 'Arqueología',
    title: 'Miel que nunca caduca',
    fact: 'La miel natural nunca se echa a perder. ¡Arqueólogos probaron miel de hace 3,000 años encontrada en tumbas egipcias y aún sabía deliciosa!',
  },
  {
    id: 4,
    emoji: '🌳',
    topic: 'Astronomía y Árboles',
    title: 'Más árboles que estrellas',
    fact: 'Hay más árboles poblando el planeta Tierra (unos 3 billones) que estrellas flotando en toda nuestra galaxia, la Vía Láctea.',
  },
  {
    id: 5,
    emoji: '🍌',
    topic: 'Botánica Divertida',
    title: 'La Banana es una baya',
    fact: 'Científicamente, las bananas son consideradas bayas debido a sus semillas internas blandas, pero las fresas rojas no lo son.',
  },
];

export const PhilosophyCuriosities: React.FC<PhilosophyCuriositiesProps> = ({
  onAddPoints,
  onUnlockBadge,
}) => {
  const [activeSegment, setActiveSegment] = useState<'world_map' | 'philosophy' | 'curiosities'>('world_map');

  // Philosophy state
  const [philoIdx, setPhiloIdx] = useState<number>(0);
  const [selectedPhiloOption, setSelectedPhiloOption] = useState<number | null>(null);

  // Curiosities state
  const [curioIdx, setCurioIdx] = useState<number>(0);

  const handlePhiloClick = (index: number) => {
    if (selectedPhiloOption !== null) return;
    setSelectedPhiloOption(index);
    sounds.playCorrect();
    onAddPoints(20); // philosophies unlock score big
    sounds.speak(philoQuestions[philoIdx].options[index].reflection);
    
    // Unlock Socrates badge on answering first philo question
    onUnlockBadge('mini_philosopher');
  };

  const nextPhilo = () => {
    sounds.playClick();
    setSelectedPhiloOption(null);
    setPhiloIdx((philoIdx + 1) % philoQuestions.length);
  };

  const speakCuriosity = () => {
    const card = curiosityCards[curioIdx];
    sounds.speak(`¡Dato curioso sobre ${card.topic}! ${card.title}. ${card.fact}`);
  };

  const nextCurio = () => {
    sounds.playClick();
    const nextIdx = (curioIdx + 1) % curiosityCards.length;
    setCurioIdx(nextIdx);
  };

  const prevCurio = () => {
    sounds.playClick();
    const prevIdx = curioIdx === 0 ? curiosityCards.length - 1 : curioIdx - 1;
    setCurioIdx(prevIdx);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Sub sections switcher */}
      <div className="flex flex-wrap justify-center gap-3 bg-white/90 backdrop-blur-md p-3 rounded-3xl shadow-lg border-4 border-yellow-300">
        <button
          id="btn-world-map-active"
          onClick={() => {
            sounds.playClick();
            setActiveSegment('world_map');
          }}
          className={`py-3 px-5 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow-md transition-all cursor-pointer flex items-center gap-2 ${
            activeSegment === 'world_map'
              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 border-teal-700 text-white scale-105'
              : 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-900'
          }`}
        >
          <span>🗺️ Mapa del Mundo Interactivo</span>
        </button>

        <button
          id="btn-philo-active"
          onClick={() => {
            sounds.playClick();
            setActiveSegment('philosophy');
            setSelectedPhiloOption(null);
          }}
          className={`py-3 px-5 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow-md transition-all cursor-pointer flex items-center gap-2 ${
            activeSegment === 'philosophy'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 border-amber-700 text-white scale-105'
              : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
          }`}
        >
          <span>🦉 Escuela de Filosofía</span>
        </button>

        <button
          id="btn-curio-active"
          onClick={() => {
            sounds.playClick();
            setActiveSegment('curiosities');
          }}
          className={`py-3 px-5 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow-md transition-all cursor-pointer flex items-center gap-2 ${
            activeSegment === 'curiosities'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 border-indigo-700 text-white scale-105'
              : 'bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900'
          }`}
        >
          <span>💡 Tarjetas de Curiosidades</span>
        </button>
      </div>

      {/* SEGMENT 1: WORLD MAP INTERACTIVE (Rincón de Curiosidades) */}
      {activeSegment === 'world_map' && (
        <WorldMapCuriosities
          onAddPoints={onAddPoints}
          onUnlockBadge={onUnlockBadge}
        />
      )}

      {/* SEGMENT 2: SOCRATIC PHILOSOPHY FOR KIDS */}
      {activeSegment === 'philosophy' && philoQuestions[philoIdx] && (
        <div className="bg-white rounded-3xl shadow-xl border-4 border-yellow-400 p-6 md:p-8 max-w-3xl mx-auto">
          {/* Wisdom owl header */}
          <div className="flex items-center gap-4 bg-amber-50 rounded-2xl border border-amber-200 p-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-yellow-300 to-amber-400 rounded-full flex items-center justify-center text-4xl shadow-md border-2 border-white shrink-0 animate-bounce duration-3000">
              🦉
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-800 flex items-center gap-1.5">
                <span>El Búho Filósofo</span>
                <span className="bg-yellow-400 text-yellow-950 font-black text-[9px] rounded-full px-2 py-0.5 uppercase tracking-wide">Sin Respuestas Incorrectas</span>
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                ¡En la filosofía, todas tus ideas con argumentos son tesoros valiosos que nos ayudan a entender el universo!
              </p>
            </div>
          </div>

          {/* Socratic Big Question Card */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-250 rounded-3xl p-6 mb-6 text-center shadow-inner">
            <h2 className="text-xl md:text-2xl font-black text-amber-900 leading-snug">
              {philoQuestions[philoIdx].question}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 font-bold mt-2 leading-relaxed">
              "{philoQuestions[philoIdx].intro}"
            </p>
          </div>

          {/* Choices layout */}
          <div className="space-y-3 mb-6">
            {philoQuestions[philoIdx].options.map((opt, i) => {
              const isSelected = selectedPhiloOption === i;
              let optionClass = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-350';

              if (selectedPhiloOption !== null) {
                if (isSelected) {
                  optionClass = 'bg-yellow-400 border-yellow-500 text-yellow-950 font-black shadow-md';
                } else {
                  optionClass = 'bg-slate-50 border-slate-200 text-slate-400 scale-95 opacity-60';
                }
              }

              return (
                <button
                  key={i}
                  id={`philo-opt-${i}`}
                  disabled={selectedPhiloOption !== null}
                  onClick={() => handlePhiloClick(i)}
                  className={`w-full py-4 px-5 text-left text-sm md:text-base font-bold rounded-2xl border-b-4 shadow transition-all duration-150 ${optionClass}`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>

          {/* Socratic Owl reflection */}
          {selectedPhiloOption !== null && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 rounded-3xl p-5 border border-yellow-250 relative shadow-md"
            >
              <div className="flex gap-3">
                <span className="text-3xl shrink-0 mt-1">💡</span>
                <div>
                  <h4 className="font-black text-amber-900 text-sm">Reflexión Ilustrada de la Escuela:</h4>
                  <p className="text-sm text-slate-700 mt-1.5 leading-relaxed font-bold">
                    {philoQuestions[philoIdx].options[selectedPhiloOption].reflection}
                  </p>
                </div>
              </div>

              <button
                id="btn-philo-next"
                onClick={nextPhilo}
                className="mt-4 flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-black text-sm px-6 py-2.5 rounded-full shadow-lg active:scale-95 transition-all mx-auto"
              >
                Siguiente Gran Misterio 🌀
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* SEGMENT 3: AMAZING CURIOSITY CARDS */}
      {activeSegment === 'curiosities' && curiosityCards[curioIdx] && (
        <div className="bg-white rounded-3xl shadow-xl border-4 border-indigo-400 p-6 md:p-8 max-w-3xl mx-auto">
          {/* Intro header with sound capability */}
          <div className="flex justify-between items-center bg-indigo-50 rounded-2xl p-4 mb-6 border border-indigo-200">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-indigo-600" />
              <div>
                <h4 className="text-sm font-black text-indigo-800">El Cofre de Maravillas</h4>
                <p className="text-xs text-indigo-600 font-medium">¡Datos del mundo que te dejarán con la boca abierta!</p>
              </div>
            </div>

            <button
              id="btn-curio-speak"
              onClick={speakCuriosity}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs md:text-sm px-4 py-2.5 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <Volume2 className="w-5 h-5 fill-white text-white" />
              <span>Escuchar en Voz Alta</span>
            </button>
          </div>

          {/* Interactive slide of curiosity */}
          <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl relative min-h-[220px] transition-all overflow-hidden shadow-inner flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={curiosityCards[curioIdx].id}
                initial={{ opacity: 0, x: 45 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -45 }}
                transition={{ duration: 0.25 }}
                className="text-center md:px-6"
              >
                <div className="text-6xl mb-3 animate-pulse">{curiosityCards[curioIdx].emoji}</div>
                <span className="bg-indigo-200 text-indigo-950 text-[10px] uppercase font-black px-3 py-1 rounded-full text-center">
                  Mundo Curioso: {curiosityCards[curioIdx].topic}
                </span>
                <h2 className="text-2xl font-black text-slate-800 mt-3 mb-2">{curiosityCards[curioIdx].title}</h2>
                <p className="text-sm md:text-base text-slate-600 font-bold leading-relaxed">{curiosityCards[curioIdx].fact}</p>
              </motion.div>
            </AnimatePresence>

            {/* Slide Indicators dot bar & buttons */}
            <div className="flex justify-between items-center gap-4 mt-6 pt-4 border-t border-slate-200">
              <button
                id="btn-curio-prev"
                onClick={prevCurio}
                className="p-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-full shadow active:scale-90 transition-all shrink-0"
              >
                <ChevronLeft className="w-5 h-5 fill-slate-600" />
              </button>

              <div className="flex gap-1.5">
                {curiosityCards.map((c, i) => (
                  <div
                    key={c.id}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i === curioIdx ? 'bg-indigo-600 w-6' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              <button
                id="btn-curio-next"
                onClick={nextCurio}
                className="p-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-full shadow active:scale-90 transition-all shrink-0"
              >
                <ChevronRight className="w-5 h-5 fill-slate-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Hint footer */}
      <div className="flex gap-2 items-start text-xs text-slate-400 max-w-3xl mx-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
        <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
        <p className="leading-snug">
          <strong>¡Conocimiento Infinito!</strong> Al aprender sobre el mapa mundial, geografía, filosofía y datos fascinantes de la Tierra, entrenas tu curiosidad e inteligencia para expandir lo maravilloso que es nuestro planeta.
        </p>
      </div>
    </div>
  );
};

