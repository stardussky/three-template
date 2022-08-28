import { defineConfig } from 'vite'
import postcssPresetEnv from 'postcss-preset-env'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
    server: {
        host: '0.0.0.0',
    },
    resolve: {
        alias: [
            { find: '~', replacement: process.cwd() },
            { find: '@', replacement: '/src' },
        ],
    },
    plugins: [
        glsl(),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `
                `,
            },
        },
        postcss: {
            plugins: [postcssPresetEnv({
                browsers: 'last 2 versions',
                autoprefixer: { grid: true },
            })],
        },
    },
})
