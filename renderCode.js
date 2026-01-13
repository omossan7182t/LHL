// renderCode.js

/**
 * @param {Object} params
 * @param {Array}  params.tokens        VM の tokens
 * @param {number} params.ip            現在の IP
 * @param {Set}    params.breakpoints   breakpoint の IP set
 * @param {string} params.stopReason    STOP_REASON
 * @param {number|null} params.errorIp  error 停止位置
 */
export function renderCode({
  tokens,
  ip,
  breakpoints,
  stopReason,
  errorIp,
}) {
  const container = document.getElementById("code-view");
  container.innerHTML = "";

  tokens.forEach((token, index) => {
    const line = document.createElement("div");
    line.className = "code-line";
    line.dataset.ip = index;

    // --- GUTTER ---
    const gutter = document.createElement("span");
    gutter.className = "code-gutter";

    if (breakpoints.has(index)) {
      gutter.textContent = "●";
      gutter.classList.add("bp");
    } else {
      gutter.textContent = "○";
    }

    // --- CODE ---
    const code = document.createElement("span");
    code.className = "code-token";
    code.textContent = formatToken(token);

    // --- IP highlight ---
    if (index === ip) {
      line.classList.add("current-ip");
    }

    // --- ERROR highlight ---
    if (stopReason === "ERROR" && index === errorIp) {
      line.classList.add("error-line");
    }

    // --- BP stop highlight ---
    if (stopReason === "BP" && index === ip) {
      line.classList.add("bp-stop");
    }

    line.appendChild(gutter);
    line.appendChild(code);
    container.appendChild(line);
  });
}

/**
 * Token 表示用（最小）
 */
function formatToken(token) {
  if (token.type === "number") {
    return `[${token.value}]`;
  }
  return token.op;
}
