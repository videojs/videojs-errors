import videojs from 'video.js';
import document from 'global/document';

const FlashObj = videojs.getComponent('Flash');
const defaultDismiss = !videojs.browser.IS_IPHONE;

// Video.js 5/6 cross-compatibility.
const registerPlugin = videojs.registerPlugin || videojs.plugin;

// Default options for the plugin.
const defaults = {
  header: '',
  code: '',
  message: '',
  timeout: 45 * 1000,
  dismiss: defaultDismiss,
  progressDisabled: false,
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
    },
    'PLAYER_ERR_DOMAIN_RESTRICTED': {
      headline: 'This video is restricted from playing on your current domain'
    },
    'PLAYER_ERR_IP_RESTRICTED': {
      headline: 'This video is restricted at your current IP address'
    },
    'PLAYER_ERR_GEO_RESTRICTED': {
      headline: 'This video is restricted from playing in your current geographic region'
    }
  }
};

const initPlugin = function(player, options) {
  let monitor;
  let waiting;
  let isStalling;
  const listeners = [];

  const updateErrors = function(updates) {
    options.errors = videojs.mergeOptions(options.errors, updates);

    // Create `code`s from errors which don't have them (based on their keys).
    Object.keys(options.errors).forEach(k => {
      const err = options.errors[k];

      if (!err.type) {
        err.type = k;
      }
    });
  };

  // Make sure we flesh out initially-provided errors.
  updateErrors();

  // clears the previous monitor timeout and sets up a new one
  const resetMonitor = function() {
    // at this point the player has recovered
    player.clearTimeout(waiting);
    if (isStalling) {
      isStalling = false;
      player.removeClass('vjs-waiting');
    }

    // start the loading spinner if player has stalled
    waiting = player.setTimeout(function() {
      // player already has an error
      // or is not playing under normal conditions
      if (player.error() || player.paused() || player.ended()) {
        return;
      }

      isStalling = true;
      player.addClass('vjs-waiting');
    }, 1000);

    player.clearTimeout(monitor);
    monitor = player.setTimeout(function() {
      // player already has an error
      // or is not playing under normal conditions
      if (player.error() || player.paused() || player.ended()) {
        return;
      }

      player.error({
        code: -2,
        type: 'PLAYER_ERR_TIMEOUT'
      });
    }, options.timeout);

    // clear out any existing player timeout
    // playback has recovered
    if (player.error() && player.error().code === -2) {
      player.error(null);
    }
  };

  // clear any previously registered listeners
  const cleanup = function() {
    let listener;

    while (listeners.length) {
      listener = listeners.shift();
      player.off(listener[0], listener[1]);
    }
    player.clearTimeout(monitor);
    player.clearTimeout(waiting);
  };

  // creates and tracks a player listener if the player looks alive
  const healthcheck = function(type, fn) {
    const check = function() {
      // if there's an error do not reset the monitor and
      // clear the error unless time is progressing
      if (!player.error()) {
        // error if using Flash and its API is unavailable
        const tech = player.$('.vjs-tech');

        if (tech &&
            tech.type === 'application/x-shockwave-flash' &&
            !tech.vjs_getProperty) {
          player.error({
            code: -2,
            type: 'PLAYER_ERR_TIMEOUT'
          });
          return;
        }

        // playback isn't expected if the player is paused
        if (player.paused()) {
          return resetMonitor();
        }
        // playback isn't expected once the video has ended
        if (player.ended()) {
          return resetMonitor();
        }
      }

      fn.call(this);
    };

    player.on(type, check);
    listeners.push([type, check]);
  };

  const onPlayStartMonitor = function() {
    let lastTime = 0;

    cleanup();

    // if no playback is detected for long enough, trigger a timeout error
    resetMonitor();
    healthcheck(['timeupdate', 'adtimeupdate'], function() {
      const currentTime = player.currentTime();

      // playback is operating normally or has recovered
      if (currentTime !== lastTime) {
        lastTime = currentTime;
        resetMonitor();
      }
    });

    if (!options.progressDisabled) {
      healthcheck('progress', resetMonitor);
    }
  };

  const onPlayNoSource = function() {
    if (!player.currentSrc()) {
      player.error({
        code: -1,
        type: 'PLAYER_ERR_NO_SRC'
      });
    }
  };

  const onErrorHandler = function() {
    let details = '';
    let error = player.error();
    const content = document.createElement('div');
    let dialogContent = '';

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

    if (error.code === 4 && FlashObj && !FlashObj.isSupported()) {
      const flashMessage = player.localize(
        'If you are using an older browser please try upgrading or installing Flash.'
      );

      details += `<span class="vjs-errors-flashmessage">${flashMessage}</span>`;
    }

    const display = player.getChild('errorDisplay');

    content.className = 'vjs-errors-dialog';
    content.id = 'vjs-errors-dialog';
    dialogContent =
     `<div class="vjs-errors-content-container">
      <h2 class="vjs-errors-headline">${this.localize(error.headline)}</h2>
        <div><b>${this.localize('Error Code')}</b>: ${(error.type || error.code)}</div>
        ${details}
      </div>`;

    const closeable = display.closeable(!('dismiss' in error) || error.dismiss);

    // We should get a close button
    if (closeable) {
      dialogContent +=
       `<div class="vjs-errors-ok-button-container">
          <button class="vjs-errors-ok-button">${this.localize('OK')}</button>
        </div>`;
      content.innerHTML = dialogContent;
      display.fillWith(content);
      // Get the close button inside the error display
      display.contentEl().firstChild.appendChild(display.getChild('closeButton').el());

      const okButton = display.el().querySelector('.vjs-errors-ok-button');

      player.on(okButton, 'click', function() {
        display.close();
      });
    } else {
      content.innerHTML = dialogContent;
      display.fillWith(content);
    }

    if (player.currentWidth() <= 600 || player.currentHeight() <= 250) {
      display.addClass('vjs-xs');
    }

    display.one('modalclose', () => player.error(null));
  };

  const onDisposeHandler = function() {
    cleanup();

    player.removeClass('vjs-errors');
    player.off('play', onPlayStartMonitor);
    player.off('play', onPlayNoSource);
    player.off('dispose', onDisposeHandler);
    player.off(['aderror', 'error'], onErrorHandler);
  };

  const reInitPlugin = function(newOptions) {
    onDisposeHandler();
    initPlugin(player, videojs.mergeOptions(defaults, newOptions));
  };

  reInitPlugin.extend = (errors) => updateErrors(errors);
  reInitPlugin.getAll = () => videojs.mergeOptions(options.errors);

  reInitPlugin.disableProgress = function(disabled) {
    options.progressDisabled = disabled;
    onPlayStartMonitor();
  };

  player.on('play', onPlayStartMonitor);
  player.on('play', onPlayNoSource);
  player.on('dispose', onDisposeHandler);
  player.on(['aderror', 'error'], onErrorHandler);

  player.ready(() => {
    player.addClass('vjs-errors');
  });

  player.errors = reInitPlugin;
};

const errors = function(options) {
  initPlugin(this, videojs.mergeOptions(defaults, options));
};

['extend', 'getAll', 'disableProgress'].forEach(k => {
  errors[k] = function() {
    videojs.log.warn(`The errors.${k}() method is not available until the plugin has been initialized!`);
  };
});

// Register the plugin with video.js.
registerPlugin('errors', errors);

export default errors;
