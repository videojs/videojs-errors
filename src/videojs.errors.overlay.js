/* Errors Overlay
 ================================================================================ */
videojs.ErrorOverlay = videojs.Component.extend({
  init: function(player, options) {
    videojs.Component.call(this, player, options);

    var self = this;

    // Default state
    self.code = options.code;
    self.header = options.header;
    self.message = options.message;
    self.details = options.details;

    // Setup elements and event handling
    self.createEl();
    self.okButtonElement.addEventListener('click', function() {self.hide()});
    self.closeButtonElement.addEventListener('click', function() {self.hide()});

    player.on('error', function (){
      var error, errors;

      error = this.error();
      errors = options.errors;

      self.setCode(error.code + ' ' + errors[error.code].type);
      self.setHeader(errors[error.code].headline);
      self.setMessage(error.message);
      self.updateLayout(this);
      self.show();
    });
  }
});

var createErrorOverlay = function(header, message, code, details) {
  return '<div class="vjs-errors-mask">' +
   '<div class="vjs-errors-dialog">' +
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
   '</div>' +
   '</div>';
};

videojs.ErrorOverlay.prototype.createEl = function() {
  this.el().innerHTML = createErrorOverlay(this.header, this.copy, this.code, this.details);

  this.containerElement = this.el().children[0];

  this.headerElement = this.containerElement.querySelector('.vjs-errors-headline');
  this.messageElement = this.containerElement.querySelector('.vjs-errors-message');
  this.codeElement = this.containerElement.querySelector('.vjs-errors-code');
  this.detailsElement = this.containerElement.querySelector('.vjs-errors-details');
  this.okButtonElement = this.containerElement.querySelector('.vjs-errors-ok-button');
  this.closeButtonElement = this.containerElement.querySelector('.vjs-errors-close-button');

  return this.el();
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