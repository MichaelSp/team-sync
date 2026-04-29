
import eslint from '@eslint/js';
import github from 'eslint-plugin-github';
import jest from 'eslint-plugin-jest';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    ...github.getFlatConfigs().typescript,
    {
        plugins: {
            jest
        },
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.eslint.json'],
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        }
    },
);