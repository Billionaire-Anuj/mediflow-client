import reactRefresh from "eslint-plugin-react-refresh";

export default [
    {
        plugins: {
            "react-refresh": reactRefresh
        },
        rules: {
            "react-refresh/only-export-components": "warn",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/no-unused-expressions": "off",
            "no-unused-expressions": "off"
        }
    }
];
