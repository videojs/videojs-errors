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
    player.one('stalled', function() {
      var
        playerRecover = function() {
          // Clear the timeout because the player has recovered.
          window.clearTimeout(stalledTimeout);
          // Clear the error and notify the Error Overlay UI component
          if(player.error() && player.error().code === -2) {
            player.error(null);
            player.trigger('errorrecover');
          }
        },
        stalledTimeout;

      stalledTimeout = window.setTimeout(function() {
        // We only want to fire this if no other error is already
        // existing on the player.
        if(!player.error()) {
          player.error({
            code: -2,
            type: 'PLAYER_ERR_TIMEOUT'
          })
        }
      }, options.timeout);

      // clear the stall timeout if progress has been made
      player.one('progress', playerRecover);
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

    // On Loadstart, always clear the error UI
    this.on('loadstart', function() {
      this.trigger('errorrecover');
    })
  });
})();
