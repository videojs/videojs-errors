(function(){
  var defaults, extend;
  defaults = {
    messages: {
      // MEDIA_ERR_ABORTED
      1: "The video download was cancelled",
      // MEDIA_ERR_NETWORK
      2: "We lost the connection to your video. Are you connected to the internet?",
      // MEDIA_ERR_DECODE
      3: "The video is bad or in a format that can't be played on your browser",
      // MEDIA_ERR_SRC_NOT_SUPPORTED
      4: "Your video is either unavailable or your browser does not support the format it's recorded in",
      // MEDIA_ERR_ENCRYPTED
      5: "The video you're trying to watch is encrypted and we don't know how to decrypt it",
      unknown: "Something we didn't anticipate just happened which is preventing your video from playing. Wait a little while and try again"
    }
  };
  extend = function(obj){
    Array.prototype.slice.call(arguments, 1).forEach(function(source){
      var prop;
      for (prop in source) {
        if (source[prop] && typeof source[prop] === 'object') {
          obj[prop] = extend(obj[prop] || {}, source[prop]);
        } else {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };
  
  videojs.plugin('errors', function(options){
    var addEventListener, messages, settings;

    settings = extend(defaults, options);
    messages = settings.messages;
    addEventListener = this.el().addEventListener || this.el().attachEvent;

    this.on('error', function(event){
      var code, dialog, player;
      player = this;
      code = event.target.error ? event.target.error.code : event.code;
      
      // create the dialog
      dialog = document.createElement('div');
      dialog.className = 'vjs-error-dialog';
      dialog.textContent = messages[code] || messages['unknown'];
      addEventListener.call(dialog, 'click', function(event){
        player.el().removeChild(dialog);
      }, false);

      // add it to the DOM
      player.el().appendChild(dialog);
    });
  });
})();