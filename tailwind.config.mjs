/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			keyframes: {
				"deployment": {
					"0%": { opacity: 0.3, transform: "translateY(-30px)" },
					"100%": { opacity: 1, transform: "translateY(0px)" },
				},
				"displace": {
					"0%": { transform: "translate(100%)" },
					"100%": { transform: "translate(0)" }
				},
				"spin-custom": {
					"0%": { transform: "rotate(0deg)" },
					"100%": { transform: "rotate(360deg)" }
				}
			},
			animation: {
				"deployment": "deployment .3s ease-in-out",
				"displace": "displace .5s ease-in-out forwards",
				"spin-custom": "spin-custom 1s linear infinite",
			},
		},
	},
	plugins: [],
}
