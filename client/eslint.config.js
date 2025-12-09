import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'

export default [
    {
        ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        plugins: {
            react: pluginReact,
            'react-hooks': pluginReactHooks,
        },
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            ...pluginReact.configs.recommended.rules,
            ...pluginReactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off',
        },
    },
]
