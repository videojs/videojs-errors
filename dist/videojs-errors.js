/*! videojs-errors - v0.1.8 - 2015-11-17
* Copyright (c) 2015 Brightcove; Licensed Apache-2.0 */
 (function(){
  var
    defaults = {
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
    },
    /**
     * Monitors a player for signs of life during playback and
     * triggers PLAYER_ERR_TIMEOUT if none occur within a reasonable
     * timeframe.
     */
    monitorPlayback = function(player, options) {
      var
        settings = videojs.mergeOptions(defaults, options),

        monitor,
        // clears the previous monitor timeout and sets up a new one
        resetMonitor = function() {
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
          }, settings.timeout);

          // clear out any existing player timeout
          if (player.error() && player.error().code === -2) {
            player.error(null);
          }
        },

        listeners = [],
        // creates and tracks a player listener if the player looks alive
        healthcheck = function(type, fn) {
          var check = function() {
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
        },
        // clear any previously registered listeners
        cleanup = function() {
          var listener;
          while (listeners.length) {
            listener = listeners.shift();
            player.off(listener[0], listener[1]);
          }
          window.clearTimeout(monitor);
        };

      player.on('play', function() {
        var lastTime = 0;

        cleanup();

        // if no playback is detected for long enough, trigger a timeout error
        resetMonitor();
        healthcheck('timeupdate', function() {
          var currentTime = player.currentTime();
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
    },
    // shim in IE8 event listener support
    on = function(elem, type, fn) {
      if (elem.addEventListener) {
        elem.addEventListener(type, fn, false);
      } else {
        elem.attachEvent('on' + type, fn);
      }
    };

  // Setup Custom Error Conditions
  var initCustomErrorConditions = function(player, options) {

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

  videojs.plugin('errors', function(options){
    var
      player = this,
      // Merge the external and default settings
      settings = videojs.mergeOptions(defaults, options);

    player.ready(function() {

      // Add to the error dialog when an error occurs
      this.on('error', function() {
        var code, error, display, details = '';

        error = this.error();

        // In the rare case when `error()` does not return an error object,
        // defensively escape the handler function.
        if (!error) {
          return;
        }

        error = videojs.mergeOptions(error, settings.errors[error.code || 0]);

        if (error.message) {
          details = '<div class="vjs-errors-details">' + this.localize('Technical details') +
            ': <div class="vjs-errors-message">' + this.localize(error.message) + '</div>' +
            '</div>';
        }

        display = this.errorDisplay;

        display.el().innerHTML =
          '<div class="vjs-errors-dialog">' +
            '<button class="vjs-errors-close-button"></button>' +
            '<div class="vjs-errors-content-container">' +
              '<h2 class="vjs-errors-headline">' + this.localize(error.headline) + '</h2>' +
              '<div><b>' + this.localize('Error Code') + '</b>: ' + (error.type || error.code) + '</div>' +
              this.localize(details) +
            '</div>' +
            '<div class="vjs-errors-ok-button-container">' +
              '<button class="vjs-errors-ok-button">' + this.localize('OK') + '</button>' +
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
      initCustomErrorConditions(this, settings);
    });
  });
})();
