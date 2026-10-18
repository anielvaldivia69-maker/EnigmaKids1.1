/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { sounds } from '../utils/sound';
import { Palette, Paintbrush, Undo2, Trash2, Award, Sparkles, Check, Heart, Shield, Crown, Zap, Sun, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PaintingDrawingProps {
  onAddPoints: (points: number) => void;
  onUnlockBadge: (badgeId: string) => void;
}

interface ColoringCharacter {
  id: string;
  name: string;
  type: 'superhero' | 'princess' | 'animal';
  icon: string;
  desc: string;
  // State elements list for regional coloring
  regions: { id: string; name: string; defaultColor: string }[];
}

const PALETTE_COLORS = [
  { hex: '#EF4444', name: 'Rojo Radiante 🍎' },
  { hex: '#F97316', name: 'Naranja Fuego 🍊' },
  { hex: '#FCD34D', name: 'Amarillo Sol ☀️' },
  { hex: '#4ADE80', name: 'Verde Pradera 🌿' },
  { hex: '#06B6D4', name: 'Celeste Agua 🌊' },
  { hex: '#3B82F6', name: 'Azul Cósmico 🌌' },
  { hex: '#6366F1', name: 'Índigo Mágico 🔮' },
  { hex: '#8B5CF6', name: 'Púrpura Brujo 🍇' },
  { hex: '#EC4899', name: 'Rosa Princesa 🌸' },
  { hex: '#F472B6', name: 'Rosa Pastel 🧁' },
  { hex: '#B45309', name: 'Marrón Tierra 🪵' },
  { hex: '#1E293B', name: 'Negro Carbón 🖤' },
  { hex: '#F1F5F9', name: 'Blanco Nieve ❄️' },
  // Expanded crayons requested by user
  { hex: '#FFD700', name: 'Oro Radiante ✨' },
  { hex: '#94A3B8', name: 'Plata Brillante 🪄' },
  { hex: '#A7F3D0', name: 'Verde Menta 🍃' },
  { hex: '#FB7185', name: 'Coral Dulce 🪸' },
  { hex: '#F43F5E', name: 'Fresa Silvestre 🍓' },
  { hex: '#C084FC', name: 'Lavanda Enigma 🪻' },
  { hex: '#FEF08A', name: 'Limón Ácido 🍋' },
  { hex: '#0D9488', name: 'Jade Místico 💎' },
  { hex: '#D946EF', name: 'Magenta Destello 🎆' },
  { hex: '#10B981', name: 'Verde Sabana 🌲' },
  { hex: '#78350F', name: 'Chocolate Suave 🍫' },
  { hex: '#FFE4E6', name: 'Rosa Bebé 🍼' }
];

const TEMPLATES: ColoringCharacter[] = [
  {
    id: 'zorro',
    name: 'Zorrito Félix 🦊',
    type: 'animal',
    icon: '🦊',
    desc: 'Un lindo y juguetón zorro de cola esponjosa con hojas otoñales y hongos silvestres.',
    regions: [
      { id: 'background', name: 'Fondo del Bosque', defaultColor: '#FFFBEB' },
      { id: 'body', name: 'Pelaje del Zorrito', defaultColor: '#F97316' },
      { id: 'tail_tip', name: 'Punta de la Cola/Pecho', defaultColor: '#FFFFFF' },
      { id: 'cheeks', name: 'Mejillas Lindas', defaultColor: '#FFF7ED' },
      { id: 'leaves', name: 'Hojas de Otoño', defaultColor: '#FBBF24' },
      { id: 'mushrooms', name: 'Hongos Silvestres', defaultColor: '#EF4444' },
    ]
  },
  {
    id: 'mapache',
    name: 'Mapachito Miko 🦝',
    type: 'animal',
    icon: '🦝',
    desc: 'Un alegre mapache explorador jugando entre troncos, hojas verdes y ricas bellotas.',
    regions: [
      { id: 'background', name: 'Fondo de Naturaleza', defaultColor: '#ECFDF5' },
      { id: 'body', name: 'Cuerpo del Mapachito', defaultColor: '#94A3B8' },
      { id: 'mask', name: 'Antifaz Divertido', defaultColor: '#334155' },
      { id: 'stripes', name: 'Rayitas de la Cola', defaultColor: '#1E293B' },
      { id: 'acorns', name: 'Bellotas Crujientes', defaultColor: '#D97706' },
      { id: 'leaves', name: 'Hojas y Plantas', defaultColor: '#4ADE80' },
    ]
  },
  {
    id: 'ciervo',
    name: 'Ciervito Bambi 🦌',
    type: 'animal',
    icon: '🦌',
    desc: 'Un tierno ciervo saltando en el prado con hermosas flores silvestres y mariposas.',
    regions: [
      { id: 'background', name: 'Prado Radiante', defaultColor: '#FEF3C7' },
      { id: 'body', name: 'Pelaje del Ciervito', defaultColor: '#D97706' },
      { id: 'belly', name: 'Pancita del Clavel', defaultColor: '#FFFBEB' },
      { id: 'spots', name: 'Manchitas del Lomo', defaultColor: '#FAFAFA' },
      { id: 'horns', name: 'Cuernos Pequeños', defaultColor: '#B45309' },
      { id: 'flowers', name: 'Flores y Mariposas', defaultColor: '#EC4899' },
    ]
  },
  {
    id: 'conejo',
    name: 'Conejito Copito 🐰',
    type: 'animal',
    icon: '🐰',
    desc: 'Un sonriente conejito blanco en su huerto lleno de deliciosas zanahorias y césped verde.',
    regions: [
      { id: 'background', name: 'Día de Huerto', defaultColor: '#F0FDF4' },
      { id: 'body', name: 'Pelaje de Copito', defaultColor: '#F1F5F9' },
      { id: 'inner_ears', name: 'Interior de Orejas', defaultColor: '#FBCFE8' },
      { id: 'carrots', name: 'Zanahorias de Tierra', defaultColor: '#F97316' },
      { id: 'foliage', name: 'Hojas de Zanahoria', defaultColor: '#22C55E' },
      { id: 'flowers', name: 'Flores de Campo', defaultColor: '#C084FC' },
    ]
  },
  {
    id: 'erizo',
    name: 'Erizito Spiky 🦔',
    type: 'animal',
    icon: '🦔',
    desc: 'Un pequeño erizo cargando una manzana roja sobre sus suaves espinas del bosque.',
    regions: [
      { id: 'background', name: 'Claro del Bosque', defaultColor: '#EEF2F6' },
      { id: 'body', name: 'Carita y Patitas', defaultColor: '#FDE047' },
      { id: 'quills', name: 'Púas del Erizito', defaultColor: '#78350F' },
      { id: 'apple', name: 'Manzana de Campo', defaultColor: '#F43F5E' },
      { id: 'mushrooms', name: 'Setas Silvestres', defaultColor: '#FB7185' },
      { id: 'foliage', name: 'Césped y Hojas', defaultColor: '#4ADE80' },
    ]
  },
  {
    id: 'ardilla',
    name: 'Ardillita Nutty 🐿️',
    type: 'animal',
    icon: '🐿️',
    desc: 'Una ardilla muy ágil que sostiene una gran bellota bajo una rama llena de piñas.',
    regions: [
      { id: 'background', name: 'Ramas del Bosque', defaultColor: '#F5F3FF' },
      { id: 'body', name: 'Cuerpo de Ardilla', defaultColor: '#EA580C' },
      { id: 'tail', name: 'Cola Esponjosa', defaultColor: '#B45309' },
      { id: 'acorn', name: 'Bellota Gigante', defaultColor: '#D97706' },
      { id: 'pinecone', name: 'Piñas de Árbol', defaultColor: '#78350F' },
      { id: 'leaves', name: 'Hojas de Pino', defaultColor: '#10B981' },
    ]
  },
  {
    id: 'pajarito',
    name: 'Pajarito Cantarín 🐦',
    type: 'animal',
    icon: '🐦',
    desc: 'Un dulce pajarito que canta alegre en su nido rodeado de flores de primavera.',
    regions: [
      { id: 'background', name: 'Cielo de Primavera', defaultColor: '#E0F2FE' },
      { id: 'body', name: 'Plumas del Ave', defaultColor: '#3B82F6' },
      { id: 'wings', name: 'Alitas del Aire', defaultColor: '#6366F1' },
      { id: 'nest', name: 'Nido Calientito', defaultColor: '#B45309' },
      { id: 'flowers', name: 'Flores y Hojitas', defaultColor: '#F472B6' },
      { id: 'butterflies', name: 'Lindas Mariposas', defaultColor: '#FFD700' },
    ]
  },
  {
    id: 'osito',
    name: 'Osito Meloso 🐻',
    type: 'animal',
    icon: '🐻',
    desc: 'Un osito pardo abrazando su tarro de miel mientras hermosas abejitas revolotean.',
    regions: [
      { id: 'background', name: 'Cangilón del Río', defaultColor: '#ECFDF5' },
      { id: 'body', name: 'Pelaje de Osito', defaultColor: '#78350F' },
      { id: 'snout', name: 'Hocico Suave', defaultColor: '#FED7AA' },
      { id: 'honey_pot', name: 'Tarro de Miel', defaultColor: '#FCD34D' },
      { id: 'bees', name: 'Abejas Amistosas', defaultColor: '#FFD700' },
      { id: 'rocks', name: 'Piedras y Plantas', defaultColor: '#94A3B8' },
    ]
  },
  {
    id: 'blank',
    name: 'Libro en Blanco 📖',
    type: 'animal',
    icon: '📖',
    desc: '¡Un lienzo mágico totalmente en blanco! Elige tus mejores crayones y pinceles para dibujar lo que tú quieras.',
    regions: [
      { id: 'background', name: 'Color del Lienzo', defaultColor: '#FFFFFF' }
    ]
  }
];

export const PaintingDrawing: React.FC<PaintingDrawingProps> = ({ onAddPoints, onUnlockBadge }) => {
  const [activeTab, setActiveTab] = useState<'fill' | 'canvas'>('canvas');
  const [selectedTemplate, setSelectedTemplate] = useState<ColoringCharacter>(TEMPLATES[0]);
  const [selectedColor, setSelectedColor] = useState<string>('#FCD34D'); // Default yellow
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState<boolean>(false);
  
  // Custom states for SVG Tap-to-Fill coloring
  const [filledColors, setFilledColors] = useState<{ [templateId: string]: { [regionId: string]: string } }>({
    zorro: {},
    mapache: {},
    ciervo: {},
    conejo: {},
    erizo: {},
    ardilla: {},
    pajarito: {},
    osito: {},
    blank: {},
  });

  // Canvas drawing properties
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(8);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [hasDrawnOnCanvas, setHasDrawnOnCanvas] = useState<boolean>(false);

  // Triggered when clicking a region in Tap-to-Fill
  const handleRegionClick = (regionId: string) => {
    sounds.playClick();
    const currentTemplateId = selectedTemplate.id;
    setFilledColors(prev => ({
      ...prev,
      [currentTemplateId]: {
        ...prev[currentTemplateId],
        [regionId]: selectedColor,
      }
    }));
  };

  const getRegionColor = (regionId: string, defaultColor: string) => {
    // Return child's selected color, or fall back to '#FFFFFF' for a black-and-white coloring book style!
    return filledColors[selectedTemplate.id]?.[regionId] || '#FFFFFF';
  };

  // Canvas context setups
  const getCanvasContext = () => {
    if (!canvasRef.current) return null;
    return canvasRef.current.getContext('2d');
  };

  // Safe canvas clearing
  const handleClearCanvas = () => {
    sounds.playClick();
    const ctx = getCanvasContext();
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasDrawnOnCanvas(false);
  };

  // Start Drawing (Mouse or Touch)
  const startDrawingPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCanvasContext();
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawnOnCanvas(true);
    
    // Get correct coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#FFFFFF' : selectedColor;
  };

  // Drawing mouse moves
  const drawLine = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCanvasContext();
    if (!ctx) return;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      // Prevent scrolling while drawing on mobile
      if (e.cancelable) e.preventDefault();
    }

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Save Artwork Action
  const handleSaveArtwork = () => {
    sounds.playLevelUp();
    onAddPoints(30);
    onUnlockBadge('paint_da_vinci');
    sounds.speak(`¡Excelente! Qué dibujo tan maravilloso y lleno de magia. Has guardado tu obra: ${selectedTemplate.name}. ¡Has ganado la medalla de Pequeño Da Vinci!`);
    setIsSavedSuccessfully(true);
  };

  // Change character template
  const handleTemplateChange = (tmpl: ColoringCharacter) => {
    sounds.playClick();
    setSelectedTemplate(tmpl);
    sounds.speak(`Vamos a pintar a ${tmpl.name}. ${tmpl.desc}`);
    
    // Clear canvas when switching template
    if (activeTab === 'canvas') {
      setTimeout(() => {
        handleClearCanvas();
      }, 50);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-4 border-pink-300 p-6 md:p-8 max-w-4xl mx-auto relative overflow-hidden">
      
      {/* Decorative floating bubbles */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 text-pink-200/20 w-36 h-36 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="40" />
        </svg>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-4 border-b-2 border-slate-100">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-black text-pink-900 flex items-center justify-center md:justify-start gap-2">
            <span>🎨 Taller de Colección Silvestre</span>
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-widest font-black animate-pulse">Bosque</span>
          </h2>
          <div className="mt-2 text-xs text-slate-600 bg-emerald-50/70 border border-emerald-100 p-3 rounded-2xl max-w-2xl text-left leading-relaxed shadow-xs">
            <p className="font-extrabold text-emerald-800 mb-1">🌲 Inspiración: Animales Adorables del Bosque y la Naturaleza</p>
            <p className="text-[11px] text-slate-500">
              Colección de ilustraciones infantiles sencillas, amigables y educativas para niños de 3 a 8 años. 
              Personajes kawaii y originales con formas redondeadas, expresiones tiernas y trazos limpios en blanco y negro, 
              enriquecidos con árboles, hojas, bellotas, hongos silvestres, zanahorias, flores y césped del prado.
            </p>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-emerald-700 font-bold">
              <span>✍️ Contornos gruesos y definidos</span>
              <span>⚪ Sin sombreado ni colores complejos</span>
              <span>🎨 Espacios muy amplios</span>
              <span>✨ Calidad profesional</span>
            </div>
          </div>
        </div>

        {/* Active mode indicator */}
        <div className="bg-pink-50 border border-pink-100 px-4 py-2 rounded-2xl flex items-center gap-2 shrink-0">
          <Paintbrush className="w-4 h-4 text-pink-500 animate-pulse" />
          <span className="text-xs font-black text-pink-700">Pincel de Brillo 🖌️</span>
        </div>
      </div>

      {/* Main interactive grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Template selector and color crayons palette - Size 4 */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Character selection category */}
          <div className="bg-pink-50/50 rounded-2xl border-2 border-pink-100 p-3.5">
            <h3 className="text-xs font-extrabold uppercase text-pink-700 tracking-wider mb-2.5 flex items-center gap-1">
              🎨 Elige tu Dibujo o Actividad:
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {TEMPLATES.map((tmpl) => (
                <button
                   key={tmpl.id}
                   id={`btn-select-template-${tmpl.id}`}
                   onClick={() => handleTemplateChange(tmpl)}
                   className={`p-2.5 rounded-xl border-2 text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                     selectedTemplate.id === tmpl.id
                       ? 'bg-pink-500 border-pink-600 text-white scale-102 shadow-sm'
                       : 'bg-white border-slate-100 hover:border-pink-300 text-slate-700'
                   }`}
                >
                  <span className="text-2xl bg-white/20 p-1.5 rounded-xl block shrink-0">{tmpl.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-black tracking-wider opacity-90 leading-none text-pink-250">
                      {tmpl.id === 'blank' ? '✨ Crear Libre' : '🐾 Animalito'}
                    </p>
                    <p className="text-xs font-black truncate mt-0.5">{tmpl.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color crayon selector */}
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
            <h3 className="text-xs font-extrabold uppercase text-indigo-950 tracking-wider mb-3 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-pink-500 animate-bounce" />
              <span>Caja de Crayones Mágicos:</span>
            </h3>

            {/* Quick selected preview */}
            <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-white rounded-xl border border-slate-100 shadow-inner">
              <div
                className="w-8 h-8 rounded-full border-2 border-slate-200 shrink-0"
                style={{ backgroundColor: selectedColor }}
              />
              <div className="min-w-0">
                <span className="text-[9px] uppercase font-black text-slate-400 block leading-none">Crayon activo</span>
                <span className="text-xs font-black text-slate-700 truncate block">
                  {PALETTE_COLORS.find(c => c.hex === selectedColor)?.name || 'Crayón Personalizado'}
                </span>
              </div>
            </div>

            {/* Colors list */}
            <div className="grid grid-cols-5 gap-2 justify-center">
              {PALETTE_COLORS.map((col, idx) => (
                <button
                  key={idx}
                  id={`crayon-color-${idx}`}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedColor(col.hex);
                    setIsEraser(false);
                    sounds.speak(`Elegiste el color ${col.name.split(' ')[0]}`);
                  }}
                  className={`w-9 h-9 rounded-full border-b-4 border-2 shadow flex items-center justify-center transition-all hover:scale-115 active:scale-95 cursor-pointer relative ${
                    selectedColor === col.hex && !isEraser
                      ? 'scale-110 ring-4 ring-pink-400 ring-offset-1'
                      : ''
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                >
                  {selectedColor === col.hex && !isEraser && (
                    <Check className={`w-4 h-4 ${col.hex === '#F1F5F9' || col.hex === '#FBBF24' ? 'text-slate-800' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>

            {/* Brush size controller & eraser toggles for Canvas mode only */}
            {activeTab === 'canvas' && (
              <div className="mt-4 pt-3.5 border-t border-slate-200/60 space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Grosor de pincel</span>
                  <span className="text-xs font-black text-slate-700">{brushSize}px</span>
                </div>
                <input
                  id="range-brush-size"
                  type="range"
                  min="4"
                  max="24"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full accent-pink-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />

                {/* Brush select style type buttons */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block text-left">Tipo de pincel:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      id="btn-brush-pencil"
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setBrushSize(4);
                        setIsEraser(false);
                        sounds.speak('Elegiste Lápiz Fino para trazos delgados ✏️');
                      }}
                      className={`py-2 px-1 rounded-xl border-2 text-[10px] font-black flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        brushSize <= 6 && !isEraser
                          ? 'bg-pink-500 border-pink-600 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="text-lg">✏️</span>
                      <span>Lápiz Fino</span>
                    </button>
                    <button
                      id="btn-brush-standard"
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setBrushSize(12);
                        setIsEraser(false);
                        sounds.speak('Elegiste Pincel Mágico para pintar brillante ✨');
                      }}
                      className={`py-2 px-1 rounded-xl border-2 text-[10px] font-black flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        brushSize > 6 && brushSize <= 16 && !isEraser
                          ? 'bg-pink-500 border-pink-600 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="text-lg">✨</span>
                      <span>Pincel Mágico</span>
                    </button>
                    <button
                      id="btn-brush-marker"
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setBrushSize(22);
                        setIsEraser(false);
                        sounds.speak('Elegiste Súper Marcador para trazar grueso 🖍️');
                      }}
                      className={`py-2 px-1 rounded-xl border-2 text-[10px] font-black flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        brushSize > 16 && !isEraser
                          ? 'bg-pink-500 border-pink-600 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="text-lg">🖍️</span>
                      <span>Marcador</span>
                    </button>
                  </div>
                </div>

                {/* Eraser */}
                <button
                  id="btn-eraser-canvas"
                  onClick={() => {
                    sounds.playClick();
                    setIsEraser(!isEraser);
                    sounds.speak(isEraser ? 'Volviendo a pincel' : 'Borrador activo. Toca las zonas para borrar tus trazos.');
                  }}
                  className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
                    isEraser
                      ? 'bg-indigo-650 text-white border-indigo-700 shadow shadow-indigo-200'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isEraser ? '✨ ¡Usando Borrador!' : '🧼 Activar Borrador'}</span>
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Right column: Interactive Main Painting Board - Size 8 */}
        <div className="lg:col-span-8">

          {/* Rendering the active gameboard */}
          <div className="p-4 bg-slate-100 rounded-3xl border border-slate-200 relative overflow-hidden flex flex-col items-center">
            
            {/* Mode 1 - Click Region Coloring Vector */}
            {activeTab === 'fill' && (
              <div className="w-full flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#E11D48] mb-3.5 flex items-center gap-1 px-3 py-1 bg-white border border-rose-100 rounded-full animate-bounce">
                  <span>✨ ¡TOCA CADA REGIÓN O EL FONDO PARA COLOREAR!</span>
                </p>

                {/* Svg Board Area displaying animal based on vector models */}
                <div className="w-full max-w-[320px] aspect-square bg-white rounded-2xl border-2 border-slate-200 shadow-md p-4 relative flex items-center justify-center">
                  
                  {/* Outer gradient background zone bound to region color */}
                  <div
                    className="absolute inset-2.5 rounded-xl transition-all duration-300"
                    style={{ backgroundColor: getRegionColor('background', selectedTemplate.regions.find(r => r.id === 'background')?.defaultColor || '#FFF') }}
                    onClick={() => handleRegionClick('background')}
                    title="Click para dar color al fondo mágico."
                  />

                  {selectedTemplate.id === 'zorro' && (
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] z-10 select-none overflow-visible">
                      {/* Quiet and cozy forest floor with mushrooms and autumn leaves */}
                      <path d="M 5 88 Q 50 82 95 88" stroke="#1E293B" strokeWidth="2" fill="none" pointerEvents="none" />
                      
                      {/* Wild forest mushrooms */}
                      <path d="M 10 88 L 10 82" stroke="#1E293B" strokeWidth="2" fill="none" pointerEvents="none" />
                      <path d="M 6 82 C 6 74, 14 74, 14 82 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('mushrooms', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('mushrooms'); }} className="cursor-pointer" />
                      <circle cx="10" cy="78" r="1" fill="#1E293B" pointerEvents="none" />
                      
                      <path d="M 18 88 L 18 84" stroke="#1E293B" strokeWidth="2" fill="none" pointerEvents="none" />
                      <path d="M 15 84 C 15 78, 21 78, 21 84 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('mushrooms', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('mushrooms'); }} className="cursor-pointer" />

                      {/* Sweet Autumn Leaves on Ground */}
                      <path d="M 80 84 Q 85 76, 78 72 Q 72 78, 80 84 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('leaves', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('leaves'); }} className="cursor-pointer" />
                      <path d="M 85 82 Q 92 78, 86 70 Q 80 74, 85 82 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('leaves', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('leaves'); }} className="cursor-pointer" />

                      {/* Giant Fluffy Fox Tail (Rounded, curled safely around the bottom side) */}
                      <path d="M 62 68 C 76 68, 88 54, 88 40 C 88 32, 78 28, 70 36 C 62 44, 58 54, 58 64 C 58 72, 68 76, 76 76 C 88 76, 94 62, 94 56" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />
                      {/* Tail Tip (Classic big white fluffy tip) */}
                      <path d="M 78 28 C 84 28, 88 34, 88 40 C 88 44, 84 46, 78 40 C 74 36, 74 30, 78 28 Z" stroke="#1E293B" strokeWidth="2" strokeLinejoin="round" fill={getRegionColor('tail_tip', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('tail_tip'); }} className="cursor-pointer hover:opacity-95" />

                      {/* Chubby Sitting Fox Body */}
                      <path d="M 32 58 C 24 64, 28 84, 46 84 C 58 84, 62 72, 58 58 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />
                      
                      {/* Cute fluffy white chest/neck bib */}
                      <path d="M 36 50 C 36 50, 44 64, 48 50 C 52 64, 58 50, 58 50 C 58 58, 36 58, 36 50 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('tail_tip', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('tail_tip'); }} className="cursor-pointer hover:opacity-95" />

                      {/* Sweet Front Paws placed together (extremely cute!) */}
                      <path d="M 38 72 C 38 82, 43 84, 43 72" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />
                      <path d="M 47 72 C 47 82, 52 84, 52 72" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />

                      {/* Fox Head Structure and perky ears */}
                      {/* Left Big Ear with dark tips */}
                      <path d="M 32 30 C 24 16, 26 6, 36 14 Z" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />
                      <path d="M 29 20 C 25 12, 26 8, 32 12" stroke="#1E293B" strokeWidth="1.8" fill="#1E293B" pointerEvents="none" />
                      
                      {/* Right Big Ear with dark tips */}
                      <path d="M 56 28 C 64 12, 60 4, 52 14 Z" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />
                      <path d="M 59 18 C 62 10, 60 6, 55 10" stroke="#1E293B" strokeWidth="1.8" fill="#1E293B" pointerEvents="none" />

                      {/* Main rounded chubby Face with big fluffy cheeks */}
                      <path d="M 26 34 C 18 42, 28 50, 44 48 C 60 50, 70 42, 62 34 C 54 26, 34 26, 26 34 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />

                      {/* Cheeks region */}
                      <path d="M 27 38 C 22 44, 30 48, 36 44 C 38 42, 38 38, 36 36" stroke="#1E293B" strokeWidth="1.5" fill={getRegionColor('cheeks', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('cheeks'); }} className="cursor-pointer" />
                      <path d="M 61 38 C 66 44, 58 48, 52 44 C 50 42, 50 38, 52 36" stroke="#1E293B" strokeWidth="1.5" fill={getRegionColor('cheeks', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('cheeks'); }} className="cursor-pointer" />

                      {/* Sweet face details */}
                      {/* Closed happy winking left eye */}
                      <path d="M 33 34 C 35 37, 39 37, 41 34" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                      {/* Sparkling open right eye with shine */}
                      <circle cx="51" cy="33" r="3" fill="#1E293B" />
                      <circle cx="50" cy="31.8" r="0.9" fill="#FFFFFF" />
                      
                      {/* Tiny black button nose & smile */}
                      <ellipse cx="44" cy="40" rx="2" ry="1.2" fill="#1E293B" />
                      <path d="M 42 43 Q 44 45, 46 43" stroke="#1E293B" strokeWidth="1.2" fill="none" />
                    </svg>
                  )}

                  {selectedTemplate.id === 'mapache' && (
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] z-10 select-none overflow-visible">
                      {/* Cozy natural environment forest trees and autumn leaves */}
                      <path d="M 80 5 L 95 10 L 88 90" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('background', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('background'); }} className="cursor-pointer opacity-80" />
                      <path d="M 82 25 L 94 28" stroke="#1E293B" strokeWidth="1.5" fill="none" pointerEvents="none" />

                      {/* Sweet forest plants & leaves on left */}
                      <path d="M 5 65 C 5 65, 12 55, 16 62 C 20 69, 10 75, 10 75 Z" stroke="#1E293B" strokeWidth="1.8" fill={getRegionColor('leaves', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('leaves'); }} className="cursor-pointer" />
                      <path d="M 12 75 C 12 75, 18 68, 22 74 C 26 80, 18 84, 18 84 Z" stroke="#1E293B" strokeWidth="1.8" fill={getRegionColor('leaves', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('leaves'); }} className="cursor-pointer" />

                      {/* Crunchy Acorns on ground */}
                      <ellipse cx="30" cy="85" rx="5.5" ry="4" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('acorns', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('acorns'); }} className="cursor-pointer" />
                      <path d="M 24 84 Q 30 78, 36 84" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('acorns', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('acorns'); }} className="cursor-pointer" />

                      {/* Big Ringed Fluffy Tail (curled outward) */}
                      <path d="M 24 72 C 10 74, 4 58, 14 48 C 24 38, 32 54, 30 68" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />
                      {/* Tail stripes (Beautiful round stripes) */}
                      <path d="M 11 65 C 15 58, 21 60, 26 62" stroke="#1E293B" strokeWidth="2.5" fill="none" onClick={(e) => { e.stopPropagation(); handleRegionClick('stripes'); }} className="cursor-pointer" />
                      <path d="M 15 71 C 18 64, 23 66, 28 68" stroke="#1E293B" strokeWidth="2.5" fill="none" onClick={(e) => { e.stopPropagation(); handleRegionClick('stripes'); }} className="cursor-pointer" />

                      {/* Cozy Raccoon sitting body */}
                      <path d="M 34 52 C 28 58, 34 82, 54 82 C 68 82, 70 66, 62 52 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />
                      
                      {/* Paws holding a delicious acorn to chest */}
                      <ellipse cx="48" cy="62" rx="4" ry="3.2" stroke="#1E293B" strokeWidth="2.2" fill={getRegionColor('body', '#FFFFFF')} />
                      <ellipse cx="56" cy="62" rx="4" ry="3.2" stroke="#1E293B" strokeWidth="2.2" fill={getRegionColor('body', '#FFFFFF')} />
                      <path d="M 44 63 Q 52 58, 60 63 Z" stroke="#1E293B" strokeWidth="1.5" fill={getRegionColor('acorns', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('acorns'); }} className="cursor-pointer" />

                      {/* Head and Ears */}
                      <path d="M 37 24 L 28 8 L 44 18 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />
                      <path d="M 61 24 L 70 8 L 54 18 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />

                      {/* Happy Face circle */}
                      <circle cx="49" cy="36" r="15" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />
                      
                      {/* Beautiful Raccoon Bandito Mask */}
                      <path d="M 34 38 C 34 30, 64 30, 64 38 C 60 44, 38 44, 34 38 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('mask', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('mask'); }} className="cursor-pointer" />
                      
                      {/* Big Shining Eyes inside mask */}
                      <circle cx="43" cy="37" r="2.5" fill="#FFFFFF" />
                      <circle cx="43" cy="37" r="1.2" fill="#1E293B" />
                      <circle cx="55" cy="37" r="2.5" fill="#FFFFFF" />
                      <circle cx="55" cy="37" r="1.2" fill="#1E293B" />

                      {/* Snout with nose and mouth */}
                      <ellipse cx="49" cy="43" rx="3.5" ry="2.2" stroke="#1E293B" strokeWidth="1.5" fill="#FFFFFF" />
                      <circle cx="49" cy="41.8" r="1.2" fill="#1E293B" />
                    </svg>
                  )}

                  {selectedTemplate.id === 'ciervo' && (
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] z-10 select-none overflow-visible">
                      {/* Grass and field flowers landscape */}
                      <path d="M 5 90 Q 50 82 95 90" stroke="#1E293B" strokeWidth="2" fill="none" pointerEvents="none" />
                      
                      {/* Dainty Meadow flowers */}
                      <circle cx="16" cy="82" r="3" fill={getRegionColor('flowers', '#FFFFFF')} stroke="#1E293B" strokeWidth="1.5" onClick={(e) => { e.stopPropagation(); handleRegionClick('flowers'); }} className="cursor-pointer" />
                      <path d="M 13 82 Q 16 76, 19 82" stroke="#1E293B" strokeWidth="1.2" fill="none" />
                      
                      {/* Flitting Butterfly over back */}
                      <path d="M 78 20 C 78 14, 86 14, 84 22 C 82 24, 76 24, 78 20 Z" stroke="#1E293B" strokeWidth="1.5" fill={getRegionColor('flowers', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('flowers'); }} className="cursor-pointer" />
                      <path d="M 84 22 C 84 16, 92 16, 90 24 T 84 22 Z" stroke="#1E293B" strokeWidth="1.5" fill={getRegionColor('flowers', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('flowers'); }} className="cursor-pointer" />

                      {/* Sweet Deer standing slender legs (from top-left of reference image) */}
                      {/* Front standing leg */}
                      <rect x="36" y="66" width="5.5" height="21" rx="2" fill={getRegionColor('body', '#FFFFFF')} stroke="#1E293B" strokeWidth="2.2" onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />
                      {/* Front back leg */}
                      <rect x="44" y="66" width="5.5" height="19" rx="2" fill={getRegionColor('body', '#FFFFFF')} stroke="#1E293B" strokeWidth="2" onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer opacity-90" />
                      
                      {/* Back standing leg */}
                      <rect x="58" y="66" width="5.5" height="21" rx="2" fill={getRegionColor('body', '#FFFFFF')} stroke="#1E293B" strokeWidth="2.2" onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />
                      {/* Back hidden leg */}
                      <rect x="65" y="64" width="5.5" height="19" rx="2" fill={getRegionColor('body', '#FFFFFF')} stroke="#1E293B" strokeWidth="2" onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer opacity-90" />

                      {/* Sleek rounded body of deer */}
                      <path d="M 32 50 C 26 54, 30 72, 48 72 C 60 72, 74 68, 70 50 C 66 38, 48 44, 32 50 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />
                      
                      {/* Cream belly patch */}
                      <ellipse cx="48" cy="62" rx="10" ry="7" fill={getRegionColor('belly', '#FFFFFF')} stroke="#1E293B" strokeWidth="1.8" onClick={(e) => { e.stopPropagation(); handleRegionClick('belly'); }} className="cursor-pointer" />

                      {/* Little spots on lower back (extremely delicate and lovely) */}
                      <circle cx="58" cy="48" r="1.8" fill={getRegionColor('spots', '#FFFFFF')} stroke="#1E293B" strokeWidth="1" onClick={(e) => { e.stopPropagation(); handleRegionClick('spots'); }} className="cursor-pointer" />
                      <circle cx="63" cy="52" r="1.8" fill={getRegionColor('spots', '#FFFFFF')} stroke="#1E293B" strokeWidth="1" onClick={(e) => { e.stopPropagation(); handleRegionClick('spots'); }} className="cursor-pointer" />
                      <circle cx="56" cy="54" r="1.3" fill={getRegionColor('spots', '#FFFFFF')} stroke="#1E293B" strokeWidth="1" onClick={(e) => { e.stopPropagation(); handleRegionClick('spots'); }} className="cursor-pointer" />

                      {/* Slender elegant neck leading to head */}
                      <path d="M 28 52 L 32 32 L 40 36 L 36 54 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />

                      {/* Deer Head with perky sideways ears */}
                      <path d="M 28 32 C 16 32, 18 24, 28 26 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />
                      <path d="M 38 29 C 48 24, 44 18, 36 24 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />

                      {/* Small velvet antlers */}
                      <path d="M 28 22 Q 22 10, 26 12 Q 26 8, 30 14" stroke={getRegionColor('horns', '#FFFFFF')} strokeWidth="3" strokeLinecap="round" onClick={(e) => { e.stopPropagation(); handleRegionClick('horns'); }} className="cursor-pointer" />
                      <path d="M 34 22 Q 38 10, 34 12 Q 38 7, 39 14" stroke={getRegionColor('horns', '#FFFFFF')} strokeWidth="3" strokeLinecap="round" onClick={(e) => { e.stopPropagation(); handleRegionClick('horns'); }} className="cursor-pointer" />

                      {/* Sweet Deer face */}
                      <ellipse cx="30" cy="30" rx="9" ry="8" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />
                      
                      {/* Absolutely gorgeous large shining eyes with two gleam spots (from image) */}
                      <circle cx="28" cy="28" r="2.8" fill="#1E293B" />
                      <circle cx="27" cy="26.8" r="0.8" fill="#FFFFFF" />
                      <circle cx="28.8" cy="28.8" r="0.4" fill="#FFFFFF" />

                      {/* Tiny cute nose */}
                      <circle cx="21" cy="32" r="1.5" fill="#1E293B" />
                    </svg>
                  )}

                  {selectedTemplate.id === 'conejo' && (
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] z-10 select-none overflow-visible">
                      {/* Cozy garden backdrop with hills and fresh grass */}
                      <path d="M 5 88 Q 50 82 95 88" stroke="#1E293B" strokeWidth="2" fill="none" pointerEvents="none" />
                      
                      {/* Wild carrots growing in soil */}
                      <rect x="80" y="80" width="3" height="8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" />
                      <path d="M 76 80 Q 81 72, 87 80 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('carrots', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('carrots'); }} className="cursor-pointer" />

                      {/* Large Floppy Ears: Left fully upright, Right fully folded over like a cozy lop ear (from image!) */}
                      {/* Left upright ear */}
                      <path d="M 42 28 C 38 10, 48 8, 48 24 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />
                      <path d="M 43 24 C 40 14, 46 12, 46 22 Z" stroke="#1E293B" strokeWidth="1.5" fill={getRegionColor('inner_ears', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('inner_ears'); }} className="cursor-pointer" />

                      {/* Right folded/flopped ear */}
                      <path d="M 54 28 C 58 18, 70 18, 62 29 C 58 32, 54 30, 54 28 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />
                      <path d="M 57 28 C 60 22, 66 22, 61 28 Z" stroke="#1E293B" strokeWidth="1.5" fill={getRegionColor('inner_ears', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('inner_ears'); }} className="cursor-pointer" />

                      {/* Soft chubby round bunny head */}
                      <circle cx="49" cy="38" r="14" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />

                      {/* Cute cheek blushes and elements */}
                      <ellipse cx="40" cy="42" rx="2" ry="1.2" fill="#FB7185" className="opacity-45" />
                      <ellipse cx="58" cy="42" rx="2" ry="1.2" fill="#FB7185" className="opacity-45" />

                      {/* Shiny sweet round eyes */}
                      <circle cx="42" cy="35" r="2" fill="#1E293B" />
                      <circle cx="56" cy="35" r="2" fill="#1E293B" />
                      
                      {/* Triangle baby pink nose and smiling mouth */}
                      <polygon points="49,38 47,40 51,40" fill="#1E293B" />
                      <path d="M 46 43 Q 49 45, 52 43" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                      {/* Fluffy Bunny sitting Body */}
                      <path d="M 36 50 C 30 56, 32 82, 52 82 C 68 82, 70 64, 60 50 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />
                      
                      {/* Cute fluffy rabbit tail */}
                      <circle cx="32" cy="72" r="5" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />

                      {/* Feet placed together */}
                      <ellipse cx="44" cy="79" rx="5.5" ry="3.8" stroke="#1E293B" strokeWidth="2.2" fill={getRegionColor('body', '#FFFFFF')} />
                      <ellipse cx="56" cy="79" rx="5.5" ry="3.8" stroke="#1E293B" strokeWidth="2.2" fill={getRegionColor('body', '#FFFFFF')} />

                      {/* Clutching a giant fresh carrot in hands */}
                      <polygon points="60,54 82,72 74,48" stroke="#1E293B" strokeWidth="2.2" strokeLinejoin="round" fill={getRegionColor('carrots', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('carrots'); }} className="cursor-pointer" />
                      <path d="M 76 46 Q 86 40, 78 36 Q 72 40, 76 46 Z" stroke="#1E293B" strokeWidth="1.8" fill={getRegionColor('foliage', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('foliage'); }} className="cursor-pointer" />
                    </svg>
                  )}

                  {selectedTemplate.id === 'erizo' && (
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] z-10 select-none overflow-visible">
                      {/* Grass and woodland wildflowers */}
                      <path d="M 5 88 Q 50 82 95 88" stroke="#1E293B" strokeWidth="2" fill="none" pointerEvents="none" />
                      
                      {/* Tiny cute forest mushrooms next to hedgehog */}
                      <rect x="80" y="80" width="3" height="8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1.5" pointerEvents="none" />
                      <path d="M 76 80 Q 81 72, 87 80 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('mushrooms', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('mushrooms'); }} className="cursor-pointer" />

                      {/* Beautiful spiky rounded coat (delicate, child-safe thick spines) */}
                      <path d="M 24 64 C 10 50, 16 22, 44 20 C 68 18, 88 38, 80 66 C 74 74, 58 74, 44 72 C 34 70, 26 68, 24 64 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('quills', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('quills'); }} className="cursor-pointer hover:opacity-95" />
                      {/* Decorative outer spines sticking out */}
                      <path d="M 28 32 L 20 24 M 40 22 L 36 10 M 56 20 L 58 8 M 70 28 L 78 18 M 78 44 L 88 40" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                      {/* Sweet face peeking out from coat */}
                      <ellipse cx="38" cy="62" rx="14" ry="12" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />
                      
                      {/* Sweet expressions */}
                      <circle cx="32" cy="58" r="2" fill="#1E293B" />
                      <circle cx="44" cy="58" r="2" fill="#1E293B" />
                      <path d="M 36 67 Q 38 69, 41 67" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      <ellipse cx="24" cy="62" rx="2" ry="1.5" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('body', '#FFFFFF')} />

                      {/* Perfect, juicy red apple balancing on spines */}
                      <path d="M 52 24 C 46 18, 54 10, 58 14 C 62 10, 70 18, 64 24 C 60 26, 56 26, 52 24 Z" stroke="#1E293B" strokeWidth="2.2" fill={getRegionColor('apple', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('apple'); }} className="cursor-pointer" />
                      <path d="M 58 14 Q 60 6, 58 4" stroke="#1E293B" strokeWidth="1.5" fill="none" />
                      <path d="M 58 8 Q 64 6, 62 10 Z" stroke="#1E293B" strokeWidth="1" fill={getRegionColor('foliage', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('foliage'); }} />

                      {/* Soft pudgy hands */}
                      <ellipse cx="32" cy="74" rx="3.5" ry="2.2" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('body', '#FFFFFF')} />
                      <ellipse cx="46" cy="73" rx="3.5" ry="2.2" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('body', '#FFFFFF')} />
                    </svg>
                  )}

                  {selectedTemplate.id === 'ardilla' && (
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] z-10 select-none overflow-visible">
                      {/* Oak tree branch on which she sits */}
                      <path d="M 5 78 Q 42 74, 95 84 L 95 92 L 5 86 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('pinecone', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('pinecone'); }} className="cursor-pointer" />
                      
                      {/* Fresh oak pine leaves */}
                      <path d="M 78 72 L 86 64 M 84 74 L 92 68" stroke="#1E293B" strokeWidth="1.8" onClick={(e) => { e.stopPropagation(); handleRegionClick('leaves'); }} className="cursor-pointer" />

                      {/* Gigantic curved fluffy squirrel tail (from row 2 of reference image!) */}
                      <path d="M 38 72 C 14 74, -2 46, 12 28 C 24 12, 38 24, 34 46 C 30 56, 40 68, 38 72 Z" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" fill={getRegionColor('tail', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('tail'); }} className="cursor-pointer hover:opacity-95" />
                      <path d="M 18 42 C 16 48, 22 52, 24 46" stroke="#1E293B" strokeWidth="2" fill="none" pointerEvents="none" />

                      {/* Rounded squirrel body */}
                      <path d="M 38 52 C 34 58, 38 76, 56 74 C 68 72, 70 62, 60 52 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />

                      {/* Holding a giant delicious acorn */}
                      <ellipse cx="50" cy="62" rx="7.5" ry="6" stroke="#1E293B" strokeWidth="2.2" fill={getRegionColor('acorn', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('acorn'); }} className="cursor-pointer" />
                      <path d="M 42 60 Q 50 51, 58 60 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('pinecone', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('pinecone'); }} className="cursor-pointer" />

                      {/* Sweet head with perky upward ears */}
                      <path d="M 46 30 Q 42 12, 49 20 Z" stroke="#1E293B" strokeWidth="2.2" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} />
                      <path d="M 58 28 Q 62 14, 56 22 Z" stroke="#1E293B" strokeWidth="2.2" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} />

                      <ellipse cx="52" cy="38" rx="12" ry="11" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />
                      <circle cx="47" cy="36" r="2" fill="#1E293B" />
                      <circle cx="58" cy="36" r="2" fill="#1E293B" />
                      <path d="M 50 42 Q 52 44, 54 42" stroke="#1E293B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    </svg>
                  )}

                  {selectedTemplate.id === 'pajarito' && (
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] z-10 select-none overflow-visible">
                      {/* Twig branch */}
                      <path d="M 5 76 T 38 72 T 95 64" stroke="#1E293B" strokeWidth="2.5" fill="none" pointerEvents="none" />
                      
                      {/* Cozy twig basket nest */}
                      <path d="M 32 72 Q 50 88, 68 70 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('nest', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('nest'); }} className="cursor-pointer" />
                      <path d="M 38 75 Q 46 79, 58 74" stroke="#1E293B" strokeWidth="1.5" fill="none" pointerEvents="none" />

                      {/* Spring Butterflies in air */}
                      <path d="M 18 24 Q 14 16, 10 20 Q 14 26, 18 24 Z" stroke="#1E293B" strokeWidth="1.5" fill={getRegionColor('butterflies', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('butterflies'); }} className="cursor-pointer" />
                      
                      {/* Cherry flowers */}
                      <circle cx="82" cy="58" r="3.2" fill={getRegionColor('flowers', '#FFFFFF')} stroke="#1E293B" strokeWidth="1.5" onClick={(e) => { e.stopPropagation(); handleRegionClick('flowers'); }} className="cursor-pointer" />

                      {/* Chubby cheerful round bird */}
                      <path d="M 34 52 C 26 42, 44 24, 58 30 C 72 36, 76 54, 58 62 C 44 64, 38 58, 34 52 Z" stroke="#1E293B" strokeWidth="2.5" strokeLinejoin="round" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />
                      
                      {/* Flapping wings (heart shaped) */}
                      <path d="M 32 44 Q 18 36, 28 42 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('wings', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('wings'); }} className="cursor-pointer" />
                      <ellipse cx="56" cy="48" rx="8.5" ry="6" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('wings', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('wings'); }} className="cursor-pointer" />

                      {/* Singing open beak */}
                      <polygon points="62,44 70,41 68,48" stroke="#1E293B" strokeWidth="2" fill="#FFF" pointerEvents="none" />

                      <circle cx="48" cy="38" r="2.2" fill="#1E293B" />
                      <circle cx="60" cy="40" r="2.2" fill="#1E293B" />

                      {/* Feathery tail */}
                      <path d="M 38 58 L 24 64 L 28 70 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer" />
                    </svg>
                  )}

                  {selectedTemplate.id === 'osito' && (
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] z-10 select-none overflow-visible">
                      {/* River stones on the floor */}
                      <path d="M 5 90 Q 50 82, 95 90" stroke="#1E293B" strokeWidth="2" fill="none" pointerEvents="none" />
                      <ellipse cx="14" cy="86" rx="6.5" ry="4" fill={getRegionColor('rocks', '#FFFFFF')} stroke="#1E293B" strokeWidth="1.8" onClick={(e) => { e.stopPropagation(); handleRegionClick('rocks'); }} className="cursor-pointer" />
                      <ellipse cx="84" cy="85" rx="5.5" ry="3.8" fill={getRegionColor('rocks', '#FFFFFF')} stroke="#1E293B" strokeWidth="1.8" onClick={(e) => { e.stopPropagation(); handleRegionClick('rocks'); }} className="cursor-pointer" />

                      {/* Sweet happy bees */}
                      <ellipse cx="80" cy="24" rx="4.5" ry="3.2" fill={getRegionColor('bees', '#FFFFFF')} stroke="#1E293B" strokeWidth="1.5" onClick={(e) => { e.stopPropagation(); handleRegionClick('bees'); }} className="cursor-pointer" />
                      <path d="M 76 22 Q 80 14, 84 22 Z" stroke="#1E293B" strokeWidth="1" fill="#FFFFFF" pointerEvents="none" />

                      {/* Chubby sweet baby bear sitting down */}
                      <path d="M 34 52 C 26 58, 32 84, 52 82 C 66 80, 72 68, 62 52 Z" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />
                      
                      {/* Belly patch */}
                      <ellipse cx="48" cy="67" rx="11" ry="9" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('belly', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('belly'); }} className="cursor-pointer" />

                      {/* Sweet golden honey pot */}
                      <path d="M 60 62 C 58 56, 74 54, 72 68 C 70 76, 58 74, 60 62" stroke="#1E293B" strokeWidth="2.2" fill={getRegionColor('honey_pot', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('honey_pot'); }} className="cursor-pointer" />
                      <ellipse cx="66" cy="58" rx="6.2" ry="2.5" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('honey_pot', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('honey_pot'); }} className="cursor-pointer" />

                      {/* Bear Ears */}
                      <path d="M 40 22 C 34 14, 44 14, 42 24 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} />
                      <path d="M 58 21 C 64 12, 56 12, 58 22 Z" stroke="#1E293B" strokeWidth="2" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} />

                      <ellipse cx="50" cy="36" rx="14.5" ry="13" stroke="#1E293B" strokeWidth="2.5" fill={getRegionColor('body', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('body'); }} className="cursor-pointer hover:opacity-95" />
                      
                      <circle cx="44" cy="33" r="2.5" fill="#1E293B" />
                      <circle cx="56" cy="33" r="2.5" fill="#1E293B" />
                      
                      {/* Snout */}
                      <ellipse cx="50" cy="38" rx="5" ry="3.5" stroke="#1E293B" strokeWidth="1.5" fill={getRegionColor('snout', '#FFFFFF')} onClick={(e) => { e.stopPropagation(); handleRegionClick('snout'); }} className="cursor-pointer" />
                      <polygon points="50,37 48,35 52,35" fill="#1E293B" pointerEvents="none" />
                    </svg>
                  )}
                </div>

                {/* Reset template colorings */}
                <div className="mt-4 flex gap-2">
                  <button
                    id="btn-reset-svg-colors"
                    onClick={() => {
                      sounds.playClick();
                      const curId = selectedTemplate.id;
                      setFilledColors(prev => ({
                        ...prev,
                        [curId]: {},
                      }));
                      sounds.speak('Colores limpiados. ¡Vuelve a darle color a tu animalito!');
                    }}
                    className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 py-1.5 px-3 rounded-xl text-xs font-black shadow-xs cursor-pointer"
                  >
                    🧹 Reiniciar Colores
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2 - Freehand Painting Canvas */}
            {activeTab === 'canvas' && (
              <div className="w-full flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5] mb-3.5 flex items-center gap-1 px-3 py-1 bg-white border border-indigo-100 rounded-full">
                  <span>
                    {selectedTemplate.id === 'blank'
                      ? '🖌️ ¡PINTA Y DIBUJA LO QUE QUIERAS EN TU PÁGINA EN BLANCO!'
                      : '🖌️ TRACE CON SU MOUSE O DEDO SOBRE LA SILUETA GUÍA'}
                  </span>
                </p>

                {/* Drawing Box Frame with guide in backdrop */}
                <div className="relative bg-white rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden w-full max-w-[320px] aspect-square">
                  
                  {/* Backdrop stencil vector template shown in background for kids to paint/trace */}
                  <div className="absolute inset-0 opacity-[0.25] pointer-events-none flex items-center justify-center p-4 z-0">
                    <div className="text-center">
                      {selectedTemplate.id === 'blank' ? (
                        <div className="flex flex-col items-center animate-pulse">
                          <span className="text-7xl select-none">✨📖✨</span>
                          <p className="text-sm font-black text-pink-500 mt-2">✨ Libro en Blanco ✨</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">¡Dibuja cualquier sueño aquí!</p>
                        </div>
                      ) : (
                        <>
                          <span className="text-8xl select-none">{selectedTemplate.icon}</span>
                          <p className="text-lg font-black text-slate-400 mt-2">{selectedTemplate.name.split(' ')[0]}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* HTML Canvas Board for real brush drawing */}
                  <canvas
                    id="freehand-drawing-canvas"
                    ref={canvasRef}
                    width={320}
                    height={320}
                    className="relative z-10 block w-full h-full cursor-crosshair touch-none"
                    onMouseDown={startDrawingPosition}
                    onMouseMove={drawLine}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawingPosition}
                    onTouchMove={drawLine}
                    onTouchEnd={stopDrawing}
                  />

                </div>

                {/* Controls under Canvas */}
                <div className="mt-4 flex gap-3.5">
                  <button
                    id="btn-clean-entire-paint"
                    onClick={handleClearCanvas}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 font-black text-xs px-3.5 py-1.5 rounded-xl cursor-pointer shadow-xs transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Borrar Lienzo</span>
                  </button>
                </div>

              </div>
            )}

            {/* Complete Activity and earn points */}
            <div className="mt-6 w-full border-t border-slate-200/60 pt-4 flex flex-col items-center">
              <button
                id="btn-complete-and-award-artwork"
                onClick={handleSaveArtwork}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-sm px-7 py-3 rounded-full border-b-4 border-rose-750 shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 leading-none"
              >
                <Award className="w-5 h-5 text-yellow-300 animate-spin-pulse" />
                <span>⭐ ¡Completar y Guardar Mi Dibujo! (+30 XP)</span>
              </button>
              <p className="text-[10px] text-slate-400 font-extrabold mt-2 uppercase tracking-wide">
                ¡Guarda tu pintura para desbloquear el trofeo especial de mini artista Da Vinci!
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Dynamic Pro Advice Box */}
      <div className="mt-6 bg-pink-50 border-2 border-pink-100 rounded-2xl p-4 flex gap-3 items-start">
        <Sparkles className="w-5 h-5 text-pink-500 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <span className="text-[10px] uppercase font-black text-pink-500 tracking-wider block">Ollie de la Paleta dice:</span>
          <p className="text-xs font-bold text-pink-950 leading-relaxed">
            ¿Sabías que pintar animalitos con colores alegres como amarillo sol y turquesa estimula tu cerebro? Prueba a rellenar a {selectedTemplate.name} con crayón brillante o dibuja su silueta con el pincel libre. ¡Eeres un artista fantástico!
          </p>
        </div>
      </div>

      {/* Save Success Sparkle Modal */}
      <AnimatePresence>
        {isSavedSuccessfully && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border-4 border-pink-400 shadow-2xl text-center relative overflow-hidden"
            >
              {/* Confetti effect row */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-rose-500 to-yellow-400 animate-pulse" />
              
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-pink-300">
                <Sparkles className="w-8 h-8 text-pink-500" />
              </div>

              <h4 className="text-xl font-black text-indigo-950 mb-2">🎉 ¡Pintura Guardada!</h4>
              
              <p className="text-sm text-slate-600 font-bold mb-1 leading-relaxed">
                Has coloreado con éxito a:
              </p>
              
              <p className="text-lg font-black text-pink-600 mb-4 bg-pink-50 py-2 rounded-xl inline-block px-4">
                {selectedTemplate.name}
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-6 flex items-center justify-center gap-2">
                <span className="text-2xl">🎁</span>
                <div className="text-left">
                  <p className="text-[10px] uppercase font-black text-amber-600 leading-none">Puntos ganados</p>
                  <p className="text-sm font-black text-amber-900 mt-0.5">¡+30 puntos de artista y la medalla!</p>
                </div>
              </div>

              <button
                id="btn-close-saved-modal"
                onClick={() => {
                  sounds.playClick();
                  setIsSavedSuccessfully(false);
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 border-b-4 border-rose-700 text-white font-black py-3 rounded-2xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 hover:scale-103 active:scale-97"
              >
                <span>¡Súper, seguir pintando! 🐾</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

