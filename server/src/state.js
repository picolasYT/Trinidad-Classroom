import db from "./db.js";

export function upsertComputer(payload) {
  const now = new Date().toISOString();
  const existing = db
    .prepare("SELECT computer_id FROM computers WHERE computer_id = ?")
    .get(payload.computerId);

  const status = payload.status || "connected";
  const ipAddress = payload.ipAddress || null;
  const computerName = payload.computerName || payload.computerId;
  const currentStudentName = payload.studentName || null;
  const lastMessage = payload.lastMessage || null;
  const lastScreenshot = payload.screenshot || null;
  const networkRxBytes = payload.network?.rxBytes || 0;
  const networkTxBytes = payload.network?.txBytes || 0;

  if (existing) {
    db.prepare(`
      UPDATE computers
      SET computer_name = ?,
          ip_address = ?,
          status = ?,
          current_student_name = ?,
          last_seen_at = ?,
          last_message = COALESCE(?, last_message),
          last_screenshot = COALESCE(?, last_screenshot),
          network_rx_bytes = ?,
          network_tx_bytes = ?,
          updated_at = ?
      WHERE computer_id = ?
    `).run(
      computerName,
      ipAddress,
      status,
      currentStudentName,
      now,
      lastMessage,
      lastScreenshot,
      networkRxBytes,
      networkTxBytes,
      now,
      payload.computerId
    );
  } else {
    db.prepare(`
      INSERT INTO computers (
        computer_id,
        computer_name,
        ip_address,
        status,
        current_student_name,
        last_seen_at,
        last_message,
        last_screenshot,
        network_rx_bytes,
        network_tx_bytes,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      payload.computerId,
      computerName,
      ipAddress,
      status,
      currentStudentName,
      now,
      lastMessage,
      lastScreenshot,
      networkRxBytes,
      networkTxBytes,
      now
    );
  }

  if (Array.isArray(payload.apps)) {
    const insertApp = db.prepare(
      "INSERT INTO app_events (computer_id, app_name) VALUES (?, ?)"
    );
    for (const appName of payload.apps.slice(0, 8)) {
      insertApp.run(payload.computerId, appName);
    }
  }

  if (Array.isArray(payload.websites)) {
    const insertWeb = db.prepare(
      "INSERT INTO web_events (computer_id, title, url) VALUES (?, ?, ?)"
    );
    for (const website of payload.websites.slice(0, 8)) {
      insertWeb.run(payload.computerId, website.title || "", website.url || "");
    }
  }
}

export function startStudentSession(computerId, studentName) {
  db.prepare(
    "INSERT INTO classroom_sessions (computer_id, student_name) VALUES (?, ?)"
  ).run(computerId, studentName);
}

export function endStudentSession(computerId, reason = "manual") {
  db.prepare(`
    UPDATE classroom_sessions
    SET ended_at = CURRENT_TIMESTAMP, ended_reason = ?
    WHERE id = (
      SELECT id FROM classroom_sessions
      WHERE computer_id = ? AND ended_at IS NULL
      ORDER BY started_at DESC
      LIMIT 1
    )
  `).run(reason, computerId);

  db.prepare(`
    UPDATE computers
    SET current_student_name = NULL,
        status = CASE WHEN status = 'disconnected' THEN status ELSE 'free' END,
        updated_at = CURRENT_TIMESTAMP
    WHERE computer_id = ?
  `).run(computerId);
}

export function setComputerLock(computerId, isLocked) {
  db.prepare(`
    UPDATE computers
    SET is_locked = ?, updated_at = CURRENT_TIMESTAMP
    WHERE computer_id = ?
  `).run(isLocked ? 1 : 0, computerId);
}

export function addNotice(computerId, message, createdBy) {
  db.prepare(
    "INSERT INTO notices (computer_id, message, created_by) VALUES (?, ?, ?)"
  ).run(computerId, message, createdBy);
}

export function getDashboardData() {
  const computers = db.prepare(`
    SELECT *
    FROM computers
    ORDER BY computer_id ASC
  `).all();

  const byComputer = {};

  for (const pc of computers) {
    byComputer[pc.computer_id] = {
      ...pc,
      recentApps: db.prepare(`
        SELECT app_name, observed_at
        FROM app_events
        WHERE computer_id = ?
        ORDER BY observed_at DESC
        LIMIT 6
      `).all(pc.computer_id),
      recentWebsites: db.prepare(`
        SELECT title, url, observed_at
        FROM web_events
        WHERE computer_id = ?
        ORDER BY observed_at DESC
        LIMIT 6
      `).all(pc.computer_id),
      activeSession: db.prepare(`
        SELECT student_name, started_at
        FROM classroom_sessions
        WHERE computer_id = ? AND ended_at IS NULL
        ORDER BY started_at DESC
        LIMIT 1
      `).get(pc.computer_id)
    };
  }

  return {
    computers: Object.values(byComputer),
    summary: {
      total: computers.length,
      connected: computers.filter((pc) => pc.status === "connected").length,
      free: computers.filter((pc) => pc.status === "free").length,
      disconnected: computers.filter((pc) => pc.status === "disconnected").length,
      locked: computers.filter((pc) => pc.is_locked === 1).length
    }
  };
}

export function getUsageReport() {
  const topStudents = db.prepare(`
    SELECT student_name, COUNT(*) AS sessions
    FROM classroom_sessions
    GROUP BY student_name
    ORDER BY sessions DESC
    LIMIT 10
  `).all();

  const computers = db.prepare(`
    SELECT computer_id, status, current_student_name, last_seen_at
    FROM computers
    ORDER BY computer_id
  `).all();

  return {
    generatedAt: new Date().toISOString(),
    topStudents,
    computers
  };
}
