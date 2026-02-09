// vite.config.js
import { defineConfig } from 'vite'
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  // This is where you add plugins, 
  // like the image optimizer we discussed.
  plugins: [
    viteImagemin({
      // Options for standard formats
      gifsicle: { optimizationLevel: 7, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 20 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [{ name: 'removeViewBox' }, { name: 'removeEmptyAttrs', active: false }],
      },
      // This is the part that handles WebP conversion
      webp: { quality: 75 }
    }),
  ],  
  server: {
    open: true, // Automatically opens the browser when you run npm run dev
  }
})
