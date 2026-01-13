// LanguageRegistry.js

export class LanguageRegistry {
  static languages = new Map();

  /**
   * 言語定義を登録する
   * validate に通らない場合は例外を投げる
   */
  static register(lang) {
    this.validate(lang);
    this.languages.set(lang.id, lang);
  }

  /**
   * 言語定義を取得する
   */
  static get(id) {
    const lang = this.languages.get(id);
    if (!lang) {
      throw new Error(`Language not found: ${id}`);
    }
    return lang;
  }

  /**
   * 登録されている全言語を配列で取得
   * UI の select 生成などに使用
   */
  static list() {
    return Array.from(this.languages.values());
  }

  /**
   * 言語定義の最低限の検証
   * （MVP 用：構造チェックのみ）
   */
  static validate(lang) {
    if (!lang) {
      throw new Error("language is required");
    }
    if (!lang.id || typeof lang.id !== "string") {
      throw new Error("language.id is required and must be string");
    }
    if (!lang.name || typeof lang.name !== "string") {
      throw new Error("language.name is required and must be string");
    }
    if (!lang.commands || typeof lang.commands !== "object") {
      throw new Error("language.commands is required");
    }
  }
}
