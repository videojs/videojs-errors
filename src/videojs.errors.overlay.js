/* Errors Overlay
 ================================================================================ */
videojs.ErrorOverlay = videojs.Component.extend({
  init: function(player, options) {
    videojs.Component.call(this, player, options);

    this.code = options.code ? options.code : '';
    this.header = options.header ? options.header : '';
    this.copy = options.copy ? options.copy : '';
    this.details = options.details ? options.details : '';

    this.createEl();
  }
});

var createErrorOverlay = function(header, copy, code, details) {
  return '<div class=\"vjs-error-container\">' +
    '<p class=\"vjs-errors-heading\">' + header + '</p>' +
    '<p>' + copy + '</p>' +
    '<p><b>Error Code: </b><span class=\"vjs-error-code\">' + code + '</span></p>' +
    '<p class=\"vjs-errors-recommendations\">' + details + '</p>' +
    '</div>';
};

videojs.ErrorOverlay.prototype.createEl = function() {
  this.el().innerHTML = createErrorOverlay(this.header, this.copy, this.code, this.details);
  this.addClass('vjs-error-dialog');
  return this.el();
};

videojs.ErrorOverlay.prototype.setHeader = function(header) {
  this.header = header;
};

videojs.ErrorOverlay.prototype.setCopy = function(copy) {
  this.copy = copy;
};

videojs.ErrorOverlay.prototype.setCode = function(code) {
  this.code = code;
};

videojs.ErrorOverlay.prototype.setDetails = function(details) {
  this.details = details;
};