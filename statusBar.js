// statusBar.js

export function renderStatusBar(state) {
  const modeEl = document.getElementById("status-mode");
  const ipEl = document.getElementById("status-ip");
  const ptrEl = document.getElementById("status-ptr");
  const pendingEl = document.getElementById("status-pending");

  // --- MODE ---
  modeEl.textContent = `MODE: ${state.stopReason}`;
  modeEl.className = `status-mode status-${state.stopReason.toLowerCase()}`;

  // --- IP ---
  ipEl.textContent = `IP: ${state.ip}`;

  // --- PTR ---
  ptrEl.textContent = `PTR: ${state.ptr}`;

  // --- PENDING ---
  if (state.pendingCount != null) {
    pendingEl.textContent = `PENDING: ${state.pendingCount}`;
    pendingEl.style.display = "";
  } else {
    pendingEl.style.display = "none";
  }
}
