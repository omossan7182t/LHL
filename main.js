import { LanguageRegistry } from "./language/LanguageRegistry.js";
import { NukuLanguage } from "./language/NukuLanguage.js";
import { tokenizeNukuDialect } from "./tokenize/tokenizeNukuDialect.js";
import { VMState } from "./vm/VMState.js";

LanguageRegistry.register(NukuLanguage);

const editor = document.getElementById("code-editor");
const output = document.getElementById("output");
const memoryGrid = document.getElementById("memory-grid");

editor.value = "";

function renderMemory(vm) {
  memoryGrid.innerHTML = "";
  for (let i = 0; i < 80; i++) {
    const cell = document.createElement("div");
    cell.className = "memory-cell";
    if (i === vm.ptr) {
      cell.classList.add("memory-cell--active");
    }
    const value = vm.memory[i];
    cell.textContent = `${i}:${value}`;
    memoryGrid.appendChild(cell);
  }
}

window.run = () => {
  output.textContent = "";
  const tokens = tokenizeNukuDialect(editor.value);
  const vm = new VMState(tokens);

  let state = "RUNNING";
  while (state === "RUNNING") {
    state = vm.step();
  }

  renderMemory(vm);
};
