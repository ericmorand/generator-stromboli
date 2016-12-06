module.exports = {
  componentRoot: 'src/components',
  plugins: {
    javascript: {
      entry: 'demo.js',
      config: {
        debug: true
      }
    },
    twig: {
      entry: 'demo.twig'
    },
    sass: {
      config: {
        sourceMap: true,
        sourceComments: true,
        sourceMapEmbed: true
      },
      entry: 'demo.scss'
    }
  },
  browserSync: {
    port: 3002,
    open: false,
    notify: false,
    server: 'www',
    logLevel: 'silent'
  },
  chokidar: {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100
    }
  }
};