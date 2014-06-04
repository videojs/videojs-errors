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
    self.type = options.type;
    self.headline = options.headline;
    self.message = options.message;
    self.details = options.details;

    // Setup elements and event handling
    self.buildEl();
    self.closeButton.addEventListener('click', function (){
      self.hide();
    });
    self.okButtonElement.addEventListener('click', function (){
      self.hide();
    });
    self.updateLayout(player);

    player.on('error', function (){
      var error;

      error = videojs.util.mergeOptions(settings.errors[this.error().code || 0], this.error());

      self.setCode(error.code, error.type);
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
  var maskElement = document.createElement('div');
  maskElement.className = 'vjs-errors-mask';
  // Dialog Element
  var dialogElement = document.createElement('div');
  dialogElement.className = 'vjs-errors-dialog';
  maskElement.appendChild(dialogElement);
  // Close Element
  this.closeButton = document.createElement('button');
  this.closeButton.className = 'vjs-errors-close-button';
  dialogElement.appendChild(this.closeButton);
  // Headline Element
  this.headlineElement = document.createElement('p');
  this.headlineElement.className = 'vjs-errors-headline';
  dialogElement.appendChild(this.headlineElement);
  // Code Element
  this.codeElement = document.createElement('p');
  this.codeElement.className = 'vjs-errors-code';
  dialogElement.appendChild(this.codeElement);
  // Message Element
  this.messageElement = document.createElement('p');
  this.messageElement.className = 'vjs-errors-message';
  dialogElement.appendChild(this.messageElement);
  // Details Element
  this.detailsElement = document.createElement('p');
  this.detailsElement.className = 'vjs-errors-details';
  dialogElement.appendChild(this.detailsElement);
  // Ok Button Container
  var okButtonContainer = document.createElement('div');
  okButtonContainer.className = 'vjs-errors-ok-button-container';
  dialogElement.appendChild(okButtonContainer);
  // Ok Button
  this.okButtonElement = document.createElement('button');
  this.okButtonElement.className = 'vjs-errors-ok-button';
  //this.okButtonElement.on('click', this.hide);
  okButtonContainer.appendChild(this.okButtonElement);
  // Add it to primary component
  this.el().appendChild(maskElement);
};

videojs.ErrorOverlay.prototype.setHeadline = function(headline) {
  this.headline = headline;
  this.headlineElement.innerHTML = this.headline;
};

videojs.ErrorOverlay.prototype.setMessage = function(message) {
  this.message = message;
  this.messageElement.innerHTML = this.message;
};

videojs.ErrorOverlay.prototype.setCode = function(code, type) {
  this.code = code;
  this.type = type;
  this.codeElement.innerHTML = '<b>Error Code:</b> ' + this.code + ' ' + this.type;
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
