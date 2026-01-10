import config from "@mediflow/eslint-custom-config";

export default [
    ...config.base,
    {
        ignores: ["node_modules", "dist", "coverage"]
    }
].flat();
