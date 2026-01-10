import storybook from "eslint-plugin-storybook";

export default [
    {
        plugins: {
            storybook
        },
        rules: {
            ...storybook.configs.recommended.rules
        }
    }
];
