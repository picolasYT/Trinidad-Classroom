require("dotenv").config();

const path = require("node:path");
const os = require("node:os");
const { app, BrowserWindow, ipcMain, dialog, powerMonitor } = require("electron");
const Store = require("electron-store");
const { io } = require("socket.io-client");
const si = require("systeminformation");
const screenshot = require("screenshot-desktop");

const store = new Store();
const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";
const COMPUTER_ID = process.env.COMPUTER_ID || "PC-001";

let mainWindow;
let socket;
let locked = false;
let statusInterval;
let session = {
  studentName: ""
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: "#030712",
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  mainWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
  mainWindow.once("ready-to-show", () => {
    mainWindow.maximize();
    mainWindow.show();
  });
}

function applyLockState() {
  if (!mainWindow) return;

  if (locked) {
    mainWindow.setAlwaysOnTop(true, "screen-saver");
    mainWindow.setFullScreen(true);
    mainWindow.focus();
    return;
  }

  mainWindow.setFullScreen(false);
  mainWindow.setAlwaysOnTop(false);
  mainWindow.maximize();
}

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "127.0.0.1";
}

async function getActiveWindowInfo() {
  try {
    const activeWinModule = await import("active-win");
    return await activeWinModule.default();
  } catch {
    return null;
  }
}

async function collectStatus() {
  const [netStats, processes, currentWindow] = await Promise.all([
    si.networkStats(),
    si.processes(),
    getActiveWindowInfo()
  ]);

  let screenBase64 = null;
  try {
    const image = await screenshot({ format: "jpg" });
    screenBase64 = `data:image/jpeg;base64,${image.toString("base64")}`;
  } catch {
    screenBase64 = null;
  }

  const visibleApps = processes.list
    .filter((item) => item.name)
    .slice(0, 8)
    .map((item) => item.name);

  const websites = [];
  if (currentWindow?.title) {
    websites.push({
      title: currentWindow.title,
      url: currentWindow.owner?.name || "Ventana activa"
    });
  }

  return {
    computerId: COMPUTER_ID,
    computerName: os.hostname(),
    ipAddress: getLocalIp(),
    status: session.studentName ? "connected" : "free",
    studentName: session.studentName || null,
    apps: visibleApps,
    websites,
    screenshot: screenBase64,
    network: {
      rxBytes: netStats[0]?.rx_bytes || 0,
      txBytes: netStats[0]?.tx_bytes || 0
    }
  };
}

async function emitStatus() {
  if (!socket?.connected) return;
  const payload = await collectStatus();
  socket.emit("agent:status", payload);
  mainWindow?.webContents.send("agent:state", { ...payload, locked });
}

function connectSocket() {
  socket = io(SERVER_URL, {
    transports: ["websocket", "polling"]
  });

  socket.on("connect", async () => {
    socket.emit("agent:hello", {
      computerId: COMPUTER_ID,
      computerName: os.hostname(),
      ipAddress: getLocalIp(),
      studentName: session.studentName || null
    });

    await emitStatus();
  });

  socket.on("teacher:message", ({ message }) => {
    dialog.showMessageBox({
      type: "info",
      title: "Aviso del profesor",
      message: message || "Nuevo aviso del panel"
    });
    mainWindow?.webContents.send("teacher:message", message);
  });

  socket.on("teacher:lock", ({ locked: nextLocked }) => {
    locked = Boolean(nextLocked);
    applyLockState();
    mainWindow?.webContents.send("agent:locked", locked);
  });

  socket.on("teacher:logout", async () => {
    session.studentName = "";
    store.delete("studentName");
    mainWindow?.webContents.send("agent:session", session);
    await emitStatus();
  });
}

ipcMain.handle("session:get", () => ({
  computerId: COMPUTER_ID,
  serverUrl: SERVER_URL,
  studentName: session.studentName,
  locked
}));

ipcMain.handle("session:start", async (_event, studentName) => {
  session.studentName = studentName;
  store.set("studentName", studentName);
  socket?.emit("agent:student-login", {
    computerId: COMPUTER_ID,
    computerName: os.hostname(),
    ipAddress: getLocalIp(),
    studentName
  });
  await emitStatus();
  return session;
});

ipcMain.handle("session:end", async () => {
  socket?.emit("agent:student-logout", {
    computerId: COMPUTER_ID,
    reason: "local_logout"
  });
  session.studentName = "";
  store.delete("studentName");
  await emitStatus();
  return session;
});

app.whenReady().then(() => {
  session.studentName = store.get("studentName", "");
  createWindow();
  connectSocket();
  statusInterval = setInterval(() => {
    emitStatus().catch(() => {});
  }, 12000);
  applyLockState();
});

app.on("browser-window-created", (_event, window) => {
  window.removeMenu();
});

powerMonitor.on("resume", () => {
  emitStatus().catch(() => {});
});

app.on("before-quit", () => {
  if (statusInterval) {
    clearInterval(statusInterval);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
