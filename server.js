const browserSync = require('browser-sync').create();
const compression = require('compression')

browserSync.init({
  server: true,
  startPath: 'test/index.html',
  files: [
    'lib/**',
    'test/**',
  ],
  middleware: [
    compression({ level: 9, threshold: 1 }),
  ],
  snippetOptions: {
    ignorePaths: ['/', '/**'],
  },
})
