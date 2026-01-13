/**
 * Token 型（前提）
 *
 * command:
 * { type: "command", op: string, delta?: number }
 *
 * number:
 * { type: "number", value: number }
 */

export class VMState {
  constructor(tokens, jumpTable = {}) {
    this.tokens = tokens;

    this.jumpTable = jumpTable;

    this.memory = new Uint8Array(30000);
    this.ptr = 0;
    this.ip = 0;

    // number literal 用
    this.pendingCount = 0;

    // error handling
    this.error = null;
    this.errorIp = null;
  }

  /**
   * 1 step 実行
   *
   * @returns {"RUNNING"|"END"|"ERROR"}
   */
  step() {
    if (this.ip >= this.tokens.length) {
      return "END";
    }

    const token = this.tokens[this.ip];

    try {
      if (token.type === "number") {
        this.pendingCount += token.value;
        this.ip++;
        return "RUNNING";
      }

      if (token.type === "command") {
        this.executeCommand(token);
        return "RUNNING";
      }

      throw new Error(`Unknown token type: ${token.type}`);
    } catch (e) {
      this.error = e;
      this.errorIp = this.ip;
      return "ERROR";
    }
  }

  executeCommand(token) {
    switch (token.op) {
      case "ADD": {
        const value = this.consumePendingOrDelta(token.delta);
        this.memory[this.ptr] += value;
        this.ip++;
        break;
      }

      case "MOVE": {
        const value = this.consumePendingOrDelta(token.delta);
        this.ptr += value;
        if (this.ptr < 0) this.ptr = 0;
        if (this.ptr >= this.memory.length) {
          this.ptr = this.memory.length - 1;
        }
        this.ip++;
        break;
      }

      case "OUTPUT": {
        console.log(String.fromCharCode(this.memory[this.ptr]));
        this.ip++;
        break;
      }

      case "INPUT": {
        // MVP では未実装（将来拡張）
        this.ip++;
        break;
      }

      case "LOOP_START": {
        if (this.memory[this.ptr] === 0) {
          const jumpTo = this.jumpTable[this.ip];
          if (jumpTo === undefined) {
            throw new Error("Unmatched LOOP_START");
          }
          this.ip = jumpTo + 1;
        } else {
          this.ip++;
        }
        break;
      }

      case "LOOP_END": {
        if (this.memory[this.ptr] !== 0) {
          const jumpTo = this.jumpTable[this.ip];
          if (jumpTo === undefined) {
            throw new Error("Unmatched LOOP_END");
          }
          this.ip = jumpTo;
        } else {
          this.ip++;
        }
        break;
      }

      default:
        throw new Error(`Unsupported op: ${token.op}`);
    }
  }

  consumePendingOrDelta(delta) {
    if (this.pendingCount > 0) {
      const v = this.pendingCount;
      this.pendingCount = 0;
      return v;
    }
    return delta ?? 0;
  }

  /**
   * tokenize 結果から VMState を生成
   * jumpTable をここで構築
   */
  static fromTokenizeResult(tokens) {
    const jumpTable = {};
    const stack = [];

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.type !== "command") continue;

      if (t.op === "LOOP_START") {
        stack.push(i);
      } else if (t.op === "LOOP_END") {
        if (stack.length === 0) {
          // tokenize 時点で warning にしてもよいが、
          // VM 実行時 ERROR としても扱える
          throw new Error("Unmatched LOOP_END");
        }
        const start = stack.pop();
        jumpTable[start] = i;
        jumpTable[i] = start;
      }
    }

    if (stack.length > 0) {
      throw new Error("Unmatched LOOP_START");
    }

    return new VMState(tokens, jumpTable);
  }
}
