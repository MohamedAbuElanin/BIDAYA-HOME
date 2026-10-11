import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import posthog from '@posthog/rollup-plugin'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const posthogPersonalKey = env.POSTHOG_PERSONAL_API_KEY || env.POSTHOG_API_KEY

  return {
    plugins: [
      react(),
      ...(posthogPersonalKey
        ? [
            posthog({
              personalApiKey: posthogPersonalKey,
              projectId: '658406',
              host: env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
              sourcemaps: {
                enabled: true,
                releaseName: 'bidaya-home',
                deleteAfterUpload: false,
              },
            }),
          ]
        : []),
    ],
    build: {
      sourcemap: true,
    },
  }
})

