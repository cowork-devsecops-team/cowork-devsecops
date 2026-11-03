import js from "@eslint/js";
import tseslint from "typescript-eslint";
import security from "eslint-plugin-security";

export default [
  { ignores: ["dist/**", "node_modules/**", "coverage/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  security.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs", globals: { module: "writable", require: "readonly", process: "readonly" } },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
];
