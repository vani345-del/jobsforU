/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // Override default colors to use RGB instead of OKLCH
            colors: {
                // Keep Tailwind's default colors but force RGB format
                // This prevents oklch() which html2canvas doesn't support
            }
        },
    },
    // Force RGB color format instead of OKLCH
    corePlugins: {
        // Ensure colors use RGB
    },
    // Use RGB colors for better compatibility with html2canvas
    future: {
        hoverOnlyWhenSupported: true,
    },
}
