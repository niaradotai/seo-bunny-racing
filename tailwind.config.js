module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}", // Include src directory files
        "./app/**/*.{js,ts,jsx,tsx}", // App Router support
        "./pages/**/*.{js,ts,jsx,tsx}", // Pages Router (if used)
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            animation: {
                'move-right-slow': 'moveRight 20s linear infinite',
                'move-right-medium': 'moveRight 15s linear infinite',
                'move-right-fast': 'moveRight 10s linear infinite',
            },
            keyframes: {
                moveRight: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100vw)' },
                },
            },
        },
    },
    plugins: [],
};
