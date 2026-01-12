import { LanguageRegistry } from "../language/LanguageRegistry";

export function tokenizeNukuDialect(
  src: string,
  langId = "nuku"
) {
  const lang = LanguageRegistry.get(langId);
  const tokens = [];

  for (const ch of src) {
    const cmd = lang.commands[ch];
    if (!cmd) continue;

    tokens.push({
      op: cmd.op,
      delta: cmd.delta,
    });
  }

  return tokens;
}
