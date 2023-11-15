// @ts-check
const { skeleton } = require('@skeletonlabs/tw-plugin');
import { myCustomTheme } from "./my-custom-theme";
import forms from "@tailwindcss/forms"
const plugin = require('tailwindcss/plugin')

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
		forms,
		plugin(({ addComponents }) => {
			addComponents({
				".toast-success": {
					border: '4px solid #3a8146',
					boxShadow: '0 2px 0 2px #3a8146'
				},
				".toast-warning": {
					border: '4px solid #b57e40',
					boxShadow: '0 2px 0 2px #b57e40'
				},
				".toast-error": {
					border: '4px solid #8b3731',
					boxShadow: '0 2px 0 2px #8b3731'
				},
			})
		})
	]
}
						