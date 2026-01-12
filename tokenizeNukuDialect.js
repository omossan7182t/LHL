import { LanguageRegistry } from "../language/LanguageRegistry";

/**
 * @typedef {Object} Token
 * @property {string} op
 * @property {number=} delta
 * @property {number=} jump
 */

/**
 * @typedef {Object} VMError
 * @property {string} message
 * @property {number} ip
 */

/**
 * @typedef {Object} TokenizeResult
 * @property {Token[]} tokens
 * @property {VMError=} error
 * @property {Array=} warnings
 */

/**
 * tokenizeNukuDialect
 * - 命令抽出
 * - LOOP_START / LOOP_END のジャンプテーブル構築
 * - unmatched loop を tokenize error として返す
 */
export function tokenizeNukuDialect(src, langId = "nuku") {
  const lang = LanguageRegistry.get(langId);

  /** @type {Token[]} */
  const tokens = [];

  /** @type {number[]} */
  const loopStack = [];

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const cmd = lang.commands[ch];
    if (!cmd) continue;

    const token = {
      op: cmd.op,
      delta: cmd.delta,
    };

    const ip = tokens.length;

    // LOOP_START
    if (token.op === "LOOP_START") {
      loopStack.push(ip);
    }

    // LOOP_END
    if (token.op === "LOOP_END") {
      const startIp = loopStack.pop();
      if (startIp == null) {
        return {
          tokens,
          error: {
            message: "Unmatched LOOP_END",
            ip,
          },
        };
      }
      token.jump = startIp;
      tokens[startIp].jump = ip;
    }

    tokens.push(token);
  }

  // unmatched LOOP_START
  if (loopStack.length > 0) {
    const ip = loopStack.pop();
    return {
      tokens,
      error: {
        message: "Unmatched LOOP_START",
        ip,
      },
    };
  }

  return { tokens };
}
