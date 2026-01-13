// renderer/statusBarRenderer.js
// ステータスバー描画（STOP_REASON / IP / ptr / pendingCount）

function renderStatusBar({
  container,
  stopReason,
  ip,
  ptr,
  pendingCount,
}) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "status-bar";

  /* =========================
   * STOP_REASON
   * ========================= */

  const stopEl = document.createElement("span");
  stopEl.className = "status-item status-stop-reason";
  stopEl.textContent = `STATE: ${stopReason}`;

  /* =========================
   * IP
   * ========================= */

  const ipEl = document.createElement("span");
  ipEl.className = "status-item status-ip";
  ipEl.textContent = `IP: ${ip}`;

  /* =========================
   * ptr
   * ========================= */

  const ptrEl = document.createElement("span");
  ptrEl.className = "status-item status-ptr";
  ptrEl.textContent = `PTR: ${ptr}`;

  /* =========================
   * pendingCount
   * ========================= */

  const pendingEl = document.createElement("span");
  pendingEl.className = "status-item status-pending";
  pendingEl.textContent = `PENDING: ${pendingCount}`;

  wrapper.appendChild(stopEl);
  wrapper.appendChild(ipEl);
  wrapper.appendChild(ptrEl);
  wrapper.appendChild(pendingEl);

  container.appendChild(wrapper);
}

window.renderStatusBar = renderStatusBar;
