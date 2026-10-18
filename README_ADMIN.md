# 🛡️ Guía del Módulo de Administración - EnigmaKids

Este documento contiene la documentación completa, las credenciales iniciales, la arquitectura de seguridad, la guía de uso y la lista de comprobación (checklist) de pruebas para el módulo de **Administrador General** de la plataforma educativa **EnigmaKids**.

---

## 🔑 1. Credenciales del Administrador Inicial

Para acceder por primera vez al Panel de Administración Central, utilice las siguientes credenciales predeterminadas:

* **Usuario:** `admin`
* **Contraseña:** `123`
* **Nombre de la Cuenta:** Administrador Enigma
* **Rol:** `admin` (Administrador General)
* **Estado:** Activo 🟢

> 💡 *Nota de seguridad:* La contraseña puede ser cambiada en cualquier momento desde el apartado **"Mi Perfil"** dentro del Panel de Administración.

---

## 🌐 2. Rutas e Instrucciones de Acceso

El módulo de administración se encuentra protegido bajo un control estricto de rutas y roles. Existen **tres formas** de ingresar al Panel de Administración:

1. **Vía URL Directa:**
   Ingresa a la ruta `/admin` o `#/admin` en la barra de direcciones de tu navegador (ejemplo: `https://tu-app.com/#/admin` o `https://tu-app.com/admin`).

2. **Vía Enlace Directo en la Pantalla de Login Principal:**
   En la pantalla de inicio de sesión general, en la parte inferior del recuadro, encontrarás un enlace discreto con un candado de seguridad: **"🔒 Portal de Administración (/admin)"**.

3. **Autenticación Directa en el Formulario /admin:**
   Al acceder a `/admin`, serás redirigido al formulario oscuro de autenticación del Portal de Administrador (`AdminLoginGate`). Introduce el usuario `admin` y la contraseña `123`.

---

## 🔒 3. Seguridad y Protección de Rutas

El sistema implementa una barrera de seguridad de tres niveles para aislar el panel administrativo:

1. **Bloqueo a Profesores y Estudiantes:**
   Si un usuario autenticado como **Profesor** o **Estudiante** intenta navegar a `/admin`, el sistema intercepta la solicitud y muestra la pantalla **"Acceso No Autorizado"**, indicando el nombre de su usuario, su rol actual y el motivo por el cual no tiene permisos. Incluye un botón para regresar a su panel correspondiente.

2. **Desactivación de Cuentas:**
   Si una cuenta de usuario es marcada como **Inactiva** por la Dirección, el sistema bloqueará su inicio de sesión de inmediato en todos los portales, notificándole que debe contactar al Administrador.

3. **Cierre de Sesión:**
   Al presionar el botón **"Cerrar Sesión"** en el encabezado superior derecho del Panel de Administración, se limpia la sesión del usuario en `localStorage` y se redirige automáticamente al Portal General.

---

## 📖 4. Guía Operativa del Panel Administrativo

### A. ¿Cómo cambiar la contraseña del Administrador?
1. En el menú superior del Panel de Administración, haz clic en la pestaña **"Mi Perfil"**.
2. Ingresa la **Contraseña Actual** (`123`).
3. Ingresa la **Nueva Contraseña** deseada.
4. Haz clic en **"Guardar Nueva Contraseña"**. La contraseña quedará actualizada en el sistema.

### B. ¿Cómo crear nuevos Administradores o Profesores?
1. Ve a la pestaña **"Usuarios"**.
2. Haz clic en el botón **"+ Agregar Nuevo Usuario"**.
3. Completa el Nombre, Nombre de Usuario, Contraseña y Selecciona el Rol:
   * **Administrador:** Acceso completo al Panel `/admin`.
   * **Profesor:** Acceso al Panel del Docente (creación de exámenes, toma de asistencia, notas).
   * **Estudiante:** Acceso al mapa de aventuras y minijuegos educativos por grado.
4. Haz clic en **"Guardar Usuario"**.

### C. ¿Cómo recepcionar la asistencia enviada por Profesores?
1. Cuando un Profesor toma asistencia en su panel y presiona **"📋 Enviar Asistencia al Administrador"**, se genera una solicitud en la base de datos local.
2. En el Panel del Administrador, ve a la pestaña **"Asistencia"** o consulta la alerta en el **"Inicio"**.
3. Revisa la lista de alumnos presentes/ausentes enviados por el docente.
4. Cambia el estado del reporte a **"Aprobado"** o **"Revisado"**.

### D. Recuperación de Acceso en caso de pérdida de contraseña
* Si se pierde la contraseña del usuario `admin`, un administrador secundario activo puede editar su clave desde la pestaña **"Usuarios"**.
* Si se pierde el acceso total, al reiniciar los datos del navegador (`localStorage.clear()`), el sistema volverá a crear automáticamente la cuenta maestro `admin` con la clave `123`.

---

## 📋 5. Checklist de Pruebas (Lista de Comprobación)

Utilice este checklist paso a paso para verificar que el módulo administrativo funciona correctamente:

- [x] **Prueba 1: Inicio de Sesión de Administrador**
  - Ingresar a `#/admin` con usuario `admin` y clave `123`.
  - Confirmar que se muestre el mensaje de bienvenida y el Panel General.
- [x] **Prueba 2: Seguridad y Bloqueo de Acceso para Profesores**
  - Iniciar sesión como Profesor (`profesor.enigma` / `123`).
  - Navegar a `#/admin`.
  - Verificar que se despliegue la pantalla "Acceso No Autorizado" bloqueando la entrada.
- [x] **Prueba 3: Seguridad y Bloqueo de Acceso para Estudiantes**
  - Iniciar sesión como Estudiante (ej. `hugo` / `123`).
  - Navegar a `#/admin`.
  - Verificar que el sistema deniegue el acceso.
- [x] **Prueba 4: Gestión de Usuarios (CRUD y Desactivación)**
  - Ir a la pestaña **Usuarios**.
  - Crear un nuevo usuario (Estudiante, Profesor o Admin).
  - Editar sus datos o cambiar su estado a **Inactivo**.
  - Probar que un usuario inactivo no pueda iniciar sesión.
- [x] **Prueba 5: Gestión de Cursos y Aulas**
  - Ir a la pestaña **Cursos**.
  - Crear un nuevo curso asignándole un profesor encargado.
  - Alternar el estado entre Activo e Inactivo.
- [x] **Prueba 6: Recepción de Asistencia enviada por Profesores**
  - Entrar como Profesor (`profesor.enigma` / `123`), ir a "Enviar Asistencia", seleccionar alumnos y enviar.
  - Entrar como Administrador (`admin` / `123`), ir a la pestaña "Asistencia" y aprobar el informe recibido.
- [x] **Prueba 7: Historial de Auditoría**
  - Ir a la pestaña **Auditoría**.
  - Verificar que las acciones de creación, edición y asistencia hayan quedado registradas con fecha y hora.
  - Probar la descarga de la bitácora en formato JSON.
- [x] **Prueba 8: Reportes y Estadísticas Académicas**
  - Ir a la pestaña **Reportes**.
  - Verificar los gráficos de distribución por grado y el informe descargable.
- [x] **Prueba 9: Ajustes de la Plataforma**
  - Ir a la pestaña **Ajustes**.
  - Cambiar el Año Lectivo o el Nombre Institucional y hacer clic en "Guardar Configuración".
- [x] **Prueba 10: Cambio de Contraseña y Cierre de Sesión**
  - Ir a **Mi Perfil**, actualizar la clave y cerrar sesión.
  - Verificar que el cierre de sesión redirija al login general.

---

## 🛠️ 6. Resumen Técnico de Cambios Implementados

### Archivos Creados:
* `/src/components/AdminLoginGate.tsx`: Componente de autenticación exclusiva de administradores y pantalla de denegación de acceso para roles no autorizados.
* `/src/components/AdminDashboard.tsx`: Panel principal de administración con 8 secciones (Inicio, Usuarios, Cursos, Asistencia, Reportes, Auditoría, Ajustes, Perfil).
* `README_ADMIN.md`: Manual de usuario, arquitectura de seguridad y lista de comprobación.

### Archivos Modificados:
* `/src/types.ts`: Agregado el rol `'admin'` a `SchoolRole`, así como las interfaces `AttendanceRecord`, `AuditLog`, `CourseItem` y `PlatformConfig`.
* `/src/components/LoginGate.tsx`: Bootstrap automático de la cuenta inicial `admin`, validación de estado activo/inactivo de la cuenta, y botón de acceso a `/admin`.
* `/src/components/TeacherDashboard.tsx`: Módulo para que los profesores tomen asistencia por grado y la envíen a la Dirección General.
* `/src/App.tsx`: Enrutamiento y control de acceso basado en `/admin`, `#/admin` y verificación de roles.
