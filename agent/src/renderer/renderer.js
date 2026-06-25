const form = document.getElementById("session-form");
const nameInput = document.getElementById("student-name");
const sessionInfo = document.getElementById("session-info");
const messageBox = document.getElementById("message-box");
const logoutBtn = document.getElementById("logout-btn");
const lockOverlay = document.getElementById("lock-overlay");

function renderSession(session) {
  if (session.studentName) {
    sessionInfo.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    sessionInfo.textContent = `Sesion iniciada: ${session.studentName} | Equipo ${session.computerId}`;
    nameInput.value = session.studentName;
  } else {
    sessionInfo.classList.add("hidden");
    logoutBtn.classList.add("hidden");
    sessionInfo.textContent = "";
    nameInput.value = "";
  }
}

function setLocked(isLocked) {
  lockOverlay.classList.toggle("hidden", !isLocked);
  document.body.classList.toggle("is-locked", isLocked);
}

window.trinidadAgent.getSession().then((session) => {
  renderSession(session);
  setLocked(session.locked);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const studentName = nameInput.value.trim();
  if (!studentName) return;
  const session = await window.trinidadAgent.startSession(studentName);
  const current = await window.trinidadAgent.getSession();
  renderSession({ ...session, computerId: current.computerId });
});

logoutBtn.addEventListener("click", async () => {
  await window.trinidadAgent.endSession();
  const current = await window.trinidadAgent.getSession();
  renderSession(current);
});

window.trinidadAgent.onMessage((message) => {
  messageBox.classList.remove("hidden");
  messageBox.textContent = `Aviso del profesor: ${message}`;
});

window.trinidadAgent.onLocked((isLocked) => {
  setLocked(isLocked);
});

window.trinidadAgent.onSession((session) => {
  window.trinidadAgent.getSession().then((current) => {
    renderSession({ ...current, ...session });
  });
});
