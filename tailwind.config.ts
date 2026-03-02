import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    green: '#243137',
                    golden: '#BD9F67',
                },
                esummit: {
                    bg: '#0b132b',      // Deep Blue Background
                    card: '#132247',    // Lighter shade for cards
                    primary: '#2563eb', // Base color theme
                    accent: '#60a5fa',  // Light Blue Accent
                    secondary: '#FFFFFF' // White
                }
            },
            fontFamily: {
                heading: ['Bebas Neue', 'cursive'],
                body: ['Poppins', 'sans-serif'],
            },
            animation: {
                shimmer: "shimmer 2s linear infinite",
            },
            keyframes: {
                shimmer: {
                    from: {
                        backgroundPosition: "0 0",
                    },
                    to: {
                        backgroundPosition: "-200% 0",
                    },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
export default config;
