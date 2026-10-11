import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { profile } from './src/content'

// Fills {{name}}-style placeholders in the HTML pages from the content source, so
// link previews (which don't run JavaScript) show the same profile text.
function profileInHtml(): Plugin {
  const values: Record<string, string> = {
    name: profile.name,
    title: profile.title,
    summary: profile.summary,
    siteUrl: profile.siteUrl,
  }
  const escape = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  return {
    name: 'profile-in-html',
    transformIndexHtml: (html) =>
      html.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
        key in values ? escape(values[key]) : match,
      ),
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), profileInHtml()],
  base: mode === 'github' ? '/me/' : '/',
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        resume: resolve(import.meta.dirname, 'resume/index.html'),
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
  server: {
    host: true,
    port: 3000,
  },
}))
