export const myCustomTheme = {
    name: 'my-custom-theme',
    properties: {
		// =~= Theme Properties =~=
		"--theme-font-family-base": `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`,
		"--theme-font-family-heading": `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace`,
		"--theme-font-color-base": "0 0 0",
		"--theme-font-color-dark": "255 255 255",
		"--theme-rounded-base": "8px",
		"--theme-rounded-container": "8px",
		"--theme-border-base": "6px",
		// =~= Theme On-X Colors =~=
		"--on-primary": "0 0 0",
		"--on-secondary": "0 0 0",
		"--on-tertiary": "0 0 0",
		"--on-success": "255 255 255",
		"--on-warning": "0 0 0",
		"--on-error": "255 255 255",
		"--on-surface": "0 0 0",
		// =~= Theme Colors  =~=
		// primary | #75eac7 
		"--color-primary-50": "234 252 247", // #eafcf7
		"--color-primary-100": "227 251 244", // #e3fbf4
		"--color-primary-200": "221 250 241", // #ddfaf1
		"--color-primary-300": "200 247 233", // #c8f7e9
		"--color-primary-400": "158 240 216", // #9ef0d8
		"--color-primary-500": "117 234 199", // #75eac7
		"--color-primary-600": "105 211 179", // #69d3b3
		"--color-primary-700": "88 176 149", // #58b095
		"--color-primary-800": "70 140 119", // #468c77
		"--color-primary-900": "57 115 98", // #397362
		// secondary | #d27fbc 
		"--color-secondary-50": "248 236 245", // #f8ecf5
		"--color-secondary-100": "246 229 242", // #f6e5f2
		"--color-secondary-200": "244 223 238", // #f4dfee
		"--color-secondary-300": "237 204 228", // #edcce4
		"--color-secondary-400": "224 165 208", // #e0a5d0
		"--color-secondary-500": "210 127 188", // #d27fbc
		"--color-secondary-600": "189 114 169", // #bd72a9
		"--color-secondary-700": "158 95 141", // #9e5f8d
		"--color-secondary-800": "126 76 113", // #7e4c71
		"--color-secondary-900": "103 62 92", // #673e5c
		// tertiary | #c1ec8d 
		"--color-tertiary-50": "246 252 238", // #f6fcee
		"--color-tertiary-100": "243 251 232", // #f3fbe8
		"--color-tertiary-200": "240 250 227", // #f0fae3
		"--color-tertiary-300": "230 247 209", // #e6f7d1
		"--color-tertiary-400": "212 242 175", // #d4f2af
		"--color-tertiary-500": "193 236 141", // #c1ec8d
		"--color-tertiary-600": "174 212 127", // #aed47f
		"--color-tertiary-700": "145 177 106", // #91b16a
		"--color-tertiary-800": "116 142 85", // #748e55
		"--color-tertiary-900": "95 116 69", // #5f7445
		// success | #4dac5d 
		"--color-success-50": "228 243 231", // #e4f3e7
		"--color-success-100": "219 238 223", // #dbeedf
		"--color-success-200": "211 234 215", // #d3ead7
		"--color-success-300": "184 222 190", // #b8debe
		"--color-success-400": "130 197 142", // #82c58e
		"--color-success-500": "77 172 93", // #4dac5d
		"--color-success-600": "69 155 84", // #459b54
		"--color-success-700": "58 129 70", // #3a8146
		"--color-success-800": "46 103 56", // #2e6738
		"--color-success-900": "38 84 46", // #26542e
		// warning | #f1a855 
		"--color-warning-50": "253 242 230", // #fdf2e6
		"--color-warning-100": "252 238 221", // #fceedd
		"--color-warning-200": "252 233 213", // #fce9d5
		"--color-warning-300": "249 220 187", // #f9dcbb
		"--color-warning-400": "245 194 136", // #f5c288
		"--color-warning-500": "241 168 85", // #f1a855
		"--color-warning-600": "217 151 77", // #d9974d
		"--color-warning-700": "181 126 64", // #b57e40
		"--color-warning-800": "145 101 51", // #916533
		"--color-warning-900": "118 82 42", // #76522a
		// error | #b94941 
		"--color-error-50": "245 228 227", // #f5e4e3
		"--color-error-100": "241 219 217", // #f1dbd9
		"--color-error-200": "238 210 208", // #eed2d0
		"--color-error-300": "227 182 179", // #e3b6b3
		"--color-error-400": "206 128 122", // #ce807a
		"--color-error-500": "185 73 65", // #b94941
		"--color-error-600": "167 66 59", // #a7423b
		"--color-error-700": "139 55 49", // #8b3731
		"--color-error-800": "111 44 39", // #6f2c27
		"--color-error-900": "91 36 32", // #5b2420
		// surface | #d4d4d4 
		"--color-surface-50": "249 249 249", // #f9f9f9
		"--color-surface-100": "246 246 246", // #f6f6f6
		"--color-surface-200": "244 244 244", // #f4f4f4
		"--color-surface-300": "238 238 238", // #eeeeee
		"--color-surface-400": "225 225 225", // #e1e1e1
		"--color-surface-500": "212 212 212", // #d4d4d4
		"--color-surface-600": "191 191 191", // #bfbfbf
		"--color-surface-700": "159 159 159", // #9f9f9f
		"--color-surface-800": "127 127 127", // #7f7f7f
		"--color-surface-900": "104 104 104", // #686868
		
	}
}