// @ts-check
const { skeleton } = require('@skeletonlabs/tw-plugin');
import { myCustomTheme } from "./my-custom-theme";
import forms from "@tailwindcss/forms"

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		require('path').join(require.resolve(
			'@skeletonlabs/skeleton'),
			'../**/*.{html,js,svelte,ts}'
		)
	],
	theme: {
		extend: {},
	},
	plugins: [
		skeleton({
			themes: {
				custom: [
					myCustomTheme
				]
			}
		}),
		forms
	]
}
						