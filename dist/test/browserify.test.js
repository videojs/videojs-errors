(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _index = require(5);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

QUnit.module("browserify require"); /**
                                     * browserify test 
                                     */

QUnit.test("videojs-errors should be requireable via browserify", function (assert) {
  assert.ok(_index2["default"], "videojs-errors is required properly");
});

},{"5":5}],2:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require(4);

var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

module.exports = doccy;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"4":4}],3:[function(require,module,exports){
(function (global){
var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof global !== "undefined") {
    win = global;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
(function (global){
'use strict';

exports.__esModule = true;

var _video = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _video2 = _interopRequireDefault(_video);

var _window = require(3);

var _window2 = _interopRequireDefault(_window);

var _document = require(2);

var _document2 = _interopRequireDefault(_document);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var FlashObj = _video2['default'].getComponent('Flash');
var defaultDismiss = !_video2['default'].browser.IS_IPHONE;

// Video.js 5/6 cross-compatibility.
var registerPlugin = _video2['default'].registerPlugin || _video2['default'].plugin;

// Default options for the plugin.
var defaults = {
  header: '',
  code: '',
  message: '',
  timeout: 45 * 1000,
  dismiss: defaultDismiss,
  progressDisabled: false,
  errors: {
    '1': {
      type: 'MEDIA_ERR_ABORTED',
      headline: 'The video download was cancelled'
    },
    '2': {
      type: 'MEDIA_ERR_NETWORK',
      headline: 'The video connection was lost, please confirm you are ' + 'connected to the internet'
    },
    '3': {
      type: 'MEDIA_ERR_DECODE',
      headline: 'The video is bad or in a format that cannot be played on your browser'
    },
    '4': {
      type: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
      headline: 'This video is either unavailable or not supported in this browser'
    },
    '5': {
      type: 'MEDIA_ERR_ENCRYPTED',
      headline: 'The video you are trying to watch is encrypted and we do not know how ' + 'to decrypt it'
    },
    'unknown': {
      type: 'MEDIA_ERR_UNKNOWN',
      headline: 'An unanticipated problem was encountered, check back soon and try again'
    },
    '-1': {
      type: 'PLAYER_ERR_NO_SRC',
      headline: 'No video has been loaded'
    },
    '-2': {
      type: 'PLAYER_ERR_TIMEOUT',
      headline: 'Could not download the video'
    },
    '-3': {
      type: 'PLAYER_ERR_DOMAIN_RESTRICTED',
      headline: 'This video is restricted from playing on your current domain'
    },
    '-4': {
      type: 'PLAYER_ERR_IP_RESTRICTED',
      headline: 'This video is restricted at your current IP address'
    },
    '-5': {
      type: 'PLAYER_ERR_GEO_RESTRICTED',
      headline: 'This video is restricted from playing in your current geographic region'
    }
  }
};

/**
 * Monitors a player for signs of life during playback and
 * triggers PLAYER_ERR_TIMEOUT if none occur within a reasonable
 * timeframe.
 */
var initPlugin = function initPlugin(player, options) {
  var monitor = void 0;
  var listeners = [];

  // clears the previous monitor timeout and sets up a new one
  var resetMonitor = function resetMonitor() {
    _window2['default'].clearTimeout(monitor);
    monitor = _window2['default'].setTimeout(function () {
      // player already has an error
      // or is not playing under normal conditions
      if (player.error() || player.paused() || player.ended()) {
        return;
      }

      player.error({
        code: -2,
        type: 'PLAYER_ERR_TIMEOUT'
      });
    }, options.timeout);

    // clear out any existing player timeout
    // playback has recovered
    if (player.error() && player.error().code === -2) {
      player.error(null);
    }
  };

  // clear any previously registered listeners
  var cleanup = function cleanup() {
    var listener = void 0;

    while (listeners.length) {
      listener = listeners.shift();
      player.off(listener[0], listener[1]);
    }
    _window2['default'].clearTimeout(monitor);
  };

  // creates and tracks a player listener if the player looks alive
  var healthcheck = function healthcheck(type, fn) {
    var check = function check() {
      // if there's an error do not reset the monitor and
      // clear the error unless time is progressing
      if (!player.error()) {
        // error if using Flash and its API is unavailable
        var tech = player.$('.vjs-tech');

        if (tech && tech.type === 'application/x-shockwave-flash' && !tech.vjs_getProperty) {
          player.error({
            code: -2,
            type: 'PLAYER_ERR_TIMEOUT'
          });
          return;
        }

        // playback isn't expected if the player is paused
        if (player.paused()) {
          return resetMonitor();
        }
        // playback isn't expected once the video has ended
        if (player.ended()) {
          return resetMonitor();
        }
      }

      fn.call(this);
    };

    player.on(type, check);
    listeners.push([type, check]);
  };

  var onPlayStartMonitor = function onPlayStartMonitor() {
    var lastTime = 0;

    cleanup();

    // if no playback is detected for long enough, trigger a timeout error
    resetMonitor();
    healthcheck(['timeupdate', 'adtimeupdate'], function () {
      var currentTime = player.currentTime();

      // playback is operating normally or has recovered
      if (currentTime !== lastTime) {
        lastTime = currentTime;
        resetMonitor();
      }
    });

    if (!options.progressDisabled) {
      healthcheck('progress', resetMonitor);
    }
  };

  var onPlayNoSource = function onPlayNoSource() {
    if (!player.currentSrc()) {
      player.error({
        code: -1,
        type: 'PLAYER_ERR_NO_SRC'
      });
    }
  };

  var onErrorHandler = function onErrorHandler() {
    var details = '';
    var error = player.error();
    var content = _document2['default'].createElement('div');
    var dialogContent = '';

    // In the rare case when `error()` does not return an error object,
    // defensively escape the handler function.
    if (!error) {
      return;
    }

    error = _video2['default'].mergeOptions(error, options.errors[error.code || 0]);

    if (error.message) {
      details = '<div class="vjs-errors-details">' + player.localize('Technical details') + '\n        : <div class="vjs-errors-message">' + player.localize(error.message) + '</div>\n        </div>';
    }

    if (error.code === 4 && FlashObj && !FlashObj.isSupported()) {
      var flashMessage = player.localize('If you are using an older browser please try upgrading or installing Flash.');

      details += '<span class="vjs-errors-flashmessage">' + flashMessage + '</span>';
    }

    var display = player.getChild('errorDisplay');

    content.className = 'vjs-errors-dialog';
    content.id = 'vjs-errors-dialog';
    dialogContent = '<div class="vjs-errors-content-container">\n      <h2 class="vjs-errors-headline">' + this.localize(error.headline) + '</h2>\n        <div><b>' + this.localize('Error Code') + '</b>: ' + (error.type || error.code) + '</div>\n        ' + details + '\n      </div>';

    var closeable = display.closeable(!('dismiss' in error) || error.dismiss);

    // We should get a close button
    if (closeable) {
      dialogContent += '<div class="vjs-errors-ok-button-container">\n          <button class="vjs-errors-ok-button">' + this.localize('OK') + '</button>\n        </div>';
      content.innerHTML = dialogContent;
      display.fillWith(content);
      // Get the close button inside the error display
      display.contentEl().firstChild.appendChild(display.getChild('closeButton').el());

      var okButton = display.el().querySelector('.vjs-errors-ok-button');

      player.on(okButton, 'click', function () {
        display.close();
      });
    } else {
      content.innerHTML = dialogContent;
      display.fillWith(content);
    }

    if (player.currentWidth() <= 600 || player.currentHeight() <= 250) {
      display.addClass('vjs-xs');
    }

    display.one('modalclose', function () {
      return player.error(null);
    });
  };

  var onDisposeHandler = function onDisposeHandler() {
    cleanup();

    player.removeClass('vjs-errors');
    player.off('play', onPlayStartMonitor);
    player.off('play', onPlayNoSource);
    player.off('dispose', onDisposeHandler);
    player.off('error', onErrorHandler);
  };

  var reInitPlugin = function reInitPlugin(newOptions) {
    onDisposeHandler();
    initPlugin(player, _video2['default'].mergeOptions(defaults, newOptions));
  };

  reInitPlugin.extend = function (errors) {
    options.errors = _video2['default'].mergeOptions(options.errors, errors);
  };

  reInitPlugin.disableProgress = function (disabled) {
    options.progressDisabled = disabled;
    onPlayStartMonitor();
  };

  player.on('play', onPlayStartMonitor);
  player.on('play', onPlayNoSource);
  player.on('dispose', onDisposeHandler);
  player.on('error', onErrorHandler);

  player.ready(function () {
    player.addClass('vjs-errors');
  });

  player.errors = reInitPlugin;
};

/**
 * Initialize the plugin. Waits until the player is ready to do anything.
 */
var errors = function errors(options) {
  initPlugin(this, _video2['default'].mergeOptions(defaults, options));
};

// Register the plugin with video.js.
registerPlugin('errors', errors);

exports['default'] = errors;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"2":2,"3":3}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy92aWRlb2pzLXNwZWxsYm9vay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiZGlzdC90ZXN0L2Jyb3dzZXJpZnkuc3RhcnQuanMiLCJub2RlX21vZHVsZXMvZ2xvYmFsL2RvY3VtZW50LmpzIiwibm9kZV9tb2R1bGVzL2dsb2JhbC93aW5kb3cuanMiLCJub2RlX21vZHVsZXMvdmlkZW9qcy1zcGVsbGJvb2svbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsInNyYy9qcy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDR0E7Ozs7OztBQUVBLE1BQU0sTUFBTixDQUFhLG9CQUFiLEUsQ0FMQTs7OztBQU1BLE1BQU0sSUFBTixDQUFXLHFEQUFYLEVBQWtFLFVBQUMsTUFBRCxFQUFZO0FBQzVFLFNBQU8sRUFBUCxxQkFBZSxxQ0FBZjtBQUNELENBRkQ7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNiQTs7Ozs7OztBQ0FBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTSxXQUFXLG1CQUFRLFlBQVIsQ0FBcUIsT0FBckIsQ0FBakI7QUFDQSxJQUFNLGlCQUFpQixDQUFDLG1CQUFRLE9BQVIsQ0FBZ0IsU0FBeEM7O0FBRUE7QUFDQSxJQUFNLGlCQUFpQixtQkFBUSxjQUFSLElBQTBCLG1CQUFRLE1BQXpEOztBQUVBO0FBQ0EsSUFBTSxXQUFXO0FBQ2YsVUFBUSxFQURPO0FBRWYsUUFBTSxFQUZTO0FBR2YsV0FB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LFNBQU8sS0FBUCxDQUFhLFlBQU07QUFDakIsV0FBTyxRQUFQLENBQWdCLFlBQWhCO0FBQ0QsR0FGRDs7QUFJQSxTQUFPLE1BQVAsR0FBZ0IsWUFBaEI7QUFDRCxDQTlNRDs7QUFnTkE7OztBQUdBLElBQU0sU0FBUyxTQUFULE1BQVMsQ0FBUyxPQUFULEVBQWtCO0FBQy9CLGFBQVcsSUFBWCxFQUFpQixtQkFBUSxZQUFSLENBQXFCLFFBQXJCLEVBQStCLE9BQS9CLENBQWpCO0FBQ0QsQ0FGRDs7QUFJQTtBQUNBLGVBQWUsUUFBZixFQUF5QixNQUF6Qjs7cUJBRWUsTSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIGJyb3dzZXJpZnkgdGVzdCBcbiAqL1xuaW1wb3J0IHBrZyBmcm9tIFwiLi4vLi4vc3JjL2pzL2luZGV4LmpzXCI7XG5cblFVbml0Lm1vZHVsZShcImJyb3dzZXJpZnkgcmVxdWlyZVwiKTtcblFVbml0LnRlc3QoXCJ2aWRlb2pzLWVycm9ycyBzaG91bGQgYmUgcmVxdWlyZWFibGUgdmlhIGJyb3dzZXJpZnlcIiwgKGFzc2VydCkgPT4ge1xuICBhc3NlcnQub2socGtnLCBcInZpZGVvanMtZXJyb3JzIGlzIHJlcXVpcmVkIHByb3Blcmx5XCIpO1xufSk7IiwidmFyIHRvcExldmVsID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDoge31cbnZhciBtaW5Eb2MgPSByZXF1aXJlKCdtaW4tZG9jdW1lbnQnKTtcblxudmFyIGRvY2N5O1xuXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGRvY2N5ID0gZG9jdW1lbnQ7XG59IGVsc2Uge1xuICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXTtcblxuICAgIGlmICghZG9jY3kpIHtcbiAgICAgICAgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddID0gbWluRG9jO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb2NjeTtcbiIsInZhciB3aW47XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgd2luID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgd2luID0ge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2luO1xuIiwiIiwiaW1wb3J0IHZpZGVvanMgZnJvbSAndmlkZW8uanMnO1xuaW1wb3J0IHdpbmRvdyBmcm9tICdnbG9iYWwvd2luZG93JztcbmltcG9ydCBkb2N1bWVudCBmcm9tICdnbG9iYWwvZG9jdW1lbnQnO1xuXG5jb25zdCBGbGFzaE9iaiA9IHZpZGVvanMuZ2V0Q29tcG9uZW50KCdGbGFzaCcpO1xuY29uc3QgZGVmYXVsdERpc21pc3MgPSAhdmlkZW9qcy5icm93c2VyLklTX0lQSE9ORTtcblxuLy8gVmlkZW8uanMgNS82IGNyb3NzLWNvbXBhdGliaWxpdHkuXG5jb25zdCByZWdpc3RlclBsdWdpbiA9IHZpZGVvanMucmVnaXN0ZXJQbHVnaW4gfHwgdmlkZW9qcy5wbHVnaW47XG5cbi8vIERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIHBsdWdpbi5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBoZWFkZXI6ICcnLFxuICBjb2RlOiAnJyxcbiAgbWVzc2FnZTogJycsXG4gIHRpbWVvdXQ6IDQ1ICogMTAwMCxcbiAgZGlzbWlzczogZGVmYXVsdERpc21pc3MsXG4gIHByb2dyZXNzRGlzYWJsZWQ6IGZhbHNlLFxuICBlcnJvcnM6IHtcbiAgICAnMSc6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfQUJPUlRFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoZSB2aWRlbyBkb3dubG9hZCB3YXMgY2FuY2VsbGVkJ1xuICAgIH0sXG4gICAgJzInOiB7XG4gICAgICB0eXBlOiAnTUVESUFfRVJSX05FVFdPUksnLFxuICAgICAgaGVhZGxpbmU6ICdUaGUgdmlkZW8gY29ubmVjdGlvbiB3YXMgbG9zdCwgcGxlYXNlIGNvbmZpcm0geW91IGFyZSAnICtcbiAgICAgICAgICAgICAgICAnY29ubmVjdGVkIHRvIHRoZSBpbnRlcm5ldCdcbiAgICB9LFxuICAgICczJzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9ERUNPREUnLFxuICAgICAgaGVhZGxpbmU6ICdUaGUgdmlkZW8gaXMgYmFkIG9yIGluIGEgZm9ybWF0IHRoYXQgY2Fubm90IGJlIHBsYXllZCBvbiB5b3VyIGJyb3dzZXInXG4gICAgfSxcbiAgICAnNCc6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfU1JDX05PVF9TVVBQT1JURUQnLFxuICAgICAgaGVhZGxpbmU6ICdUaGlzIHZpZGVvIGlzIGVpdGhlciB1bmF2YWlsYWJsZSBvciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcidcbiAgICB9LFxuICAgICc1Jzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9FTkNSWVBURUQnLFxuICAgICAgaGVhZGxpbmU6ICdUaGUgdmlkZW8geW91IGFyZSB0cnlpbmcgdG8gd2F0Y2ggaXMgZW5jcnlwdGVkIGFuZCB3ZSBkbyBub3Qga25vdyBob3cgJyArXG4gICAgICAgICAgICAgICAgJ3RvIGRlY3J5cHQgaXQnXG4gICAgfSxcbiAgICAndW5rbm93bic6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfVU5LTk9XTicsXG4gICAgICBoZWFkbGluZTogJ0FuIHVuYW50aWNpcGF0ZWQgcHJvYmxlbSB3YXMgZW5jb3VudGVyZWQsIGNoZWNrIGJhY2sgc29vbiBhbmQgdHJ5IGFnYWluJ1xuICAgIH0sXG4gICAgJy0xJzoge1xuICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfTk9fU1JDJyxcbiAgICAgIGhlYWRsaW5lOiAnTm8gdmlkZW8gaGFzIGJlZW4gbG9hZGVkJ1xuICAgIH0sXG4gICAgJy0yJzoge1xuICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfVElNRU9VVCcsXG4gICAgICBoZWFkbGluZTogJ0NvdWxkIG5vdCBkb3dubG9hZCB0aGUgdmlkZW8nXG4gICAgfSxcbiAgICAnLTMnOiB7XG4gICAgICB0eXBlOiAnUExBWUVSX0VSUl9ET01BSU5fUkVTVFJJQ1RFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoaXMgdmlkZW8gaXMgcmVzdHJpY3RlZCBmcm9tIHBsYXlpbmcgb24geW91ciBjdXJyZW50IGRvbWFpbidcbiAgICB9LFxuICAgICctNCc6IHtcbiAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX0lQX1JFU1RSSUNURUQnLFxuICAgICAgaGVhZGxpbmU6ICdUaGlzIHZpZGVvIGlzIHJlc3RyaWN0ZWQgYXQgeW91ciBjdXJyZW50IElQIGFkZHJlc3MnXG4gICAgfSxcbiAgICAnLTUnOiB7XG4gICAgICB0eXBlOiAnUExBWUVSX0VSUl9HRU9fUkVTVFJJQ1RFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoaXMgdmlkZW8gaXMgcmVzdHJpY3RlZCBmcm9tIHBsYXlpbmcgaW4geW91ciBjdXJyZW50IGdlb2dyYXBoaWMgcmVnaW9uJ1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBNb25pdG9ycyBhIHBsYXllciBmb3Igc2lnbnMgb2YgbGlmZSBkdXJpbmcgcGxheWJhY2sgYW5kXG4gKiB0cmlnZ2VycyBQTEFZRVJfRVJSX1RJTUVPVVQgaWYgbm9uZSBvY2N1ciB3aXRoaW4gYSByZWFzb25hYmxlXG4gKiB0aW1lZnJhbWUuXG4gKi9cbmNvbnN0IGluaXRQbHVnaW4gPSBmdW5jdGlvbihwbGF5ZXIsIG9wdGlvbnMpIHtcbiAgbGV0IG1vbml0b3I7XG4gIGNvbnN0IGxpc3RlbmVycyA9IFtdO1xuXG4gIC8vIGNsZWFycyB0aGUgcHJldmlvdXMgbW9uaXRvciB0aW1lb3V0IGFuZCBzZXRzIHVwIGEgbmV3IG9uZVxuICBjb25zdCByZXNldE1vbml0b3IgPSBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KG1vbml0b3IpO1xuICAgIG1vbml0b3IgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIC8vIHBsYXllciBhbHJlYWR5IGhhcyBhbiBlcnJvclxuICAgICAgLy8gb3IgaXMgbm90IHBsYXlpbmcgdW5kZXIgbm9ybWFsIGNvbmRpdGlvbnNcbiAgICAgIGlmIChwbGF5ZXIuZXJyb3IoKSB8fCBwbGF5ZXIucGF1c2VkKCkgfHwgcGxheWVyLmVuZGVkKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBwbGF5ZXIuZXJyb3Ioe1xuICAgICAgICBjb2RlOiAtMixcbiAgICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfVElNRU9VVCdcbiAgICAgIH0pO1xuICAgIH0sIG9wdGlvbnMudGltZW91dCk7XG5cbiAgICAvLyBjbGVhciBvdXQgYW55IGV4aXN0aW5nIHBsYXllciB0aW1lb3V0XG4gICAgLy8gcGxheWJhY2sgaGFzIHJlY292ZXJlZFxuICAgIGlmIChwbGF5ZXIuZXJyb3IoKSAmJiBwbGF5ZXIuZXJyb3IoKS5jb2RlID09PSAtMikge1xuICAgICAgcGxheWVyLmVycm9yKG51bGwpO1xuICAgIH1cbiAgfTtcblxuICAvLyBjbGVhciBhbnkgcHJldmlvdXNseSByZWdpc3RlcmVkIGxpc3RlbmVyc1xuICBjb25zdCBjbGVhbnVwID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGxpc3RlbmVyO1xuXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgIGxpc3RlbmVyID0gbGlzdGVuZXJzLnNoaWZ0KCk7XG4gICAgICBwbGF5ZXIub2ZmKGxpc3RlbmVyWzBdLCBsaXN0ZW5lclsxXSk7XG4gICAgfVxuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQobW9uaXRvcik7XG4gIH07XG5cbiAgLy8gY3JlYXRlcyBhbmQgdHJhY2tzIGEgcGxheWVyIGxpc3RlbmVyIGlmIHRoZSBwbGF5ZXIgbG9va3MgYWxpdmVcbiAgY29uc3QgaGVhbHRoY2hlY2sgPSBmdW5jdGlvbih0eXBlLCBmbikge1xuICAgIGNvbnN0IGNoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBpZiB0aGVyZSdzIGFuIGVycm9yIGRvIG5vdCByZXNldCB0aGUgbW9uaXRvciBhbmRcbiAgICAgIC8vIGNsZWFyIHRoZSBlcnJvciB1bmxlc3MgdGltZSBpcyBwcm9ncmVzc2luZ1xuICAgICAgaWYgKCFwbGF5ZXIuZXJyb3IoKSkge1xuICAgICAgICAvLyBlcnJvciBpZiB1c2luZyBGbGFzaCBhbmQgaXRzIEFQSSBpcyB1bmF2YWlsYWJsZVxuICAgICAgICBjb25zdCB0ZWNoID0gcGxheWVyLiQoJy52anMtdGVjaCcpO1xuXG4gICAgICAgIGlmICh0ZWNoICYmXG4gICAgICAgICAgICB0ZWNoLnR5cGUgPT09ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCcgJiZcbiAgICAgICAgICAgICF0ZWNoLnZqc19nZXRQcm9wZXJ0eSkge1xuICAgICAgICAgIHBsYXllci5lcnJvcih7XG4gICAgICAgICAgICBjb2RlOiAtMixcbiAgICAgICAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX1RJTUVPVVQnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGxheWJhY2sgaXNuJ3QgZXhwZWN0ZWQgaWYgdGhlIHBsYXllciBpcyBwYXVzZWRcbiAgICAgICAgaWYgKHBsYXllci5wYXVzZWQoKSkge1xuICAgICAgICAgIHJldHVybiByZXNldE1vbml0b3IoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBwbGF5YmFjayBpc24ndCBleHBlY3RlZCBvbmNlIHRoZSB2aWRlbyBoYXMgZW5kZWRcbiAgICAgICAgaWYgKHBsYXllci5lbmRlZCgpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc2V0TW9uaXRvcigpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZuLmNhbGwodGhpcyk7XG4gICAgfTtcblxuICAgIHBsYXllci5vbih0eXBlLCBjaGVjayk7XG4gICAgbGlzdGVuZXJzLnB1c2goW3R5cGUsIGNoZWNrXSk7XG4gIH07XG5cbiAgY29uc3Qgb25QbGF5U3RhcnRNb25pdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGxhc3RUaW1lID0gMDtcblxuICAgIGNsZWFudXAoKTtcblxuICAgIC8vIGlmIG5vIHBsYXliYWNrIGlzIGRldGVjdGVkIGZvciBsb25nIGVub3VnaCwgdHJpZ2dlciBhIHRpbWVvdXQgZXJyb3JcbiAgICByZXNldE1vbml0b3IoKTtcbiAgICBoZWFsdGhjaGVjayhbJ3RpbWV1cGRhdGUnLCAnYWR0aW1ldXBkYXRlJ10sIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBwbGF5ZXIuY3VycmVudFRpbWUoKTtcblxuICAgICAgLy8gcGxheWJhY2sgaXMgb3BlcmF0aW5nIG5vcm1hbGx5IG9yIGhhcyByZWNvdmVyZWRcbiAgICAgIGlmIChjdXJyZW50VGltZSAhPT0gbGFzdFRpbWUpIHtcbiAgICAgICAgbGFzdFRpbWUgPSBjdXJyZW50VGltZTtcbiAgICAgICAgcmVzZXRNb25pdG9yKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoIW9wdGlvbnMucHJvZ3Jlc3NEaXNhYmxlZCkge1xuICAgICAgaGVhbHRoY2hlY2soJ3Byb2dyZXNzJywgcmVzZXRNb25pdG9yKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgb25QbGF5Tm9Tb3VyY2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXBsYXllci5jdXJyZW50U3JjKCkpIHtcbiAgICAgIHBsYXllci5lcnJvcih7XG4gICAgICAgIGNvZGU6IC0xLFxuICAgICAgICB0eXBlOiAnUExBWUVSX0VSUl9OT19TUkMnXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3Qgb25FcnJvckhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgZGV0YWlscyA9ICcnO1xuICAgIGxldCBlcnJvciA9IHBsYXllci5lcnJvcigpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBsZXQgZGlhbG9nQ29udGVudCA9ICcnO1xuXG4gICAgLy8gSW4gdGhlIHJhcmUgY2FzZSB3aGVuIGBlcnJvcigpYCBkb2VzIG5vdCByZXR1cm4gYW4gZXJyb3Igb2JqZWN0LFxuICAgIC8vIGRlZmVuc2l2ZWx5IGVzY2FwZSB0aGUgaGFuZGxlciBmdW5jdGlvbi5cbiAgICBpZiAoIWVycm9yKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZXJyb3IgPSB2aWRlb2pzLm1lcmdlT3B0aW9ucyhlcnJvciwgb3B0aW9ucy5lcnJvcnNbZXJyb3IuY29kZSB8fCAwXSk7XG5cbiAgICBpZiAoZXJyb3IubWVzc2FnZSkge1xuICAgICAgZGV0YWlscyA9IGA8ZGl2IGNsYXNzPVwidmpzLWVycm9ycy1kZXRhaWxzXCI+JHtwbGF5ZXIubG9jYWxpemUoJ1RlY2huaWNhbCBkZXRhaWxzJyl9XG4gICAgICAgIDogPGRpdiBjbGFzcz1cInZqcy1lcnJvcnMtbWVzc2FnZVwiPiR7cGxheWVyLmxvY2FsaXplKGVycm9yLm1lc3NhZ2UpfTwvZGl2PlxuICAgICAgICA8L2Rpdj5gO1xuICAgIH1cblxuICAgIGlmIChlcnJvci5jb2RlID09PSA0ICYmIEZsYXNoT2JqICYmICFGbGFzaE9iai5pc1N1cHBvcnRlZCgpKSB7XG4gICAgICBjb25zdCBmbGFzaE1lc3NhZ2UgPSBwbGF5ZXIubG9jYWxpemUoJ0lmIHlvdSBhcmUgdXNpbmcgYW4gb2xkZXIgYnJvd3NlciBwbGVhc2UgdHJ5IHVwZ3JhZGluZyBvciBpbnN0YWxsaW5nIEZsYXNoLicpO1xuXG4gICAgICBkZXRhaWxzICs9IGA8c3BhbiBjbGFzcz1cInZqcy1lcnJvcnMtZmxhc2htZXNzYWdlXCI+JHtmbGFzaE1lc3NhZ2V9PC9zcGFuPmA7XG4gICAgfVxuXG4gICAgY29uc3QgZGlzcGxheSA9IHBsYXllci5nZXRDaGlsZCgnZXJyb3JEaXNwbGF5Jyk7XG5cbiAgICBjb250ZW50LmNsYXNzTmFtZSA9ICd2anMtZXJyb3JzLWRpYWxvZyc7XG4gICAgY29udGVudC5pZCA9ICd2anMtZXJyb3JzLWRpYWxvZyc7XG4gICAgZGlhbG9nQ29udGVudCA9XG4gICAgIGA8ZGl2IGNsYXNzPVwidmpzLWVycm9ycy1jb250ZW50LWNvbnRhaW5lclwiPlxuICAgICAgPGgyIGNsYXNzPVwidmpzLWVycm9ycy1oZWFkbGluZVwiPiR7dGhpcy5sb2NhbGl6ZShlcnJvci5oZWFkbGluZSl9PC9oMj5cbiAgICAgICAgPGRpdj48Yj4ke3RoaXMubG9jYWxpemUoJ0Vycm9yIENvZGUnKX08L2I+OiAkeyhlcnJvci50eXBlIHx8IGVycm9yLmNvZGUpfTwvZGl2PlxuICAgICAgICAke2RldGFpbHN9XG4gICAgICA8L2Rpdj5gO1xuXG4gICAgY29uc3QgY2xvc2VhYmxlID0gZGlzcGxheS5jbG9zZWFibGUoISgnZGlzbWlzcycgaW4gZXJyb3IpIHx8IGVycm9yLmRpc21pc3MpO1xuXG4gICAgLy8gV2Ugc2hvdWxkIGdldCBhIGNsb3NlIGJ1dHRvblxuICAgIGlmIChjbG9zZWFibGUpIHtcbiAgICAgIGRpYWxvZ0NvbnRlbnQgKz1cbiAgICAgICBgPGRpdiBjbGFzcz1cInZqcy1lcnJvcnMtb2stYnV0dG9uLWNvbnRhaW5lclwiPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJ2anMtZXJyb3JzLW9rLWJ1dHRvblwiPiR7dGhpcy5sb2NhbGl6ZSgnT0snKX08L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+YDtcbiAgICAgIGNvbnRlbnQuaW5uZXJIVE1MID0gZGlhbG9nQ29udGVudDtcbiAgICAgIGRpc3BsYXkuZmlsbFdpdGgoY29udGVudCk7XG4gICAgICAvLyBHZXQgdGhlIGNsb3NlIGJ1dHRvbiBpbnNpZGUgdGhlIGVycm9yIGRpc3BsYXlcbiAgICAgIGRpc3BsYXkuY29udGVudEVsKCkuZmlyc3RDaGlsZC5hcHBlbmRDaGlsZChkaXNwbGF5LmdldENoaWxkKCdjbG9zZUJ1dHRvbicpLmVsKCkpO1xuXG4gICAgICBjb25zdCBva0J1dHRvbiA9IGRpc3BsYXkuZWwoKS5xdWVyeVNlbGVjdG9yKCcudmpzLWVycm9ycy1vay1idXR0b24nKTtcblxuICAgICAgcGxheWVyLm9uKG9rQnV0dG9uLCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZGlzcGxheS5jbG9zZSgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRlbnQuaW5uZXJIVE1MID0gZGlhbG9nQ29udGVudDtcbiAgICAgIGRpc3BsYXkuZmlsbFdpdGgoY29udGVudCk7XG4gICAgfVxuXG4gICAgaWYgKHBsYXllci5jdXJyZW50V2lkdGgoKSA8PSA2MDAgfHwgcGxheWVyLmN1cnJlbnRIZWlnaHQoKSA8PSAyNTApIHtcbiAgICAgIGRpc3BsYXkuYWRkQ2xhc3MoJ3Zqcy14cycpO1xuICAgIH1cblxuICAgIGRpc3BsYXkub25lKCdtb2RhbGNsb3NlJywgKCkgPT4gcGxheWVyLmVycm9yKG51bGwpKTtcbiAgfTtcblxuICBjb25zdCBvbkRpc3Bvc2VIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY2xlYW51cCgpO1xuXG4gICAgcGxheWVyLnJlbW92ZUNsYXNzKCd2anMtZXJyb3JzJyk7XG4gICAgcGxheWVyLm9mZigncGxheScsIG9uUGxheVN0YXJ0TW9uaXRvcik7XG4gICAgcGxheWVyLm9mZigncGxheScsIG9uUGxheU5vU291cmNlKTtcbiAgICBwbGF5ZXIub2ZmKCdkaXNwb3NlJywgb25EaXNwb3NlSGFuZGxlcik7XG4gICAgcGxheWVyLm9mZignZXJyb3InLCBvbkVycm9ySGFuZGxlcik7XG4gIH07XG5cbiAgY29uc3QgcmVJbml0UGx1Z2luID0gZnVuY3Rpb24obmV3T3B0aW9ucykge1xuICAgIG9uRGlzcG9zZUhhbmRsZXIoKTtcbiAgICBpbml0UGx1Z2luKHBsYXllciwgdmlkZW9qcy5tZXJnZU9wdGlvbnMoZGVmYXVsdHMsIG5ld09wdGlvbnMpKTtcbiAgfTtcblxuICByZUluaXRQbHVnaW4uZXh0ZW5kID0gZnVuY3Rpb24oZXJyb3JzKSB7XG4gICAgb3B0aW9ucy5lcnJvcnMgPSB2aWRlb2pzLm1lcmdlT3B0aW9ucyhvcHRpb25zLmVycm9ycywgZXJyb3JzKTtcbiAgfTtcblxuICByZUluaXRQbHVnaW4uZGlzYWJsZVByb2dyZXNzID0gZnVuY3Rpb24oZGlzYWJsZWQpIHtcbiAgICBvcHRpb25zLnByb2dyZXNzRGlzYWJsZWQgPSBkaXNhYmxlZDtcbiAgICBvblBsYXlTdGFydE1vbml0b3IoKTtcbiAgfTtcblxuICBwbGF5ZXIub24oJ3BsYXknLCBvblBsYXlTdGFydE1vbml0b3IpO1xuICBwbGF5ZXIub24oJ3BsYXknLCBvblBsYXlOb1NvdXJjZSk7XG4gIHBsYXllci5vbignZGlzcG9zZScsIG9uRGlzcG9zZUhhbmRsZXIpO1xuICBwbGF5ZXIub24oJ2Vycm9yJywgb25FcnJvckhhbmRsZXIpO1xuXG4gIHBsYXllci5yZWFkeSgoKSA9PiB7XG4gICAgcGxheWVyLmFkZENsYXNzKCd2anMtZXJyb3JzJyk7XG4gIH0pO1xuXG4gIHBsYXllci5lcnJvcnMgPSByZUluaXRQbHVnaW47XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIHBsdWdpbi4gV2FpdHMgdW50aWwgdGhlIHBsYXllciBpcyByZWFkeSB0byBkbyBhbnl0aGluZy5cbiAqL1xuY29uc3QgZXJyb3JzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBpbml0UGx1Z2luKHRoaXMsIHZpZGVvanMubWVyZ2VPcHRpb25zKGRlZmF1bHRzLCBvcHRpb25zKSk7XG59O1xuXG4vLyBSZWdpc3RlciB0aGUgcGx1Z2luIHdpdGggdmlkZW8uanMuXG5yZWdpc3RlclBsdWdpbignZXJyb3JzJywgZXJyb3JzKTtcblxuZXhwb3J0IGRlZmF1bHQgZXJyb3JzO1xuIl19
