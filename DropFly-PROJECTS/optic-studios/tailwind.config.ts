import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Optic Studios refined brand colors
        brand: {
          orange: "#C4612A", // Primary orange from logo
          light: "#E07B39", // Lighter orange for accents
          dark: "#B8571F", // Darker orange for depth
          black: "#0A0A0A", // Rich black
          white: "#FFFFFF", // Pure white
          gray: "#1A1A1A", // Dark gray for cards
          neutral: "#404040", // Medium gray for text
        },
        // Refined accent colors
        accent: {
          orange: "#FF7A3D", // Bright orange highlight
          copper: "#D2691E", // Copper tone
          cream: "#FFF8F0", // Warm white
          charcoal: "#2C2C2C", // Charcoal for depth
        }
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #C4612A 0%, #E07B39 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #B8571F 0%, #C4612A 100%)',
        'orange-gradient': 'linear-gradient(135deg, #E07B39 0%, #FF7A3D 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
        'accent-gradient': 'linear-gradient(135deg, #C4612A 0%, #FFFFFF 100%)',
      }
    },
  },
  plugins: [],
} satisfies Config;