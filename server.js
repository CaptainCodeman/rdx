const browserSync = require('browser-sync').create();
const compression = require('compression')

browserSync.init({
  server: {
    index: 'index.html',
  },
  files: [
    'dist/**',
    'index.html',
  ],
  middleware: [
    compression({ level: 9, threshold: 1 }),
  ],
  snippetOptions: {
    ignorePaths: ['/', '/**'],
  },
})
