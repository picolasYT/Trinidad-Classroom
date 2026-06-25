# Trinidad Classroom

Sistema de administracion de computadoras para aula escolar con:

- Panel administrador para profesores y directivos
- Agente Windows para las PCs de alumnos
- Backend local con base de datos SQLite
- Tiempo real con WebSockets
- Scripts `.bat` para instalar y ejecutar cada parte

## Estructura

- `server/`: API, WebSocket, base de datos y logica central
- `dashboard/`: panel React + Tailwind CSS
- `agent/`: aplicacion Electron para cada PC de alumno
- `scripts/`: instalacion y arranque en Windows

## Funciones incluidas en esta primera version

- Registro de PCs con ID fijo
- Inicio de sesion temporal del alumno
- Estado en tiempo real: conectada, libre, desconectada y bloqueada
- Ver aplicaciones abiertas
- Ver metricas de red basicas por equipo
- Ver captura reciente de pantalla
- Envio de avisos al alumno
- Bloquear y desbloquear equipo
- Cerrar sesion del alumno
- Reportes basicos de uso
- Roles de `teacher` y `admin`

## Importante

Esta base es funcional para un entorno escolar propio y controlado. Algunas funciones avanzadas, como historial web preciso por navegador o inspeccion completa del trafico, requieren integraciones extra o componentes a nivel sistema que no conviene activar sin politicas claras del colegio, consentimiento y evaluacion legal.

## Instalacion rapida

1. Instalar Node.js 20 o superior en todas las PCs.
2. Tambien puedes usar el menu principal:
   - `setup-trinidad-classroom.bat`
3. En la PC servidor ejecutar:
   - `scripts\install-server.bat`
   - `scripts\start-server.bat`
4. En la misma PC o en otra dentro de la red abrir el panel:
   - `scripts\install-dashboard.bat`
   - `scripts\start-dashboard.bat`
5. En cada PC de alumno:
   - `scripts\install-agent.bat`
   - ingresar IP del servidor, puerto e ID de la PC cuando lo pida
   - `scripts\start-agent.bat`

## Credenciales iniciales

- Usuario: `admin`
- Clave: `trinidad@2026`

Cambiar la clave apenas se instala.
