export const NukuLanguage = {
  id: "nuku",
  name: "ぬく方言",
  unofficial: true,
  commands: {
    "+": { op: "ADD", delta: 1 },
    "-": { op: "ADD", delta: -1 },
    ">": { op: "MOVE", delta: 1 },
    "<": { op: "MOVE", delta: -1 },
    ".": { op: "OUTPUT" },
    ",": { op: "INPUT" },
    "[": { op: "LOOP_START" },
    "]": { op: "LOOP_END" },
  },
  samples: {
    helloWorld: `ぬくぬくぬく ぬく ぬく ぬくく ぬくぬくっ...` // 実際のHello Worldコードは後で設定
  }
};
