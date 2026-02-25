import type { ThemeRegistration } from 'shiki';

/**
 * Vizly Dark — custom Shiki theme
 * Colors mirror the Vizly design system:
 *   keywords      → #7c4dff  (purple)
 *   class names   → #00e5ff  (cyan)
 *   functions     → #1de9b6  (teal)
 *   strings       → #ff9f43  (orange)
 *   comments      → #4d5a6e  (gray, italic)
 *   numbers/const → #ff4081  (pink)
 *   plain text    → #a0aab4  (text-dim)
 */
export const vizlyTheme: ThemeRegistration = {
    name: 'vizly-dark',
    type: 'dark',
    // VS Code editor colors
    colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#a0aab4',
        'editorLineNumber.foreground': '#2d3748',
        'editorCursor.foreground': '#7c4dff',
        'editor.selectionBackground': 'rgba(124,77,255,0.2)',
    },
    // TextMate grammar rules (shiki v1.x uses this format)
    tokenColors: [
        // ── Plain text / fallback ──
        {
            settings: { foreground: '#a0aab4' },
        },
        // ── Comments ──
        {
            scope: [
                'comment',
                'punctuation.definition.comment',
                'comment.block',
                'comment.line',
            ],
            settings: { foreground: '#4d5a6e', fontStyle: 'italic' },
        },
        // ── Keywords, control flow, modifiers ──
        {
            scope: [
                'keyword',
                'keyword.control',
                'keyword.control.flow',
                'keyword.operator',
                'meta.var.expr keyword',
                'storage',
                'storage.type',
                'storage.modifier',
                'variable.language.this',
                'variable.language.super',
                'constant.language.undefined',
                'constant.language.null',
                'constant.language.boolean',
            ],
            settings: { foreground: '#7c4dff', fontStyle: 'bold' },
        },
        // ── Class and type names ──
        {
            scope: [
                'entity.name.type',
                'entity.name.class',
                'entity.other.inherited-class',
                'support.class',
                'meta.class entity.name.type.class',
                // TypeScript type annotations
                'support.type.primitive',
                'meta.type.annotation entity.name.type',
            ],
            settings: { foreground: '#00e5ff' },
        },
        // ── Function and method names ──
        {
            scope: [
                'entity.name.function',
                'support.function',
                'meta.function-call entity.name.function',
                'meta.method-call entity.name.function',
                'variable.function',
            ],
            settings: { foreground: '#1de9b6' },
        },
        // ── String literals ──
        {
            scope: [
                'string',
                'string.quoted.single',
                'string.quoted.double',
                'string.template',
                'punctuation.definition.string',
            ],
            settings: { foreground: '#ff9f43' },
        },
        // ── Template literal expressions ──
        {
            scope: ['punctuation.definition.template-expression'],
            settings: { foreground: '#7c4dff' },
        },
        // ── Numbers ──
        {
            scope: ['constant.numeric', 'constant.numeric.decimal', 'constant.numeric.hex'],
            settings: { foreground: '#ff4081' },
        },
        // ── Other constants ──
        {
            scope: ['constant.other', 'support.constant'],
            settings: { foreground: '#ff4081' },
        },
        // ── Variables (general) ──
        {
            scope: ['variable', 'variable.other.readwrite'],
            settings: { foreground: '#a0aab4' },
        },
        // ── Parameters ──
        {
            scope: ['variable.parameter'],
            settings: { foreground: '#c0c8d4' },
        },
        // ── TypeScript-specific ──
        {
            scope: [
                'storage.type.type.ts',
                'storage.type.interface.ts',
                'storage.type.enum.ts',
                'meta.type.parameters',
            ],
            settings: { foreground: '#7c4dff', fontStyle: 'bold' },
        },
        // ── Punctuation (brackets, commas) ──
        {
            scope: ['punctuation', 'meta.brace'],
            settings: { foreground: '#8892a4' },
        },
        // ── Decorators ──
        {
            scope: ['meta.decorator', 'punctuation.decorator'],
            settings: { foreground: '#ff9f43' },
        },
        // ── JSX / HTML tags ──
        {
            scope: ['entity.name.tag', 'support.class.component'],
            settings: { foreground: '#ff4081' },
        },
        {
            scope: ['entity.other.attribute-name'],
            settings: { foreground: '#1de9b6' },
        },
    ],
};
