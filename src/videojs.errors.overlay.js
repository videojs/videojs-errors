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
    self.header = options.header;
    self.message = options.message;
    self.details = options.details;

    // Setup elements and event handling
    self.updateLayout(player);

    player.on('error', function (){
      var error;

      error = videojs.util.mergeOptions(settings.errors[this.error().code || 0], this.error());

      self.setCode(error.code + ' ' + error.type);
      self.setHeader(error.headline);
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

var createErrorOverlay = function(header, message, code, details) {
  return '<div class="vjs-errors-dialog">' +
   '<button class="vjs-errors-close-button"></button>' +
   '<div class="vjs-errors-content-container">' +
   '<p class="vjs-errors-headline">' + header + '</p>' +
   '<p><b>Error Code: </b><span class="vjs-errors-code">' + code + '</span></p>' +
   '<p class="vjs-errors-message">' + message + '</p>' +
   '<p class="vjs-errors-details">' + details + '</p>' +
   '</div>' +
   '<div class="vjs-errors-ok-button-container">' +
   '<button class="vjs-errors-ok-button">OK</button>' +
   '</div>' +
   '</div>';
};

videojs.ErrorOverlay.prototype.createEl = function() {
  // Create primary element
  var el = videojs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-error-overlay'
  });

  // Create content element
  this.contentEl_ = videojs.createEl('div', {
    className: 'vjs-errors-mask',
    innerHTML: createErrorOverlay(self.header, self.message, self.code, self.details)
  });

  // Add content element to primary element
  el.appendChild(this.contentEl_);

  // Register components
  this.containerElement = el.children[0];
  this.headerElement = this.containerElement.querySelector('.vjs-errors-headline');
  this.messageElement = this.containerElement.querySelector('.vjs-errors-message');
  this.codeElement = this.containerElement.querySelector('.vjs-errors-code');
  this.detailsElement = this.containerElement.querySelector('.vjs-errors-details');
  this.okButtonElement = this.containerElement.querySelector('.vjs-errors-ok-button');
  this.closeButtonElement = this.containerElement.querySelector('.vjs-errors-close-button');

  // Add event handling for buttons
  this.okButtonElement.addEventListener('click', function() {console.log('hide')});
  this.closeButtonElement.addEventListener('click', function() {console.log('hide')});

  // Return primary element
  return el;
};

videojs.ErrorOverlay.prototype.setHeader = function(header) {
  this.header = header;
  this.headerElement.innerHTML = this.header;
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
    this.addClass('vjs-error-overlay');
    this.removeClass('vjs-error-overlay-mini');
  } else {
    this.addClass('vjs-error-overlay-mini');
    this.removeClass('vjs-error-overlay');
  }
};
