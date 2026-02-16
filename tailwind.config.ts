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
                    bg: '#030014',      // Deep space black
                    card: '#0f0b29',    // Dark purple/blue card bg
                    primary: '#9d4edd',  // Electric Purple
                    accent: '#00f0ff',   // Cyan/Neon Blue
                }
            },
            fontFamily: {
                heading: ['Bebas Neue', 'cursive'],
                body: ['Poppins', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
export default config;
