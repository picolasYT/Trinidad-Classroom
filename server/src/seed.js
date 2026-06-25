import db from "./db.js";

const computers = Array.from({ length: 12 }, (_, index) => ({
  computerId: `PC-${String(index + 1).padStart(3, "0")}`,
  computerName: `Aula ${index + 1}`
}));

for (const computer of computers) {
  db.prepare(`
    INSERT OR IGNORE INTO computers (computer_id, computer_name, status, updated_at)
    VALUES (?, ?, 'disconnected', CURRENT_TIMESTAMP)
  `).run(computer.computerId, computer.computerName);
}

console.log("Base inicial cargada.");
