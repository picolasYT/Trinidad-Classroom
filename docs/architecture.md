# Arquitectura de Trinidad Classroom

## Componentes

### 1. Backend local

- `Node.js + Express`
- `Socket.IO` para tiempo real
- `SQLite` local para guardar usuarios, equipos, sesiones y eventos

Responsabilidades:

- autenticar profesores y directivos
- registrar computadoras del aula
- recibir estado del agente
- enviar comandos al agente
- generar reportes

### 2. Dashboard web

- `React + Tailwind CSS`
- interfaz tipo software profesional
- vista general del aula con tarjetas por equipo

Responsabilidades:

- login de administradores
- ver estado de todos los equipos
- seleccionar una PC y administrarla
- enviar mensajes y comandos
- revisar apps, red y capturas recientes

### 3. Agente Windows

- `Electron`
- arranca con Windows usando acceso directo o tarea programada
- mantiene el `COMPUTER_ID` fijo

Responsabilidades:

- pedir nombre del alumno
- abrir sesion temporal
- reportar apps y estado
- tomar capturas periodicas
- recibir comandos del profesor

## Funciones recomendadas agregadas

- vista de captura reciente por PC
- historial de sesiones por alumno
- bandera de PC bloqueada
- reportes simples de uso
- red basica por equipo
- posibilidad futura de listas blancas de apps o sitios
- alertas por desconexion prolongada

## Sobre trafico y web

En esta primera base:

- se guardan metricas de red por equipo
- se envia una referencia de la ventana activa

Para trafico completo por computadora se recomienda una fase 2 con:

- servicio Windows dedicado
- analisis de conexiones salientes por proceso
- politicas claras de privacidad y retencion
