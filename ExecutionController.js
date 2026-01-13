// ExecutionController.js
// VMState と UI / 実行状態を束ねる唯一の司令塔

/**
 * StopReason
 * RUN   : 実行中
 * STEP  : Step 実行で 1 命令停止
 * BP    : ブレークポイント停止
 * END   : 正常終了
 * ERROR : エラー停止
 */

export class ExecutionController {
  /**
   * @param {VMState} vm
   * @param {{
   *   onStateChange?: function,
   *   onOutput?: function,
   * }} callbacks
   */
  constructor(vm, callbacks = {}) {
    this.vm = vm;

    // 実行状態
    this.stopReason = "STEP"; // 初期状態は「止まっている」
    this.running = false;

    // BP
    this.breakpoints = new Set();
    this.ignoreFirstBpOnce = false;

    // animation frame
    this._rafId = null;

    // callbacks
    this.onStateChange = callbacks.onStateChange || (() => {});
    this.onOutput = callbacks.onOutput || (() => {});
  }

  /* =========================
   * Public API
   * ========================= */

  run() {
    if (this.running) return;

    this.running = true;
    this.stopReason = "RUN";
    this._notify();

    this._runLoop();
  }

  step() {
    if (this.running) return;

    const r = this.vm.step();

    if (r === "ERROR") {
      this.stopReason = "ERROR";
    } else if (r === "END") {
      this.stopReason = "END";
    } else {
      this.stopReason = "STEP";
    }

    this._notify();
  }

  stop() {
    this.running = false;
    if (this._rafId != null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  reset(vm) {
    this.stop();
    this.vm = vm;
    this.stopReason = "STEP";
    this.running = false;
    this._notify();
  }

  toggleBreakpoint(ip) {
    if (this.breakpoints.has(ip)) {
      this.breakpoints.delete(ip);
    } else {
      this.breakpoints.add(ip);
    }
    this._notify();
  }

  setIgnoreFirstBpOnce(flag) {
    this.ignoreFirstBpOnce = !!flag;
  }

  /* =========================
   * Internal
   * ========================= */

  _runLoop() {
    const tick = () => {
      if (!this.running) return;

      const r = this.vm.step();

      // --- ERROR ---
      if (r === "ERROR") {
        this._halt("ERROR");
        return;
      }

      // --- END ---
      if (r === "END") {
        this._halt("END");
        return;
      }

      // --- BP ---
      if (this.breakpoints.has(this.vm.ip)) {
        if (this.ignoreFirstBpOnce) {
          this.ignoreFirstBpOnce = false;
        } else {
          this._halt("BP");
          return;
        }
      }

      this._rafId = requestAnimationFrame(tick);
    };

    this._rafId = requestAnimationFrame(tick);
  }

  _halt(reason) {
    this.running = false;
    this.stopReason = reason;

    if (this._rafId != null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    this._notify();
  }

  _notify() {
    this.onStateChange({
      stopReason: this.stopReason,
      running: this.running,
      ip: this.vm.ip,
      ptr: this.vm.ptr,
      pendingCount: this.vm.pendingCount ?? null,
      errorIp: this.vm.errorIp ?? null,
    });
  }
}
