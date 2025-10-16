import globals from 'globals'
import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'src/components/ui', 'src/routeTree.gen.ts'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      ...pluginQuery.configs['flat/recommended'],
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-console': 'off', // Permitir console.log temporariamente
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // Desabilitar temporariamente
      '@typescript-eslint/no-explicit-any': 'off', // Permitir any temporariamente
      '@typescript-eslint/no-implicit-any-catch': 'off',
      '@typescript-eslint/ban-ts-comment': 'off', // Permitir @ts-ignore
      // Enforce type-only imports for TypeScript types
      '@typescript-eslint/consistent-type-imports': 'off', // Desabilitar temporariamente
      // Prevent duplicate imports from the same module
      'no-duplicate-imports': 'off', // Desabilitar temporariamente
    },
  }
)
