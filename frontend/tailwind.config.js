/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#EFEEE8",
          dim: "#E7E4D9",
          line: "#DBD8CB",
        },
        ink: {
          DEFAULT: "#1B1B1F",
          soft: "#66645C",
          faint: "#8E8C81",
        },
        surface: "#FFFFFF",
        cobalt: {
          DEFAULT: "#3355FF",
          dark: "#2643D6",
          soft: "#E8ECFF",
        },
        verified: {
          DEFAULT: "#1F8A5F",
          soft: "#E3F3EA",
        },
        marker: {
          DEFAULT: "#FFD447",
          soft: "#FFF6D9",
        },
        danger: {
          DEFAULT: "#B23A2E",
          soft: "#FBEAE7",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Archivo", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        paper: "0 1px 2px rgba(27,27,31,0.04), 0 8px 24px -12px rgba(27,27,31,0.18)",
        "paper-lg": "0 4px 10px rgba(27,27,31,0.06), 0 24px 48px -20px rgba(27,27,31,0.28)",
        flag: "0 2px 6px rgba(51,85,255,0.35)",
      },
      backgroundImage: {
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marker: {
          "0%": { backgroundSize: "0% 40%" },
          "100%": { backgroundSize: "100% 40%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(.16,1,.3,1) forwards",
      },
    },
  },
  plugins: [],
};
