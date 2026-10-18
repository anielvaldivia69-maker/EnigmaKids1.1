/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { sounds } from '../utils/sound';
import { Volume2, HelpCircle, Check, ArrowRight, RotateCcw, Award, Lightbulb, Star, BookOpen, PenTool, CheckCircle, XCircle, Mic, MicOff, Music, Layers, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LanguageGameProps {
  onAddPoints: (points: number) => void;
  onUnlockBadge: (badgeId: string) => void;
  studentGrade?: string;
}

interface PhonicsChallenge {
  soundName: string;
  phonema: string;
  clue: string;
  sampleWord: string;
  options: string[];
  correctLetter: string;
}

interface SyllableChallenge {
  type: 'combinar' | 'separar';
  prompt: string;
  wordOrLetters: string;
  correctAnswer: string | string[];
  options: string[];
  syllableCount?: number;
}

interface LetterScrambleChallenge {
  word: string;
  category: string;
  clue: string;
}

interface WordMatchingChallenge {
  word: string;
  relation: 'sinonimo' | 'antonimo' | 'ortografia' | 'puntuacion';
  clue: string;
  options: string[];
  correct: string;
}

interface SentenceScrambleChallenge {
  sentence: string;
  clue: string;
}

interface RedactChallenge {
  topic: string;
  prompt: string;
  requiredWord: string;
  helper: string;
}

export const LanguageGame: React.FC<LanguageGameProps> = ({ onAddPoints, onUnlockBadge, studentGrade = 'Segundo Grado' }) => {
  const isThirdGrade = studentGrade === 'Tercer Grado';
  const [gradeMode, setGradeMode] = useState<'Segundo Grado' | 'Tercer Grado'>(
    isThirdGrade ? 'Tercer Grado' : 'Segundo Grado'
  );

  useEffect(() => {
    setGradeMode(isThirdGrade ? 'Tercer Grado' : 'Segundo Grado');
  }, [studentGrade]);

  const [activeSubMode, setActiveSubMode] = useState<'fas_phonics' | 'fas_syllables' | 'letters' | 'matching' | 'sentences' | 'redact' | 'read'>('fas_phonics');

  // Game 1: Phonics (FAS Fase 1 - Sonidos y Fonemas)
  const [phonicsIndex, setPhonicsIndex] = useState<number>(0);
  const [selectedPhonicsOption, setSelectedPhonicsOption] = useState<string | null>(null);
  const [isPhonicsCorrect, setIsPhonicsCorrect] = useState<boolean | null>(null);

  // Game 2: Syllables (FAS Fase 2 - Sílabas y Separación)
  const [syllableIndex, setSyllableIndex] = useState<number>(0);
  const [selectedSyllableOption, setSelectedSyllableOption] = useState<string | null>(null);
  const [isSyllableCorrect, setIsSyllableCorrect] = useState<boolean | null>(null);

  // Game 3: Letter scramble (FAS Fase 3 - Construcción de Palabras)
  const [scrambleIndex, setScrambleIndex] = useState<number>(0);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{ id: string; letter: string }[]>([]);
  const [isScrambleCorrect, setIsScrambleCorrect] = useState<boolean | null>(null);

  // Game 4: Matching (Vocabulario, Ortografía y Signos)
  const [matchingIndex, setMatchingIndex] = useState<number>(0);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [isMatchCorrect, setIsMatchCorrect] = useState<boolean | null>(null);

  // Game 5: Sentence scramble (FAS Fase 4 - Oraciones)
  const [sentenceIndex, setSentenceIndex] = useState<number>(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<{ id: string; word: string }[]>([]);
  const [isSentenceCorrect, setIsSentenceCorrect] = useState<boolean | null>(null);

  // Game 6: Redaction (Producción de textos)
  const [redactIndex, setRedactIndex] = useState<number>(0);
  const [redactInput, setRedactInput] = useState<string>('');
  const [isRedactEvaluated, setIsRedactEvaluated] = useState<boolean>(false);
  const [redactFeedback, setRedactFeedback] = useState<{
    capitalized: boolean;
    hasPunctuation: boolean;
    minLength: boolean;
    containsWord: boolean;
    isPerfect: boolean;
  }>({
    capitalized: false,
    hasPunctuation: false,
    minLength: false,
    containsWord: false,
    isPerfect: false
  });

  // Game 7: Reading practice (Fluidez y Comprensión)
  const [readIndex, setReadIndex] = useState<number>(0);
  const [isReadingRecord, setIsReadingRecord] = useState<boolean>(false);
  const [spokenResult, setSpokenResult] = useState<string>('');
  const [evaluatedResult, setEvaluatedResult] = useState<{
    word: string;
    isCorrect: boolean;
    cleanWord: string;
  }[]>([]);
  const [hasEvaluatedRead, setHasEvaluatedRead] = useState<boolean>(false);
  const [readingScore, setReadingScore] = useState<number>(0);
  const [micActiveReadSupported, setMicActiveReadSupported] = useState<boolean>(true);
  const [selectedReadingQuestionAnswer, setSelectedReadingQuestionAnswer] = useState<string | null>(null);

  const readRecognitionRef = React.useRef<any>(null);

  // --- CONTENT BANKS FOR FAS METHOD (FÓNICO, ANALÍTICO Y SINTÉTICO) ---

  // 1. Phonics Bank (Sonido -> Letra)
  const phonicsQuestions: PhonicsChallenge[] = [
    {
      soundName: 'M /m-m-m/',
      phonema: '/m/',
      clue: 'Escucha el zumbido suave: /mmm/. ¿Con qué letra empieza la palabra "MAMÁ" o "MANZANA"?',
      sampleWord: 'Manzana 🍎',
      options: ['M', 'P', 'S', 'L'],
      correctLetter: 'M'
    },
    {
      soundName: 'S /s-s-s/',
      phonema: '/s/',
      clue: 'Escucha el silbido de la serpiente: /ssss/. ¿Qué letra suena al inicio de "SOL" o "SAPO"?',
      sampleWord: 'Sol ☀️',
      options: ['T', 'S', 'R', 'M'],
      correctLetter: 'S'
    },
    {
      soundName: 'P /p-p-p/',
      phonema: '/p/',
      clue: 'Escucha el golpe suave de los labios: /p-p/. ¿Con qué letra inicia la palabra "PELOTA"?',
      sampleWord: 'Pelota ⚽',
      options: ['B', 'D', 'P', 'T'],
      correctLetter: 'P'
    },
    {
      soundName: 'L /l-l-l/',
      phonema: '/l/',
      clue: 'Pon la lengua en el paladar: /llll/. ¿Qué letra marca el inicio de "LUNA" y "LIBRO"?',
      sampleWord: 'Luna 🌙',
      options: ['L', 'F', 'M', 'N'],
      correctLetter: 'L'
    },
    {
      soundName: 'T /t-t-t/',
      phonema: '/t/',
      clue: 'Escucha el chasquido del reloj: /t-t-t/. ¿Con qué letra se escribe "TIGRE" y "TOMATE"?',
      sampleWord: 'Tigre 🐯',
      options: ['D', 'T', 'P', 'C'],
      correctLetter: 'T'
    },
    {
      soundName: 'R /r-r-r/',
      phonema: '/r/',
      clue: 'Escucha el motor rugiente: /rrrr/. ¿Qué letra suena fuerte en "RANA" y "RUEDA"?',
      sampleWord: 'Rana 🐸',
      options: ['R', 'L', 'S', 'Z'],
      correctLetter: 'R'
    }
  ];

  // 2. Syllables Bank (Consonante + Vocal & Separación Silábica)
  const syllableQuestions: SyllableChallenge[] = [
    {
      type: 'combinar',
      prompt: 'Juntamos el sonido /m/ con la vocal /a/: M + A',
      wordOrLetters: 'M + A',
      correctAnswer: 'MA',
      options: ['MA', 'ME', 'MI', 'MO']
    },
    {
      type: 'combinar',
      prompt: 'Juntamos el sonido /p/ con la vocal /e/: P + E',
      wordOrLetters: 'P + E',
      correctAnswer: 'PE',
      options: ['PA', 'PE', 'PI', 'PU']
    },
    {
      type: 'separar',
      prompt: '¿En cuántas sílabas se divide la palabra "PELOTA"?',
      wordOrLetters: 'PE - LO - TA',
      correctAnswer: '3 sílabas (PE-LO-TA)',
      options: ['2 sílabas', '3 sílabas (PE-LO-TA)', '4 sílabas', '1 sílaba'],
      syllableCount: 3
    },
    {
      type: 'separar',
      prompt: '¿Cómo se separa en sílabas la palabra "MARIPOSA"?',
      wordOrLetters: 'MARIPOSA',
      correctAnswer: 'MA - RI - PO - SA',
      options: ['MAR - IPO - SA', 'MA - RI - PO - SA', 'MARI - POSA', 'M - A - R - I'],
      syllableCount: 4
    },
    {
      type: 'separar',
      prompt: '¿Cómo se separa en sílabas la palabra "ESTRELLA"?',
      wordOrLetters: 'ESTRELLA',
      correctAnswer: 'ES - TRE - LLA',
      options: ['ES - TRE - LLA', 'EST - REL - LA', 'E - STRE - LLA', 'ES - TREL - LA'],
      syllableCount: 3
    }
  ];

  // 3. Letter Scramble Questions (Construcción de Palabras)
  const scrambleQuestions: LetterScrambleChallenge[] = gradeMode === 'Segundo Grado' ? [
    { word: 'SOL', category: 'Naturaleza ☀️', clue: 'Estrella brillante que nos da luz y calor durante el día.' },
    { word: 'LUNA', category: 'Espacio 🌙', clue: 'Nos acompaña en el cielo nocturno y brilla plateada.' },
    { word: 'LIBRO', category: 'Escuela 📖', clue: 'Tiene páginas llenas de cuentos, letras y conocimiento.' },
    { word: 'SOPA', category: 'Comida 🍲', clue: 'Alimento calientito que tomamos con cuchara.' },
    { word: 'PELOTA', category: 'Juegos ⚽', clue: 'Objeto redondo con el que jugamos al fútbol o al baloncesto.' }
  ] : [
    { word: 'POESIA', category: 'Literatura 📜', clue: 'Texto hermoso compuesto en versos que expresan emociones.' },
    { word: 'FABULA', category: 'Literatura 🦊', clue: 'Relato corto donde los animales hablan y nos dejan una moraleja.' },
    { word: 'ORTOGRAFIA', category: 'Gramática ✍️', clue: 'Escribir las palabras correctamente con sus letras y tildes adecuadas.' },
    { word: 'DICCIONARIO', category: 'Objetos 📚', clue: 'Libro especial donde encontramos el significado exacto de cada palabra.' },
    { word: 'PARRAFO', category: 'Gramática 📝', clue: 'Conjunto de oraciones organizadas que expresan una idea principal.' }
  ];

  // 4. Vocabulary, Spelling and Punctuation Questions
  const matchingQuestions: WordMatchingChallenge[] = gradeMode === 'Segundo Grado' ? [
    {
      word: 'GIGANTE',
      relation: 'sinonimo',
      clue: '¿Cuál palabra significa exactamente lo mismo que gigante?',
      options: ['Enorme', 'Diminuto', 'Pequeño', 'Lento'],
      correct: 'Enorme'
    },
    {
      word: 'ALEGRE',
      relation: 'antonimo',
      clue: '¿Qué palabra significa lo contrario de sentirse alegre?',
      options: ['Feliz', 'Triste', 'Sonriente', 'Rápido'],
      correct: 'Triste'
    },
    {
      word: 'SIGNOS DE PUNTUACIÓN',
      relation: 'puntuacion',
      clue: '¿Qué signo debemos colocar siempre al finalizar una oración?',
      options: ['Punto final (.)', 'Coma (,)', 'Guión (-)', 'Signo de interrogación (¿)'],
      correct: 'Punto final (.)'
    },
    {
      word: 'MAYÚSCULA',
      relation: 'ortografia',
      clue: '¿Con qué tipo de letra se debe iniciar una oración o un nombre propio?',
      options: ['Letra Inicial Mayúscula', 'Letra minúscula', 'Letra cursiva pequeña', 'Número'],
      correct: 'Letra Inicial Mayúscula'
    }
  ] : [
    {
      word: 'REGLA ORTOGRÁFICA: MB y MP',
      relation: 'ortografia',
      clue: 'Antes de las letras B y P, ¿qué letra debemos escribir siempre?',
      options: ['La letra M (ej. campo, tambor)', 'La letra N', 'La letra S', 'La letra C'],
      correct: 'La letra M (ej. campo, tambor)'
    },
    {
      word: 'VALIENTE',
      relation: 'antonimo',
      clue: '¿Qué palabra expresa lo opuesto de valiente en un cuento?',
      options: ['Heroico', 'Temeroso', 'Fuerte', 'Decidido'],
      correct: 'Temeroso'
    },
    {
      word: 'COMENZAR',
      relation: 'sinonimo',
      clue: '¿Qué verbo tiene el mismo significado que comenzar?',
      options: ['Iniciar', 'Terminar', 'Pausar', 'Concluir'],
      correct: 'Iniciar'
    },
    {
      word: 'SIGNOS DE INTERROGACIÓN',
      relation: 'puntuacion',
      clue: '¿Qué signos se utilizan para realizar una pregunta en español?',
      options: ['¿?', '¡!', '()', '""'],
      correct: '¿?'
    }
  ];

  // 5. Sentence Scramble Questions
  const sentenceQuestions: SentenceScrambleChallenge[] = gradeMode === 'Segundo Grado' ? [
    { sentence: 'El sol brilla en el cielo', clue: 'Pista: Describe un día muy radiante y luminoso.' },
    { sentence: 'El perro corre feliz en el parque', clue: 'Pista: Un perrito haciendo ejercicio al aire libre.' },
    { sentence: 'La mariposa vuela sobre las bellas flores', clue: 'Pista: Insecto de colores lindos revoloteando en el jardín.' }
  ] : [
    { sentence: 'Los estudiantes leen cuentos en la biblioteca escolar', clue: 'Pista: El hábito hermoso de la lectura compartida en la escuela.' },
    { sentence: 'Toda oración inicia con mayúscula y termina con punto', clue: 'Pista: Una regla de oro para la redacción perfecta.' },
    { sentence: 'La fábula del zorro nos enseña una importante moraleja', clue: 'Pista: La literatura nos ayuda a reflexionar sobre valores.' }
  ];

  // 6. Redaction Questions
  const redactQuestions: RedactChallenge[] = gradeMode === 'Segundo Grado' ? [
    {
      topic: '🐾 Las Mascotas',
      prompt: 'Escribe una oración alegre sobre lo que hace tu mascota favorita.',
      requiredWord: 'gato',
      helper: 'Pista: Usa la palabra "gato" o "perro". Recuerda iniciar con MAYÚSCULA y poner PUNTO FINAL.'
    },
    {
      topic: '☀️ El Sol y la Naturaleza',
      prompt: 'Redacta una oración que describa un día de sol en el campo o la playa.',
      requiredWord: 'sol',
      helper: 'Pista: Incluye la palabra "sol", pon mayúscula inicial y termina con un punto.'
    }
  ] : [
    {
      topic: '📚 La Importancia de Leer',
      prompt: 'Redacta un párrafo corto explicando por qué te gusta leer libros en la escuela.',
      requiredWord: 'libro',
      helper: 'Pista: Incluye la palabra "libro". Usa mayúscula al iniciar, incluye al menos 5 palabras y termina con un punto final.'
    },
    {
      topic: '🌳 Cuidado del Medio Ambiente',
      prompt: 'Escribe una oración explicativa sobre la importancia de sembrar y regar los árboles.',
      requiredWord: 'árbol',
      helper: 'Pista: Emplea la palabra "árbol", mantén buena ortografía y signos de puntuación.'
    }
  ];

  // 7. Reading Questions with Comprehension Question
  const readingQuestions = [
    {
      id: 1,
      text: "El sol brilla sobre las flores amarillas del jardín.",
      category: "Naturaleza 🌸",
      clue: "Una linda oración sobre el sol y las flores coloridas.",
      question: "¿De qué color son las flores del jardín?",
      options: ["Amarillas", "Azules", "Rojas", "Negras"],
      correct: "Amarillas",
      mainIdea: "El sol ilumina la belleza del jardín florido."
    },
    {
      id: 2,
      text: "El búho sabio lee un gran libro por la noche.",
      category: "Lectura 🦉",
      clue: "Un búho inteligente leyendo bajo las estrellas.",
      question: "¿Cuándo lee el búho sabio su libro?",
      options: ["Por la noche", "Por la mañana", "Al mediodía", "Nunca"],
      correct: "Por la noche",
      mainIdea: "La sabiduría y el amor por los libros en todo momento."
    },
    {
      id: 3,
      text: "Toda oración debe iniciar con mayúscula y terminar con punto.",
      category: "Gramática y FAS ✍️",
      clue: "Una norma fundamental para la escritura correcta.",
      question: "¿Con qué debe finalizar toda oración bien escrita?",
      options: ["Con un punto (.)", "Con un número", "Con una coma", "Sin nada"],
      correct: "Con un punto (.)",
      mainIdea: "Las reglas gramaticales nos permiten comunicarnos con claridad."
    }
  ];

  // --- INITIALIZERS ---
  const startPhonics = (index: number) => {
    if (index >= phonicsQuestions.length) {
      onUnlockBadge('phonics_master');
      sounds.playLevelUp();
      sounds.speak('¡Excelente! Has completado la Fase 1 del Método FAS. Dominas la relación sonido-letra.');
      setPhonicsIndex(0);
      index = 0;
    }
    setSelectedPhonicsOption(null);
    setIsPhonicsCorrect(null);
  };

  const startSyllables = (index: number) => {
    if (index >= syllableQuestions.length) {
      sounds.playLevelUp();
      sounds.speak('¡Magnífico! Has dominado la formación y separación de sílabas.');
      setSyllableIndex(0);
      index = 0;
    }
    setSelectedSyllableOption(null);
    setIsSyllableCorrect(null);
  };

  const startScramble = (index: number) => {
    if (index >= scrambleQuestions.length) {
      onUnlockBadge('language_scramble_champion');
      sounds.playLevelUp();
      sounds.speak('¡Asombroso! Ordenaste todas las sílabas y letras para construir palabras perfectas.');
      setScrambleIndex(0);
      index = 0;
    }
    const current = scrambleQuestions[index];
    const lettersArr = current.word.split('').map((l, i) => ({
      id: `${l}-${i}-${Date.now()}`,
      letter: l
    }));
    const shuffled = [...lettersArr].sort(() => Math.random() - 0.5);
    setAvailableLetters(shuffled);
    setSelectedLetters([]);
    setIsScrambleCorrect(null);
  };

  const startMatching = (index: number) => {
    if (index >= matchingQuestions.length) {
      onUnlockBadge('vocabulary_wizard');
      sounds.playLevelUp();
      sounds.speak('¡Fabuloso! Dominas el vocabulario, ortografía y signos de puntuación.');
      setMatchingIndex(0);
      index = 0;
    }
    setSelectedMatch(null);
    setIsMatchCorrect(null);
  };

  const startSentence = (index: number) => {
    if (index >= sentenceQuestions.length) {
      sounds.playLevelUp();
      sounds.speak('¡Maravilloso! Alineaste perfectamente la sintaxis y construcción de oraciones.');
      setSentenceIndex(0);
      index = 0;
    }
    const current = sentenceQuestions[index];
    const wordsArr = current.sentence.split(' ').map((w, idx) => ({
      id: `${w}-${idx}-${Date.now()}`,
      word: w
    }));
    const shuffled = [...wordsArr].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setSelectedWords([]);
    setIsSentenceCorrect(null);
  };

  const startRedact = (index: number) => {
    if (index >= redactQuestions.length) {
      sounds.playLevelUp();
      sounds.speak('¡Genial! Has completado los retos de composición y escritura.');
      setRedactIndex(0);
      index = 0;
    }
    setRedactInput('');
    setIsRedactEvaluated(false);
  };

  const startReadingIndex = (index: number) => {
    if (index >= readingQuestions.length) {
      sounds.playLevelUp();
      sounds.speak('¡Enhorabuena! Has leído e identificado la idea principal de todas las lecturas.');
      setReadIndex(0);
      index = 0;
    }
    setSpokenResult('');
    setEvaluatedResult([]);
    setHasEvaluatedRead(false);
    setReadingScore(0);
    setIsReadingRecord(false);
    setSelectedReadingQuestionAnswer(null);
  };

  useEffect(() => {
    if (activeSubMode === 'fas_phonics') {
      startPhonics(phonicsIndex);
    } else if (activeSubMode === 'fas_syllables') {
      startSyllables(syllableIndex);
    } else if (activeSubMode === 'letters') {
      startScramble(scrambleIndex);
    } else if (activeSubMode === 'matching') {
      startMatching(matchingIndex);
    } else if (activeSubMode === 'sentences') {
      startSentence(sentenceIndex);
    } else if (activeSubMode === 'redact') {
      startRedact(redactIndex);
    } else if (activeSubMode === 'read') {
      startReadingIndex(readIndex);
    }
  }, [activeSubMode, phonicsIndex, syllableIndex, scrambleIndex, matchingIndex, sentenceIndex, redactIndex, readIndex, gradeMode]);

  // Audio helper to pronounce phonema clearly
  const speakPhonemaSound = () => {
    if (activeSubMode === 'fas_phonics' && phonicsQuestions[phonicsIndex]) {
      const cur = phonicsQuestions[phonicsIndex];
      sounds.speak(`Fonema ${cur.phonema}. ${cur.clue}`);
    } else if (activeSubMode === 'fas_syllables' && syllableQuestions[syllableIndex]) {
      const cur = syllableQuestions[syllableIndex];
      sounds.speak(`${cur.prompt}`);
    } else if (activeSubMode === 'letters' && scrambleQuestions[scrambleIndex]) {
      const cur = scrambleQuestions[scrambleIndex];
      sounds.speak(`Palabra de la categoría ${cur.category}. Pista: ${cur.clue}`);
    } else if (activeSubMode === 'read' && readingQuestions[readIndex]) {
      sounds.speak(`Lectura: ${readingQuestions[readIndex].text}`);
    }
  };

  // --- HANDLERS FOR PHONICS ---
  const handlePhonicsSelect = (opt: string) => {
    if (selectedPhonicsOption !== null) return;
    setSelectedPhonicsOption(opt);
    const current = phonicsQuestions[phonicsIndex];
    const correct = opt === current.correctLetter;
    setIsPhonicsCorrect(correct);

    if (correct) {
      sounds.playCorrect();
      onAddPoints(15);
      sounds.speak(`¡Excelente! El sonido ${current.phonema} corresponde a la letra ${opt}.`);
    } else {
      sounds.playIncorrect();
      sounds.speak(`La respuesta correcta es la letra ${current.correctLetter}. Escucha con atención el sonido.`);
    }
  };

  // --- HANDLERS FOR SYLLABLES ---
  const handleSyllableSelect = (opt: string) => {
    if (selectedSyllableOption !== null) return;
    setSelectedSyllableOption(opt);
    const current = syllableQuestions[syllableIndex];
    const correct = opt === current.correctAnswer;
    setIsSyllableCorrect(correct);

    if (correct) {
      sounds.playCorrect();
      onAddPoints(15);
      sounds.speak(`¡Muy bien! ${opt} es la respuesta silábica correcta.`);
    } else {
      sounds.playIncorrect();
      sounds.speak(`Recuerda que la respuesta correcta es ${current.correctAnswer}.`);
    }
  };

  // --- HANDLERS FOR SCRAMBLE ---
  const selectLetter = (letterItem: { id: string; letter: string }) => {
    if (isScrambleCorrect !== null) return;
    sounds.playClick();
    setSelectedLetters([...selectedLetters, letterItem.letter]);
    setAvailableLetters(availableLetters.filter((item) => item.id !== letterItem.id));
  };

  const undoLastLetter = () => {
    if (isScrambleCorrect !== null || selectedLetters.length === 0) return;
    sounds.playClick();
    const lastLetter = selectedLetters[selectedLetters.length - 1];
    setSelectedLetters(selectedLetters.slice(0, -1));
    setAvailableLetters([...availableLetters, { id: `${lastLetter}-${Date.now()}`, letter: lastLetter }]);
  };

  const resetScramble = () => {
    sounds.playClick();
    startScramble(scrambleIndex);
  };

  useEffect(() => {
    if (activeSubMode !== 'letters' || !scrambleQuestions[scrambleIndex]) return;
    const currentQ = scrambleQuestions[scrambleIndex];
    if (selectedLetters.length === currentQ.word.length && selectedLetters.length > 0) {
      const spelled = selectedLetters.join('');
      if (spelled === currentQ.word) {
        setIsScrambleCorrect(true);
        sounds.playCorrect();
        onAddPoints(15);
        sounds.speak(`¡Felicidades! Construiste la palabra ${currentQ.word} con el método FAS.`);
      } else {
        setIsScrambleCorrect(false);
        sounds.playIncorrect();
        sounds.speak(`Intenta ordenar las sílabas o letras nuevamente.`);
      }
    }
  }, [selectedLetters]);

  // --- HANDLERS FOR MATCHING ---
  const handleMatchSelect = (option: string) => {
    if (selectedMatch !== null) return;
    setSelectedMatch(option);
    const current = matchingQuestions[matchingIndex];
    const correct = option === current.correct;
    setIsMatchCorrect(correct);

    if (correct) {
      sounds.playCorrect();
      onAddPoints(15);
      sounds.speak(`¡Correcto! ${option} es la respuesta adecuada.`);
    } else {
      sounds.playIncorrect();
      sounds.speak(`La respuesta correcta es ${current.correct}.`);
    }
  };

  // --- HANDLERS FOR SENTENCES ---
  const selectWord = (wordItem: { id: string; word: string }) => {
    if (isSentenceCorrect !== null) return;
    sounds.playClick();
    setSelectedWords([...selectedWords, wordItem.word]);
    setAvailableWords(availableWords.filter(item => item.id !== wordItem.id));
  };

  const undoLastWord = () => {
    if (isSentenceCorrect !== null || selectedWords.length === 0) return;
    sounds.playClick();
    const lastWord = selectedWords[selectedWords.length - 1];
    setSelectedWords(selectedWords.slice(0, -1));
    setAvailableWords([...availableWords, { id: `${lastWord}-${Date.now()}`, word: lastWord }]);
  };

  const resetSentence = () => {
    sounds.playClick();
    startSentence(sentenceIndex);
  };

  useEffect(() => {
    if (activeSubMode !== 'sentences' || !sentenceQuestions[sentenceIndex]) return;
    const currentQ = sentenceQuestions[sentenceIndex];
    const targetWords = currentQ.sentence.split(' ');
    
    if (selectedWords.length === targetWords.length && selectedWords.length > 0) {
      const built = selectedWords.join(' ');
      if (built === currentQ.sentence) {
        setIsSentenceCorrect(true);
        sounds.playCorrect();
        onAddPoints(20);
        sounds.speak(`¡Grandioso! Construiste la oración correctamente: "${currentQ.sentence}".`);
      } else {
        setIsSentenceCorrect(false);
        sounds.playIncorrect();
        sounds.speak(`Revisa el orden de las palabras de la oración.`);
      }
    }
  }, [selectedWords]);

  // --- HANDLERS FOR REDACTION ---
  const checkRedactRequirements = () => {
    const text = redactInput.trim();
    if (!text) return { capitalized: false, hasPunctuation: false, minLength: false, containsWord: false, isPerfect: false };

    const current = redactQuestions[redactIndex];
    const capitalized = text.length > 0 && text[0] === text[0].toUpperCase() && text[0] !== text[0].toLowerCase();
    const lastChar = text[text.length - 1];
    const hasPunctuation = ['.', '!', '?'].includes(lastChar);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const minLength = words.length >= (gradeMode === 'Tercer Grado' ? 5 : 3);
    const containsWord = text.toLowerCase().includes(current.requiredWord.toLowerCase());

    return {
      capitalized,
      hasPunctuation,
      minLength,
      containsWord,
      isPerfect: capitalized && hasPunctuation && minLength && containsWord
    };
  };

  const handleEvaluateRedact = () => {
    if (!redactInput.trim()) return;
    const feedback = checkRedactRequirements();
    setRedactFeedback(feedback);
    setIsRedactEvaluated(true);

    if (feedback.isPerfect) {
      sounds.playCorrect();
      onAddPoints(25);
      sounds.speak('¡Excelente redacción! Tu escrito cumple con el método FAS, mayúscula inicial y punto final.');
    } else {
      sounds.playIncorrect();
      sounds.speak('Revisa los puntos marcados con cruz para perfeccionar tu texto.');
    }
  };

  // --- HANDLERS FOR READING ---
  const cleanWordForComparison = (w: string) => {
    return w.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()¿?¡"']/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const evaluateSpeechReading = (spokenText: string) => {
    if (!spokenText) return;
    const currentQ = readingQuestions[readIndex];
    if (!currentQ) return;
    
    const cleanSpokenWords = spokenText.toLowerCase()
      .split(/\s+/)
      .map(cleanWordForComparison);
      
    const targetWords = currentQ.text.split(/\s+/);
    
    let correctCount = 0;
    const evaluated = targetWords.map(word => {
      const cleanTarget = cleanWordForComparison(word);
      const isCorrect = cleanSpokenWords.some(spokenW => {
        return spokenW === cleanTarget || spokenW.includes(cleanTarget) || cleanTarget.includes(spokenW);
      });
      if (isCorrect) correctCount++;
      return {
        word,
        isCorrect,
        cleanWord: cleanTarget
      };
    });

    const scorePct = Math.round((correctCount / targetWords.length) * 100);
    setEvaluatedResult(evaluated);
    setReadingScore(scorePct);
    setHasEvaluatedRead(true);

    if (scorePct >= 75) {
      sounds.playCorrect();
      onAddPoints(20);
      sounds.speak('¡Excelente fluidez lectora! Has leído muy bien la lección.');
    } else {
      sounds.playIncorrect();
      onAddPoints(5);
      sounds.speak('¡Buen intento! Sigue practicando tu lectura en voz alta.');
    }
  };

  const handleToggleReadingMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicActiveReadSupported(false);
      sounds.speak('Tu navegador no soporta el micrófono interactivo.');
      return;
    }

    if (isReadingRecord) {
      if (readRecognitionRef.current) {
        readRecognitionRef.current.stop();
      }
    } else {
      sounds.playClick();
      setSpokenResult('');
      setHasEvaluatedRead(false);
      setEvaluatedResult([]);

      const rec = new SpeechRecognition();
      rec.lang = 'es-ES';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setIsReadingRecord(true);
        sounds.speak('Grabando activa. Lee la oración claramente.');
      };

      rec.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript || '';
        setSpokenResult(spoken);
        evaluateSpeechReading(spoken);
      };

      rec.onerror = () => {
        setIsReadingRecord(false);
        sounds.playIncorrect();
      };

      rec.onend = () => {
        setIsReadingRecord(false);
      };

      readRecognitionRef.current = rec;
      try {
        rec.start();
      } catch (err) {
        console.error('Mic error', err);
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-4 border-sky-300 p-6 md:p-8 max-w-4xl mx-auto overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-6 -mt-6 text-sky-200/20 w-32 h-32 pointer-events-none">
        <BookOpen className="w-full h-full" />
      </div>

      {/* Header FAS Method & Grade Selector Banner */}
      <div className="flex flex-wrap justify-between items-center bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl p-4 mb-6 shadow-md border-b-4 border-blue-700">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-yellow-300 animate-pulse" />
          <div>
            <h3 className="text-base md:text-lg font-black uppercase tracking-wide">
              Método FAS (Fónico, Analítico y Sintético) 📖
            </h3>
            <p className="text-xs text-sky-100 font-medium">
              Avanza: Sonidos ➔ Sílabas ➔ Palabras ➔ Oraciones ➔ Comprensión Lector
            </p>
          </div>
        </div>

        {/* Grade Level Focus Selector */}
        <div className="flex items-center gap-1 bg-white/20 p-1.5 rounded-xl border border-white/30 backdrop-blur-xs mt-2 md:mt-0">
          <button
            onClick={() => {
              sounds.playClick();
              setGradeMode('Segundo Grado');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              gradeMode === 'Segundo Grado'
                ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                : 'text-white hover:bg-white/10'
            }`}
          >
            2° Grado
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setGradeMode('Tercer Grado');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              gradeMode === 'Tercer Grado'
                ? 'bg-yellow-400 text-yellow-950 shadow-sm'
                : 'text-white hover:bg-white/10'
            }`}
          >
            3° Grado
          </button>
        </div>
      </div>

      {/* Sub-mode Navigation Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubMode('fas_phonics');
          }}
          className={`py-2.5 px-3 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow-sm transition-all cursor-pointer ${
            activeSubMode === 'fas_phonics'
              ? 'bg-sky-500 border-sky-600 text-white scale-105'
              : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800'
          }`}
        >
          🔊 1. Sonidos y Fonemas
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubMode('fas_syllables');
          }}
          className={`py-2.5 px-3 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow-sm transition-all cursor-pointer ${
            activeSubMode === 'fas_syllables'
              ? 'bg-sky-500 border-sky-600 text-white scale-105'
              : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800'
          }`}
        >
          🧩 2. Sílabas
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubMode('letters');
          }}
          className={`py-2.5 px-3 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow-sm transition-all cursor-pointer ${
            activeSubMode === 'letters'
              ? 'bg-sky-500 border-sky-600 text-white scale-105'
              : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800'
          }`}
        >
          🔠 3. Palabras
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubMode('sentences');
          }}
          className={`py-2.5 px-3 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow-sm transition-all cursor-pointer ${
            activeSubMode === 'sentences'
              ? 'bg-sky-500 border-sky-600 text-white scale-105'
              : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800'
          }`}
        >
          📝 4. Oraciones
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubMode('matching');
          }}
          className={`py-2.5 px-3 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow-sm transition-all cursor-pointer ${
            activeSubMode === 'matching'
              ? 'bg-sky-500 border-sky-600 text-white scale-105'
              : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800'
          }`}
        >
          🔍 Vocabulario/Ortografía
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubMode('redact');
          }}
          className={`py-2.5 px-3 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow-sm transition-all cursor-pointer ${
            activeSubMode === 'redact'
              ? 'bg-sky-500 border-sky-600 text-white scale-105'
              : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800'
          }`}
        >
          ✍️ Producción de Texto
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubMode('read');
          }}
          className={`py-2.5 px-3 rounded-2xl font-black text-xs md:text-sm border-b-4 shadow-sm transition-all cursor-pointer ${
            activeSubMode === 'read'
              ? 'bg-sky-500 border-sky-600 text-white scale-105'
              : 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800'
          }`}
        >
          🎤 Lectura & Comprensión
        </button>
      </div>

      {/* Audio Clue Trigger Bar */}
      <div className="flex justify-between items-center bg-sky-50 rounded-2xl p-4 mb-6 border border-sky-200">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-sky-600" />
          <p className="text-xs text-sky-900 font-bold">
            Enfoque FAS ({gradeMode}): Entrenamiento auditivo y lectoescritura
          </p>
        </div>

        <button
          onClick={speakPhonemaSound}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
        >
          <Volume2 className="w-4 h-4 fill-white" />
          <span>Escuchar Audio Lección</span>
        </button>
      </div>

      {/* SUBMODE 1: FAS PHONICS (SONIDOS Y FONEMAS) */}
      {activeSubMode === 'fas_phonics' && phonicsQuestions[phonicsIndex] && (
        <div className="space-y-6">
          <div className="bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300 p-6 text-center shadow-inner relative">
            <span className="absolute top-2 left-3 bg-amber-400 text-amber-950 text-[10px] font-black rounded-full px-3 py-0.5 uppercase">
              Fase 1: Discriminación Auditiva
            </span>
            <p className="text-xs text-amber-700 font-bold uppercase mt-1">Identificación del Fonema</p>
            <h2 className="text-3xl font-black text-amber-950 mt-2 mb-2">
              Sonido: {phonicsQuestions[phonicsIndex].soundName}
            </h2>
            <p className="text-sm md:text-base text-slate-700 font-medium max-w-xl mx-auto leading-relaxed">
              "{phonicsQuestions[phonicsIndex].clue}"
            </p>
            <div className="mt-3 inline-block bg-white px-4 py-1.5 rounded-full border border-amber-200 text-xs font-bold text-amber-900">
              Ejemplo visual: {phonicsQuestions[phonicsIndex].sampleWord}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-wider">
            Toca la letra que representa el sonido:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {phonicsQuestions[phonicsIndex].options.map((opt) => {
              const isSelected = selectedPhonicsOption === opt;
              const isThisCorrect = opt === phonicsQuestions[phonicsIndex].correctLetter;

              let btnClass = 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50';
              if (selectedPhonicsOption !== null) {
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
                  key={opt}
                  disabled={selectedPhonicsOption !== null}
                  onClick={() => handlePhonicsSelect(opt)}
                  className={`py-5 text-3xl font-black rounded-2xl border-b-4 shadow-md transition-all cursor-pointer ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selectedPhonicsOption !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-4 bg-sky-50 rounded-2xl border border-sky-200"
            >
              {isPhonicsCorrect ? (
                <p className="text-emerald-700 font-bold text-base mb-3">
                  ¡Excelente relación sonido-letra! +15 Puntos XP 🎉
                </p>
              ) : (
                <p className="text-rose-600 font-bold text-base mb-3">
                  La respuesta correcta era la letra "{phonicsQuestions[phonicsIndex].correctLetter}". ¡Sigue practicando!
                </p>
              )}
              <button
                onClick={() => {
                  sounds.playClick();
                  setPhonicsIndex(phonicsIndex + 1);
                }}
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base px-6 py-3 rounded-full shadow-lg mx-auto active:scale-95 transition-all cursor-pointer"
              >
                <span>Siguiente Sonido</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* SUBMODE 2: FAS SYLLABLES (FORMACIÓN Y SEPARACIÓN SILÁBICA) */}
      {activeSubMode === 'fas_syllables' && syllableQuestions[syllableIndex] && (
        <div className="space-y-6">
          <div className="bg-emerald-50 rounded-2xl border-2 border-emerald-200 p-6 text-center shadow-inner relative">
            <span className="absolute top-2 left-3 bg-emerald-400 text-emerald-950 text-[10px] font-black rounded-full px-3 py-0.5 uppercase">
              Fase 2: Sílabas y Estructura
            </span>
            <p className="text-xs text-emerald-700 font-bold uppercase mt-1">
              {syllableQuestions[syllableIndex].type === 'combinar' ? 'Formación de Sílabas' : 'Separación Silábica'}
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-emerald-950 mt-2 mb-2">
              {syllableQuestions[syllableIndex].prompt}
            </h2>
            <div className="text-xl font-black text-emerald-800 bg-white px-5 py-2 rounded-2xl border border-emerald-300 inline-block mt-2">
              {syllableQuestions[syllableIndex].wordOrLetters}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {syllableQuestions[syllableIndex].options.map((opt) => {
              const isSelected = selectedSyllableOption === opt;
              const isThisCorrect = opt === syllableQuestions[syllableIndex].correctAnswer;

              let btnClass = 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50';
              if (selectedSyllableOption !== null) {
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
                  key={opt}
                  disabled={selectedSyllableOption !== null}
                  onClick={() => handleSyllableSelect(opt)}
                  className={`py-4 px-6 text-xl md:text-2xl font-black rounded-2xl border-b-4 shadow-md transition-all cursor-pointer ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selectedSyllableOption !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-200"
            >
              {isSyllableCorrect ? (
                <p className="text-emerald-700 font-bold text-base mb-3">
                  ¡Gran análisis silábico! +15 Puntos XP 🎉
                </p>
              ) : (
                <p className="text-rose-600 font-bold text-base mb-3">
                  La respuesta correcta era "{syllableQuestions[syllableIndex].correctAnswer}".
                </p>
              )}
              <button
                onClick={() => {
                  sounds.playClick();
                  setSyllableIndex(syllableIndex + 1);
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base px-6 py-3 rounded-full shadow-lg mx-auto active:scale-95 transition-all cursor-pointer"
              >
                <span>Siguiente Sílaba</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* SUBMODE 3: WORD SCRAMBLE (CONSTRUCCIÓN DE PALABRAS) */}
      {activeSubMode === 'letters' && scrambleQuestions[scrambleIndex] && (
        <div>
          <div className="bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300 p-5 mb-6 text-center shadow-inner relative">
            <span className="absolute top-2 left-3 bg-amber-400 text-amber-950 text-[10px] font-black rounded-full px-2.5 py-0.5 uppercase">
              Fase 3: Construcción FAS - {scrambleQuestions[scrambleIndex].category}
            </span>
            <p className="text-sm text-slate-500 font-medium mt-1">Ordena las letras para formar la palabra:</p>
            <h3 className="text-lg md:text-xl font-bold text-amber-900 mt-2">
              "{scrambleQuestions[scrambleIndex].clue}"
            </h3>
          </div>

          <div className="flex justify-center flex-wrap gap-2 md:gap-3 mb-6 min-h-16 items-center">
            {scrambleQuestions[scrambleIndex].word.split('').map((_, idx) => {
              const letter = selectedLetters[idx];
              return (
                <motion.div
                  key={idx}
                  layout
                  className={`w-12 h-12 md:w-16 md:h-16 text-2xl md:text-4xl font-extrabold rounded-2xl flex items-center justify-center border-2 border-dashed ${
                    isScrambleCorrect === true
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : isScrambleCorrect === false
                      ? 'bg-rose-50 border-rose-300 text-rose-500'
                      : letter
                      ? 'bg-sky-100 border-sky-400 text-sky-800 shadow-md'
                      : 'bg-slate-50 border-slate-300 text-transparent'
                  }`}
                >
                  {letter || ''}
                </motion.div>
              );
            })}
          </div>

          {selectedLetters.length > 0 && isScrambleCorrect === null && (
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={undoLastLetter}
                className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
              >
                ↩ Borrar Última Letra
              </button>
              <button
                onClick={resetScramble}
                className="text-xs bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Reiniciar Palabra
              </button>
            </div>
          )}

          {isScrambleCorrect === null ? (
            <div>
              <p className="text-center text-xs text-slate-400 font-bold uppercase mb-3 tracking-wider">
                Toca las letras para armar la palabra:
              </p>
              <div className="flex justify-center flex-wrap gap-2.5 md:gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                {availableLetters.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectLetter(item)}
                    className="w-12 h-12 md:w-16 md:h-16 bg-white hover:bg-sky-50 border-b-4 border-slate-300 hover:border-sky-400 text-2xl md:text-3xl font-black rounded-xl text-sky-800 shadow transition-all duration-100 cursor-pointer"
                  >
                    {item.letter}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-2">
              <p className="text-emerald-700 font-black text-xl mb-3 flex items-center justify-center gap-1.5 animate-bounce">
                <Check className="w-6 h-6 stroke-[3px]" /> ¡Felicidades! ¡Has construido la palabra correctamente!
              </p>
              <button
                onClick={() => {
                  sounds.playClick();
                  setScrambleIndex(scrambleIndex + 1);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-lg px-8 py-3.5 rounded-full shadow-lg mx-auto active:scale-95 transition-all cursor-pointer"
              >
                <span>Siguiente Palabra</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBMODE 4: VOCABULARY AND SPELLING */}
      {activeSubMode === 'matching' && matchingQuestions[matchingIndex] && (
        <div>
          <div className="bg-sky-50 rounded-2xl border-2 border-sky-200 p-6 mb-6 text-center shadow-inner relative">
            <span className="absolute top-2 left-3 text-[10px] font-black rounded-full px-3 py-0.5 uppercase bg-indigo-400 text-indigo-950">
              Ortografía, Signos y Vocabulario ({gradeMode})
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 mt-2 mb-2">
              {matchingQuestions[matchingIndex].word}
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-medium">
              {matchingQuestions[matchingIndex].clue}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {matchingQuestions[matchingIndex].options.map((opt, i) => {
              const isSelected = selectedMatch === opt;
              const isThisCorrect = opt === matchingQuestions[matchingIndex].correct;

              let btnClass = 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50';
              if (selectedMatch !== null) {
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
                  disabled={selectedMatch !== null}
                  onClick={() => handleMatchSelect(opt)}
                  className={`py-4 px-6 text-lg md:text-xl font-black rounded-2xl border-b-4 shadow-md transition-all cursor-pointer ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selectedMatch !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-4 bg-sky-50 rounded-2xl border border-sky-100"
            >
              {isMatchCorrect ? (
                <p className="text-emerald-700 font-bold text-base mb-3">
                  ¡Respuesta ortográfica perfecta! +15 puntos XP 🎉
                </p>
              ) : (
                <p className="text-rose-600 font-bold text-base mb-3">
                  La respuesta correcta era "{matchingQuestions[matchingIndex].correct}".
                </p>
              )}
              <button
                onClick={() => {
                  sounds.playClick();
                  setMatchingIndex(matchingIndex + 1);
                }}
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-lg px-8 py-3.5 rounded-full shadow-lg mx-auto active:scale-95 transition-all cursor-pointer"
              >
                <span>Continuar</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* SUBMODE 5: SENTENCE BUILDING (CONSTRUCCIÓN DE ORACIONES) */}
      {activeSubMode === 'sentences' && sentenceQuestions[sentenceIndex] && (
        <div>
          <div className="bg-[#FFFBEB] rounded-2xl border-2 border-dashed border-amber-300 p-5 mb-6 text-center shadow-inner relative">
            <span className="absolute top-2 left-3 bg-amber-400 text-amber-950 text-[10px] font-black rounded-full px-2.5 py-0.5 uppercase">
              Fase 4: Sintaxis y Oraciones ({gradeMode})
            </span>
            <p className="text-sm text-slate-500 font-semibold mt-1">Ordena las palabras para formar la oración:</p>
            <h3 className="text-lg md:text-xl font-bold text-amber-950 mt-2">
              "{sentenceQuestions[sentenceIndex].clue}"
            </h3>
          </div>

          <div className="flex justify-center flex-wrap gap-2.5 p-4 min-h-20 bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-2xl items-center mb-6">
            {selectedWords.length === 0 ? (
              <p className="text-xs text-emerald-600 font-black uppercase text-center w-full block tracking-widest py-2">
                🌟 Toca las palabras de abajo para alinearlas aquí 🌟
              </p>
            ) : (
              selectedWords.map((word, idx) => (
                <motion.div
                  key={idx}
                  layout
                  className={`px-4 py-2 text-sm md:text-base font-black rounded-xl shadow-xs border flex items-center gap-1.5 ${
                    isSentenceCorrect === true
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : isSentenceCorrect === false
                      ? 'bg-rose-100 border-rose-300 text-rose-700'
                      : 'bg-indigo-600 border-indigo-700 text-white'
                  }`}
                >
                  <span>{word}</span>
                </motion.div>
              ))
            )}
          </div>

          {selectedWords.length > 0 && isSentenceCorrect === null && (
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={undoLastWord}
                className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
              >
                ↩ Deshacer Última Palabra
              </button>
              <button
                onClick={resetSentence}
                className="text-xs bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Reordenar Todo
              </button>
            </div>
          )}

          {isSentenceCorrect === null ? (
            <div>
              <p className="text-center text-xs text-slate-400 font-bold uppercase mb-3 tracking-wider">
                Toca cada palabra para armar la oración:
              </p>
              <div className="flex justify-center flex-wrap gap-3 p-4 bg-slate-100/80 rounded-2xl border border-slate-200 shadow-inner">
                {availableWords.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectWord(item)}
                    className="px-4 py-2.5 bg-white hover:bg-sky-50 border-2 border-slate-200 hover:border-sky-400 text-sm md:text-base font-black rounded-xl text-sky-950 shadow-sm transition-all duration-100 cursor-pointer"
                  >
                    {item.word}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-5 bg-emerald-50 rounded-2xl border border-emerald-100 mb-2">
              <p className="text-emerald-700 font-black text-xl mb-3 flex items-center justify-center gap-2 animate-bounce">
                <Check className="w-6 h-6 stroke-[3px]" /> ¡Fabuloso! ¡Has alineado la oración perfectamente!
              </p>
              <button
                onClick={() => {
                  sounds.playClick();
                  setSentenceIndex(sentenceIndex + 1);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-lg px-8 py-3.5 rounded-full shadow-lg mx-auto active:scale-95 transition-all cursor-pointer"
              >
                <span>Siguiente Oración</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUBMODE 6: REDACTION (PRODUCCIÓN DE TEXTOS GUIADA) */}
      {activeSubMode === 'redact' && redactQuestions[redactIndex] && (
        <div className="space-y-6">
          <div className="bg-[#F5F3FF] rounded-2xl border-2 border-purple-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-purple-800 font-black text-xs uppercase mb-1">
              <PenTool className="w-4 h-4 text-purple-600" /> Tema de Redacción ({gradeMode}): {redactQuestions[redactIndex].topic}
            </div>
            <h3 className="text-sm md:text-base font-bold text-purple-950">
              {redactQuestions[redactIndex].prompt}
            </h3>
            <p className="text-xs text-purple-600 mt-2 italic font-semibold">
              {redactQuestions[redactIndex].helper}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border">
            <h4 className="text-xs font-black text-slate-500 uppercase col-span-2 mb-1">
              🔎 Verificación de Escritura FAS:
            </h4>
            
            <div className="flex items-center gap-2 text-xs font-bold">
              {checkRedactRequirements().capitalized ? (
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
              )}
              <span className={checkRedactRequirements().capitalized ? 'text-emerald-700' : 'text-slate-500'}>
                Inicia con Letra Mayúscula
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              {checkRedactRequirements().hasPunctuation ? (
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
              )}
              <span className={checkRedactRequirements().hasPunctuation ? 'text-emerald-700' : 'text-slate-500'}>
                Termina con punto final (.) o signo
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              {checkRedactRequirements().minLength ? (
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
              )}
              <span className={checkRedactRequirements().minLength ? 'text-emerald-700' : 'text-slate-500'}>
                Longitud suficiente de palabras
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold">
              {checkRedactRequirements().containsWord ? (
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
              )}
              <span className={checkRedactRequirements().containsWord ? 'text-emerald-700' : 'text-slate-500'}>
                Incluye la palabra: <strong className="underline uppercase">{redactQuestions[redactIndex].requiredWord}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-500 uppercase">Escribe tu texto aquí:</label>
            <textarea
              rows={3}
              placeholder="Ej. Mi lindo gatito juega en el patio con la pelota."
              value={redactInput}
              onChange={(e) => {
                setRedactInput(e.target.value);
                if (isRedactEvaluated) setIsRedactEvaluated(false);
              }}
              className="w-full px-4 py-3 text-sm font-semibold border-2 border-slate-200 rounded-2xl focus:border-purple-400 focus:outline-none text-slate-800 shadow-inner"
            />
          </div>

          <div className="flex gap-4 justify-between flex-wrap items-center">
            <button
              onClick={() => setRedactIndex(redactIndex + 1)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold underline cursor-pointer"
            >
              Siguiente tema 🐾
            </button>

            <button
              disabled={!redactInput.trim()}
              onClick={handleEvaluateRedact}
              className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs uppercase rounded-2xl shadow-md cursor-pointer flex items-center gap-2"
            >
              <span>Verificar Redacción ✨</span>
            </button>
          </div>

          {isRedactEvaluated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border-2 text-center ${
                redactFeedback.isPerfect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {redactFeedback.isPerfect ? (
                <div>
                  <h4 className="font-black text-slate-800 text-sm mb-1">👑 ¡Composición Excelente!</h4>
                  <p className="text-xs text-slate-600 mb-3">
                    Has cumplido con las reglas del método FAS y la estructura gramatical. +25 Puntos XP.
                  </p>
                  <button
                    onClick={() => setRedactIndex(redactIndex + 1)}
                    className="py-2 px-4 bg-emerald-600 text-white text-xs font-black rounded-lg cursor-pointer"
                  >
                    Escribir sobre otro Tema 🎨
                  </button>
                </div>
              ) : (
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm mb-1">💡 Consejos de Redacción:</h4>
                  <p className="text-xs text-slate-600">
                    Asegúrate de incluir la palabra <strong className="uppercase">{redactQuestions[redactIndex].requiredWord}</strong>, iniciar con mayúscula y cerrar con un punto final.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* SUBMODE 7: READING AND COMPREHENSION (FLUIDEZ Y COMPRENSIÓN LECTORA) */}
      {activeSubMode === 'read' && readingQuestions[readIndex] && (
        <div className="space-y-6">
          <div className="bg-[#FFFDF5] rounded-3xl border-2 border-yellow-300 p-6 shadow-xs relative">
            <span className="absolute top-2 right-3 bg-yellow-200 text-yellow-900 text-[10px] font-black rounded-full px-3 py-1 uppercase">
              Categoría: {readingQuestions[readIndex].category}
            </span>

            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
              <span>Lectura Guiada e Idea Principal</span>
            </h3>

            <div className="my-4 text-center">
              <p className="text-xs text-slate-400 font-extrabold uppercase mb-2">Texto de Lectura:</p>
              <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-sm inline-block">
                <p className="text-slate-800 text-xl md:text-2xl font-black leading-relaxed">
                  "{readingQuestions[readIndex].text}"
                </p>
              </div>
              <p className="text-xs font-semibold text-sky-700 italic mt-3">
                💡 Idea Principal: {readingQuestions[readIndex].mainIdea}
              </p>
            </div>
          </div>

          {/* Micro Recording Action area */}
          <div className="flex flex-col items-center justify-center p-5 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
            <button
              onClick={handleToggleReadingMic}
              className={`w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-lg transition-all ${
                isReadingRecord
                  ? 'bg-red-500 border-red-700 text-white animate-pulse'
                  : 'bg-white border-sky-300 text-indigo-600 hover:bg-sky-50'
              } cursor-pointer mb-2`}
              title="Clica para accionar el micrófono y leer en voz alta"
            >
              {isReadingRecord ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
              {isReadingRecord ? '🔴 GRABANDO TU LECTURA... TOCA AL TERMINAR' : '🎙️ TOCA EL MICRÓFONO PARA LEER EN VOZ ALTA'}
            </p>
          </div>

          {/* Interactive Comprehension Question */}
          <div className="bg-sky-50 p-5 rounded-2xl border border-sky-200">
            <h4 className="text-sm font-black text-sky-900 mb-2">
              ❓ Pregunta de Comprensión Lector: {readingQuestions[readIndex].question}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {readingQuestions[readIndex].options.map((opt) => {
                const isSelected = selectedReadingQuestionAnswer === opt;
                const isCorrect = opt === readingQuestions[readIndex].correct;

                let btnStyle = 'bg-white text-slate-800 border-slate-200';
                if (selectedReadingQuestionAnswer !== null) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500 text-white border-emerald-600';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500 text-white border-rose-600';
                  } else {
                    btnStyle = 'bg-slate-100 text-slate-300 border-slate-200';
                  }
                }

                return (
                  <button
                    key={opt}
                    disabled={selectedReadingQuestionAnswer !== null}
                    onClick={() => {
                      setSelectedReadingQuestionAnswer(opt);
                      if (opt === readingQuestions[readIndex].correct) {
                        sounds.playCorrect();
                        onAddPoints(15);
                      } else {
                        sounds.playIncorrect();
                      }
                    }}
                    className={`p-3 font-bold text-sm rounded-xl border-2 transition-all cursor-pointer ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedReadingQuestionAnswer !== null && (
            <div className="text-center mt-4">
              <button
                onClick={() => setReadIndex(readIndex + 1)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm px-6 py-3 rounded-full shadow-md cursor-pointer inline-flex items-center gap-2"
              >
                <span>Siguiente Lectura</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer advice */}
      <div className="flex gap-2 items-start text-xs text-slate-400 mt-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <Lightbulb className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
        <p className="leading-snug">
          <strong>Enfoque Pedagógico FAS ({gradeMode}):</strong> Avance sistemático desde sonidos individuales y fonemas ➔ sílabas ➔ palabras ➔ oraciones completas ➔ comprensión y redacción con ortografía adecuada.
        </p>
      </div>
    </div>
  );
};
