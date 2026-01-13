// vm/VMState.js
// Brainfuck ベース VM（number literal / loop / memory view 対応）

class VMState {
  constructor(tokens, jumpTable) {
    this.tokens = tokens;
    this.jumpTable = jumpTable;

    this.memory = new Uint8Array(30000);
    this.ptr = 0;
    this.ip = 0;

    // number literal 用
    this.pendingCount = 0;

    // error
    this.error = null;
    this.errorIp = null;
  }

  /* =========================
   * factory
   * ========================= */

  static fromTokenizeResult(result) {
    const { tokens, jumpTable } = result;
    return new VMState(tokens, jumpTable);
  }

  /* =========================
   * step 実行
   * ========================= */

  step() {
    if (this.ip < 0 || this.ip >= this.tokens.length) {
      return "END";
    }

    const token = this.tokens[this.ip];

    try {
      switch (token.op) {
        case "NUMBER":
          // 次の ADD に合算される
          this.pendingCount += token.value;
          this.ip++;
          return "RUN";

        case "ADD":
          this.memory[this.ptr] =
            (this.memory[this.ptr] + (token.delta ?? 0) + this.pendingCount) & 0xff;
          this.pendingCount = 0;
          break;

        case "MOVE":
          this.ptr += token.delta ?? 0;
          if (this.ptr < 0) this.ptr = 0;
          if (this.ptr >= this.memory.length) {
            this.ptr = this.memory.length - 1;
          }
          break;

        case "OUTPUT":
          // 出力は controller 側でフック
          break;

        case "INPUT":
          // MVP では未対応
          break;

        case "LOOP_START":
          if (this.memory[this.ptr] === 0) {
            const jumpTo = this.jumpTable.get(this.ip);
            if (jumpTo == null) {
              throw new Error("unmatched LOOP_START");
            }
            this.ip = jumpTo;
          }
          break;

        case "LOOP_END":
          if (this.memory[this.ptr] !== 0) {
            const jumpBack = this.jumpTable.get(this.ip);
            if (jumpBack == null) {
              throw new Error("unmatched LOOP_END");
            }
            this.ip = jumpBack;
          }
          break;

        default:
          // no-op
          break;
      }
    } catch (err) {
      this.error = err;
      this.errorIp = this.ip;
      return "ERROR";
    }

    this.ip++;
    return "RUN";
  }

  /* =========================
   * Memory ViewModel
   * ========================= */

  getMemoryViewModel() {
    const view = [];

    const MAX = 80;
    for (let i = 0; i < MAX; i++) {
      const value = this.memory[i];
      view.push({
        index: i,
        value,
        char: this.toPrintableChar(value),
      });
    }

    return view;
  }

  /* =========================
   * UTF-8 printable 判定
   * ========================= */

  toPrintableChar(value) {
    if (value >= 32 && value <= 126) {
      return String.fromCharCode(value);
    }
    return ".";
  }
}

window.VMState = VMState;
