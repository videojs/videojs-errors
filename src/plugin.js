import videojs from 'video.js';

// Default options for the plugin.
const defaults = {
  header: '',
  code: '',
  message: '',
  timeout: 45 * 1000,
  errors: {
    '1': {
      type: 'MEDIA_ERR_ABORTED',
      headline: 'The video download was cancelled'
    },
    '2': {
      type: 'MEDIA_ERR_NETWORK',
      headline: 'The video connection was lost, please confirm you are ' +
                'connected to the internet'
    },
    '3': {
      type: 'MEDIA_ERR_DECODE',
      headline: 'The video is bad or in a format that cannot be played on your browser'
    },
    '4': {
      type: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
      headline: 'This video is either unavailable or not supported in this browser'
    },
    '5': {
      type: 'MEDIA_ERR_ENCRYPTED',
      headline: 'The video you are trying to watch is encrypted and we do not know how ' +
                'to decrypt it'
    },
    'unknown': {
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

/**
 * Monitors a player for signs of life during playback and
 * triggers PLAYER_ERR_TIMEOUT if none occur within a reasonable
 * timeframe.
 */
const monitorPlayback = function(player, options) {
  let monitor;

  // clears the previous monitor timeout and sets up a new one
  const resetMonitor = function() {
    window.clearTimeout(monitor);
    monitor = window.setTimeout(function() {
      if (player.error() || player.paused() || player.ended()) {
        // never overwrite existing errors or display a new one
        // if the player is paused or ended.
        return;
      }

      player.error({
        code: -2,
        type: 'PLAYER_ERR_TIMEOUT'
      });
    }, options.timeout);

    // clear out any existing player timeout
    if (player.error() && player.error().code === -2) {
      player.error(null);
    }
  };

  let listeners = [];

  // clear any previously registered listeners
  const cleanup = function() {
    let listener;

    while (listeners.length) {
      listener = listeners.shift();
      player.off(listener[0], listener[1]);
    }
    window.clearTimeout(monitor);
  };

  // creates and tracks a player listener if the player looks alive
  const healthcheck = function(type, fn) {
    let check = function() {
      // playback isn't expected if the player is paused, shut
      // down monitoring
      if (player.paused()) {
        return cleanup();
      }
      // playback isn't expected once the video has ended
      if (player.ended()) {
        return cleanup();
      }
      fn.call(this);
    };

    player.on(type, check);
    listeners.push([type, check]);
  };

  player.on('play', function() {
    let lastTime = 0;

    cleanup();

    // if no playback is detected for long enough, trigger a timeout error
    resetMonitor();
    healthcheck('timeupdate', function() {
      let currentTime = player.currentTime();

      if (currentTime !== lastTime) {
        lastTime = currentTime;
        resetMonitor();
      }
    });
    healthcheck('progress', resetMonitor);
  });

  player.on('dispose', function() {
    cleanup();
  });
};

// Setup Custom Error Conditions
const initCustomErrorConditions = function(player, options) {

  // PLAYER_ERR_TIMEOUT
  monitorPlayback(player, options);

  // PLAYER_ERR_NO_SRC
  player.on('play', function() {
    if (!player.currentSrc()) {
      player.error({
        code: -1,
        type: 'PLAYER_ERR_NO_SRC'
      });
    }
  });
};

/**
 * Set up the plugin.
 */
const onPlayerReady = (player, options) => {

  player.addClass('vjs-errors');

  // Add to the error dialog when an error occurs
  player.on('error', function() {
    let display;
    let details = '';
    let error = player.error();
    let content = document.createElement('div');

    // In the rare case when `error()` does not return an error object,
    // defensively escape the handler function.
    if (!error) {
      return;
    }

    error = videojs.mergeOptions(error, options.errors[error.code || 0]);

    if (error.message) {
      details = `<div class="vjs-errors-details">${player.localize('Technical details')}
        : <div class="vjs-errors-message">${player.localize(error.message)}</div>
        </div>`;
    }

    display = player.errorDisplay;

    content.className = 'vjs-errors-dialog';
    content.innerHTML =
      `<button class="vjs-errors-close-button"></button>
        <div class="vjs-errors-content-container">
          <h2 class="vjs-errors-headline">${this.localize(error.headline) }</h2>
          <div><b>${this.localize('Error Code')}</b>: ${(error.type || error.code)}</div>
          ${details}
        </div>
        <div class="vjs-errors-ok-button-container">
          <button class="vjs-errors-ok-button">${this.localize('OK')}</button>
        </div>`;

    display.fillWith(content);

    if (player.width() <= 600 || player.height() <= 250) {
      display.addClass('vjs-xs');
    }

    let closeButton = display.el().querySelector('.vjs-errors-close-button');
    let okButton = display.el().querySelector('.vjs-errors-ok-button');

    videojs.on(closeButton, 'click', function() {
      display.close();
    });
    videojs.on(okButton, 'click', function() {
      display.close();
    });
  });

  // Initialize custom error conditions
  initCustomErrorConditions(player, options);
};

/**
 * Initialize the plugin. Waits until the player is ready to do anything.
 */
const errors = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
videojs.plugin('errors', errors);

export default errors;
