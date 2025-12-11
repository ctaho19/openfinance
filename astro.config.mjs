import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import aws from 'astro-sst';

export default defineConfig({
  output: 'server',
  adapter: aws(),
  integrations: [react()],
  srcDir: './src',
  vite: {
    css: {
      transformer: 'postcss',
    },
  },
});
