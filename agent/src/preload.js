const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("trinidadAgent", {
  getSession: () => ipcRenderer.invoke("session:get"),
  startSession: (studentName) => ipcRenderer.invoke("session:start", studentName),
  endSession: () => ipcRenderer.invoke("session:end"),
  onState: (callback) => ipcRenderer.on("agent:state", (_event, data) => callback(data)),
  onMessage: (callback) => ipcRenderer.on("teacher:message", (_event, data) => callback(data)),
  onLocked: (callback) => ipcRenderer.on("agent:locked", (_event, data) => callback(data)),
  onSession: (callback) => ipcRenderer.on("agent:session", (_event, data) => callback(data))
});
