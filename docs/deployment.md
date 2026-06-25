# Instalacion en varias PCs

## 1. Preparar la PC servidor

1. Instalar Node.js 20+
2. Copiar la carpeta completa del proyecto
3. Opcion simple: ejecutar `setup-trinidad-classroom.bat` y elegir `Instalar PC servidor local del aula`
4. El instalador genera `server\.env` automaticamente
5. Ejecutar `scripts\start-server.bat`
6. Verificar la IP local del servidor

## 2. Configurar el dashboard

1. Ejecutar `setup-trinidad-classroom.bat` y elegir `Instalar PC de profesor o directivo`
2. El instalador pregunta la IP del servidor y genera `dashboard\.env`
3. Ejecutar `scripts\start-dashboard.bat`
4. Abrir en navegador `http://localhost:5173`

## 3. Configurar cada agente

1. Ejecutar `setup-trinidad-classroom.bat` y elegir `Instalar PC de alumno`
2. El instalador pregunta:

   - IP del servidor
   - puerto del servidor
   - ID fijo de la PC

3. Genera `agent\.env` automaticamente
4. Ejecutar `scripts\start-agent.bat`

## 4. Inicio automatico con Windows

Opciones recomendadas:

- agregar un acceso directo del agente en `shell:startup`
- o crear una tarea programada al iniciar sesion
- o ejecutar `scripts\register-agent-startup.bat`

Comando sugerido:

`npm start` dentro de `agent\`

Para una instalacion real en produccion conviene empaquetar el agente con Electron Builder y generar un `.exe`.

## 5. Red interna

- mantener todas las PCs en la misma red Wi-Fi o LAN
- abrir el puerto `4000` en firewall del servidor si hace falta
- reservar IP fija para la PC servidor

## 6. Produccion recomendada

- usar `npm run build` en dashboard
- servir el frontend compilado desde Express o IIS
- empaquetar el agente como instalador `.exe`
- cambiar el usuario y clave por defecto

## Credenciales iniciales

- usuario: `admin`
- clave: `trinidad@2026`
