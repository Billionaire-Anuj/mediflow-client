import tseslint from "typescript-eslint";
import turbo from "eslint-config-turbo/flat";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
    ...turbo,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: true,
                sourceType: "module",
                ecmaVersion: "latest"
            }
        },
        plugins: {
            prettier: prettierPlugin
        },
        rules: {
            "prettier/prettier": "warn"
        }
    },
    prettier
];
