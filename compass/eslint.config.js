import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // THEME ENFORCEMENT: Prevent raw color classes (Rule 1.1)
      // Blocks: bg-white, bg-black, text-white, text-black, bg-[#...], text-[#...]
      'no-restricted-syntax': [
        'error',
        {
          // Block raw white/black background classes
          selector: "Literal[value=/\\bbg-(white|black)\\b/]",
          message: 'Use semantic tokens (bg-background, bg-card) instead of bg-white/bg-black. See Rule 1.1.',
        },
        {
          // Block raw white/black text classes
          selector: "Literal[value=/\\btext-(white|black)\\b/]",
          message: 'Use semantic tokens (text-foreground, text-primary-foreground) instead of text-white/text-black. See Rule 1.1.',
        },
        {
          // Block raw hex colors in arbitrary values (bg-[#ffffff])
          selector: "Literal[value=/\\b(bg|text)-\\[#[0-9a-fA-F]{3,6}\\]/]",
          message: 'Raw hex colors are forbidden. Use semantic tokens from globals.css instead. See Rule 1.1.',
        },
        {
          // Block common raw color utilities (bg-gray-*, text-gray-*)
          selector: "Literal[value=/\\b(bg|text)-(gray|slate|zinc|neutral|stone)-(50|100|200|300|400|500|600|700|800|900|950)\\b/]",
          message: 'Use semantic tokens (bg-muted, text-muted-foreground) instead of raw gray utilities. See Rule 1.1.',
        },
      ],
    },
  },
])
