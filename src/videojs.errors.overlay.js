/* Errors Overlay
 ================================================================================ */
videojs.ErrorOverlay = videojs.Component.extend({
  init: function(player, options) {
    videojs.Component.call(this, player, options);

    var
      self = this,
      settings = videojs.util.mergeOptions({
        errors: {
          0: {
            code: 0,
            type: 'UNKNOWN',
            headline: 'An error has occurred',
            message: 'Something really unexpected happened'
          }
        }
      }, options);

    // Default state
    self.code = options.code;
    self.headline = options.headline;
    self.message = options.message;
    self.details = options.details;

    // Setup elements and event handling
    self.buildEl();
    self.updateLayout(player);

    player.on('error', function (){
      var error;

      error = videojs.util.mergeOptions(settings.errors[this.error().code || 0], this.error());

      self.setCode(error.code + ' ' + error.type);
      self.setHeadline(error.headline);
      self.setMessage(error.message);
      self.updateLayout(this);
      self.show();
    });

    player.on('loadstart', function() {
      self.hide();
    });

    player.on('errorrecover', function() {
      self.hide();
    });
  }
});

videojs.ErrorOverlay.prototype.buildEl = function() {
  // Mask Element
  this.maskElement = document.createElement('div');
  this.maskElement.className = 'vjs-errors-mask';
  // Dialog Element
  this.dialogElement = document.createElement('div');
  this.dialogElement.className = 'vjs-errors-dialog';
  this.maskElement.appendChild(this.dialogElement);
  // Close Element
  this.closeButton = document.createElement('button');
  this.closeButton.className = 'vjs-errors-close-button';
  this.dialogElement.appendChild(this.closeButton);
  // Headline Element
  this.headlineElement = document.createElement('p');
  this.headlineElement.className = 'vjs-errors-headline';
  this.dialogElement.appendChild(this.headlineElement);
  // Code Element
  this.codeElement = document.createElement('p');
  this.codeElement.className = 'vjs-errors-code';
  this.dialogElement.appendChild(this.codeElement);
  // Message Element
  this.messageElement = document.createElement('p');
  this.messageElement.className = 'vjs-errors-message';
  this.dialogElement.appendChild(this.messageElement);
  // Details Element
  this.detailsElement = document.createElement('p');
  this.detailsElement.className = 'vjs-errors-details';
  this.dialogElement.appendChild(this.detailsElement);
  // Ok Button Container
  this.okButtonContainer = document.createElement('div');
  this.okButtonContainer.className = 'vjs-errors-ok-button-container';
  this.dialogElement.appendChild(this.okButtonContainer);
  // Ok Button
  this.okButtonElement = document.createElement('button');
  this.okButtonElement.className = 'vjs-errors-ok-button';
  this.okButtonContainer.appendChild(this.okButtonElement);
  // Add it to primary component
  this.el().appendChild(this.maskElement);
};

videojs.ErrorOverlay.prototype.setHeadline = function(headline) {
  this.headline = headline;
  this.headlineElement.innerHTML = this.headline;
};

videojs.ErrorOverlay.prototype.setMessage = function(message) {
  this.message = message;
  this.messageElement.innerHTML = this.message;
};

videojs.ErrorOverlay.prototype.setCode = function(code) {
  this.code = code;
  this.codeElement.innerHTML = this.code;
};

videojs.ErrorOverlay.prototype.setDetails = function(details) {
  this.details = details;
  this.detailsElement.innerHTML = this.details;
};

videojs.ErrorOverlay.prototype.updateLayout = function(player) {
  if (player.width() > 300 && player.height() > 150){
    this.addClass('vjs-errors-overlay');
    this.removeClass('vjs-errors-overlay-mini');
  } else {
    this.addClass('vjs-errors-overlay-mini');
    this.removeClass('vjs-errors-overlay');
  }
};
