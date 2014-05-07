(function(){
  var defaults = {
    timeout: 5000,
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
      }
    }
  };

  videojs.plugin('errors', function(options){
    var timeoutListener, errors, settings, timeout, player;

    settings = videojs.util.mergeOptions(defaults, options);
    errors = settings.errors;
    timeout = settings.timeout;
    player = this;

    // Create the dialog element, register it with the player,
    // and add it to the DOM.
    player.children.errorOverlay = new videojs.ErrorOverlay(player);
    player.addChild(player.children.errorOverlay);

    player.on('readystatechange', function() {

    });

    // Handle Error events dispatched from player.
    player.on('error', function(event){

      if (timeoutListener) {
        timeoutListener = null;
      }

      console.log('received error', this.error());

      var error = this.error();

      player.children.errorOverlay.setCode(error.code + ' ' + errors[error.code].type);
      player.children.errorOverlay.setHeader(errors[error.code].headline);
      player.children.errorOverlay.setMessage(error.message);
      player.children.errorOverlay.show();

    });
  });
})();