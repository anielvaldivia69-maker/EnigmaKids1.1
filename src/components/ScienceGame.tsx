/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { sounds } from '../utils/sound';
import { Leaf, Award, Lightbulb, Play, Smile, Orbit, CheckCircle2, FlaskConical, CircleAlert, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScienceGameProps {
  onAddPoints: (points: number) => void;
  onUnlockBadge: (badgeId: string) => void;
}

// Science ecosystems data
interface Species {
  name: string;
  emoji: string;
  habitat: 'ocean' | 'desert' | 'jungle' | 'forest';
  funFact: string;
}

const speciesList: Species[] = [
  { name: 'Delfín', emoji: '🐬', habitat: 'ocean', funFact: 'Un mamífero acuático súper inteligente que duerme con un ojo abierto.' },
  { name: 'Camello', emoji: '🐫', habitat: 'desert', funFact: 'Guarda agua y grasa en sus jorobas para sobrevivir días enteros con calor.' },
  { name: 'Tucán', emoji: '🪶', habitat: 'jungle', funFact: 'Tiene un pico enorme y colorido para alcanzar frutas y regular su temperatura.' },
  { name: 'Oso Pardo', emoji: '🐻', habitat: 'forest', funFact: 'Le encanta pescar salmones de los ríos y duerme en cuevas durante el invierno.' },
  { name: 'Tiburón', emoji: '🦈', habitat: 'ocean', funFact: 'No tiene huesos, su esqueleto es de cartílago flexible.' },
  { name: 'Cactus', emoji: '🌵', habitat: 'desert', funFact: 'Tiene espinas en lugar de hojas para no perder humedad bajo el ardiente sol.' },
  { name: 'Mono', emoji: '🐒', habitat: 'jungle', funFact: 'Usa su cola larga como una mano extra para columpiarse por los árboles.' },
  { name: 'Ardilla', emoji: '🐿️', habitat: 'forest', funFact: 'Esconde nueces bajo la tierra y eso ayuda a que crezcan nuevos árboles.' },
];

// Organs data
interface Organ {
  id: string;
  name: string;
  emoji: string;
  function: string;
  location: string;
  funFact: string;
}

const organsList: Organ[] = [
  {
    id: 'brain',
    name: 'El Cerebro 🧠',
    emoji: '🧠',
    function: 'Es la computadora central del cuerpo. Controla tus pensamientos, emociones, memoria y movimientos.',
    location: 'En la cabeza, protegido por el cráneo.',
    funFact: '¡Genera suficiente energía eléctrica pequeña como para encender una bombilla LED!',
  },
  {
    id: 'heart',
    name: 'El Corazón ❤️',
    emoji: '❤️',
    function: 'Es una bomba muscular incansable que distribuye la sangre llena de oxígeno y vida por todo tu cuerpo.',
    location: 'En el pecho, ligeramente hacia el lado izquierdo.',
    funFact: '¡Late unas cien mil veces al día y nunca descansa!',
  },
  {
    id: 'lungs',
    name: 'Los Pulmones 🫁',
    emoji: '🫁',
    function: 'Toman el aire limpio cuando inhalas y sacan el dióxido de carbono que tu cuerpo ya no necesita.',
    location: 'En el pecho, a los costados del corazón.',
    funFact: '¡Si se estiraran por completo, cubrirían una pista de tenis entera!',
  },
  {
    id: 'stomach',
    name: 'El Estómago 🍕',
    emoji: '🍕',
    function: 'Mezcla los alimentos que consumes con jugos ácidos especiales para triturarlos y extraer energías.',
    location: 'En el vientre, debajo de tus costones.',
    funFact: 'Su ácido es tan potente que ayuda a destruir bacterias malas que entran en la comida.',
  },
  {
    id: 'bones',
    name: 'El Esqueleto 🦴',
    emoji: '🦴',
    function: 'La estructura de huesos duros que sostiene tu cuerpo, protege tus órganos y te permite correr.',
    location: 'Distribuido por todo tu cuerpo.',
    funFact: '¡Un bebé tiene casi 300 huesos, pero de adulto se unen y te quedan solo 206!',
  },
];

export const ScienceGame: React.FC<ScienceGameProps> = ({ onAddPoints, onUnlockBadge }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ecosystem' | 'anatomy' | 'experiment'>('ecosystem');

  // ECOSYSTEM GAME STATES
  const [ecoIndex, setEcoIndex] = useState<number>(0);
  const [ecoSuccess, setEcoSuccess] = useState<boolean | null>(null);

  // ANATOMY STATES
  const [selectedOrgan, setSelectedOrgan] = useState<Organ | null>(null);

  // EXPERIMENT STATES
  const [step, setStep] = useState<number>(0);
  const [hasSoda, setHasSoda] = useState<boolean>(false);
  const [hasColor, setHasColor] = useState<boolean>(false);
  const [hasVinegar, setHasVinegar] = useState<boolean>(false);
  const [erupting, setErupting] = useState<boolean>(false);

  // Ecosystem action handler
  const selectHabitat = (habitatType: 'ocean' | 'desert' | 'jungle' | 'forest') => {
    if (ecoSuccess !== null) return;
    const current = speciesList[ecoIndex];
    const correct = current.habitat === habitatType;
    setEcoSuccess(correct);

    if (correct) {
      sounds.playCorrect();
      onAddPoints(15);
      sounds.speak(`¡Excelente! El ${current.name} pertenece al hábitat: ${
        habitatType === 'ocean' ? 'el Océano' : habitatType === 'desert' ? 'el Desierto' : habitatType === 'jungle' ? 'la Selva' : 'el Bosque'
      }. ${current.funFact}`);
      
      // Unlock badge for answering first ecosystem correctly
      if (ecoIndex === 0) {
        onUnlockBadge('eco_ranger');
      }
    } else {
      sounds.playIncorrect();
      sounds.speak(`Oh, todavía no. El ${current.name} vive en otro ecosistema. ¡Aprende de ello e intenta con otro!`);
    }
  };

  const nextEcosystem = () => {
    setEcoSuccess(null);
    const nextIdx = (ecoIndex + 1) % speciesList.length;
    setEcoIndex(nextIdx);
  };

  // Anatomy click handler
  const handleOrganClick = (organ: Organ) => {
    sounds.playClick();
    setSelectedOrgan(organ);
    sounds.speak(`${organ.name}. ${organ.function}. Pista curiosa: ${organ.funFact}`);
    onAddPoints(5); // reward discovery
  };

  // Experiment pours
  const handlePour = (ingredient: 'soda' | 'color' | 'vinegar') => {
    sounds.playClick();
    if (ingredient === 'soda') setHasSoda(true);
    if (ingredient === 'color') setHasColor(true);
    if (ingredient === 'vinegar') {
      if (!hasSoda) {
        sounds.speak('Primero debes poner el bicarbonato mágico en el cráter.');
        return;
      }
      setHasVinegar(true);
      // Automatically erupt!
      setErupting(true);
      sounds.playLevelUp();
      sounds.speak('¡BUM! ¡Reacción química! El ácido del vinagre y la base del bicarbonato crearon dióxido de carbono y una asombrosa erupción espumosa.');
      onUnlockBadge('mini_einstein');
      onAddPoints(30);
    }
  };

  const resetExperiment = () => {
    sounds.playClick();
    setHasSoda(false);
    setHasColor(false);
    setHasVinegar(false);
    setErupting(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-4 border-emerald-300 p-6 md:p-8 max-w-3xl mx-auto overflow-hidden">
      {/* Sub tabs navigation inside Science */}
      <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6">
        <button
          id="btn-sc-eco"
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('ecosystem');
          }}
          className={`py-2 px-1 md:py-3 md:px-4 rounded-2xl font-black text-xs md:text-base border-b-4 shadow-md transition-all ${
            activeSubTab === 'ecosystem'
              ? 'bg-emerald-500 border-emerald-600 text-white'
              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
          }`}
        >
          🌴 Ecosistemas
        </button>

        <button
          id="btn-sc-anat"
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('anatomy');
            setSelectedOrgan(null);
          }}
          className={`py-2 px-1 md:py-3 md:px-4 rounded-2xl font-black text-xs md:text-base border-b-4 shadow-md transition-all ${
            activeSubTab === 'anatomy'
              ? 'bg-emerald-500 border-emerald-600 text-white'
              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
          }`}
        >
          🧍 Cuerpo Humano
        </button>

        <button
          id="btn-sc-exp"
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('experiment');
            resetExperiment();
          }}
          className={`py-2 px-1 md:py-3 md:px-4 rounded-2xl font-black text-xs md:text-base border-b-4 shadow-md transition-all ${
            activeSubTab === 'experiment'
              ? 'bg-emerald-500 border-emerald-600 text-white'
              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
          }`}
        >
          🌋 Experimentos
        </button>
      </div>

      {/* SUB-TAB 1: ECOSYSTEMS GAME */}
      {activeSubTab === 'ecosystem' && speciesList[ecoIndex] && (
        <div className="text-center">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-6 border-2 border-dashed border-emerald-300 mb-6 max-w-sm mx-auto shadow-inner relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-extrabold text-xs px-3 py-1 rounded-full uppercase shadow">
              ¿Dónde vive?
            </span>
            <div className="text-7xl my-4 animate-bounce duration-1000">{speciesList[ecoIndex].emoji}</div>
            <h3 className="text-3xl font-black text-emerald-900 mb-2">{speciesList[ecoIndex].name}</h3>
            <p className="text-xs text-emerald-700/80 font-bold uppercase tracking-wider">Toca el botón con su hábitat correcto:</p>
          </div>

          {/* Habitat Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {(['ocean', 'desert', 'jungle', 'forest'] as const).map((habitat) => {
              const label = habitat === 'ocean' ? '⚓ Océano' : habitat === 'desert' ? '🏜️ Desierto' : habitat === 'jungle' ? '🐒 Selva' : '🌲 Bosque';
              const borderColors = {
                ocean: 'border-blue-400 hover:bg-blue-50 text-blue-800',
                desert: 'border-amber-400 hover:bg-amber-50 text-amber-800',
                jungle: 'border-emerald-400 hover:bg-emerald-50 text-emerald-800',
                forest: 'border-stone-400 hover:bg-stone-50 text-stone-800',
              };

              let activeStyles = 'bg-white border-b-4';
              if (ecoSuccess !== null) {
                if (speciesList[ecoIndex].habitat === habitat) {
                  activeStyles = 'bg-emerald-505 bg-emerald-500 border-emerald-700 text-white shadow-emerald-100';
                } else if (ecoSuccess === false) {
                  activeStyles = 'bg-slate-100 border-slate-300 text-slate-300 opacity-60';
                }
              }

              return (
                <button
                  key={habitat}
                  id={`eco-choice-${habitat}`}
                  disabled={ecoSuccess !== null}
                  onClick={() => selectHabitat(habitat)}
                  className={`py-3 px-4 font-black text-sm rounded-2xl shadow transition-all duration-150 ${borderColors[habitat]} ${activeStyles}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Feedback & Continue */}
          {ecoSuccess !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-5 rounded-2xl border mb-2 text-left max-w-xl mx-auto shadow-md ${
                ecoSuccess ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
              }`}
            >
              <div className="flex gap-3">
                <div className="text-3xl shrink-0">{ecoSuccess ? '🏆' : '💡'}</div>
                <div>
                  <h4 className={`font-black text-base ${ecoSuccess ? 'text-emerald-800' : 'text-rose-700'}`}>
                    {ecoSuccess ? '¡Impresionante, explorador natural!' : '¡Excelente intento! Sigue explorando:'}
                  </h4>
                  <p className="text-sm text-slate-600 font-medium mt-1">
                    {speciesList[ecoIndex].funFact}
                  </p>
                </div>
              </div>
              
              <button
                id="btn-eco-next"
                onClick={nextEcosystem}
                className="mt-4 flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm px-6 py-2.5 rounded-full shadow-md active:scale-95 transition-all mx-auto"
              >
                Siguiente Criatura 🐾
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ANATOMY MAP */}
      {activeSubTab === 'anatomy' && (
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* Visual Silhouette with hotspots */}
          <div className="flex flex-col items-center justify-center p-4 bg-sky-50 rounded-3xl border border-sky-100 shadow-inner relative min-h-[350px]">
            <h4 className="text-xs text-sky-700 font-black mb-1 uppercase tracking-wider">Toca las partes del cuerpo</h4>
            
            {/* Body illustration representation in vector SVG */}
            <svg viewBox="0 0 200 350" className="w-full max-w-[220px] drop-shadow-md">
              {/* Silhouette outline */}
              <path
                d="M100,30 C112,30 120,40 120,48 C120,53 116,60 110,64 L110,75 L135,80 C145,82 148,93 145,105 L135,160 C132,170 124,175 120,175 L118,175 L121,240 L130,314 C132,324 122,330 115,330 C108,330 105,324 103,314 L100,270 L97,314 C95,324 92,330 85,330 C78,330 68,324 70,314 L79,240 L82,175 L80,175 C76,175 68,170 65,160 L55,105 C52,93 55,82 65,80 L90,75 L90,64 C84,60 80,53 80,48 C80,40 88,30 100,30 Z"
                fill="#E0F2FE"
                stroke="#38BDF8"
                strokeWidth="4"
              />
              {/* Hotspot Indicators */}
              <circle cx="100" cy="46" r="14" fill={selectedOrgan?.id === 'brain' ? '#F43F5E' : '#38BDF8'} opacity="0.35" className="animate-pulse" />
              <circle cx="100" cy="46" r="6" fill="#0284C7" onClick={() => handleOrganClick(organsList[0])} className="cursor-pointer" />

              <circle cx="95" cy="100" r="12" fill={selectedOrgan?.id === 'heart' ? '#F43F5E' : '#E11D48'} opacity="0.4" />
              <circle cx="95" cy="100" r="5" fill="#BE123C" onClick={() => handleOrganClick(organsList[1])} className="cursor-pointer" />

              <path d="M85,95 C85,90 92,90 92,95 L92,110 C92,115 85,115 85,110 Z M108,95 C108,90 115,90 115,95 L115,110 C115,115 108,115 108,110 Z" fill="#38BDF8" opacity="0.7" />
              <circle cx="108" cy="104" r="6" fill="#0369A1" onClick={() => handleOrganClick(organsList[2])} className="cursor-pointer" />

              <rect x="88" y="125" width="24" height="20" rx="6" fill="#F59E0B" opacity="0.6" />
              <circle cx="100" cy="135" r="5" fill="#D97706" onClick={() => handleOrganClick(organsList[3])} className="cursor-pointer" />

              {/* Knees or general bones */}
              <circle cx="79" cy="240" r="5" fill="#64748B" onClick={() => handleOrganClick(organsList[4])} className="cursor-pointer" />
              <circle cx="121" cy="240" r="5" fill="#64748B" onClick={() => handleOrganClick(organsList[4])} className="cursor-pointer" />
            </svg>

            {/* List to tap directly for simplicity */}
            <div className="flex flex-wrap gap-1.5 justify-center mt-3">
              {organsList.map((org) => (
                <button
                  key={org.id}
                  id={`btn-organ-select-${org.id}`}
                  onClick={() => handleOrganClick(org)}
                  className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                    selectedOrgan?.id === org.id
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-sky-50'
                  }`}
                >
                  {org.name.split(' ')[1] || org.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive display of selected organ description */}
          <div>
            <AnimatePresence mode="wait">
              {selectedOrgan ? (
                <motion.div
                  key={selectedOrgan?.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-emerald-50/50 rounded-3xl p-6 border-2 border-emerald-200 shadow-md relative"
                >
                  <div className="text-4xl absolute -top-5 right-4 bg-emerald-100 border border-emerald-300 w-12 h-12 flex items-center justify-center rounded-2xl shadow-md">
                    {selectedOrgan.emoji}
                  </div>
                  
                  <h3 className="text-2xl font-black text-emerald-800 mb-1">{selectedOrgan.name}</h3>
                  <p className="text-xs text-emerald-600 font-extrabold uppercase mb-4 tracking-wider">Ubicación: {selectedOrgan.location}</p>
                  
                  <div className="bg-white p-4 rounded-2xl mb-4 border border-emerald-150 shadow-sm leading-relaxed">
                    <p className="text-sm text-slate-600 font-medium">
                      {selectedOrgan.function}
                    </p>
                  </div>

                  <div className="bg-yellow-100/70 p-4 rounded-2xl border border-yellow-200 flex gap-2">
                    <span className="text-xl">💡</span>
                    <div>
                      <h4 className="text-xs font-black text-yellow-800 uppercase tracking-wide">Dato Extra Curioso</h4>
                      <p className="text-xs text-yellow-950 font-bold leading-normal mt-0.5">{selectedOrgan.funFact}</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-dashed border-2 border-slate-200 rounded-3xl p-8 text-center text-slate-400">
                  <Smile className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
                  <h4 className="font-extrabold text-slate-600">¡Explora tus Superpoderes!</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">
                    Toca cualquiera de los círculos brillantes en el cuerpo del niño para ver qué hace tu cerebro, corazón, pulmones o huesos por ti cada día.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SAFE MINI-EXPERIMENTS */}
      {activeSubTab === 'experiment' && (
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Interactive lab simulation panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center shadow-inner relative">
            <span className="absolute top-2.5 left-3 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-full px-2.5 py-0.5 tracking-wider flex items-center gap-1">
              <FlaskConical className="w-3 h-3" /> Simulado Virtual
            </span>

            <div className="w-full h-44 flex items-end justify-center relative mb-4 mt-2">
              {/* Scientific Eruption animation inside customized styled SVG */}
              {erupting ? (
                <div className="absolute top-0 left-0 w-full h-[95%] overflow-hidden flex flex-col items-center justify-end">
                  {/* Sparks & bubbles flowing */}
                  <motion.div
                    animate={{ y: [-10, -100], scale: [0.5, 1.4, 0.5], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                    className="absolute text-3xl font-black text-rose-500 bottom-16 select-none"
                  >
                    🫧
                  </motion.div>
                  <motion.div
                    animate={{ y: [-5, -120], x: [-30, -50], scale: [0.8, 1.2, 0.4], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute text-2xl bottom-16 select-none"
                  >
                    💥
                  </motion.div>
                  <motion.div
                    animate={{ y: [-15, -110], x: [30, 60], scale: [0.6, 1.5, 0.6], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                    className="absolute text-lg bottom-16 select-none"
                  >
                    🌋
                  </motion.div>

                  {/* Red/Amber foam eruption crown */}
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], rotate: [-1, 2, -1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 w-28 h-20 rounded-full blur-[2px] opacity-90 shadow-lg bottom-12 absolute z-10"
                  />
                </div>
              ) : null}

              {/* The Volcano artwork */}
              <svg viewBox="0 0 160 120" className="w-[180px] h-[135px] relative z-20">
                {/* Ground */}
                <path d="M10,110 Q80,105 150,110 L150,120 L10,120 Z" fill="#4B5563" />
                {/* Volcano mountain structure */}
                <path d="M45,110 L65,40 L95,40 L115,110 Z" fill="#78350F" stroke="#451A03" strokeWidth="3" />
                {/* Shadow */}
                <path d="M80,40 L115,110 L90,110 L72,40 Z" fill="#451A03" opacity="0.3" />
                {/* Baking soda inside representation */}
                {hasSoda && (
                  <ellipse cx="80" cy="40" rx="10" ry="3" fill="#FFFFFF" />
                )}
                {/* Food coloring inside representation */}
                {hasColor && (
                  <ellipse cx="80" cy="40" rx="8" ry="2.5" fill="#EF4444" />
                )}
              </svg>
            </div>

            {/* Simulated actions buttons */}
            <div className="flex justify-center gap-2 mb-2">
              <button
                id="btn-pour-soda"
                disabled={hasSoda}
                onClick={() => handlePour('soda')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  hasSoda 
                    ? 'bg-slate-200 text-slate-400 border-slate-300' 
                    : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200 hover:scale-105 shadow-sm'
                }`}
              >
                🍚 Agregar Bicarbonato
              </button>

              <button
                id="btn-pour-color"
                disabled={hasColor}
                onClick={() => handlePour('color')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  hasColor 
                    ? 'bg-slate-200 text-slate-400 border-slate-300' 
                    : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200 hover:scale-105 shadow-sm'
                }`}
              >
                🔴 Colorante Rojo
              </button>

              <button
                id="btn-pour-vinegar"
                disabled={erupting}
                onClick={() => handlePour('vinegar')}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  erupting 
                    ? 'bg-amber-400 text-amber-950 border-amber-500' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold hover:scale-105 shadow-sm'
                }`}
              >
                🍾 ¡Echar Vinagre!
              </button>
            </div>

            {erupting && (
              <button
                id="btn-reset-exp"
                onClick={resetExperiment}
                className="mt-2 text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 px-4 py-1.5 rounded-full border border-rose-200"
              >
                Reiniciar Volcán 🔄
              </button>
            )}
          </div>

          {/* Real world recipes safely explanation */}
          <div className="bg-indigo-50/50 rounded-3xl p-6 border-2 border-indigo-150 shadow-md">
            <h3 className="text-xl font-black text-indigo-900 mb-3 flex items-center gap-1">
              <span>🌋 El Volcán Químico Casero</span>
            </h3>
            
            <p className="text-xs text-indigo-800 font-extrabold uppercase mb-2">Pasos para hacerlo en casa con tus padres:</p>

            <ol className="text-xs leading-relaxed text-slate-600 space-y-2.5 list-decimal pl-4 font-medium">
              <li>Coloca un vaso pequeño de plástico vacío sobre un plato hondo o bandeja (para no ensuciar la mesa).</li>
              <li>Modela arcilla o plastilina alrededor del vaso para darle una forma de montaña de volcán.</li>
              <li>Añade <strong>2 cucharadas de bicarbonato de sodio</strong> dentro del vaso.</li>
              <li>Agrega unas gotitas de colorante vegetal rojo y <strong>una cucharita de jabón líquido de lavar platos</strong> (¡para hacer burbujas gigantes!).</li>
              <li>¡Vierte lentamente <strong>medio vaso de vinagre blanco</strong> y da un paso atrás para ver la divertida erupción espumosa!</li>
            </ol>

            <div className="bg-white p-3 rounded-2xl border border-indigo-100 mt-4 flex gap-2">
              <CircleAlert className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] font-black text-indigo-800 uppercase tracking-wide">Recordatorio de seguridad</h4>
                <p className="text-[11px] text-slate-500 font-bold leading-tight mt-0.5">Realiza este y cualquier otro experimento científico siempre bajo la alegre supervisión de tus papás o maestros.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Hint */}
      <div className="flex gap-2 items-start text-xs text-slate-400 mt-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <Sparkles className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
        <p className="leading-snug">
          <strong>¿Sabías qué?</strong> El estudio de las ciencias naturales nos ayuda a descifrar el increíble funcionamiento del planeta Tierra y la asombrosa biología que late dentro de cada uno de nosotros.
        </p>
      </div>
    </div>
  );
};
