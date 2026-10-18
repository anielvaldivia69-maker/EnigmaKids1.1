import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client to prevent startup failures on missing API keys
let aiClient: any = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in environment variables.');
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// REST Endpoint for Wise Owl Ollie AI Assistant
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    const { question, currentSubject } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'La pregunta es requerida y debe ser un texto.' });
    }

    const client = getGeminiClient();

    // Friendly local response as a backup if API key is not configured
    if (!client) {
      const backupTips: Record<string, string> = {
        math: '¡Hola amiguito! Practica sumas y restas para ganar puntos de sabiduría dorada. Intenta resolver los desafíos rápidos.',
        language: '📚 ¡Me encanta leer! Puedes jugar a ordenar letras, construir hermosas oraciones o leer en voz alta con el micrófono.',
        science: '🧪 ¡Hora de experimentar! Ve al laboratorio de ciencias y pon a prueba mezclas químicas fascinantes.',
        philosophy_curiosities: '💭 Como decía Sócrates: ¡solo sé que no sé nada! Reflexiona con paciencia las preguntas filosóficas.',
        classroom: '🏫 Bienvenido al Aula Virtual de repaso. Anota todo en la pizarra interactiva para repasar.',
        painting_drawing: '🎨 ¡Bienvenido al rincón artístico! Elige un superhéroe o una hermosa princesa para colorear con un toque o dibujar con el lápiz de brillo.',
        badges: '🏆 ¡Qué gran colección de medallas! Cumple los requisitos especiales para ganarlas todas.',
      };

      const tip = backupTips[currentSubject] || '¡Sigue jugando y aprendiendo de forma increíble!';
      return res.json({
        text: `¡Hola amiguito! Mi mente mágica inteligente está en modo local ahora (pídele a tu tutor configurar la clave GEMINI_API_KEY en Settings). Pero te doy este sabio consejo: ${tip}`,
        isLocalBackup: true,
      });
    }

    const systemInstruction = `
Eres Ollie, el Búho Sabio y amigable asistente de Enigmakids. 
Enigmakids es un sitio web educativo e interactivo para niños con juegos de matemáticas, lengua, ciencias naturales, filosofía y logros.

Las secciones actuales son:
1. "math" (Matemáticas Mágicas): Tiene retos para aprender a Sumar, Restar, Multiplicar y Dividir de forma divertida. Con niveles y puntuaciones.
2. "language" (Lengua y Literatura): Actividades como Sopa de Letras / Desorden de letras (Letter Scramble), Asociación de Conceptos (Concept Matching), Construir Oraciones (Sentences Block), Redacción Libre y Lectura en Voz Alta con reconocimiento de micrófono (Lectura Alaud).
3. "science" (Ciencias Sorpresa): El laboratorio del científico chiflado, experimentos simulados (por ejemplo, mezclas químicas de bicarbonato y vinagre, imanes, refracción de luz) con opciones locas y aprendizajes científicos.
4. "philosophy_curiosities" (Filosofía y Secretos): Diálogos hermosos de Sócrates en la Antigua Grecia, dilemas existenciales infantiles muy tiernos y respuestas para ganar medallas.
5. "classroom" (Aula Virtual): Un salón de clases con notas, para leer, escribir en pizarra y tutorías donde se pueden repasar materias.
6. "painting_drawing" (Taller de Pintar y Dibujar): Un rincón creativo donde los niños pueden colorear personajes de superhéroes y princesas (ej. Capitán Relámpago, Princesa Kiara) usando el coloreado táctil inteligente o dibujando libremente sobre bocetos translúcidos con el pincel de brillo.
7. "badges" (Sala de Medallas / Trofeos): Donde se exponen las medallas ganadas (como "Pequeño Pitágoras", "Pequeño Da Vinci", "Científico Loco", etc.) con sus requisitos.

El usuario se encuentra actualmente en la sección: "${currentSubject || 'math'}".

Tu rol:
- Responder a la pregunta o solicitud de voz/texto del estudiante con muchísima paciencia, alegría, cariño y vocabulario apto para niños de 6 a 12 años.
- Brindar consejos divertidos de aprendizaje de la sección actual ("${currentSubject || 'math'}"), explicando de forma muy lúdica qué pueden aprender en ella y qué ganar.
- Motivar siempre al estudiante, dándole sugerencias o desafíos rápidos como "¿Sabías que en el laboratorio químico puedes mezclar vinagre y bicarbonato? ¡Pruébalo!" o "¡Puedes entrenar tu oratoria con Lectura Alaud!".
- Mantén las respuestas súper CONCISAS (máximo 2-3 oraciones cortas o un párrafo directo de no más de 65 palabras. ¡Mantenerlo apto para sintetizador de voz!).
- Habla siempre en español. No uses lenguaje técnico aburrido. Usa analogías de animales, magia y superpoderes del saber.
- Evita responder con formato Markdown excesivo o símbolos extraños (ej. no uses asteriscos gruesos, barras inclinadas u otros), ya que se leerá en voz alta para el niño. Mantén el texto limpio y legible.
`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.85,
      },
    });

    const replyText = response.text || '¡Vaya amiguito! Mi mente voló por un segundo. ¡Pregúntame de nuevo!';
    return res.json({
      text: replyText.replace(/[*#]/g, ''), // Strip markup so TTS reads it perfectly
      isLocalBackup: false,
    });
  } catch (error: any) {
    console.error('Error on Gemini Assistant endpoint:', error);
    return res.status(500).json({
      error: 'Hubo un error al conectar con la mente del Búho Ollie.',
      details: error.message,
    });
  }
});

// In-memory backend storage for Rooms and Invitations
let roomsDb: any[] = [
  {
    id: 'room-init-1',
    name: 'Sala de Matemáticas Mágicas 🧠',
    description: 'Espacio de resolución de problemas en equipo y cálculo mental.',
    subject: 'math',
    teacherId: 'teacher-main',
    teacherName: 'Profe Sabiondo 🎓',
    createdAt: new Date().toISOString()
  }
];

let invitationsDb: any[] = [
  {
    id: 'inv-init-1',
    roomId: 'room-init-1',
    roomName: 'Sala de Matemáticas Mágicas 🧠',
    teacherId: 'teacher-main',
    teacherName: 'Profe Sabiondo 🎓',
    studentId: 'std-hugo',
    studentName: 'Hugo López',
    status: 'Pendiente',
    createdAt: new Date().toISOString()
  },
  {
    id: 'inv-init-2',
    roomId: 'room-init-1',
    roomName: 'Sala de Matemáticas Mágicas 🧠',
    teacherId: 'teacher-main',
    teacherName: 'Profe Sabiondo 🎓',
    studentId: 'std-sofi',
    studentName: 'Sofía Díaz',
    status: 'Aceptada',
    createdAt: new Date().toISOString()
  }
];

// GET /api/rooms - Get all rooms or by teacherId
app.get('/api/rooms', (req, res) => {
  const { teacherId } = req.query;
  if (teacherId) {
    return res.json(roomsDb.filter(r => r.teacherId === teacherId));
  }
  return res.json(roomsDb);
});

// POST /api/rooms - Create room & send invitations
app.post('/api/rooms', (req, res) => {
  const { name, description, subject, teacherId, teacherName, studentIds, studentNames } = req.body;

  if (!name || !teacherId) {
    return res.status(400).json({ error: 'Nombre de sala y profesor son requeridos.' });
  }

  const newRoom = {
    id: `room-${Date.now()}`,
    name: name.trim(),
    description: description ? description.trim() : '',
    subject: subject || 'general',
    teacherId,
    teacherName: teacherName || 'Profesor',
    createdAt: new Date().toISOString()
  };

  roomsDb.push(newRoom);

  const newInvitations: any[] = [];
  if (Array.isArray(studentIds) && studentIds.length > 0) {
    studentIds.forEach((sId, index) => {
      const inv = {
        id: `inv-${Date.now()}-${index}`,
        roomId: newRoom.id,
        roomName: newRoom.name,
        teacherId: newRoom.teacherId,
        teacherName: newRoom.teacherName,
        studentId: sId,
        studentName: (studentNames && studentNames[sId]) ? studentNames[sId] : 'Estudiante',
        status: 'Pendiente',
        createdAt: new Date().toISOString()
      };
      invitationsDb.push(inv);
      newInvitations.push(inv);
    });
  }

  return res.status(201).json({
    room: newRoom,
    invitations: newInvitations
  });
});

// GET /api/invitations - Get invitations for student or teacher
app.get('/api/invitations', (req, res) => {
  const { studentId, teacherId, roomId } = req.query;
  let result = invitationsDb;

  if (studentId) {
    result = result.filter(i => i.studentId === studentId);
  }
  if (teacherId) {
    result = result.filter(i => i.teacherId === teacherId);
  }
  if (roomId) {
    result = result.filter(i => i.roomId === roomId);
  }

  return res.json(result);
});

// PATCH /api/invitations/:id - Update invitation status (Aceptada / Rechazada)
app.patch('/api/invitations/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Aceptada', 'Rechazada', 'Pendiente'].includes(status)) {
    return res.status(400).json({ error: 'Estado inválido. Debe ser Pendiente, Aceptada o Rechazada.' });
  }

  const invIndex = invitationsDb.findIndex(i => i.id === id);
  if (invIndex === -1) {
    return res.status(404).json({ error: 'Invitación no encontrada.' });
  }

  invitationsDb[invIndex].status = status;
  invitationsDb[invIndex].updatedAt = new Date().toISOString();

  return res.json(invitationsDb[invIndex]);
});

// GET /api/rooms/:id/access-check - Validate if a student has accepted invitation to enter room
app.get('/api/rooms/:id/access-check', (req, res) => {
  const roomId = req.params.id;
  const { studentId } = req.query;

  const room = roomsDb.find(r => r.id === roomId);
  if (!room) {
    return res.status(404).json({ authorized: false, message: 'La sala especificada no existe.' });
  }

  const invitation = invitationsDb.find(i => i.roomId === roomId && i.studentId === studentId);
  if (!invitation || invitation.status !== 'Aceptada') {
    return res.status(403).json({
      authorized: false,
      message: 'Acceso no autorizado: No has aceptado la invitación a esta sala.'
    });
  }

  return res.json({ authorized: true, room });
});

// ==========================================
// VIRTUAL ROOMS WITH ACCESS CODES (ENIGMAKIDS)
// ==========================================
const VIRTUAL_ROOMS_FILE = path.join(process.cwd(), 'data', 'virtual_rooms.json');

// Ensure data folder exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function loadVirtualRooms(): any[] {
  try {
    if (fs.existsSync(VIRTUAL_ROOMS_FILE)) {
      const content = fs.readFileSync(VIRTUAL_ROOMS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading virtual_rooms.json:', err);
  }
  return [];
}

function saveVirtualRooms(rooms: any[]) {
  try {
    fs.writeFileSync(VIRTUAL_ROOMS_FILE, JSON.stringify(rooms, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing virtual_rooms.json:', err);
  }
}

// Generate code format: EK-XXXX (using 4 uppercase alphanumeric characters, easy to read and enter for children)
function generateUniqueRoomCode(existingRooms: any[]): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Avoid 0, 1, O, I to prevent confusion
  let code = '';
  let attempts = 0;
  do {
    code = 'EK-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    attempts++;
  } while (existingRooms.some(r => r.code === code && r.status !== 'finalizada') && attempts < 100);
  return code;
}

// Rate limiter for joining code attempts: max 6 attempts per minute per client key
const joinAttemptsMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = joinAttemptsMap.get(key);
  if (!record || now > record.resetTime) {
    joinAttemptsMap.set(key, { count: 1, resetTime: now + 60000 });
    return true;
  }
  if (record.count >= 6) {
    return false; // Throttled
  }
  record.count++;
  return true;
}
function resetRateLimit(key: string) {
  joinAttemptsMap.delete(key);
}

// GET /api/virtual-rooms - List rooms (filtered by teacherId or studentId)
app.get('/api/virtual-rooms', (req, res) => {
  const { teacherId, studentId } = req.query;
  const rooms = loadVirtualRooms();

  if (teacherId && typeof teacherId === 'string') {
    return res.json(rooms.filter(r => r.teacherId === teacherId));
  }
  if (studentId && typeof studentId === 'string') {
    return res.json(rooms.filter(r => r.participants?.some((p: any) => p.studentId === studentId)));
  }
  return res.json(rooms);
});

// GET /api/virtual-rooms/:id - Get single room details
app.get('/api/virtual-rooms/:id', (req, res) => {
  const { id } = req.params;
  const rooms = loadVirtualRooms();
  const room = rooms.find(r => r.id === id);
  if (!room) {
    return res.status(404).json({ error: 'La sala virtual no existe.' });
  }
  return res.json(room);
});

// POST /api/virtual-rooms - Teacher creates a room with unique access code
app.post('/api/virtual-rooms', (req, res) => {
  const { name, description, type, teacherId, teacherName, assignedQuizId } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'El nombre de la sala es obligatorio.' });
  }
  if (!teacherId || typeof teacherId !== 'string') {
    return res.status(400).json({ error: 'El identificador del docente es obligatorio.' });
  }

  const validTypes = ['clase', 'actividad', 'evaluacion'];
  const selectedType = validTypes.includes(type) ? type : 'clase';

  const rooms = loadVirtualRooms();
  const code = generateUniqueRoomCode(rooms);

  const newRoom = {
    id: `vroom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    code,
    name: name.trim().slice(0, 100),
    description: description ? String(description).trim().slice(0, 300) : '',
    type: selectedType,
    status: 'activa',
    teacherId,
    teacherName: teacherName || 'Profesor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    participants: [],
    assignedQuizId: assignedQuizId || undefined
  };

  rooms.push(newRoom);
  saveVirtualRooms(rooms);

  return res.status(201).json(newRoom);
});

// PATCH /api/virtual-rooms/:id/status - Teacher manages status (activa, cerrada, finalizada)
app.patch('/api/virtual-rooms/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, teacherId } = req.body;

  const validStatuses = ['activa', 'cerrada', 'finalizada'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido. Debe ser: activa, cerrada o finalizada.' });
  }

  const rooms = loadVirtualRooms();
  const roomIndex = rooms.findIndex(r => r.id === id);
  if (roomIndex === -1) {
    return res.status(404).json({ error: 'La sala virtual no existe.' });
  }

  // Authorization check: Only the owner teacher can modify their room
  if (rooms[roomIndex].teacherId !== teacherId) {
    return res.status(403).json({ error: 'No tienes autorización para administrar esta sala.' });
  }

  rooms[roomIndex].status = status;
  rooms[roomIndex].updatedAt = new Date().toISOString();
  saveVirtualRooms(rooms);

  return res.json(rooms[roomIndex]);
});

// POST /api/virtual-rooms/join - Student joins a room using the access code
app.post('/api/virtual-rooms/join', (req, res) => {
  const { code, studentId, studentName, studentUsername, studentRole } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'El código de acceso es obligatorio.' });
  }

  if (!studentId || typeof studentId !== 'string') {
    return res.status(401).json({ error: 'Debes iniciar sesión para unirte a una sala.' });
  }

  if (studentRole && studentRole !== 'student') {
    return res.status(403).json({ error: 'Solo los alumnos pueden unirse a una sala mediante código.' });
  }

  const clientKey = `${req.ip || 'ip'}-${studentId}`;
  if (!checkRateLimit(clientKey)) {
    return res.status(429).json({ error: 'Has superado el límite de intentos. Espera 1 minuto antes de volver a intentar.' });
  }

  // Normalize code: remove spaces and uppercase
  const normalizedCode = code.replace(/\s+/g, '').toUpperCase();

  const rooms = loadVirtualRooms();
  const room = rooms.find(r => r.code.toUpperCase() === normalizedCode);

  if (!room) {
    return res.status(404).json({ error: 'El código introducido no es válido. Comprueba el código con tu profesor.' });
  }

  // Reset rate limiting upon valid code
  resetRateLimit(clientKey);

  // Validate room status
  if (room.status === 'cerrada') {
    return res.status(403).json({ error: 'Esta sala ya no admite nuevos participantes en este momento (ingreso cerrado).' });
  }
  if (room.status === 'finalizada') {
    return res.status(403).json({ error: 'Esta sala ya ha sido finalizada por el docente.' });
  }

  // Check if student is already in room participants
  const existingParticipant = room.participants.find((p: any) => p.studentId === studentId);
  if (existingParticipant) {
    existingParticipant.status = 'Activo';
    existingParticipant.lastSeen = new Date().toISOString();
    saveVirtualRooms(rooms);
    return res.json({
      room,
      alreadyJoined: true,
      message: '¡Ya formas parte de esta sala! Te has reconectado exitosamente.'
    });
  }

  // Register new participant
  const newParticipant = {
    studentId,
    studentName: (studentName && String(studentName).trim()) || 'Alumno',
    studentUsername: studentUsername || '',
    joinedAt: new Date().toISOString(),
    status: 'Activo',
    lastSeen: new Date().toISOString()
  };

  room.participants.push(newParticipant);
  room.updatedAt = new Date().toISOString();
  saveVirtualRooms(rooms);

  return res.status(201).json({
    room,
    alreadyJoined: false,
    message: '¡Te has unido exitosamente a la sala!'
  });
});

// GET /api/virtual-rooms/:id/participants - Real-time polling endpoint
app.get('/api/virtual-rooms/:id/participants', (req, res) => {
  const { id } = req.params;
  const rooms = loadVirtualRooms();
  const room = rooms.find(r => r.id === id);
  if (!room) {
    return res.status(404).json({ error: 'Sala no encontrada.' });
  }
  return res.json({
    roomId: room.id,
    code: room.code,
    status: room.status,
    participants: room.participants || []
  });
});


// Configure Vite middleware or static serving
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Enigmakids Backend Server] running on http://localhost:${PORT}`);
  });
};

startServer();
