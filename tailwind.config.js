import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
        './resources/js/**/*.js',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                // Brand palette dari logo berwarna Candaria.
                // Biru indigo logo (#282888) — dipakai ulang lewat override `emerald`.
                primary: {
                    50:  '#ededfb',
                    100: '#d7d7f5',
                    200: '#b4b4ec',
                    300: '#8b8bdf',
                    400: '#6262cf',
                    500: '#4040b5',
                    600: '#2e2e97',
                    700: '#282888',
                    800: '#20206b',
                    900: '#1a1a54',
                    950: '#0f0f31',
                },
                // Override `emerald` => biru logo. Semua kelas emerald-* lama ikut biru.
                emerald: {
                    50:  '#ededfb',
                    100: '#d7d7f5',
                    200: '#b4b4ec',
                    300: '#8b8bdf',
                    400: '#6262cf',
                    500: '#3a3aa8',
                    600: '#2e2e97',
                    700: '#282888',
                    800: '#20206b',
                    900: '#1a1a54',
                    950: '#0f0f31',
                },
                // Override `teal` => kuning logo (#f8f818). Gradient emerald->teal jadi biru->kuning.
                teal: {
                    50:  '#fefce8',
                    100: '#fef9c3',
                    200: '#fdf08a',
                    300: '#fbe34d',
                    400: '#f5e000',
                    500: '#eac30a',
                    600: '#ca9e04',
                    700: '#a17708',
                    800: '#855f0e',
                    900: '#714f12',
                    950: '#422a06',
                },
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
                'fade-in-left': 'fadeInLeft 0.6s ease-out forwards',
                'fade-in': 'fadeIn 0.6s ease-out forwards',
            }
        },
    },

    plugins: [forms],
};
