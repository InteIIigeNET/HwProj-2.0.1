import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import checker from 'vite-plugin-checker'
import environment from 'vite-plugin-environment';

export default defineConfig({
    root: './',
    publicDir: 'public',
    plugins: [
        react(),
        tsconfigPaths(),
        svgr({
            svgrOptions: {
                icon: true
            }
        }),
        checker({
            typescript: true,
            eslint: {
                useFlatConfig: true,
                lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
                dev: {
                    logLevel: ['error']
                }
            }
        }),
        environment(['NODE_ENV'])
    ],
    server: {
        host: '0.0.0.0',
        port: 3000,
        allowedHosts: ["hwproj.ru", "localhost"],
        hmr: {
            host: 'localhost',
            port: 3000,
            protocol: 'ws'
        },
        open: true
    },
    build: {
        outDir: "dist",
        //emptyOutDir: true
    }
})