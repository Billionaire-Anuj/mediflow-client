import react from "eslint-plugin-react";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import { fixupPluginRules } from "@eslint/compat";
import reactHooksRaw from "eslint-plugin-react-hooks";

const reactHooks = fixupPluginRules(reactHooksRaw);

export default [
    {
        plugins: {
            react,
            "react-hooks": reactHooks,
            "jsx-a11y": jsxA11y,
            import: importPlugin
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "react/jsx-uses-react": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn"
        },
        settings: {
            react: {
                version: "detect"
            }
        }
    }
];
