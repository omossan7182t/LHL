import { LanguageRegistry } from "../language/LanguageRegistry.js";

export function tokenizeNukuDialect(src, langId = "nuku") {
  const lang = LanguageRegistry.get(langId);
  const tokens = [];

  for (const ch of src) {
    const cmd = lang.commands[ch];
    if (!cmd) continue;

    tokens.push({
      op: cmd.op,
      delta: cmd.delta
    });
  }

  return tokens;
}
