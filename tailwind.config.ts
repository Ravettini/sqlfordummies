import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta GCBA según Manual de Marca
        'gcba-yellow': '#FFCC00',
        'gcba-cyan': '#8DE2D6',
        'gcba-blue': '#153244',
        'gcba-gray': '#3C3C3B',
        'gcba-offwhite': '#FCFCFC',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        // Tipografía Archivo según Manual de Marca GCBA
        'archivo': ['Archivo', 'sans-serif'],
        'sans': ['Archivo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

