import videojs from 'video.js';
import window from 'global/window';
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
const initPlugin = function(player, options) {
  let monitor;
  let listeners = [];

  // clears the previous monitor timeout and sets up a new one
  const resetMonitor = function() {
    window.clearTimeout(monitor);
    monitor = window.setTimeout(function() {
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
    window.clearTimeout(monitor);
  };

  // creates and tracks a player listener if the player looks alive
  const healthcheck = function(type, fn) {
    let check = function() {
      // if there's an error do not reset the monitor and
      // clear the error unless time is progressing
      if (!player.error()) {
        // error if using Flash and its API is unavailable
        let tech = player.$('.vjs-tech');

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
    let lastTime = player.currentTime();

    cleanup();

    // if no playback is detected for long enough, trigger a timeout error
    resetMonitor();
    healthcheck(['timeupdate', 'adtimeupdate'], function() {
      let currentTime = player.currentTime();

      // playback is operating normally or has recovered
      if ((lastTime + 1) <= (currentTime)) {
        lastTime = currentTime;
        resetMonitor();
      }
    });
    healthcheck('progress', resetMonitor);
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
    let display;
    let details = '';
    let error = player.error();
    let content = document.createElement('div');
    let dialogContent = '';
    let closeable;

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
      const flashMessage = player.localize(' * If you are using an older browser' +
      ' please try upgrading or installing Flash.');

      details += `<span class="vjs-errors-flashmessage">${flashMessage}</span>`;
    }
    display = player.getChild('errorDisplay');

    content.className = 'vjs-errors-dialog';
    content.id = 'vjs-errors-dialog';
    dialogContent =
     `<div class="vjs-errors-content-container">
      <h2 class="vjs-errors-headline">${this.localize(error.headline)}</h2>
        <div><b>${this.localize('Error Code')}</b>: ${(error.type || error.code)}</div>
        ${details}
      </div>`;

    closeable = display.closeable(!('dismiss' in error) || error.dismiss);

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

      let okButton = display.el().querySelector('.vjs-errors-ok-button');

      player.on(okButton, 'click', function() {
        display.close();
      });
    } else {
      content.innerHTML = dialogContent;
      display.fillWith(content);
    }

    if (player.width() <= 600 || player.height() <= 250) {
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
    player.off('error', onErrorHandler);
  };

  const reInitPlugin = function(newOptions) {
    onDisposeHandler();
    initPlugin(player, videojs.mergeOptions(defaults, newOptions));
  };

  player.on('play', onPlayStartMonitor);
  player.on('play', onPlayNoSource);
  player.on('dispose', onDisposeHandler);
  player.on('error', onErrorHandler);

  player.ready(() => {
    player.addClass('vjs-errors');
  });

  player.errors = reInitPlugin;
};

/**
 * Initialize the plugin. Waits until the player is ready to do anything.
 */
const errors = function(options) {
  initPlugin(this, videojs.mergeOptions(defaults, options));
};

// Register the plugin with video.js.
registerPlugin('errors', errors);

export default errors;
