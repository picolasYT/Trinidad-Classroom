import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import http from "node:http";
import { Server } from "socket.io";
import db from "./db.js";
import { loginUser, requireAuth, requireRole } from "./auth.js";
import {
  addNotice,
  endStudentSession,
  getDashboardData,
  getUsageReport,
  setComputerLock,
  startStudentSession,
  upsertComputer
} from "./state.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = Number(process.env.PORT || 4000);
const agentSockets = new Map();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "Trinidad Classroom Server" });
});

app.post("/api/auth/login", (req, res) => {
  const result = loginUser(req.body.username, req.body.password);
  if (!result) {
    return res.status(401).json({ error: "Credenciales invalidas" });
  }
  res.json(result);
});

app.get("/api/dashboard", requireAuth, (req, res) => {
  res.json(getDashboardData());
});

app.get("/api/reports/usage", requireAuth, requireRole("teacher", "admin"), (req, res) => {
  res.json(getUsageReport());
});

app.post("/api/computers/:computerId/message", requireAuth, requireRole("teacher", "admin"), (req, res) => {
  const { computerId } = req.params;
  const { message } = req.body;

  addNotice(computerId, message, req.user.username);
  io.to(`computer:${computerId}`).emit("teacher:message", { message });
  res.json({ ok: true });
});

app.post("/api/computers/:computerId/lock", requireAuth, requireRole("teacher", "admin"), (req, res) => {
  const { computerId } = req.params;
  setComputerLock(computerId, true);
  io.to(`computer:${computerId}`).emit("teacher:lock", { locked: true });
  io.emit("dashboard:update", getDashboardData());
  res.json({ ok: true });
});

app.post("/api/computers/:computerId/unlock", requireAuth, requireRole("teacher", "admin"), (req, res) => {
  const { computerId } = req.params;
  setComputerLock(computerId, false);
  io.to(`computer:${computerId}`).emit("teacher:lock", { locked: false });
  io.emit("dashboard:update", getDashboardData());
  res.json({ ok: true });
});

app.post("/api/computers/:computerId/logout", requireAuth, requireRole("teacher", "admin"), (req, res) => {
  const { computerId } = req.params;
  endStudentSession(computerId, "teacher_logout");
  io.to(`computer:${computerId}`).emit("teacher:logout", {});
  io.emit("dashboard:update", getDashboardData());
  res.json({ ok: true });
});

io.on("connection", (socket) => {
  socket.on("dashboard:join", () => {
    socket.join("dashboards");
    socket.emit("dashboard:update", getDashboardData());
  });

  socket.on("agent:hello", (payload) => {
    const computerId = payload.computerId;
    socket.data.computerId = computerId;
    socket.join(`computer:${computerId}`);
    agentSockets.set(computerId, socket.id);

    upsertComputer({
      computerId,
      computerName: payload.computerName,
      ipAddress: payload.ipAddress,
      status: payload.studentName ? "connected" : "free",
      studentName: payload.studentName
    });

    io.emit("dashboard:update", getDashboardData());
  });

  socket.on("agent:student-login", (payload) => {
    startStudentSession(payload.computerId, payload.studentName);
    upsertComputer({
      computerId: payload.computerId,
      computerName: payload.computerName,
      ipAddress: payload.ipAddress,
      status: "connected",
      studentName: payload.studentName
    });

    io.emit("dashboard:update", getDashboardData());
  });

  socket.on("agent:status", (payload) => {
    upsertComputer(payload);
    io.emit("dashboard:update", getDashboardData());
  });

  socket.on("agent:student-logout", (payload) => {
    endStudentSession(payload.computerId, payload.reason || "student_logout");
    io.emit("dashboard:update", getDashboardData());
  });

  socket.on("disconnect", () => {
    const computerId = socket.data.computerId;
    if (!computerId) {
      return;
    }

    db.prepare(`
      UPDATE computers
      SET status = 'disconnected',
          last_seen_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE computer_id = ?
    `).run(computerId);

    agentSockets.delete(computerId);
    io.emit("dashboard:update", getDashboardData());
  });
});

server.listen(PORT, () => {
  console.log(`Trinidad Classroom server running on http://localhost:${PORT}`);
});
