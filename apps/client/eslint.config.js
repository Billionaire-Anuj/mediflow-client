import config from "@mediflow/eslint-custom-config";

export default [
    ...config.base,
    ...config.react,
    ...config.vite
].flat();
