import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import typescriptEslintParser from '@typescript-eslint/parser';

export default [
    // Задаем файлы и директории, для которых не требуется проверка eslint
    {
        ignores: [
            "node_modules",
            "dist",
            "build/**/*",
            "*config.*",
            "public",
            "src/api/api.ts" // Поскольку этот файл автогенерируется
        ]
    },
    
    // Базовые рекомендуемые правила ESLint
    js.configs.recommended,
    
    // Конфигурация для проекта на TypeScript
    {
        files: ["**/*.{ts,tsx}"],
        plugins: {
            react: reactPlugin,
            '@typescript-eslint': tsPlugin,
            import: importPlugin
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            },
            parser: typescriptEslintParser,
            parserOptions: {
                ecmaFeatures: { jsx: true },
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json',
            }
        },
        settings: {
            react: { version: 'detect' },
            'import/resolver': {
                typescript: {
                    alwaysTryTypes: true, // Всегда пытаться резолвить через TS
                    project: './tsconfig.json' // Использовать пути из tsconfig
                },
                node: true // Разрешить импорты из Node.js модулей
            }
        },
        rules: {
            // Базовые правила
            'eqeqeq': ['warn', 'always', { null: 'never' }],  // Требует === вместо ==, кроме сравнения с null и undefined
            'no-console': 'warn', // Предупреждение при console.log
            'no-unused-vars': 'warn', // Неиспользуемые переменные
            'no-empty': 'warn', // Пустые блоки кода
            'no-useless-escape': 'warn', // Избыточное экранирование символов
            'no-undef': 'off', // Рекомендовано отключать для typescript-проектов
            // 'curly': 'error', // Фигурные скобки для блоков

            // React правила
            'react/react-in-jsx-scope': 'off', // Отключает требование импорта React (для React 17+)
            'react/jsx-uses-react': 'warn', // Помечает неиспользуемый React
            'react/jsx-uses-vars': 'warn', // Помечает неиспользуемые JSX переменные

            // TypeScript правила
            '@typescript-eslint/no-explicit-any': 'warn', // Запрет на тип 'any'
            //'@typescript-eslint/consistent-type-imports': 'warn' // Единообразие type imports

            // Правила импортов
            // 'import/order': [
            //     'warn',
            //     {
            //         groups: [ // Порядок групп импортов
            //             'builtin',  // Встроенные модули (path, fs)
            //             'external', // Внешние зависимости (react, lodash)
            //             'internal', // Внутренние пути (@/components)
            //             'parent',   // Импорты из родительских директорий
            //             'sibling',  // Импорты из текущей директории
            //             'index'     // Индексные файлы
            //         ],
            //         'newlines-between': 'always' // Пустые строки между группами
            //     }
            // ]
        }
    },
    
    // Конфигурация для редких JavaScript-файлов
    {
        files: ["**/*.js"],
        languageOptions: {
            globals: {
                ...globals.node
            },
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module"
            }
        }
    }
]