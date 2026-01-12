/**
 * Tokenize source code written in Nuku dialect.
 * @param {string} src
 * @param {string} langId
 * @returns {{ tokens: Array, error: VMError | null, warnings: VMWarning[] }}
 */
export function tokenizeNukuDialect(src, langId = "nuku") {
  const lang = LanguageRegistry.get(langId)

  const tokens = []
  const warnings = []

  let ip = 0

  // 単語単位（空白 or 改行）
  const words = src.split(/\s+/).filter(Boolean)

  for (let wIndex = 0; wIndex < words.length; wIndex++) {
    const word = words[wIndex]

    /* ---------- number literal ---------- */
    if (word.startsWith("ぬっ")) {
      const match = /^ぬ(っ+)く$/.exec(word)
      if (!match) {
        return {
          tokens,
          warnings,
          error: new VMError(
            "INVALID_NUMBER",
            "Invalid nuku number literal",
            ip,
            "TOKENIZE"
          ),
        }
      }

      const power = match[1].length - 1
      const value = Math.pow(10, power)

      // 巨大 number → medium warning
      if (power >= 5) {
        warnings.push(
          new VMWarning({
            code: "LARGE_NUMBER",
            message: "Large number literal may cause unintended output",
            ip,
            severity: "medium",
            source: "TOKENIZE",
          })
        )
      }

      tokens.push({
        op: "ADD",
        delta: value,
        sourceWordIndex: wIndex,
      })

      // 境界曖昧チェック（次の単語が命令で区切りなし感）
      const next = words[wIndex + 1]
      if (next && !next.startsWith("ぬっ") && !lang.commands[next]) {
        warnings.push(
          new VMWarning({
            code: WarningCodes.AMBIGUOUS_BOUNDARY,
            message: "Ambiguous boundary after number literal",
            ip,
            severity: "medium",
            source: "TOKENIZE",
          })
        )
      }

      ip++
      continue
    }

    /* ---------- command ---------- */
    const cmd = lang.commands[word]
    if (cmd) {
      tokens.push({
        op: cmd.op,
        delta: cmd.delta,
        sourceWordIndex: wIndex,
      })

      // 冗長 command 連続 → low warning
      const prev = tokens[tokens.length - 2]
      if (
        prev &&
        prev.op === cmd.op &&
        typeof cmd.delta === "number" &&
        cmd.op === "ADD"
      ) {
        warnings.push(
          new VMWarning({
            code: WarningCodes.INEFFICIENT_COMMAND_RUN,
            message: "Repeated commands could be encoded as a number literal",
            ip,
            severity: "low",
            source: "TOKENIZE",
          })
        )
      }

      ip++
      continue
    }

    /* ---------- unknown word ---------- */
    // 仕様：完全無視（Brainfuck 準拠）
    continue
  }

  return {
    tokens,
    error: null,
    warnings,
  }
}
