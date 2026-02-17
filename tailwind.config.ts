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
                    bg: '#050A14',      // Deep Midnight Blue
                    card: '#0A1124',    // Darker Blue for cards
                    primary: '#FFB800', // Electric Amber/Gold
                    accent: '#94A3B8',  // Metallic Slate Blue (Replacing Neon Cyan)
                    secondary: '#E2E8F0' // Platinum Silver
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
    plugins: [],
};
export default config;
