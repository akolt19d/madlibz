import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import configureServer from './server';

export const webSocketServer = {
	name: "webSocketServer",
	configureServer
}

export default defineConfig({
	plugins: [sveltekit(), webSocketServer]
});
