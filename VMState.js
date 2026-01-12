export class VMState {
  constructor(tokens = []) {
    this.memory = new Uint8Array(30000);
    this.ptr = 0;
    this.ip = 0;
    this.tokens = tokens;
    this.errorIp = null;
    this.pendingCount = 0;
  }

  fromTokenizeResult(tokens) {
    this.tokens = tokens;
    this.ip = 0;
    this.ptr = 0;
    this.errorIp = null;
    this.pendingCount = 0;
  }

  step() {
    const tok = this.tokens[this.ip];
    if (!tok) return "END";

    if (tok.error) {
      this.errorIp = this.ip;
      return "ERROR";
    }

    switch (tok.op) {
      case "ADD":
        this.memory[this.ptr] += tok.delta ?? 0;
        break;
      case "MOVE":
        this.ptr += tok.delta ?? 0;
        break;
      case "OUTPUT":
        console.log(String.fromCharCode(this.memory[this.ptr]));
        break;
      case "INPUT":
        // 入力未実装（MVP）
        break;
      case "LOOP_START":
        if (this.memory[this.ptr] === 0) this.ip = tok.jump ?? this.ip;
        break;
      case "LOOP_END":
        if (this.memory[this.ptr] !== 0) this.ip = tok.jump ?? this.ip;
        break;
    }

    this.ip++;
    return "RUNNING";
  }

  execute() {
    let status;
    while ((status = this.step()) === "RUNNING") {}
    return status;
  }

  getMemoryViewModel() {
    return Array.from(this.memory.slice(0, 80)).map((v, i) => ({
      index: i,
      value: v,
      char: v >= 32 && v <= 126 ? String.fromCharCode(v) : ""
    }));
  }
}
