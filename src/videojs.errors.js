(function(){
  var defaults = {
    header: '',
    code: '',
    message: '',
    details: '',
    timeout: 45 * 1000,
    errors: {
      0: {
        type: "MEDIA_ERR_CUSTOM",
        headline: "Custom Error Headline" 
      },
      1: {
        type: "MEDIA_ERR_ABORTED",
        headline: "The video download was cancelled"
      },
      2: {
        type: "MEDIA_ERR_NETWORK",
        headline: "The video connection was lost, please confirm you're connected to the internet"
      },
      3: {
        type: "MEDIA_ERR_DECODE",
        headline: "The video is bad or in a format that can't be played on your browser"
      },
      4: {
        type: "MEDIA_ERR_SRC_NOT_SUPPORTED",
        headline: "This video is either unavailable or not supported in this browser"
      },
      5: {
        type: "MEDIA_ERR_ENCRYPTED",
        headline: "The video you're trying to watch is encrypted and we don't know how to decrypt it"
      },
      unknown: {
        type: "MEDIA_ERR_UNKNOWN",
        headline: "An unanticipated problem was encountered, check back soon and try again"
      },
      '-1': {
        type: 'PLAYER_ERR_NO_SRC',
        headline: 'No video has been loaded'
      },
      '-2': {
        type: 'PLAYER_ERR_TIMEOUT',
        headline: 'Could not download the video'
      },
      custom: {
        timeout: {
          code: 0,
          type: "MEDIA_ERR_TIMEOUT",
          headline: "Media Time Out",
          message: "Your media timed out.",
          interval: 45000
        }
      }
    }
  };

  // Setup Custom Error Conditions
  var initCustomErrorConditions = function(player, options) {

    // PLAYER_ERR_TIMEOUT
    player.on('stalled', function() {
      var
        cancelTimeout = function() {
          window.clearTimeout(stalledTimeout);
        },
        stalledTimeout;

        stalledTimeout = window.setTimeout(function() {
          player.error({
            code: -2,
            type: 'PLAYER_ERR_TIMEOUT'
          })
        }, options.timeout);

      // clear the stall timeout if progress has been made
      player.on('timeupdate', cancelTimeout);
      player.on('progress', cancelTimeout);
    });

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
