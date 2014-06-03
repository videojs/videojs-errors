(function(){
  var
    defaults = {
      header: '',
      code: '',
      message: '',
      details: '',
      timeout: 45 * 1000,
      errors: {
        1: {
          type: 'MEDIA_ERR_ABORTED',
          headline: 'The video download was cancelled'
        },
        2: {
          type: 'MEDIA_ERR_NETWORK',
          headline: 'The video connection was lost, please confirm you\'re connected to the internet'
        },
        3: {
          type: 'MEDIA_ERR_DECODE',
          headline: 'The video is bad or in a format that can\'t be played on your browser'
        },
        4: {
          type: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
          headline: 'This video is either unavailable or not supported in this browser'
        },
        5: {
          type: 'MEDIA_ERR_ENCRYPTED',
          headline: 'The video you\'re trying to watch is encrypted and we don\'t know how to decrypt it'
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
        settings = videojs.util.mergeOptions(defaults, options),

        monitor,
        // clears the previous monitor timeout and sets up a new one
        resetMonitor = function() {
          window.clearTimeout(monitor);
          monitor = window.setTimeout(function() {
            player.error({
              code: -2,
              type: 'PLAYER_ERR_TIMEOUT'
            });
          }, settings.timeout);

          // clear out any existing player timeout
          if (player.error() && player.error().code === -2) {
            player.error(null);
            player.trigger('errorrecover');
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
    };

  // Setup Custom Error Conditions
  var initCustomErrorConditions = function(player, options) {
    var stalledTimeout, playbackMonitor;

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

    // Merge the external and default settings
    var settings = videojs.util.mergeOptions(defaults, options);

    // Create the dialog element, register it with the player
    this.addChild(new videojs.ErrorOverlay(this, settings));

    // Initialize custom error conditions
    initCustomErrorConditions(this, settings);

  });
})();
