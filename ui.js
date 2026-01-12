function renderMemoryGrid(vm) {
  const grid = document.querySelector(".memory-grid");
  grid.innerHTML = "";
  const view = vm.getMemoryViewModel();
  view.forEach(cell => {
    const div = document.createElement("div");
    div.textContent = cell.char || cell.value;
    div.className = "memory-cell";
    if (vm.ptr === cell.index) div.classList.add("current-cell");
    grid.appendChild(div);
  });
}

function renderExecution(vm, controller) {
  renderMemoryGrid(vm);
  const statusBar = document.querySelector(".status-bar");
  statusBar.textContent = `IP: ${vm.ip} | pending: ${vm.pendingCount} | STOP: ${controller.stopReason}`;
}
