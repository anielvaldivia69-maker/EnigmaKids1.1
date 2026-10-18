/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { sounds } from '../utils/sound';
import { Award, Trophy, Star, ShieldCheck, Zap, KeyRound, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface BadgesProps {
  unlockedBadgeIds: string[];
}

export interface BadgeInfo {
  id: string;
  title: string;
  requirement: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  description: string;
}

export const badgesList: BadgeInfo[] = [
  {
    id: 'math_bronze',
    title: 'Calculador Explorador 🧭',
    requirement: 'Llegar a Nivel 2 en cualquier juego de matemáticas.',
    emoji: '🧭',
    bgColor: 'bg-amber-100 border-amber-300',
    textColor: 'text-amber-800',
    description: '¡Has aprendido a resolver problemas numéricos rápidos!'
  },
  {
    id: 'math_silver',
    title: 'Guardián de los Números 🛡️',
    requirement: 'Llegar a Nivel 3 en cualquier juego de matemáticas.',
    emoji: '🛡️',
    bgColor: 'bg-slate-100 border-slate-300',
    textColor: 'text-slate-800',
    description: '¡Tus cálculos precisos ayudan a restaurar la paz matemática!'
  },
  {
    id: 'math_gold',
    title: 'Mente Maestra Einstein 🚀',
    requirement: 'Llegar a Nivel 4 en cualquier juego de matemáticas.',
    emoji: '🚀',
    bgColor: 'bg-yellow-100 border-yellow-300',
    textColor: 'text-yellow-800',
    description: '¡Increíble rapidez mental! Rompiste la barrera de las operaciones más complejas.'
  },
  {
    id: 'language_scramble_champion',
    title: 'Cazador de Letras 🔠',
    requirement: 'Resolver y completar el deletreador de palabras de lengua literatura.',
    emoji: '🔠',
    bgColor: 'bg-sky-100 border-sky-300',
    textColor: 'text-sky-800',
    description: '¡Tienes un vocabulario asombroso y una excelente ortografía literaria!'
  },
  {
    id: 'vocabulary_wizard',
    title: 'Mago del Lenguaje 🪄',
    requirement: 'Completar el de sinónimos y antónimos gramaticales.',
    emoji: '🪄',
    bgColor: 'bg-purple-100 border-purple-300',
    textColor: 'text-purple-800',
    description: '¡Dominas el significado y los contrarios mágicos de las palabras!'
  },
  {
    id: 'eco_ranger',
    title: 'Héroe del Planeta 🌍',
    requirement: 'Asociar tu primera criatura con su hábitat correcto de ciencias.',
    emoji: '🌍',
    bgColor: 'bg-emerald-100 border-emerald-300',
    textColor: 'text-emerald-800',
    description: '¡Proteges la fauna del océano, de la selva y del desierto con tu sabiduría!'
  },
  {
    id: 'mini_einstein',
    title: 'Científico Volcánico 🌋',
    requirement: 'Efectuar la mezcla virtual para erupcionar el volcán químico.',
    emoji: '🌋',
    bgColor: 'bg-red-100 border-red-300',
    textColor: 'text-red-800',
    description: '¡Haz mezclado de forma perfecta ingredientes químicos en el laboratorio simulado!'
  },
  {
    id: 'mic_master',
    title: 'Lector Estrella 🎤',
    requirement: 'Leer una oración en voz alta de forma perfecta sin cometer ningún error.',
    emoji: '🎤',
    bgColor: 'bg-rose-100 border-rose-350',
    textColor: 'text-rose-900',
    description: '¡Lees con increíble velocidad, precisión y una excelente entonación!'
  },
  {
    id: 'mini_philosopher',
    title: 'Pequeño Sócrates 💭',
    requirement: 'Reflexionar y responder tu primer misterio en el aula de filosofía.',
    emoji: '💭',
    bgColor: 'bg-indigo-100 border-indigo-300',
    textColor: 'text-indigo-800',
    description: '¡Gran capacidad analítica! Te gusta preguntarte el porqué de la vida.'
  },
  {
    id: 'world_explorer',
    title: 'Explorador del Mundo 🗺️',
    requirement: 'Descubrir y explorar 5 países diferentes en el mapa del Rincón de Curiosidades.',
    emoji: '🗺️',
    bgColor: 'bg-teal-100 border-teal-300',
    textColor: 'text-teal-800',
    description: '¡Has viajado por los continentes descubriendo monumentos, animales y datos fascinantes!'
  },
  {
    id: 'paint_da_vinci',
    title: 'Pequeño Da Vinci 🎨',
    requirement: 'Pintar un superhéroe o princesa en la pizarra de pintar y dibujar.',
    emoji: '🎨',
    bgColor: 'bg-pink-100 border-pink-300',
    textColor: 'text-pink-850',
    description: '¡Posees una creatividad brillante y un control de colores digno de un gran artista!'
  },
];

export const Badges: React.FC<BadgesProps> = ({ unlockedBadgeIds }) => {
  const handleBadgeClick = (badge: BadgeInfo, isUnlocked: boolean) => {
    sounds.playClick();
    if (isUnlocked) {
      sounds.speak(`¡Felicidades por tener tu trofeo: ${badge.title}! ${badge.description}`);
    } else {
      sounds.speak(`Este trofeo está asegurado. Para ganarlo necesitas: ${badge.requirement}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-4 border-amber-300 p-6 md:p-8 max-w-4xl mx-auto">
      {/* Badges Intro Header */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-amber-100 border-2 border-amber-300 rounded-full text-amber-600 mb-2 items-center justify-center animate-bounce">
          <Trophy className="w-10 h-10 stroke-[2.5]" />
        </div>
        <h2 className="text-3xl font-black text-amber-900">Tu Sala de Trofeos Enigmakids</h2>
        <p className="text-sm text-slate-500 font-bold max-w-md mx-auto mt-1">
          ¡Derrumba barreras aprendiendo! Consigue medallas únicas completando los desafíos interactivos de lengua, mates, ciencias y filosofía.
        </p>

        {/* Counter Progress */}
        <div className="mt-4 inline-block bg-yellow-50 border border-yellow-200 rounded-full px-5 py-2 font-black text-amber-700 shadow-inner">
          🏆 Trofeos desbloqueados: <span className="text-yellow-600 text-lg">{unlockedBadgeIds.length}</span> de <span className="text-slate-400">{badgesList.length}</span>
        </div>
      </div>

      {/* Grid gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {badgesList.map((badge) => {
          const isUnlocked = unlockedBadgeIds.includes(badge.id);

          return (
            <motion.div
              key={badge.id}
              onClick={() => handleBadgeClick(badge, isUnlocked)}
              whileHover={{ scale: isUnlocked ? 1.05 : 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col justify-between items-center text-center p-4 rounded-2xl border-2 shadow-sm relative cursor-pointer group transition-all duration-300 ${
                isUnlocked
                  ? `${badge.bgColor} hover:shadow-md border-b-4 hover:-translate-y-1`
                  : 'bg-slate-50 border-slate-200 border-dashed opacity-70 grayscale'
              }`}
            >
              {/* Unlock sparkles ribbon overlay */}
              {isUnlocked && (
                <div className="absolute top-1 right-1 text-yellow-400 animate-pulse">
                  <Sparkles className="w-4 h-4 fill-yellow-400" />
                </div>
              )}

              {/* Big emoji emblem placeholder */}
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-3 shadow transition-all ${
                  isUnlocked ? 'bg-white scale-110' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isUnlocked ? badge.emoji : '🔒'}
              </div>

              {/* Badge label title */}
              <div className="flex-grow flex flex-col justify-center">
                <h3 className={`text-base font-extrabold leading-snug ${
                  isUnlocked ? badge.textColor : 'text-slate-400'
                }`}>
                  {isUnlocked ? badge.title.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '') : 'Trofeo Bloqueado'}
                </h3>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed mt-1.5 min-h-[50px]">
                  {isUnlocked ? badge.description : badge.requirement}
                </p>
              </div>

              {/* Locked/Unlocked status ribbon pill footer */}
              <div className="w-full mt-3">
                <span className={`inline-block py-1 px-3 text-[10px] font-black rounded-full uppercase tracking-wider ${
                  isUnlocked
                    ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-sm'
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {isUnlocked ? '🔓 Desbloqueado' : 'Asegurado'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
