import videojs from 'video.js';
import document from 'global/document';
import {version as VERSION} from '../package.json';

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
      headline: 'The video download was cancelled',
      message: 'You aborted the media playback.'
    },
    '2': {
      type: 'MEDIA_ERR_NETWORK',
      headline: 'The video connection was lost, please confirm you are ' +
                'connected to the internet',
      message: 'A network error caused the media download to fail part-way.' +
               'Currently most helpful for MP4 and/or progressive download video formats. ' +
               'See the Known issues section of the Display Error Messages Plugin document for details.'
    },
    '3': {
      type: 'MEDIA_ERR_DECODE',
      headline: 'The video is bad or in a format that cannot be played on your browser',
      message: 'The media playback was aborted due to a corruption problem or because' +
      'the media used features your browser did not support.'
    },
    '4': {
      type: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
      headline: 'This video is either unavailable or not supported in this browser',
      message: 'The media could not be loaded, either because the server or network failed ' +
               'or because the format is not supported.'
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
    'FLASHLS_ERR_CROSS_DOMAIN': {
      headline: 'The video could not be loaded: crossdomain access denied.'
    },
    'VIDEO_CLOUD_ERR_DUPLICATE_PARAMETERS': {
      headline: 'Invalid Request: Duplicate Parameter',
      message: 'The same parameter name was provided more than once in the request'
    },
    'VIDEO_CLOUD_ERR_TOKEN_REQUIRED': {
      headline: 'Access Denied: Missing Token',
      message: 'Video cannot be played without a token'
    },
    'VIDEO_CLOUD_ERR_TOKEN_INVALID': {
      headline: 'Access Denied: Invalid Token',
      message: 'Video cannot be played without a valid token'
    },
    'PLAYER_ERR_DOMAIN_RESTRICTED': {
      headline: 'Playback Denied: Domain Restricted',
      message: 'Video not playable on this domain.'
    },
    'PLAYER_ERR_IP_RESTRICTED': {
      headline: 'Playback Denied: IP',
      message: 'Your IP address does not have access to this video.'
    },
    'PLAYER_ERR_GEO_RESTRICTED': {
      headline: 'Playback Denied: Location',
      message: 'Video unavailable from your current location.'
    },
    'PLAYER_ERR_OFFER_RESTRICTED': {
      headline: 'Playback Denied: Offer Restricted',
      message: 'Video not playable with your entitlements.'
    },
    'PLAYER_ERR_TAG_RESTRICTED': {
      headline: 'Playback Denied: Tags',
      message: 'Video does not have tags required for playback.'
    },
    'PLAYER_ERR_ACCOUNT_ID': {
      headline: 'Playback Denied: Account ID',
      message: 'Account ID missing or invalid.'
    },
    'VIDEO_CLOUD_ERR_VIDEO_NOT_PLAYABLE': {
      headline: 'Playback Denied: Unavailable',
      message: 'Video is not currently available for playback.'
    },
    'VIDEO_CLOUD_ERR_PLAYLIST_NOT_PLAYABLE': {
      headline: 'Playback Denied: Unavailable',
      message: 'Playlists is not currently available for playback.'
    },
    'VIDEO_CLOUD_DENIED_BY_STREAM_LIMIT_CREATE': {
      headline: 'Stream Limiting: New Viewers',
      message: 'Limited stream has reached the maximum number of viewers.'
    },
    'VIDEO_CLOUD_DENIED_BY_STREAM_LIMIT_RENEW': {
      headline: 'Stream Limiting: Existing Viewers',
      message: 'Limited stream is already being watched by the maximum number of viewers.'
    },
    'VIDEO_CLOUD_DENIED_BY_STREAM_LIMITING': {
      headline: 'Stream Limiting: New Viewers',
      message: 'Limited stream has reached the maximum number of viewers.'
    },
    'VIDEO_CLOUND_DENIED_BY_DEVICE_LIMITING': {
      headline: 'Device Limiting: New Viewers',
      message: 'Maximum number of streams has been reached on this device.'
    },
    'VIDEO_CLOUD_ERR_VIDEO_NOT_FOUND': {
      headline: 'Video Unavailable: Not Found',
      message: 'Video cannot be found.'
    },
    'VIDEO_CLOUD_ERR_PLAYLIST_NOT_FOUND': {
      headline: 'Playlist Unavailable: Not Found',
      message: 'Playlist cannot be found.'
    },
    'VIDEO_CLOUD_ERR_METHOD_NOT_ALLOWED': {
      headline: 'API: Method not allowed'
    },
    'VIDEO_CLOUD_ERR_SERVER': {
      headline: 'Server: Internal server error'
    },
    'VIDEO_CLOUD_ERR_VIDEO_RETRIEVE_FAILURE': {
      headline: 'Server Error: Video',
      message: 'Video unavailable.'
    },
    'VIDEO_CLOUD_ERR_ACCOUNT_RETRIEVE_FAILURE': {
      headline: 'Server Error: Account',
      message: 'Account unavailable.'
    },
    'VIDEO_CLOUD_ERR_VIDEO_URLS_RETRIEVE_FAILURE': {
      headline: 'Server Error: Video URLs',
      message: 'Stream URLs unavailable'
    },
    'VIDEO_CLOUD_ERR_PLAYLIST_RETRIEVE_FAILURE': {
      headline: 'Server Error: Playlist',
      message: 'Video playlist unavailable.'
    },
    'VIDEO_CLOUD_ERR_PLAYBACK_RIGHT_RETRIEVE_FAILURE': {
      headline: 'Server Error: Playback Rights',
      message: 'Entitlements unavailable.'
    },
    'VIDEO_CLOUD_ERR_PLAYLIST_VIDEOS_RETRIEVE_FAILURE': {
      headline: 'Server Error: Playlist Videos',
      message: 'Playlist videos unavailable.'
    },
    'VIDEO_CLOUD_ERR_LICENSE_RETRIEVE_FAILURE': {
      headline: 'Server Error: License',
      message: 'Stream license unavailable.'
    },
    'VIDEO_CLOUD_ERR_OFFERS_RETRIEVE_FAILURE': {
      headline: 'Server Error: Offers',
      message: 'Stream offers unavailable.'
    },
    'VIDEO_CLOUD_ERR_RIGHTS_RETRIEVE_FAILURE': {
      headline: 'Server Error: Rights',
      message: 'Stream rights unavailable.'
    },
    'VIDEO_CLOUD_ERR_SERVICE_UNAVAILABLE': {
      headline: 'Server Error: Unavailable',
      message: 'The server is currently unavailable. Please try again later.'
    },
    'VIDEO_CLOUD_ERR_SERVICE_TIMEOUT': {
      headline: 'Server Error: Timeout',
      message: 'Recevied a timeout from the server. Please try again later.'
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

    error = videojs.mergeOptions(error, options.errors[error.code || error.type || 0]);

    if (error.message) {
      details = `<div class="vjs-errors-details">${player.localize('Technical details')}
        : <div class="vjs-errors-message">${player.localize(error.message)}</div>
        </div>`;
    }

    if (error.code === 4 && FlashObj && !FlashObj.isSupported()) {
      const flashMessage = player.localize('If you are using an older browser please try upgrading or installing Flash.');

      details += `<span class="vjs-errors-flashmessage">${flashMessage}</span>`;
    }

    const display = player.getChild('errorDisplay');

    content.className = 'vjs-errors-dialog';
    content.id = 'vjs-errors-dialog';
    dialogContent =
     `<div class="vjs-errors-content-container">
      <h2 class="vjs-errors-headline">${this.localize(error.headline)}</h2>
        <div class="vjs-errors-code"><b>${this.localize('Error Code')}:</b> ${(error.type || error.code)}</div>
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

  // Get / set timeout value. Restart monitor if changed.
  reInitPlugin.timeout = function(timeout) {
    if (typeof timeout === 'undefined') {
      return options.timeout;
    }
    if (timeout !== options.timeout) {
      options.timeout = timeout;
      if (!player.paused()) {
        onPlayStartMonitor();
      }
    }
  };

  // no-op API
  // TODO: remove in a major version
  reInitPlugin.disableProgress = () => {};

  player.on('play', onPlayStartMonitor);
  player.on('play', onPlayNoSource);
  player.on('dispose', onDisposeHandler);
  player.on(['aderror', 'error'], onErrorHandler);

  player.ready(() => {
    player.addClass('vjs-errors');
  });

  // if the plugin is re-initialised during playback, start the timeout handler.
  if (!player.paused()) {
    onPlayStartMonitor();
  }

  // Include the version number.
  reInitPlugin.VERSION = VERSION;

  player.errors = reInitPlugin;
};

const errors = function(options) {
  initPlugin(this, videojs.mergeOptions(defaults, options));
};

['extend', 'getAll'].forEach(k => {
  errors[k] = function() {
    videojs.log.warn(`The errors.${k}() method is not available until the plugin has been initialized!`);
  };
});

// Include the version number.
errors.VERSION = VERSION;

// Register the plugin with video.js.
registerPlugin('errors', errors);

export default errors;
