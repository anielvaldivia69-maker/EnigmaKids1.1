/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { sounds } from '../utils/sound';
import { Play, RotateCcw, Award, CheckCircle, Zap, Star, Trophy, Sparkles, AlertCircle, Layers, Grid, Brain, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MathGameProps {
  onAddPoints: (points: number) => void;
  onUnlockBadge: (badgeId: string) => void;
  mathLevels: { suma: number; resta: number; multiplicacion: number; division: number };
  onUpdateLevel: (operation: 'suma' | 'resta' | 'multiplicacion' | 'division', newLevel: number) => void;
  studentGrade?: string;
}

type OperationType = 'suma' | 'resta' | 'multiplicacion' | 'division' | 'reto';

interface MathQuestion {
  numA: number;
  numB: number;
  numC?: number;
  operation: OperationType;
  symbol: string;
  correctAnswer: number;
  options: number[];
  storyText?: string;
  displayExpression?: string;
  patternType?: 'serie' | 'descomposicion' | 'estandar';
  mentalStrategy?: string;
}

export const MathGame: React.FC<MathGameProps> = ({
  onAddPoints,
  onUnlockBadge,
  mathLevels,
  onUpdateLevel,
  studentGrade = 'Segundo Grado',
}) => {
  const isFirstGrade = studentGrade === 'Primer Grado';
  const isThirdGrade = studentGrade === 'Tercer Grado';

  const [gradeMode, setGradeMode] = useState<'Segundo Grado' | 'Tercer Grado'>(
    isThirdGrade ? 'Tercer Grado' : 'Segundo Grado'
  );

  useEffect(() => {
    setGradeMode(isThirdGrade ? 'Tercer Grado' : 'Segundo Grado');
  }, [studentGrade]);

  const allowedTabs: OperationType[] = isFirstGrade
    ? ['suma', 'resta']
    : ['suma', 'resta', 'multiplicacion', 'division', 'reto'];

  const [activeTab, setActiveTab] = useState<OperationType>('suma');
  const [question, setQuestion] = useState<MathQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string>('');
  const [visualEmoji, setVisualEmoji] = useState('🍎');
  const [showManipulatives, setShowManipulatives] = useState<boolean>(true);

  // Difficulty titles
  const difficultyNames = ['Principiante (Nivel 1)', 'Cazador de Números (Nivel 2)', 'Maestro Matemático (Nivel 3)', 'Genio Supremo (Nivel 4)'];

  // Helper to calculate place value breakdown (Centenas, Decenas, Unidades)
  const getPlaceValue = (val: number) => {
    const centenas = Math.floor(val / 100);
    const decenas = Math.floor((val % 100) / 10);
    const unidades = val % 10;
    return { centenas, decenas, unidades };
  };

  // Generate question based on activeTab, level and grade mode
  const generateQuestion = (opType: OperationType, level: number) => {
    let numA = 0;
    let numB = 0;
    let correctAnswer = 0;
    let symbol = '+';
    let displayExpression = undefined;
    let storyText = undefined;
    let patternType: 'serie' | 'descomposicion' | 'estandar' = 'estandar';
    let mentalStrategy = undefined;

    if (isFirstGrade) {
      const emojis = ['🍎', '🍓', '🍪', '🎈', '🧸', '🐱', '🐾', '🍉', '🍕', '🚗', '⭐'];
      setVisualEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
    }

    switch (opType) {
      case 'suma':
        symbol = '+';
        if (isFirstGrade) {
          numA = Math.floor(Math.random() * 5) + 1;
          numB = Math.floor(Math.random() * 4) + 1;
        } else if (gradeMode === 'Segundo Grado') {
          // Playful manipulative 2nd grade numbers (focusing on Decenas and Unidades)
          if (level === 1) {
            numA = Math.floor(Math.random() * 20) + 10;
            numB = Math.floor(Math.random() * 15) + 5;
          } else {
            numA = Math.floor(Math.random() * 40) + 20;
            numB = Math.floor(Math.random() * 35) + 15;
          }
        } else {
          // 3rd Grade Mental math decomposition strategy
          numA = Math.floor(Math.random() * 50) + 25;
          numB = Math.floor(Math.random() * 45) + 15;
          const tensA = Math.floor(numA / 10) * 10;
          const tensB = Math.floor(numB / 10) * 10;
          const unitsA = numA % 10;
          const unitsB = numB % 10;
          mentalStrategy = `Cálculo mental: (${tensA} + ${tensB}) + (${unitsA} + ${unitsB}) = ${tensA + tensB} + ${unitsA + unitsB}`;
        }
        correctAnswer = numA + numB;
        break;

      case 'resta':
        symbol = '-';
        if (isFirstGrade) {
          numA = Math.floor(Math.random() * 6) + 3;
          numB = Math.floor(Math.random() * (numA - 2)) + 1;
        } else if (gradeMode === 'Segundo Grado') {
          numA = Math.floor(Math.random() * 35) + 20;
          numB = Math.floor(Math.random() * (numA - 10)) + 5;
        } else {
          // 3rd Grade
          numA = Math.floor(Math.random() * 80) + 40;
          numB = Math.floor(Math.random() * (numA - 15)) + 10;
          const tensA = Math.floor(numA / 10) * 10;
          const tensB = Math.floor(numB / 10) * 10;
          mentalStrategy = `Cálculo mental: Resta primero decenas (${numA} − ${tensB} = ${numA - tensB}) y luego unidades.`;
        }
        correctAnswer = numA - numB;
        break;

      case 'multiplicacion':
        symbol = '×';
        if (gradeMode === 'Segundo Grado') {
          // Intro multiplication via repeated addition
          numA = Math.floor(Math.random() * 4) + 2; // 2 to 5 groups
          numB = Math.floor(Math.random() * 5) + 2; // 2 to 6 per group
          storyText = `Tienes ${numA} grupos de ${numB} elementos cada uno. Es la suma repetida: ${Array(numA).fill(numB).join(' + ')}`;
        } else {
          // 3rd Grade multiplication tables & mental shortcuts
          numA = Math.floor(Math.random() * 8) + 3;
          numB = Math.floor(Math.random() * 9) + 2;
          mentalStrategy = `Estrategia de cálculo mental directo: ${numA} × ${numB}`;
        }
        correctAnswer = numA * numB;
        break;

      case 'division':
        symbol = '÷';
        if (gradeMode === 'Segundo Grado') {
          numB = Math.floor(Math.random() * 3) + 2; // divisor 2 to 4
          correctAnswer = Math.floor(Math.random() * 5) + 1;
          numA = numB * correctAnswer;
          storyText = `Reparto equitativo: Repartir ${numA} objetos entre ${numB} niños en partes iguales.`;
        } else {
          numB = Math.floor(Math.random() * 7) + 2; // divisor 2 to 8
          correctAnswer = Math.floor(Math.random() * 9) + 2;
          numA = numB * correctAnswer;
          mentalStrategy = `Piensa: ¿Qué número multiplicado por ${numB} da ${numA}?`;
        }
        break;

      case 'reto':
        symbol = '🔥';
        if (gradeMode === 'Segundo Grado') {
          // Pattern or simple word challenge for 2nd grade
          patternType = 'serie';
          const step = Math.floor(Math.random() * 3) + 2; // +2, +3, +5
          const start = Math.floor(Math.random() * 10) + 2;
          numA = start;
          numB = step;
          correctAnswer = start + (step * 3);
          displayExpression = `${start}, ${start + step}, ${start + (step * 2)}, ?`;
          storyText = `¡Encuentra el número que sigue en la serie contando de ${step} en ${step}!`;
        } else {
          // Advanced multi-step math problem for 3rd grade
          const boxes = Math.floor(Math.random() * 3) + 3;
          const perBox = Math.floor(Math.random() * 4) + 4;
          const bonus = Math.floor(Math.random() * 5) + 5;
          correctAnswer = (boxes * perBox) + bonus;
          displayExpression = `(${boxes} × ${perBox}) + ${bonus}`;
          storyText = `Un supermercado tiene ${boxes} cajas con ${perBox} manzanas cada una, y ${bonus} manzanas sueltas. ¿Cuántas manzanas hay en total?`;
        }
        break;
    }

    // Generate option choices
    const ops = new Set<number>();
    ops.add(correctAnswer);

    while (ops.size < 4) {
      let offset = Math.floor(Math.random() * 12) + 1;
      if (Math.random() > 0.5) {
        ops.add(correctAnswer + offset);
      } else {
        const potential = correctAnswer - offset;
        if (potential >= 0) {
          ops.add(potential);
        } else {
          ops.add(correctAnswer + offset + 2);
        }
      }
    }

    setQuestion({
      numA,
      numB,
      operation: opType,
      symbol,
      correctAnswer,
      options: Array.from(ops).sort(() => Math.random() - 0.5),
      displayExpression,
      storyText,
      patternType,
      mentalStrategy
    });
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  useEffect(() => {
    const levelVal = activeTab === 'reto' ? 1 : (mathLevels[activeTab] || 1);
    generateQuestion(activeTab, levelVal);
  }, [activeTab, mathLevels, gradeMode]);

  const handleAnswerClick = (ans: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(ans);
    const correct = ans === question?.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      sounds.playCorrect();
      const currentLevel = activeTab === 'reto' ? 1 : (mathLevels[activeTab] || 1);
      const xpPoints = currentLevel * 10 + 5;
      onAddPoints(xpPoints);
      setPointsEarned(xpPoints);
      
      const newStreak = streak + 1;
      setStreak(newStreak);

      if (activeTab !== 'reto' && newStreak > 0 && newStreak % 3 === 0 && currentLevel < 4) {
        sounds.playLevelUp();
        const nextLevel = currentLevel + 1;
        onUpdateLevel(activeTab, nextLevel);
        setCelebrationMessage(`¡Asombroso! Subiste a nivel ${nextLevel} en ${activeTab === 'suma' ? 'Suma' : activeTab === 'resta' ? 'Resta' : activeTab === 'multiplicacion' ? 'Multiplicación' : 'División'}! 🎉`);
        setShowCelebration(true);
        sounds.speak(`¡Excelente trabajo! Has subido de nivel.`);

        if (nextLevel === 2) onUnlockBadge('math_bronze');
        else if (nextLevel === 3) onUnlockBadge('math_silver');
        else if (nextLevel === 4) onUnlockBadge('math_gold');
      } else {
        const praises = [
          '¡Muy bien hecho!',
          '¡Respuesta genial!',
          '¡Excelente razonamiento!',
          '¡Gran trabajo matemático!'
        ];
        sounds.speak(praises[Math.floor(Math.random() * praises.length)]);
      }

    } else {
      sounds.playIncorrect();
      setStreak(0);
      sounds.speak(`Respuesta incorrecta. ¡Analiza los bloques y vuelve a intentarlo!`);
    }
  };

  const handleNextQuestion = () => {
    const levelVal = activeTab === 'reto' ? 1 : (mathLevels[activeTab] || 1);
    generateQuestion(activeTab, levelVal);
  };

  const currentLevel = activeTab === 'reto' ? 1 : (mathLevels[activeTab] || 1);

  // --- RENDER VIRTUAL BASE-10 MANIPULATIVES (BLOQUES MULTIBASE) ---
  const renderBase10Manipulatives = (val: number, label: string, colorScheme: string) => {
    const { centenas, decenas, unidades } = getPlaceValue(val);

    return (
      <div className={`p-3 bg-white/90 rounded-2xl border-2 ${colorScheme} shadow-xs text-center`}>
        <span className="text-[11px] font-black uppercase text-slate-600 block mb-2">
          {label}: <strong className="text-slate-900 text-sm">{val}</strong>
        </span>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Centenas (Placas de 100) */}
          {centenas > 0 && (
            <div className="flex flex-col items-center">
              <div className="flex gap-1">
                {Array.from({ length: centenas }).map((_, i) => (
                  <div key={`c-${i}`} className="w-10 h-10 bg-emerald-400 border-2 border-emerald-600 rounded-md flex items-center justify-center text-[10px] font-black text-emerald-950 shadow-xs">
                    100
                  </div>
                ))}
              </div>
              <span className="text-[9px] font-bold text-emerald-700 mt-0.5">{centenas} C</span>
            </div>
          )}

          {/* Decenas (Barras de 10) */}
          {decenas > 0 && (
            <div className="flex flex-col items-center">
              <div className="flex gap-1">
                {Array.from({ length: decenas }).map((_, i) => (
                  <div key={`d-${i}`} className="w-3.5 h-10 bg-sky-400 border-2 border-sky-600 rounded-xs flex flex-col justify-between py-0.5 items-center text-[8px] font-extrabold text-sky-950 shadow-xs">
                    <span>10</span>
                  </div>
                ))}
              </div>
              <span className="text-[9px] font-bold text-sky-700 mt-0.5">{decenas} D</span>
            </div>
          )}

          {/* Unidades (Cubos de 1) */}
          {unidades > 0 && (
            <div className="flex flex-col items-center">
              <div className="flex flex-wrap max-w-[80px] justify-center gap-1">
                {Array.from({ length: unidades }).map((_, i) => (
                  <div key={`u-${i}`} className="w-3.5 h-3.5 bg-amber-400 border border-amber-600 rounded-xs shadow-xs text-[7px] font-black flex items-center justify-center text-amber-950">
                    1
                  </div>
                ))}
              </div>
              <span className="text-[9px] font-bold text-amber-700 mt-0.5">{unidades} U</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Visual Aid depending on Grade and Mode
  const renderVisualAid = () => {
    if (!question) return null;

    // Segundo Grado: Base-10 Blocks & Repeated Addition Groups
    if (gradeMode === 'Segundo Grado' && showManipulatives) {
      if (question.operation === 'suma') {
        return (
          <div className="mt-5 p-4 bg-amber-50 rounded-2xl border-2 border-amber-200 max-w-xl mx-auto text-center shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-amber-800 font-black uppercase flex items-center gap-1">
                <Layers className="w-4 h-4 text-amber-600" /> Bloques Multibase Virtuales (2° Grado)
              </span>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                Decenas (10) y Unidades (1)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-2">
              {renderBase10Manipulatives(question.numA, 'Primer Número', 'border-sky-300')}
              <span className="text-2xl font-black text-amber-600">+</span>
              {renderBase10Manipulatives(question.numB, 'Segundo Número', 'border-emerald-300')}
            </div>
          </div>
        );
      } else if (question.operation === 'multiplicacion') {
        return (
          <div className="mt-5 p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-200 max-w-xl mx-auto text-center shadow-xs">
            <span className="text-xs text-indigo-800 font-black uppercase block mb-3">
              🍭 Inicio de Multiplicación: {question.numA} Grupos de {question.numB} Elementos
            </span>

            <div className="flex flex-wrap justify-center gap-3">
              {Array.from({ length: question.numA }).map((_, gIdx) => (
                <div key={gIdx} className="bg-white border-2 border-indigo-300 p-2.5 rounded-2xl shadow-xs text-center">
                  <span className="text-[10px] font-bold text-indigo-600 block mb-1">Grupo {gIdx + 1}</span>
                  <div className="flex gap-1 justify-center">
                    {Array.from({ length: question.numB }).map((_, itemIdx) => (
                      <span key={itemIdx} className="text-lg">⭐</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-indigo-700 font-bold mt-3">
              Suma Repetida: {Array(question.numA).fill(question.numB).join(' + ')} = ?
            </p>
          </div>
        );
      }
    }

    // Tercer Grado: Abstract Mental Calculation Strategies & Logic Patterns
    if (gradeMode === 'Tercer Grado') {
      if (question.mentalStrategy) {
        return (
          <div className="mt-5 p-4 bg-purple-50 rounded-2xl border-2 border-purple-200 max-w-xl mx-auto text-center shadow-xs">
            <div className="flex items-center gap-2 justify-center text-purple-900 font-black text-xs uppercase mb-1">
              <Brain className="w-4 h-4 text-purple-600" /> Estrategia de Cálculo Mental (3° Grado)
            </div>
            <p className="text-xs md:text-sm font-bold text-purple-950 bg-white p-3 rounded-xl border border-purple-200 shadow-inner">
              {question.mentalStrategy}
            </p>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-4 border-yellow-300 p-6 md:p-8 max-w-3xl mx-auto overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-6 -mt-6 text-yellow-300/20 w-32 h-32 pointer-events-none">
        <Sparkles className="w-full h-full" />
      </div>

      {/* Grade Selector & Methodology Indicator */}
      <div className="flex flex-wrap justify-between items-center bg-gradient-to-r from-amber-400 to-yellow-500 text-yellow-950 rounded-2xl p-4 mb-6 shadow-md border-b-4 border-amber-600">
        <div className="flex items-center gap-2">
          <Trophy className="w-7 h-7 text-yellow-950" />
          <div>
            <h3 className="text-base font-black uppercase">
              Enfoque Lúdico y Razonamiento Matemático 🧮
            </h3>
            <p className="text-xs text-yellow-900 font-medium">
              {gradeMode === 'Segundo Grado' ? 'Bloques Multibase & Manipulativos Digitales' : 'Cálculo Mental & Pensamiento Lógico'}
            </p>
          </div>
        </div>

        {/* Grade Toggle Button */}
        <div className="flex items-center gap-1 bg-yellow-950/10 p-1.5 rounded-xl border border-yellow-950/20">
          <button
            onClick={() => {
              sounds.playClick();
              setGradeMode('Segundo Grado');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              gradeMode === 'Segundo Grado'
                ? 'bg-white text-amber-950 shadow-sm'
                : 'text-amber-950 hover:bg-white/20'
            }`}
          >
            2° Grado (Lúdico)
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setGradeMode('Tercer Grado');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              gradeMode === 'Tercer Grado'
                ? 'bg-white text-amber-950 shadow-sm'
                : 'text-amber-950 hover:bg-white/20'
            }`}
          >
            3° Grado (Mental)
          </button>
        </div>
      </div>

      {/* Operation Tabs Navigation */}
      <div className="flex flex-wrap md:grid md:grid-cols-5 gap-2 justify-center mb-6">
        {allowedTabs.map((op) => {
          const isActive = activeTab === op;
          const displayLabel = op === 'suma' ? 'Suma +' : op === 'resta' ? 'Resta −' : op === 'multiplicacion' ? 'Multi x' : op === 'division' ? 'Divi ÷' : '🔥 Retos';
          
          return (
            <button
              key={op}
              onClick={() => {
                sounds.playClick();
                setActiveTab(op);
                setStreak(0);
              }}
              className={`py-3 px-3 text-xs md:text-sm font-black rounded-2xl border-b-4 transition-all shadow-sm cursor-pointer ${
                isActive
                  ? 'bg-amber-400 border-amber-600 text-amber-950 scale-105'
                  : 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
              }`}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>

      {/* Stats Header */}
      <div className="flex flex-wrap justify-between items-center bg-amber-50 rounded-2xl p-4 mb-6 border-2 border-dashed border-amber-300 gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500 animate-bounce" />
          <div>
            <p className="text-xs text-amber-600 font-black uppercase">Tu Racha de Respuestas</p>
            <div className="flex items-center gap-1">
              <span className="text-xl font-black text-amber-700">{streak}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < (streak % 3 || (streak > 0 && streak % 3 === 0 ? 3 : 0))
                        ? 'text-yellow-400 fill-yellow-400 animate-pulse'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 font-extrabold">
            Modo Activo: {gradeMode}
          </p>
          <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-black rounded-full shadow-inner mt-1">
            {activeTab === 'reto' ? '🔥 Retos Lógicos' : difficultyNames[currentLevel - 1]}
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-slate-50 rounded-3xl border-2 border-slate-200 p-6 md:p-8 text-center mb-6 relative shadow-inner">
        {question && (
          <div>
            {question.displayExpression ? (
              <div className="flex flex-col items-center gap-3">
                {question.storyText && (
                  <p className="text-sm md:text-base text-indigo-950 font-black max-w-xl mx-auto leading-relaxed mb-3 bg-yellow-50 border-2 border-yellow-200 px-4 py-3 rounded-2xl shadow-xs">
                    {question.storyText}
                  </p>
                )}
                <div className="flex flex-wrap justify-center items-center gap-4 text-3xl md:text-5xl font-black text-slate-800">
                  <span className="text-indigo-700 bg-indigo-50 px-5 py-2.5 rounded-2xl border-2 border-indigo-200 shadow-xs">
                    {question.displayExpression}
                  </span>
                  <span className="text-slate-400 font-normal">=</span>
                  <span className="w-24 bg-white border-4 border-dashed border-slate-300 rounded-2xl min-h-16 flex items-center justify-center text-amber-500 font-black shadow-inner">
                    {selectedAnswer !== null ? selectedAnswer : '?'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center gap-4 md:gap-8 text-4xl md:text-6xl font-extrabold text-slate-800">
                <span className="w-20 text-right">{question.numA}</span>
                <span className="text-amber-500 font-black">{question.symbol}</span>
                <span className="w-20 text-left">{question.numB}</span>
                <span className="text-slate-400 font-normal">=</span>
                <span className="w-20 bg-white border-4 border-dashed border-slate-300 rounded-2xl min-h-16 flex items-center justify-center text-amber-500 font-black shadow-xs">
                  {selectedAnswer !== null ? selectedAnswer : '?'}
                </span>
              </div>
            )}

            {/* Visual Manipulatives / Mental Math Strategy Display */}
            {renderVisualAid()}

            {/* Answer Feedbacks */}
            <div className="h-10 mt-4 flex justify-center items-center">
              {isCorrect === true && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 text-emerald-600 font-black text-base bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200"
                >
                  <CheckCircle className="w-5 h-5 fill-emerald-600 text-white" />
                  <span>¡Excelente! +{pointsEarned} PUNTOS XP</span>
                </motion.div>
              )}
              {isCorrect === false && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 text-rose-600 font-black text-base bg-rose-50 px-4 py-1.5 rounded-full border border-rose-200"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>¡Uy! Revisa la operación e intenta de nuevo...</span>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {question?.options.map((opt, i) => {
          const isSelected = selectedAnswer === opt;
          const isThisCorrect = opt === question.correctAnswer;

          let btnClass = 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50';
          if (selectedAnswer !== null) {
            if (isThisCorrect) {
              btnClass = 'bg-emerald-500 border-emerald-600 text-white shadow-lg';
            } else if (isSelected) {
              btnClass = 'bg-rose-500 border-rose-600 text-white';
            } else {
              btnClass = 'bg-slate-100 border-slate-200 text-slate-300 opacity-50';
            }
          }

          return (
            <button
              key={i}
              disabled={selectedAnswer !== null}
              onClick={() => handleAnswerClick(opt)}
              className={`py-4 px-6 text-2xl md:text-3xl font-extrabold rounded-2xl border-b-4 shadow-md transition-all cursor-pointer ${btnClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Next Question Control */}
      {selectedAnswer !== null && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <button
            onClick={handleNextQuestion}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-lg px-10 py-3.5 rounded-2xl border-b-4 border-amber-700 shadow-lg justify-center active:scale-95 transition-all cursor-pointer"
          >
            <span>Siguiente Ejercicio</span>
            <Play className="w-5 h-5 fill-white" />
          </button>
        </motion.div>
      )}

      {/* Footer advice */}
      <div className="flex gap-2 items-start text-xs text-slate-400 mt-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="leading-snug font-semibold">
          {gradeMode === 'Segundo Grado' ? (
            <span><strong>Método Lúdico 2° Grado:</strong> Utiliza los bloques multibase (Centenas, Decenas y Unidades) para representar las cantidades y facilitar la comprensión visual.</span>
          ) : (
            <span><strong>Método Lúdico 3° Grado:</strong> Aplica estrategias de cálculo mental, descomposición aditiva y razonamiento para resolver operaciones con fluidez.</span>
          )}
        </p>
      </div>
    </div>
  );
};
