import path from "path";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    console.log(`Development Mode Configurations: ${mode}.`);
    console.log(`Server API URL: ${env.VITE_API_URL}.`);

    return {
        build: {
            outDir: "dist"
        },
        plugins: [
            react(),
            svgr({
                svgrOptions: {
                    icon: true,
                    replaceAttrValues: {
                        "#141414": "currentColor",
                        "#000": "currentColor",
                        "#000000": "currentColor"
                    },
                    svgo: true,
                    svgoConfig: {
                        plugins: [
                            {
                                name: "addAttributesToSVGElement",
                                params: { attributes: [{ stroke: "currentColor" }] }
                            }
                        ]
                    }
                }
            })
        ],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "src"),
                src: path.resolve(__dirname, "src")
            }
        },
        server: {
            port: 6075,
            proxy: {
                "/api": {
                    target: env.VITE_API_URL,
                    changeOrigin: true,
                    secure: false
                }
            }
        },
        preview: {
            port: 8080
        }
    };
});
