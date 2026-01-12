/**
 * @typedef {Object} VMError
 * @property {string} message
 * @property {number} ip
 */

export class VMState {
  memory = new Uint8Array(30000);
  ptr = 0;
  ip = 0;

  /** @type {Array} */
  tokens = [];

  /** @type {VMError|null} */
  error = null;

  /** 実行可能かどうか */
  runnable = true;

  constructor(tokens) {
    this.tokens = tokens;
  }

  /**
   * tokenize 結果から VMState を生成する
   * - tokenize error があれば runnable=false
   */
  static fromTokenizeResult(result) {
    const vm = new VMState(result.tokens || []);

    if (result.error) {
      vm.error = result.error;
      vm.ip = result.error.ip;
      vm.runnable = false;
    }

    return vm;
  }

  step() {
    if (!this.runnable) {
      return "ERROR";
    }

    const token = this.tokens[this.ip];
    if (!token) return "END";

    switch (token.op) {
      case "ADD":
        this.memory[this.ptr] += token.delta ?? 0;
        break;

      case "MOVE":
        this.ptr += token.delta ?? 0;
        break;

      case "OUTPUT":
        console.log(String.fromCharCode(this.memory[this.ptr]));
        break;

      case "LOOP_START":
        if (this.memory[this.ptr] === 0) {
          this.ip = token.jump;
        }
        break;

      case "LOOP_END":
        if (this.memory[this.ptr] !== 0) {
          this.ip = token.jump;
        }
        break;
    }

    this.ip++;
    return "RUNNING";
  }
}
