import { LanguageRegistry } from "../language/LanguageRegistry.js";

/**
 * tokenize result:
 * {
 *   tokens: Token[],
 *   error: null | { message, ip }
 * }
 */
export function tokenizeNukuDialect(src, langId = "nuku") {
  const lang = LanguageRegistry.get(langId);

  const tokens = [];
  const loopStack = [];

  let ip = 0;

  for (const ch of src) {
    const cmd = lang.commands[ch];
    if (!cmd) continue;

    const token = {
      op: cmd.op,
      delta: cmd.delta,
      ip
    };

    if (cmd.op === "LOOP_START") {
      loopStack.push(ip);
    }

    if (cmd.op === "LOOP_END") {
      if (loopStack.length === 0) {
        return {
          tokens: [],
          error: {
            message: "Unmatched ']'",
            ip
          }
        };
      }
      const startIp = loopStack.pop();
      token.jump = startIp;
      tokens[startIp].jump = ip;
    }

    tokens.push(token);
    ip++;
  }

  if (loopStack.length > 0) {
    return {
      tokens: [],
      error: {
        message: "Unmatched '['",
        ip: loopStack[0]
      }
    };
  }

  return { tokens, error: null };
}
