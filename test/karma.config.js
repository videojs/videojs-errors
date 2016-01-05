module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['qunit', 'sinon', 'detectBrowsers'],

    detectBrowsers: {
      enabled: !process.env.TRAVIS,
      usePhantomJS: false
    },


    files: [
      '../node_modules/video.js/dist/ie8/videojs-ie8.min.js',
      '../node_modules/video.js/dist/video.js',
      '../src/videojs.errors.js',
      'videojs-errors.test.js'
    ],

    singleRun: true,

    browsers: [ 'Firefox' ]
  });
};
