import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import configureServer from './configureServer';

export const webSocketServer = {
	name: "webSocketServer",
	configureServer
}

export default defineConfig({
	plugins: [sveltekit(), webSocketServer]
});
