(function(){
  var defaults = {
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
    // Timeout Condition
    player.on('loadstart', function() {
      var timeoutListener = function() {
        player.error(options.errors.custom.timeout);
      };
      player.one('progress', function() {
        timeoutListener = null;
      });
      player.one('play', function() {
        timeoutListener = null;
      });
      player.one('pause', function() {
        timeoutListener = null;
      });
      player.one('timeupdate', function() {
        timeoutListener = null;
      });
      setTimeout(function(){
        if (timeoutListener) {
          timeoutListener();
        }
      }, options.errors.custom.timeout.interval);
    });
  };

  videojs.plugin('errors', function(options){

    var errors, settings, player;

    settings = videojs.util.mergeOptions(defaults, options);
    errors = settings.errors;
    player = this;

    // Create the dialog element, register it with the player,
    // and add it to the DOM.
    player.children.errorOverlay = new videojs.ErrorOverlay(player);
    player.addChild(player.children.errorOverlay);

    // Hide the default error display (if present)
    if(player.el().querySelector('.vjs-error-display')) {
      player.el().querySelector('.vjs-error-display').setAttribute('style',
          'display: none; width: 0; height: 0');
    }

    // Initialize Error Conditions
    initCustomErrorConditions(player, settings);

    // Handle Error events dispatched from player.
    player.on('error', function(){

      var error = this.error();

      player.children.errorOverlay.setCode(error.code + ' ' + errors[error.code].type);
      player.children.errorOverlay.setHeader(errors[error.code].headline);
      player.children.errorOverlay.setMessage(error.message);
      player.children.errorOverlay.show();

    });

    // When a new video is loaded, if there is a pre-existing error
    // then clear it out and reset.
    player.on('loadstart', function() {
      if (this.error()) {
        this.error(null);
        player.children.errorOverlay.hide();
      }
    });

  });
})();