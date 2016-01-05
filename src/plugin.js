import videojs from 'video.js';

// Default options for the plugin.
const defaults = {
  header: '',
  code: '',
  message: '',
  timeout: 45 * 1000,
  errors: {
    1: {
      type: 'MEDIA_ERR_ABORTED',
      headline: 'The video download was cancelled'
    },
    2: {
      type: 'MEDIA_ERR_NETWORK',
      headline: 'The video connection was lost, please confirm you are connected to the internet'
    },
    3: {
      type: 'MEDIA_ERR_DECODE',
      headline: 'The video is bad or in a format that cannot be played on your browser'
    },
    4: {
      type: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
      headline: 'This video is either unavailable or not supported in this browser'
    },
    5: {
      type: 'MEDIA_ERR_ENCRYPTED',
      headline: 'The video you are trying to watch is encrypted and we do not know how to decrypt it'
    },
    unknown: {
      type: 'MEDIA_ERR_UNKNOWN',
      headline: 'An unanticipated problem was encountered, check back soon and try again'
    },
    '-1': {
      type: 'PLAYER_ERR_NO_SRC',
      headline: 'No video has been loaded'
    },
    '-2': {
      type: 'PLAYER_ERR_TIMEOUT',
      headline: 'Could not download the video'
    }
  }
};

// Setup Custom Error Conditions
const initCustomErrorConditions = function(player, options) {

  // PLAYER_ERR_TIMEOUT
  monitorPlayback(player, options);

  // PLAYER_ERR_NO_SRC
  player.on('play', function() {
    if (player.currentSrc() === null ||
        player.currentSrc() === undefined ||
        player.currentSrc() === '') {
      player.error({
        code: -1,
        type: 'PLAYER_ERR_NO_SRC'
      });
    }
  });
};

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 * @param    {Object} [options={}]
 */
const onPlayerReady = (player, options) => {

  player.addClass('vjs-errors');

  // Add to the error dialog when an error occurs
  player.on('error', function() {
    var code, error, display, details = '';

    error = player.error();

    // In the rare case when `error()` does not return an error object,
    // defensively escape the handler function.
    if (!error) {
      return;
    }

    error = videojs.mergeOptions(error, options.errors[error.code || 0]);

    if (error.message) {
      details = '<div class="vjs-errors-details">' + player.localize('Technical details') +
        ': <div class="vjs-errors-message">' + player.localize(error.message) + '</div>' +
        '</div>';
    }

    display = player.errorDisplay;

    display.el().innerHTML =
      '<div class="vjs-errors-dialog">' +
        '<button class="vjs-errors-close-button"></button>' +
        '<div class="vjs-errors-content-container">' +
          '<h2 class="vjs-errors-headline">' + player.localize(error.headline) + '</h2>' +
          '<div><b>' + player.localize('Error Code') + '</b>: ' + (error.type || error.code) + '</div>' +
          player.localize(details) +
        '</div>' +
        '<div class="vjs-errors-ok-button-container">' +
          '<button class="vjs-errors-ok-button">' + player.localize('OK') + '</button>' +
        '</div>' +
      '</div>';

    if (player.width() <= 600 || player.height() <= 250) {
      display.addClass('vjs-xs');
    }

    on(display.el().querySelector('.vjs-errors-close-button'), 'click', function() {
      display.hide();
    });
    on(display.el().querySelector('.vjs-errors-ok-button'), 'click', function() {
      display.hide();
    });
  });

  // Initialize custom error conditions
  initCustomErrorConditions(player, options);
};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function errors
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const errors = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
videojs.plugin('errors', errors);

export default errors;
