/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { sounds } from '../utils/sound';
import { Globe, Search, Sparkles, Volume2, Compass, Award, CheckCircle2, RefreshCw, Bot, ChevronRight, Bookmark, X, Play, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface CountryData {
  id: string;
  name: string;
  flag: string;
  continent: 'América' | 'Europa' | 'África' | 'Asia' | 'Oceanía' | 'Antártida';
  capital: string;
  x: number; // Percentage X position on map SVG (0-100)
  y: number; // Percentage Y position on map SVG (0-100)
  animal: {
    name: string;
    emoji: string;
    fact: string;
  };
  landmark: {
    name: string;
    emoji: string;
    fact: string;
  };
  curiosity: {
    title: string;
    emoji: string;
    fact: string;
  };
  trivia: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
}

export const COUNTRIES_DATA: CountryData[] = [
  {
    id: 'mexico',
    name: 'México',
    flag: '🇲🇽',
    continent: 'América',
    capital: 'Ciudad de México',
    x: 21,
    y: 46,
    animal: {
      name: 'Axolote Rosa',
      emoji: '🦎',
      fact: '¡El axolote es una criatura acuática mágica que puede regenerar sus patitas, cola e incluso parte de su corazón si sufre un accidente!',
    },
    landmark: {
      name: 'Chichén Itzá',
      emoji: '🏛️',
      fact: 'Una enorme pirámide Maya. Durante los equinoccios de primavera y otoño, la luz del sol crea la sombra de una serpiente que parece bajar por los escalones.',
    },
    curiosity: {
      title: 'El Origen del Chocolate',
      emoji: '🍫',
      fact: '¡El chocolate nació en México! Las antiguas civilizaciones aztecas y mayas cultivaban cacao y preparaban una bebida espumosa y sagrada llamada xocolātl.',
    },
    trivia: {
      question: '¿Qué superpoder biológico especial tiene el axolote mexicano?',
      options: ['Puede volar entre los árboles', 'Puede regenerar partes de su cuerpo', 'Puede cambiar de color como un camaleón'],
      correct: 1,
      explanation: '¡Excelente! El axolote tiene la asombrosa capacidad de regenerar órganos y extremidades perdidas.',
    },
  },
  {
    id: 'peru',
    name: 'Perú',
    flag: '🇵🇪',
    continent: 'América',
    capital: 'Lima',
    x: 30,
    y: 67,
    animal: {
      name: 'Llama Andina',
      emoji: '🦙',
      fact: 'Las llamas son animales muy inteligentes y sociables que habitan en las alturas de la cordillera de los Andes.',
    },
    landmark: {
      name: 'Machu Picchu',
      emoji: '🏔️',
      fact: 'Una impresionante ciudad de piedra construida por la civilización Inca en la cima de las montañas a más de 2,400 metros de altura.',
    },
    curiosity: {
      title: 'Más de 3,000 Tipos de Papas',
      emoji: '🥔',
      fact: '¡En Perú se cultivan más de 3,000 variedades de papas nativas! Las hay de color azul, morado, amarillo y con formas muy divertidas.',
    },
    trivia: {
      question: '¿Dónde construyeron los Incas la majestuosa ciudadela de Machu Picchu?',
      options: ['Bajo el fondo del océano', 'En la cima de altas montañas de piedra', 'En el medio de un desierto helado'],
      correct: 1,
      explanation: '¡Correcto! Machu Picchu está ubicada pacíficamente en la cima de los Andes peruanos.',
    },
  },
  {
    id: 'brazil',
    name: 'Brasil',
    flag: '🇧🇷',
    continent: 'América',
    capital: 'Brasilia',
    x: 36,
    y: 68,
    animal: {
      name: 'Tucán Toco',
      emoji: '🦜',
      fact: 'Tiene un pico gigante y brillante que representa un tercio de su cuerpo, pero es muy liviano porque por dentro es hueco como una esponja.',
    },
    landmark: {
      name: 'Cristo Redentor',
      emoji: '🗿',
      fact: 'Una gigantesca estatua con los brazos abiertos sobre la cima del cerro del Corcovado contemplando la bahía de Río de Janeiro.',
    },
    curiosity: {
      title: 'El Gran Río Amazonas',
      emoji: '🌊',
      fact: 'El río Amazonas es el más largo y caudaloso del mundo. Contiene más agua que los siguientes siete ríos más grandes del planeta juntos.',
    },
    trivia: {
      question: '¿Cuál es la selva tropical y el río más extenso del planeta Tierra?',
      options: ['La Selva del Amazonas', 'El Desierto del Sahara', 'Los Glaciares de la Antártida'],
      correct: 0,
      explanation: '¡Muy bien! El Amazonas alberga la mayor cantidad de biodiversidad del planeta.',
    },
  },
  {
    id: 'usa',
    name: 'Estados Unidos',
    flag: '🇺🇸',
    continent: 'América',
    capital: 'Washington D.C.',
    x: 23,
    y: 34,
    animal: {
      name: 'Águila Calva',
      emoji: '🦅',
      fact: 'Un águila majestuosa de cabeza blanca con una visión 8 veces más potente que la del ser humano, lo que le permite ver peces desde las alturas.',
    },
    landmark: {
      name: 'Estatua de la Libertad',
      emoji: '🗽',
      fact: 'Ubicada en la entrada del puerto de Nueva York. Fue un regalo de Francia para celebrar la amistad entre ambas naciones.',
    },
    curiosity: {
      title: 'El Asombroso Gran Cañón',
      emoji: '🏞️',
      fact: 'Un inmenso cañón natural esculpido durante millones de años por las corrientes del Río Colorado, ¡se puede ver desde el espacio!',
    },
    trivia: {
      question: '¿Qué río esculpió lentamente las rocas para formar el Gran Cañón?',
      options: ['El Río Misisipi', 'El Río Colorado', 'El Río Nilo'],
      correct: 1,
      explanation: '¡Así es! El impetuoso Río Colorado talló este cañón a lo largo de eones de años.',
    },
  },
  {
    id: 'espana',
    name: 'España',
    flag: '🇪🇸',
    continent: 'Europa',
    capital: 'Madrid',
    x: 46,
    y: 38,
    animal: {
      name: 'Lince Ibérico',
      emoji: '🐱',
      fact: 'El felino salvaje con pinceles de pelos negros en las orejas que actúan como antenas ultra sensibles para escuchar pequeños sonidos.',
    },
    landmark: {
      name: 'La Sagrada Familia',
      emoji: '🏰',
      fact: 'Una catedral en Barcelona ideada por el genial arquitecto Antoni Gaudí. Sus columnas parecen árboles gigantes de un bosque mágico.',
    },
    curiosity: {
      title: 'El Arte del Flamenco',
      emoji: '💃',
      fact: 'Una expresión artística tradicional con guitarra, zapateado y palmas llena de ritmo, pasión y energía contagiosa.',
    },
    trivia: {
      question: '¿En qué genial arquitecto se inspiró la Sagrada Familia imitando formas de la naturaleza?',
      options: ['Antoni Gaudí', 'Leonardo da Vinci', 'Pablo Picasso'],
      correct: 0,
      explanation: '¡Excelente! Antoni Gaudí diseñó estructuras imitando la naturaleza y los bosques.',
    },
  },
  {
    id: 'francia',
    name: 'Francia',
    flag: '🇫🇷',
    continent: 'Europa',
    capital: 'París',
    x: 48,
    y: 32,
    animal: {
      name: 'Gallo Galo',
      emoji: '🐓',
      fact: 'Un gallo orgulloso y madrugador que ha sido el símbolo histórico nacional de valentía desde tiempos de los antiguos galos.',
    },
    landmark: {
      name: 'Torre Eiffel',
      emoji: '🗼',
      fact: 'Una torre de hierro de 330 metros. En los días calurosos de verano, el metal se expande y la torre ¡crece hasta 15 centímetros de alto!',
    },
    curiosity: {
      title: 'El Museo del Louvre',
      emoji: '🎨',
      fact: 'El museo de arte más visitado del mundo. Si le dedicaras 30 segundos a cada obra de arte, ¡tardarías 100 días enteros en recorrerlo!',
    },
    trivia: {
      question: '¿Por qué la Torre Eiffel mide unos centímetros más de altura en verano?',
      options: ['Porque la riegan con agua', 'Porque el calor del sol expande el metal', 'Porque los pájaros tiran de ella'],
      correct: 1,
      explanation: '¡Bingo! La dilatación térmica hace que el hierro de la Torre Eiffel se expanda en verano.',
    },
  },
  {
    id: 'egipto',
    name: 'Egipto',
    flag: '🇪🇬',
    continent: 'África',
    capital: 'El Cairo',
    x: 54,
    y: 44,
    animal: {
      name: 'Camello Dromedario',
      emoji: '🐪',
      fact: 'Guarda grasa en su joroba que puede convertir en agua y energía, permitiéndole viajar semanas por el desierto sin beber nada.',
    },
    landmark: {
      name: 'Pirámides de Guiza',
      emoji: '📐',
      fact: 'Monumentales construcciones de piedra erigidas hace más de 4,500 años como tumbas de faraones. Siguen siendo una maravilla del mundo.',
    },
    curiosity: {
      title: 'La Miel Inmortal',
      emoji: '🍯',
      fact: '¡La miel pura nunca se echa a perder! Arqueólogos encontraron vasijas de miel en tumbas egipcias de 3,000 años ¡y aún sabe riquísima!',
    },
    trivia: {
      question: '¿Qué alimento natural hallado en las tumbas egipcias nunca vence ni se arruina?',
      options: ['El pan de trigo', 'La miel natural de abejas', 'La leche de camella'],
      correct: 1,
      explanation: '¡Cierto! Gracias a sus propiedades naturales, la miel puede conservarse comestible por miles de años.',
    },
  },
  {
    id: 'madagascar',
    name: 'Madagascar',
    flag: '🇲🇬',
    continent: 'África',
    capital: 'Antananarivo',
    x: 62,
    y: 71,
    animal: {
      name: 'Lémur de Cola Anillada',
      emoji: '🐒',
      fact: '¡Los lémures solo viven en estado salvaje en la isla de Madagascar! Usan su larga cola con rayas blancas y negras para comunicarse.',
    },
    landmark: {
      name: 'Avenida de los Baobabs',
      emoji: '🌳',
      fact: 'Árboles ancestrales gigantescos que parecen plantados del revés, con sus ramas superiores pareciendo raíces hacia el cielo.',
    },
    curiosity: {
      title: 'Isla de la Biodiversidad',
      emoji: '🌺',
      fact: '¡El 90% de todas las especies de animales y plantas de Madagascar no existen en ningún otro rincón del planeta Tierra!',
    },
    trivia: {
      question: '¿En qué único lugar salvaje de la Tierra habitan los lémures de cola anillada?',
      options: ['En la isla de Madagascar', 'En el Polo Norte', 'En los bosques de Europa'],
      correct: 0,
      explanation: '¡Correcto! Madagascar es una isla aislada donde los lémures evolucionaron de forma única.',
    },
  },
  {
    id: 'kenia',
    name: 'Kenia',
    flag: '🇰🇪',
    continent: 'África',
    capital: 'Nairobi',
    x: 58,
    y: 58,
    animal: {
      name: 'León de la Sabana',
      emoji: '🦁',
      fact: 'El rugido de un león adulto es tan potente que se puede escuchar a más de 8 kilómetros de distancia.',
    },
    landmark: {
      name: 'Reserva Masái Mara',
      emoji: '🏜️',
      fact: 'Una vasta reserva natural donde animales salvajes viven en completa libertad en las llanuras africanas.',
    },
    curiosity: {
      title: 'La Gran Migración',
      emoji: '🦓',
      fact: 'Cada año, más de 1.5 millones de cebras y ñus cruzan los ríos de la sabana en busca de pastos verdes frescos.',
    },
    trivia: {
      question: '¿A cuántos kilómetros de distancia se puede escuchar el rugido de un león potente?',
      options: ['A 10 metros', 'A 8 kilómetros de distancia', 'No hace ningún sonido'],
      correct: 1,
      explanation: '¡Increíble! El rugido retumba a 8 kilómetros a la redonda en las llanuras.',
    },
  },
  {
    id: 'china',
    name: 'China',
    flag: '🇨🇳',
    continent: 'Asia',
    capital: 'Pekín',
    x: 76,
    y: 38,
    animal: {
      name: 'Oso Panda Gigante',
      emoji: '🐼',
      fact: 'Pasa casi 12 horas al día comiendo tallos de bambú. ¡Un panda adulto puede comer hasta 38 kilos de bambú cada día!',
    },
    landmark: {
      name: 'Gran Muralla China',
      emoji: '🏯',
      fact: 'Una inmensa fortaleza serpenteante de piedra que mide más de 21,000 kilómetros de longitud cruzando montañas y valles.',
    },
    curiosity: {
      title: 'Inventores del Papel',
      emoji: '📜',
      fact: '¡En la antigua China se inventó el papel, la brújula, la imprenta y los espectaculares fuegos artificiales!',
    },
    trivia: {
      question: '¿Cuántas horas al día pasa un tierno oso panda comiendo bambú?',
      options: ['15 minutos', 'Casi 12 horas al día', 'Solo come mientras duerme'],
      correct: 1,
      explanation: '¡Bingo! El bambú da poca energía, por lo que los pandas pasan medio día masticándolo felizmente.',
    },
  },
  {
    id: 'japon',
    name: 'Japón',
    flag: '🇯🇵',
    continent: 'Asia',
    capital: 'Tokio',
    x: 87,
    y: 38,
    animal: {
      name: 'Ciervos de Nara',
      emoji: '🦌',
      fact: 'En la ciudad de Nara, cientos de ciervos caminan libres entre las personas y aprendieron a hacer inclinaciones con la cabeza para pedir comida.',
    },
    landmark: {
      name: 'Monte Fuji',
      emoji: '🌋',
      fact: 'Un majestuoso volcán sagrado con la cima siempre cubierta de nieve blanca, inmortalizado en miles de pinturas y versos.',
    },
    curiosity: {
      title: 'El Arte del Origami',
      emoji: '🕊️',
      fact: 'El milenario arte japonés de doblar una sola hoja de papel sin tijeras ni pegamento para crear figuras de grullas, flores y animales.',
    },
    trivia: {
      question: '¿Cómo se llama el tradicional arte japonés de crear figuras doblando papel?',
      options: ['Origami', 'Pintura al óleo', 'Escultura de arcilla'],
      correct: 0,
      explanation: '¡Perfecto! El origami transforma una simple hoja de papel en hermosas figuras.',
    },
  },
  {
    id: 'india',
    name: 'India',
    flag: '🇮🇳',
    continent: 'Asia',
    capital: 'Nueva Delhi',
    x: 69,
    y: 48,
    animal: {
      name: 'Tigre de Bengala',
      emoji: '🐯',
      fact: 'Las rayas de un tigre son únicas como las huellas dactilares humanas: ¡no existen dos tigres con el mismo patrón de rayas!',
    },
    landmark: {
      name: 'Taj Mahal',
      emoji: '🕌',
      fact: 'Un palacio de mármol blanco deslumbrante construido hace siglos que cambia de tono entre rosa, blanco y dorado según la luz del sol.',
    },
    curiosity: {
      title: 'Ajedrez e Indagación',
      emoji: '♟️',
      fact: '¡El juego del ajedrez se inventó en la India hace más de 1,500 años! Originalmente se llamaba Chaturanga.',
    },
    trivia: {
      question: '¿Qué famoso juego de estrategia de tablero se inventó originalmente en la India?',
      options: ['El Ajedrez', 'Los Videojuegos', 'El Dominó'],
      correct: 0,
      explanation: '¡Así es! El ajedrez nació en la India antigua como un juego de táctica y concentración.',
    },
  },
  {
    id: 'australia',
    name: 'Australia',
    flag: '🇦🇺',
    continent: 'Oceanía',
    capital: 'Camberra',
    x: 84,
    y: 73,
    animal: {
      name: 'Canguro Rojo',
      emoji: '🦘',
      fact: '¡Los canguros no pueden caminar hacia atrás! Las mamás canguro llevan a sus bebés en una bolsa frontal afelpada llamada marsupio.',
    },
    landmark: {
      name: 'Ópera de Sídney',
      emoji: '🎭',
      fact: 'Un emblemático edificio de teatro junto al mar cuyo techo parece velas blancas de barcos desplegadas al viento.',
    },
    curiosity: {
      title: 'La Gran Barrera de Coral',
      emoji: '🪸',
      fact: '¡Es la estructura viva más grande del planeta! Es un arrecife tan gigantesco que los astronautas pueden observarlo desde el espacio.',
    },
    trivia: {
      question: '¿Cómo se llama la bolsita afelpada donde las mamás canguro llevan a sus crías?',
      options: ['Marsupio', 'Mochila', 'Nido de plumas'],
      correct: 0,
      explanation: '¡Excelente! Los marsupiales cuidan a sus bebés dentro de su marsupio.',
    },
  },
  {
    id: 'noruega',
    name: 'Noruega',
    flag: '🇳🇴',
    continent: 'Europa',
    capital: 'Oslo',
    x: 49,
    y: 20,
    animal: {
      name: 'Reno del Ártico',
      emoji: '🦌',
      fact: 'En el duro invierno, los ojos de los renos cambian de color azul profundo para ayudarlos a ver en la penumbra del Polo Norte.',
    },
    landmark: {
      name: 'Fiordos Noruegos',
      emoji: '🏔️',
      fact: 'Profundos valles de agua cristalina rodeados por colosales montañas de roca moldeadas por glaciares durante la Era de Hielo.',
    },
    curiosity: {
      title: 'La Mágica Aurora Boreal',
      emoji: '🌌',
      fact: 'Luces danzantes de colores verde, violeta y rosa que iluminan el cielo nocturno polar cuando partículas del sol chocan con la atmósfera.',
    },
    trivia: {
      question: '¿Qué fenómeno natural de luces danzantes verdes e ilumina las noches de Noruega?',
      options: ['La Aurora Boreal', 'El Rayo Láser', 'Un Arcoíris de Fuego'],
      correct: 0,
      explanation: '¡Correcto! La aurora boreal crea un espectáculo cósmico brillante en el cielo.',
    },
  },
  {
    id: 'antartida',
    name: 'Antártida',
    flag: '🇦🇶',
    continent: 'Antártida',
    capital: 'Estación Amundsen-Scott',
    x: 55,
    y: 92,
    animal: {
      name: 'Pingüino Emperador',
      emoji: '🐧',
      fact: '¡Soportan fríos extremos de hasta -60°C! Los papás pingüino cuidan el huevo sobre sus patas acurrucados en grandes círculos para darse calor.',
    },
    landmark: {
      name: 'El Polo Sur Geográfico',
      emoji: '🧊',
      fact: 'El continente más frío, ventoso y helado de la Tierra. Está cubierto por una gruesa capa de hielo de más de 2,000 metros de espesor.',
    },
    curiosity: {
      title: 'El Tesoro del Agua Dulce',
      emoji: '❄️',
      fact: '¡La Antártida contiene el 70% de toda el agua dulce del planeta Tierra en forma de gigantescos glaciares congelados!',
    },
    trivia: {
      question: '¿Cómo hacen los pingüinos emperador para resistir vientos helados de -60°C?',
      options: ['Toman chocolate caliente', 'Se acurrucan juntos en grandes grupos apretados', 'Vuelan a la playa tropical'],
      correct: 1,
      explanation: '¡Así es! Se juntan en piña apretada rotando continuamente para que todos se mantengan abrigados.',
    },
  },
];

interface WorldMapCuriositiesProps {
  onAddPoints: (points: number) => void;
  onUnlockBadge: (badgeId: string) => void;
}

export const WorldMapCuriosities: React.FC<WorldMapCuriositiesProps> = ({
  onAddPoints,
  onUnlockBadge,
}) => {
  const [selectedContinent, setSelectedContinent] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [activeTab, setActiveTab] = useState<'animal' | 'landmark' | 'curiosity' | 'trivia'>('animal');
  
  // Visited countries for passport
  const [visitedCountryIds, setVisitedCountryIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('enigmakids_visited_countries');
      return saved ? JSON.parse(saved) : ['mexico'];
    } catch (e) {
      return ['mexico'];
    }
  });

  // Trivia state per selected country
  const [userTriviaAnswer, setUserTriviaAnswer] = useState<number | null>(null);
  const [showTriviaFeedback, setShowTriviaFeedback] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiStory, setAiStory] = useState<string | null>(null);
  const [showPassportModal, setShowPassportModal] = useState<boolean>(false);

  // Filter countries
  const filteredCountries = COUNTRIES_DATA.filter((country) => {
    const matchesContinent = selectedContinent === 'Todos' || country.continent === selectedContinent;
    const matchesSearch =
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.landmark.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.curiosity.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesContinent && matchesSearch;
  });

  const handleSelectCountry = (country: CountryData) => {
    sounds.playClick();
    setSelectedCountry(country);
    setActiveTab('animal');
    setUserTriviaAnswer(null);
    setShowTriviaFeedback(false);
    setAiStory(null);

    // Track in passport
    if (!visitedCountryIds.includes(country.id)) {
      const updated = [...visitedCountryIds, country.id];
      setVisitedCountryIds(updated);
      localStorage.setItem('enigmakids_visited_countries', JSON.stringify(updated));

      // Unlock explorer badge if visited 5 countries
      if (updated.length >= 5) {
        onUnlockBadge('world_explorer');
      }
    }

    // Auto-read welcome fact
    sounds.speak(`¡Bienvenido a ${country.name}! En el continente de ${country.continent}. Su animal representativo es el ${country.animal.name}.`);
  };

  const speakCurrentFact = () => {
    if (!selectedCountry) return;
    let text = '';
    if (activeTab === 'animal') {
      text = `Animal de ${selectedCountry.name}: ${selectedCountry.animal.name}. ${selectedCountry.animal.fact}`;
    } else if (activeTab === 'landmark') {
      text = `Monumento de ${selectedCountry.name}: ${selectedCountry.landmark.name}. ${selectedCountry.landmark.fact}`;
    } else if (activeTab === 'curiosity') {
      text = `Dato curioso de ${selectedCountry.name}: ${selectedCountry.curiosity.title}. ${selectedCountry.curiosity.fact}`;
    } else if (activeTab === 'trivia') {
      text = `Pregunta de trivia de ${selectedCountry.name}: ${selectedCountry.trivia.question}`;
    }
    sounds.speak(text);
  };

  const handleRandomTrip = () => {
    sounds.playLevelUp();
    const randomIndex = Math.floor(Math.random() * COUNTRIES_DATA.length);
    const randomCountry = COUNTRIES_DATA[randomIndex];
    handleSelectCountry(randomCountry);
  };

  const handleTriviaOptionClick = (optionIdx: number) => {
    if (!selectedCountry || showTriviaFeedback) return;
    setUserTriviaAnswer(optionIdx);
    setShowTriviaFeedback(true);

    if (optionIdx === selectedCountry.trivia.correct) {
      sounds.playCorrect();
      onAddPoints(15);
      sounds.speak(`¡Excelente respuesta correcta! Ganaste 15 puntos de sabiduría. ${selectedCountry.trivia.explanation}`);
    } else {
      sounds.playIncorrect();
      sounds.speak(`¡Casi lo logras amiguito! La respuesta correcta era: ${selectedCountry.trivia.options[selectedCountry.trivia.correct]}. ${selectedCountry.trivia.explanation}`);
    }
  };

  const handleAskOllieAI = async () => {
    if (!selectedCountry) return;
    setIsAiLoading(true);
    setAiStory(null);
    sounds.playClick();
    sounds.speak(`Consultando a Sabihondo sobre los grandes secretos de ${selectedCountry.name}...`);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Cuéntame un secreto súper divertido, corto y mágico sobre el país de ${selectedCountry.name} para un niño de primaria. Menciona algo único.`,
          currentSubject: 'philosophy_curiosities',
        }),
      });

      const data = await res.json();
      if (data && data.text) {
        setAiStory(data.text);
        sounds.speak(data.text);
      } else {
        setAiStory(`¡${selectedCountry.name} es un país extraordinario lleno de historia, selvas y castillos increibles!`);
      }
    } catch (err) {
      setAiStory(`¡${selectedCountry.name} tiene paisajes espectaculares que inspiran a todos los exploradores!`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-4 border-teal-300 p-5 md:p-8 max-w-5xl mx-auto overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-tr from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl shadow-md border-2 border-white shrink-0">
            🗺️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-teal-950">Mapa Interactivo del Mundo</h2>
              <span className="bg-teal-100 text-teal-800 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border border-teal-300">
                Rincón de Curiosidades
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              ¡Haz clic en los países para descubrir animales, monumentos y resolver trivias fantásticas!
            </p>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Random Trip Button */}
          <button
            id="btn-random-country-trip"
            onClick={handleRandomTrip}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-yellow-950 font-black text-xs md:text-sm px-4 py-2.5 rounded-2xl shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
            title="Elegir un país al azar"
          >
            <Sparkles className="w-4 h-4 fill-yellow-950" />
            <span>🎲 ¡Viaje Sorpresa!</span>
          </button>

          {/* Explorer Passport Modal Button */}
          <button
            id="btn-open-passport"
            onClick={() => {
              sounds.playClick();
              setShowPassportModal(true);
            }}
            className="flex items-center gap-2 bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 text-teal-900 font-black text-xs md:text-sm px-4 py-2.5 rounded-2xl shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <span>🛂 Pasaporte</span>
            <span className="bg-teal-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full">
              {visitedCountryIds.length}/{COUNTRIES_DATA.length}
            </span>
          </button>
        </div>
      </div>

      {/* CONTINENT FILTERS & SEARCH BAR */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-wrap gap-1.5 items-center justify-between">
          
          {/* Continents pill bar */}
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
            {['Todos', 'América', 'Europa', 'África', 'Asia', 'Oceanía', 'Antártida'].map((cont) => {
              const icons: Record<string, string> = {
                Todos: '🌍',
                América: '🌎',
                Europa: '🏰',
                África: '🦁',
                Asia: '⛩️',
                Oceanía: '🦘',
                Antártida: '🐧',
              };
              const isSelected = selectedContinent === cont;
              return (
                <button
                  key={cont}
                  id={`btn-continent-${cont}`}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedContinent(cont);
                  }}
                  className={`py-1.5 px-3 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-700 shadow-sm scale-105'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-teal-50 hover:text-teal-800'
                  }`}
                >
                  <span>{icons[cont]}</span>
                  <span>{cont}</span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar país, animal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* GRAPHICAL WORLD MAP SVG CANVAS CONTAINER */}
      <div className="relative bg-gradient-to-b from-sky-100 via-sky-50 to-blue-100 rounded-3xl border-4 border-sky-200 p-4 min-h-[380px] md:min-h-[440px] shadow-inner overflow-hidden select-none">
        
        {/* Ocean animations background details */}
        <div className="absolute top-4 left-6 text-2xl opacity-40 animate-pulse">⛵</div>
        <div className="absolute bottom-6 right-12 text-3xl opacity-40 animate-bounce">🐋</div>
        <div className="absolute top-12 right-24 text-xl opacity-30">☁️</div>
        <div className="absolute bottom-16 left-20 text-xl opacity-30">☁️</div>
        
        {/* Compass Rose */}
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-1.5 rounded-full border border-sky-200 shadow-sm text-sky-800 text-xs font-black flex items-center gap-1">
          <Compass className="w-4 h-4 animate-spin-slow text-sky-600" />
          <span className="text-[10px]">N</span>
        </div>

        {/* SVG Continents Background Stylized Paths */}
        <svg viewBox="0 0 1000 500" className="w-full h-full min-h-[320px] drop-shadow-sm">
          {/* North America */}
          <path
            d="M 120,80 Q 180,60 260,90 Q 300,140 250,220 Q 180,240 130,180 Q 90,120 120,80 Z"
            fill="#C7D2FE"
            stroke="#818CF8"
            strokeWidth="3"
            className="transition-colors hover:fill-indigo-200"
          />
          {/* South America */}
          <path
            d="M 260,250 Q 340,260 380,340 Q 330,440 280,430 Q 240,350 260,250 Z"
            fill="#A7F3D0"
            stroke="#34D399"
            strokeWidth="3"
            className="transition-colors hover:fill-emerald-200"
          />
          {/* Europe */}
          <path
            d="M 430,90 Q 530,80 560,160 Q 480,200 440,160 Q 410,120 430,90 Z"
            fill="#FDE68A"
            stroke="#F59E0B"
            strokeWidth="3"
            className="transition-colors hover:fill-amber-200"
          />
          {/* Africa */}
          <path
            d="M 460,200 Q 580,190 620,290 Q 560,390 490,360 Q 440,280 460,200 Z"
            fill="#FED7AA"
            stroke="#F97316"
            strokeWidth="3"
            className="transition-colors hover:fill-orange-200"
          />
          {/* Asia */}
          <path
            d="M 570,70 Q 820,60 880,180 Q 820,280 660,260 Q 580,180 570,70 Z"
            fill="#FECDD3"
            stroke="#FB7185"
            strokeWidth="3"
            className="transition-colors hover:fill-rose-200"
          />
          {/* Oceania / Australia */}
          <path
            d="M 780,320 Q 890,310 900,390 Q 820,430 770,390 Z"
            fill="#DDD6FE"
            stroke="#A78BFA"
            strokeWidth="3"
            className="transition-colors hover:fill-purple-200"
          />
          {/* Antarctica */}
          <path
            d="M 150,470 L 880,470 Q 890,495 500,495 Z"
            fill="#E0F2FE"
            stroke="#38BDF8"
            strokeWidth="3"
            className="transition-colors hover:fill-sky-200"
          />
        </svg>

        {/* CLICKABLE COUNTRY PINS OVERLAY */}
        {filteredCountries.map((country) => {
          const isVisited = visitedCountryIds.includes(country.id);
          const isSelected = selectedCountry?.id === country.id;

          return (
            <div
              key={country.id}
              style={{ left: `${country.x}%`, top: `${country.y}%` }}
              onClick={() => handleSelectCountry(country)}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 group"
            >
              {/* Pulse Ring */}
              <div
                className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                  isSelected ? 'bg-amber-400' : isVisited ? 'bg-teal-400' : 'bg-sky-400'
                }`}
              />

              {/* Pin Bubble */}
              <motion.div
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                className={`relative flex items-center justify-center p-1.5 md:p-2 rounded-2xl shadow-lg border-2 transition-all ${
                  isSelected
                    ? 'bg-amber-400 border-amber-600 scale-125 z-20 ring-4 ring-amber-300/50'
                    : isVisited
                    ? 'bg-white border-teal-500'
                    : 'bg-white/90 border-slate-300 hover:border-teal-400'
                }`}
              >
                <span className="text-base md:text-xl leading-none">{country.flag}</span>
                
                {/* Stamp visited indicator checkmark */}
                {isVisited && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white text-[8px]">
                    ✓
                  </span>
                )}
              </motion.div>

              {/* Label Badge underneath */}
              <div
                className={`mt-1 whitespace-nowrap text-[10px] md:text-xs font-black px-2 py-0.5 rounded-full shadow-md border text-center transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white/95 text-slate-800 border-slate-200 group-hover:bg-teal-500 group-hover:text-white'
                }`}
              >
                {country.name} {country.animal.emoji}
              </div>
            </div>
          );
        })}

        {filteredCountries.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm p-6 text-center">
            <span className="text-4xl mb-2">🔍</span>
            <h4 className="font-black text-slate-700 text-base">No encontramos países con esa búsqueda</h4>
            <p className="text-xs text-slate-500 mt-1">Prueba seleccionando "Todos" los continentes o buscando otra palabra.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedContinent('Todos');
              }}
              className="mt-3 bg-teal-600 text-white font-black text-xs px-4 py-2 rounded-full shadow"
            >
              Ver todos los países
            </button>
          </div>
        )}
      </div>

      {/* QUICK COUNTRY CAROUSEL / SELECTOR TILES */}
      <div className="mt-5">
        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Explore todos los destinos ({filteredCountries.length}):</span>
          <span className="text-[10px] text-teal-700">Haz clic en cualquiera para abrir su ficha</span>
        </h4>

        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
          {filteredCountries.map((c) => {
            const isSelected = selectedCountry?.id === c.id;
            const isVisited = visitedCountryIds.includes(c.id);

            return (
              <button
                key={c.id}
                id={`btn-select-tile-${c.id}`}
                onClick={() => handleSelectCountry(c)}
                className={`py-2 px-3 rounded-2xl border-2 font-bold text-xs flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-md font-black scale-105'
                    : isVisited
                    ? 'bg-teal-50 border-teal-200 text-teal-900 hover:bg-teal-100'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-lg">{c.flag}</span>
                <span className="whitespace-nowrap">{c.name}</span>
                <span className="text-xs">{c.animal.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE COUNTRY DETAIL MODAL CARD */}
      <AnimatePresence>
        {selectedCountry && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border-4 border-amber-400 w-full max-w-2xl overflow-hidden relative my-8"
            >
              {/* Top Banner Header */}
              <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-5 md:p-6 text-white relative">
                
                {/* Close Button */}
                <button
                  id="btn-close-country-modal"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedCountry(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="text-5xl md:text-6xl bg-white/20 p-2 rounded-2xl shadow-inner border border-white/30 shrink-0">
                    {selectedCountry.flag}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-white text-orange-900 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                        {selectedCountry.continent}
                      </span>
                      <span className="text-xs font-bold text-orange-100">
                        Capital: {selectedCountry.capital}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mt-1 leading-tight">
                      {selectedCountry.name}
                    </h2>
                  </div>
                </div>

                {/* Sound Narrator Button */}
                <button
                  id="btn-speak-country-detail"
                  onClick={speakCurrentFact}
                  className="mt-4 flex items-center gap-2 bg-white text-amber-950 hover:bg-amber-50 font-black text-xs md:text-sm px-4 py-2 rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>Escuchar con Sabihondo 🔊</span>
                </button>
              </div>

              {/* TABS SWITCHER FOR COUNTRY DETAILS */}
              <div className="flex border-b border-slate-200 bg-slate-50">
                <button
                  id="tab-animal"
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('animal');
                  }}
                  className={`flex-1 py-3 px-2 text-center font-black text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'animal'
                      ? 'border-amber-500 text-amber-900 bg-white shadow-sm'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{selectedCountry.animal.emoji}</span>
                  <span>Animal Típico</span>
                </button>

                <button
                  id="tab-landmark"
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('landmark');
                  }}
                  className={`flex-1 py-3 px-2 text-center font-black text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'landmark'
                      ? 'border-amber-500 text-amber-900 bg-white shadow-sm'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{selectedCountry.landmark.emoji}</span>
                  <span>Monumento</span>
                </button>

                <button
                  id="tab-curiosity"
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('curiosity');
                  }}
                  className={`flex-1 py-3 px-2 text-center font-black text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'curiosity'
                      ? 'border-amber-500 text-amber-900 bg-white shadow-sm'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{selectedCountry.curiosity.emoji}</span>
                  <span>Dato Curioso</span>
                </button>

                <button
                  id="tab-trivia"
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('trivia');
                  }}
                  className={`flex-1 py-3 px-2 text-center font-black text-xs md:text-sm border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeTab === 'trivia'
                      ? 'border-amber-500 text-amber-900 bg-amber-100 text-amber-900 shadow-sm'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>🎮</span>
                  <span>Trivia (+15 XP)</span>
                </button>
              </div>

              {/* TAB CONTENT PANEL */}
              <div className="p-6">
                
                {/* TAB 1: ANIMAL */}
                {activeTab === 'animal' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                      <span className="text-5xl animate-bounce">{selectedCountry.animal.emoji}</span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">Fauna Típica</span>
                        <h3 className="text-xl font-black text-amber-950">{selectedCountry.animal.name}</h3>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-sm md:text-base text-slate-700 font-bold leading-relaxed">
                        "{selectedCountry.animal.fact}"
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: LANDMARK */}
                {activeTab === 'landmark' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center gap-4 bg-sky-50 border border-sky-200 p-4 rounded-2xl">
                      <span className="text-5xl animate-pulse">{selectedCountry.landmark.emoji}</span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 block">Maravilla & Monumento</span>
                        <h3 className="text-xl font-black text-sky-950">{selectedCountry.landmark.name}</h3>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-sm md:text-base text-slate-700 font-bold leading-relaxed">
                        "{selectedCountry.landmark.fact}"
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: CURIOSITY */}
                {activeTab === 'curiosity' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                      <span className="text-5xl">{selectedCountry.curiosity.emoji}</span>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Dato Asombroso</span>
                        <h3 className="text-xl font-black text-emerald-950">{selectedCountry.curiosity.title}</h3>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <p className="text-sm md:text-base text-slate-700 font-bold leading-relaxed">
                        "{selectedCountry.curiosity.fact}"
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* TAB 4: TRIVIA GAME */}
                {activeTab === 'trivia' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                      <span className="bg-amber-200 text-amber-900 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
                        Desafío de Sabiduría
                      </span>
                      <h4 className="text-base font-black text-amber-950 mt-1">
                        {selectedCountry.trivia.question}
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {selectedCountry.trivia.options.map((opt, idx) => {
                        let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50 hover:border-amber-300';
                        if (showTriviaFeedback) {
                          if (idx === selectedCountry.trivia.correct) {
                            btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-black shadow-md';
                          } else if (idx === userTriviaAnswer) {
                            btnStyle = 'bg-rose-500 border-rose-600 text-white font-black';
                          } else {
                            btnStyle = 'bg-slate-100 border-slate-200 text-slate-400 opacity-50';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={showTriviaFeedback}
                            onClick={() => handleTriviaOptionClick(idx)}
                            className={`w-full py-3 px-4 text-left font-bold text-xs md:text-sm rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {showTriviaFeedback && idx === selectedCountry.trivia.correct && (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {showTriviaFeedback && (
                      <div className="p-3 bg-amber-100 rounded-xl border border-amber-300 text-xs text-amber-950 font-bold">
                        💡 {selectedCountry.trivia.explanation}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* GEMINI AI ASSISTANT ASK OLLIE */}
                <div className="mt-6 pt-4 border-t border-slate-200">
                  {aiStory ? (
                    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl text-xs font-bold text-indigo-950 space-y-1">
                      <div className="flex items-center gap-1.5 text-indigo-700 font-black">
                        <Bot className="w-4 h-4 text-indigo-600" />
                        <span>Sabihondo el Búho dice:</span>
                      </div>
                      <p className="leading-relaxed text-slate-700">{aiStory}</p>
                    </div>
                  ) : (
                    <button
                      id="btn-ask-gemini-country"
                      disabled={isAiLoading}
                      onClick={handleAskOllieAI}
                      className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-900 font-black text-xs md:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Bot className="w-5 h-5 text-indigo-600" />
                      <span>
                        {isAiLoading ? 'Consultando a la mente del Búho...' : `🤖 Preguntar a Sabihondo más secretos de ${selectedCountry.name}`}
                      </span>
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPLORER PASSPORT MODAL */}
      <AnimatePresence>
        {showPassportModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-amber-900 text-amber-50 rounded-3xl p-6 max-w-lg w-full border-4 border-amber-600 shadow-2xl relative"
            >
              <button
                onClick={() => setShowPassportModal(false)}
                className="absolute top-4 right-4 p-2 bg-amber-800 hover:bg-amber-700 text-amber-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🛂</span>
                <div>
                  <h3 className="text-xl font-black text-yellow-300">Pasaporte de Explorador Enigmakids</h3>
                  <p className="text-xs text-amber-200 font-bold">Sellos coleccionados en tus viajes alrededor del mundo</p>
                </div>
              </div>

              <div className="bg-amber-950/80 p-4 rounded-2xl border border-amber-700/50 mb-4">
                <div className="flex justify-between text-xs font-black text-yellow-200 mb-1">
                  <span>Progreso de Exploración:</span>
                  <span>{visitedCountryIds.length} / {COUNTRIES_DATA.length} Países</span>
                </div>
                <div className="w-full h-3 bg-amber-900 rounded-full overflow-hidden border border-amber-700">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all duration-500"
                    style={{ width: `${(visitedCountryIds.length / COUNTRIES_DATA.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Stamps Grid */}
              <div className="grid grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {COUNTRIES_DATA.map((c) => {
                  const isVisited = visitedCountryIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        if (isVisited) {
                          setShowPassportModal(false);
                          handleSelectCountry(c);
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isVisited
                          ? 'bg-amber-800 border-yellow-500 text-white cursor-pointer hover:scale-105'
                          : 'bg-amber-950/40 border-amber-800/40 text-amber-600/50 grayscale'
                      }`}
                    >
                      <div className="text-2xl mb-0.5">{isVisited ? c.flag : '🔒'}</div>
                      <div className="text-[10px] font-black truncate">{c.name}</div>
                      {isVisited && <span className="text-[9px] text-yellow-300 block">✓ Visitado</span>}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-amber-800 text-center">
                <p className="text-[11px] text-amber-300 font-bold">
                  🌟 ¡Explora 5 países diferentes para desbloquear la medalla "Explorador del Mundo"!
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
