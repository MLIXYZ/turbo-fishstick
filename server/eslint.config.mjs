import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            '*.config.js',
            '*.config.mjs',
            '**/*.js',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,mts,cts}'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.es2021,
            },
        },
    },
]
