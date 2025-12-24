import defaultTheme from 'tailwindcss/defaultTheme';
import config from './tailwind.theme.config.js';
import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';
import aspectRatio from '@tailwindcss/aspect-ratio';

/**
 * Find the applicable theme color palette, or use the default one
 */
const themeConfig = process.env.THEME_KEY && config[process.env.THEME_KEY] ? config[process.env.THEME_KEY] : config.default;
const { colors } = themeConfig;

export default {
    darkMode: 'class',
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}'
    ],
    safelist: ['dark'],
    theme: {
        fontFamily: {
            sans: ['Fira Code', ...defaultTheme.fontFamily.sans],
        },
        extend: {
            colors: {
                theme: {
                    ...colors
                }
            },
            typography: (theme) => ({
                dark: {
                    css: {
                        color: theme("colors.gray.200"),
                        blockquote: {
                            color: colors.dark.primary,
                            borderColor: colors.primary
                        },
                        'blockquote > p::before, p::after': {
                            color: colors.primary,
                        },
                    },
                },
                DEFAULT: {
                    css: {
                        a: {
                            color: colors.dark.primary,
                            '&:hover': {
                                color: colors.primary,
                            },
                        },
                        blockquote: {
                            color: colors.primary,
                            fontSize: theme("fontSize.2xl"),
                            borderColor: colors.dark.primary,
                        },
                        'blockquote > p::before, p::after': {
                            color: colors.dark.primary,
                        },
                        h1: {
                            color: colors.dark.secondary,
                        },
                        h2: {
                            color: colors.dark.secondary,
                        },
                        h3: {
                            color: colors.dark.secondary,
                        },
                    }
                },
            }),
        },
    },
    variants: {
        extend: { typography: ["dark"] }
    },
    plugins: [
        typography,
        forms,
        aspectRatio,
    ]
};
