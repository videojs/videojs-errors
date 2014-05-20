/* Errors Overlay
 ================================================================================ */
videojs.ErrorOverlay = videojs.Component.extend({
  init: function(player, options) {
    videojs.Component.call(this, player, options);

    this.code = options && options.code ? options.code : '';
    this.header = options && options.header ? options.header : '';
    this.message = options && options.message ? options.message : '';
    this.details = options && options.details ? options.details : '';

    this.createEl();
    this.hide();

  }
});

var populateOverlay = function(header, message, code, details) {
  this.show();
}

var createErrorOverlay = function(header, message, code, details) {
  return '<div class=\"vjs-errors-container\">' +
    '<div class=\"vjs-errors-close-button"></div>' +
    '<div class=\"vjs-errors-content\">' +
    '<p class=\"vjs-errors-heading\">' + header + '</p>' +
    '<p class=\"vjs-errors-message\">' + message + '</p>' +
    '<p><b>Error Code: </b><span class=\"vjs-error-code\">' + code + '</span></p>' +
    '<p class=\"vjs-errors-recommendations\">' + details + '</p>' +
    '</div><button class=\"vjs-errors-ok-button\">OK</button></div>';
};

videojs.ErrorOverlay.prototype.createEl = function() {
  this.el().innerHTML = createErrorOverlay(this.header, this.copy, this.code, this.details);

  this.headerElement = this.el().children[0].querySelector('.vjs-errors-heading');
  this.messageElement = this.el().children[0].querySelector('.vjs-errors-message');
  this.codeElement = this.el().children[0].querySelector('.vjs-error-code');

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
};
