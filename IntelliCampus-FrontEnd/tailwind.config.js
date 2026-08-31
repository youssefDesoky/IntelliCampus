export default {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: { extend: {} },
  safelist: [
    { pattern: /(bg|text|border)-(blue|green|yellow|purple|red|gray)-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /border-(blue|green|yellow|purple|red|gray)-(50|100|200|300|400|500|600|700|800|900|950)/, variants: ['before'] }
  ],
  plugins: [
    require('@tailwindcss/typography'),
  ],
};