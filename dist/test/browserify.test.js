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

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"4":4}],3:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

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
    healthcheck('progress', resetMonitor);
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

    if (player.width() <= 600 || player.height() <= 250) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy92aWRlb2pzLXNwZWxsYm9vay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiZGlzdC90ZXN0L2Jyb3dzZXJpZnkuc3RhcnQuanMiLCJub2RlX21vZHVsZXMvZ2xvYmFsL2RvY3VtZW50LmpzIiwibm9kZV9tb2R1bGVzL2dsb2JhbC93aW5kb3cuanMiLCJub2RlX21vZHVsZXMvdmlkZW9qcy1zcGVsbGJvb2svbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsInNyYy9qcy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDR0E7Ozs7OztBQUVBLE1BQU0sTUFBTixDQUFhLG9CQUFiLEUsQ0FMQTs7OztBQU1BLE1BQU0sSUFBTixDQUFXLHFEQUFYLEVBQWtFLFVBQUMsTUFBRCxFQUFZO0FBQzVFLFNBQU8sRUFBUCxxQkFBZSxxQ0FBZjtBQUNELENBRkQ7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1RBOzs7Ozs7O0FDQUE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNLFdBQVcsbUJBQVEsWUFBUixDQUFxQixPQUFyQixDQUFqQjtBQUNBLElBQU0saUJBQWlCLENBQUMsbUJBQVEsT0FBUixDQUFnQixTQUF4Qzs7QUFFQTtBQUNBLElBQU0saUJBQWlCLG1CQUFRLGNBQVIsSUFBMEIsbUJBQVEsTUFBekQ7O0FBRUE7QUFDQSxJQUFNLFdBQVc7QUFDZixVQUFRLEVBRE87QUFFZixRQUFNLEVBRlM7QUFHZixXQUFTLEVBSE07QUFJZixXQUFTLEtBQUssSUFKQztBQUtm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LG1CQUFRLFlBQVIsQ0FBcUIsUUFBckIsRUFBK0IsT0FBL0IsQ0FBakI7QUFDRCxDQUZEOztBQUlBO0FBQ0EsZUFBZSxRQUFmLEVBQXlCLE1BQXpCOztxQkFFZSxNIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogYnJvd3NlcmlmeSB0ZXN0IFxuICovXG5pbXBvcnQgcGtnIGZyb20gXCIuLi8uLi9zcmMvanMvaW5kZXguanNcIjtcblxuUVVuaXQubW9kdWxlKFwiYnJvd3NlcmlmeSByZXF1aXJlXCIpO1xuUVVuaXQudGVzdChcInZpZGVvanMtZXJyb3JzIHNob3VsZCBiZSByZXF1aXJlYWJsZSB2aWEgYnJvd3NlcmlmeVwiLCAoYXNzZXJ0KSA9PiB7XG4gIGFzc2VydC5vayhwa2csIFwidmlkZW9qcy1lcnJvcnMgaXMgcmVxdWlyZWQgcHJvcGVybHlcIik7XG59KTsiLCJ2YXIgdG9wTGV2ZWwgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6XG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB7fVxudmFyIG1pbkRvYyA9IHJlcXVpcmUoJ21pbi1kb2N1bWVudCcpO1xuXG5pZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZG9jdW1lbnQ7XG59IGVsc2Uge1xuICAgIHZhciBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J107XG5cbiAgICBpZiAoIWRvY2N5KSB7XG4gICAgICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXSA9IG1pbkRvYztcbiAgICB9XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY2N5O1xufVxuIiwiaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzZWxmO1xufSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHt9O1xufVxuIiwiIiwiaW1wb3J0IHZpZGVvanMgZnJvbSAndmlkZW8uanMnO1xuaW1wb3J0IHdpbmRvdyBmcm9tICdnbG9iYWwvd2luZG93JztcbmltcG9ydCBkb2N1bWVudCBmcm9tICdnbG9iYWwvZG9jdW1lbnQnO1xuXG5jb25zdCBGbGFzaE9iaiA9IHZpZGVvanMuZ2V0Q29tcG9uZW50KCdGbGFzaCcpO1xuY29uc3QgZGVmYXVsdERpc21pc3MgPSAhdmlkZW9qcy5icm93c2VyLklTX0lQSE9ORTtcblxuLy8gVmlkZW8uanMgNS82IGNyb3NzLWNvbXBhdGliaWxpdHkuXG5jb25zdCByZWdpc3RlclBsdWdpbiA9IHZpZGVvanMucmVnaXN0ZXJQbHVnaW4gfHwgdmlkZW9qcy5wbHVnaW47XG5cbi8vIERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIHBsdWdpbi5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBoZWFkZXI6ICcnLFxuICBjb2RlOiAnJyxcbiAgbWVzc2FnZTogJycsXG4gIHRpbWVvdXQ6IDQ1ICogMTAwMCxcbiAgZGlzbWlzczogZGVmYXVsdERpc21pc3MsXG4gIGVycm9yczoge1xuICAgICcxJzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9BQk9SVEVEJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhlIHZpZGVvIGRvd25sb2FkIHdhcyBjYW5jZWxsZWQnXG4gICAgfSxcbiAgICAnMic6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfTkVUV09SSycsXG4gICAgICBoZWFkbGluZTogJ1RoZSB2aWRlbyBjb25uZWN0aW9uIHdhcyBsb3N0LCBwbGVhc2UgY29uZmlybSB5b3UgYXJlICcgK1xuICAgICAgICAgICAgICAgICdjb25uZWN0ZWQgdG8gdGhlIGludGVybmV0J1xuICAgIH0sXG4gICAgJzMnOiB7XG4gICAgICB0eXBlOiAnTUVESUFfRVJSX0RFQ09ERScsXG4gICAgICBoZWFkbGluZTogJ1RoZSB2aWRlbyBpcyBiYWQgb3IgaW4gYSBmb3JtYXQgdGhhdCBjYW5ub3QgYmUgcGxheWVkIG9uIHlvdXIgYnJvd3NlcidcbiAgICB9LFxuICAgICc0Jzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9TUkNfTk9UX1NVUFBPUlRFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoaXMgdmlkZW8gaXMgZWl0aGVyIHVuYXZhaWxhYmxlIG9yIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJ1xuICAgIH0sXG4gICAgJzUnOiB7XG4gICAgICB0eXBlOiAnTUVESUFfRVJSX0VOQ1JZUFRFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoZSB2aWRlbyB5b3UgYXJlIHRyeWluZyB0byB3YXRjaCBpcyBlbmNyeXB0ZWQgYW5kIHdlIGRvIG5vdCBrbm93IGhvdyAnICtcbiAgICAgICAgICAgICAgICAndG8gZGVjcnlwdCBpdCdcbiAgICB9LFxuICAgICd1bmtub3duJzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9VTktOT1dOJyxcbiAgICAgIGhlYWRsaW5lOiAnQW4gdW5hbnRpY2lwYXRlZCBwcm9ibGVtIHdhcyBlbmNvdW50ZXJlZCwgY2hlY2sgYmFjayBzb29uIGFuZCB0cnkgYWdhaW4nXG4gICAgfSxcbiAgICAnLTEnOiB7XG4gICAgICB0eXBlOiAnUExBWUVSX0VSUl9OT19TUkMnLFxuICAgICAgaGVhZGxpbmU6ICdObyB2aWRlbyBoYXMgYmVlbiBsb2FkZWQnXG4gICAgfSxcbiAgICAnLTInOiB7XG4gICAgICB0eXBlOiAnUExBWUVSX0VSUl9USU1FT1VUJyxcbiAgICAgIGhlYWRsaW5lOiAnQ291bGQgbm90IGRvd25sb2FkIHRoZSB2aWRlbydcbiAgICB9LFxuICAgICctMyc6IHtcbiAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX0RPTUFJTl9SRVNUUklDVEVEJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhpcyB2aWRlbyBpcyByZXN0cmljdGVkIGZyb20gcGxheWluZyBvbiB5b3VyIGN1cnJlbnQgZG9tYWluJ1xuICAgIH0sXG4gICAgJy00Jzoge1xuICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfSVBfUkVTVFJJQ1RFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoaXMgdmlkZW8gaXMgcmVzdHJpY3RlZCBhdCB5b3VyIGN1cnJlbnQgSVAgYWRkcmVzcydcbiAgICB9LFxuICAgICctNSc6IHtcbiAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX0dFT19SRVNUUklDVEVEJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhpcyB2aWRlbyBpcyByZXN0cmljdGVkIGZyb20gcGxheWluZyBpbiB5b3VyIGN1cnJlbnQgZ2VvZ3JhcGhpYyByZWdpb24nXG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIE1vbml0b3JzIGEgcGxheWVyIGZvciBzaWducyBvZiBsaWZlIGR1cmluZyBwbGF5YmFjayBhbmRcbiAqIHRyaWdnZXJzIFBMQVlFUl9FUlJfVElNRU9VVCBpZiBub25lIG9jY3VyIHdpdGhpbiBhIHJlYXNvbmFibGVcbiAqIHRpbWVmcmFtZS5cbiAqL1xuY29uc3QgaW5pdFBsdWdpbiA9IGZ1bmN0aW9uKHBsYXllciwgb3B0aW9ucykge1xuICBsZXQgbW9uaXRvcjtcbiAgY29uc3QgbGlzdGVuZXJzID0gW107XG5cbiAgLy8gY2xlYXJzIHRoZSBwcmV2aW91cyBtb25pdG9yIHRpbWVvdXQgYW5kIHNldHMgdXAgYSBuZXcgb25lXG4gIGNvbnN0IHJlc2V0TW9uaXRvciA9IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQobW9uaXRvcik7XG4gICAgbW9uaXRvciA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgLy8gcGxheWVyIGFscmVhZHkgaGFzIGFuIGVycm9yXG4gICAgICAvLyBvciBpcyBub3QgcGxheWluZyB1bmRlciBub3JtYWwgY29uZGl0aW9uc1xuICAgICAgaWYgKHBsYXllci5lcnJvcigpIHx8IHBsYXllci5wYXVzZWQoKSB8fCBwbGF5ZXIuZW5kZWQoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHBsYXllci5lcnJvcih7XG4gICAgICAgIGNvZGU6IC0yLFxuICAgICAgICB0eXBlOiAnUExBWUVSX0VSUl9USU1FT1VUJ1xuICAgICAgfSk7XG4gICAgfSwgb3B0aW9ucy50aW1lb3V0KTtcblxuICAgIC8vIGNsZWFyIG91dCBhbnkgZXhpc3RpbmcgcGxheWVyIHRpbWVvdXRcbiAgICAvLyBwbGF5YmFjayBoYXMgcmVjb3ZlcmVkXG4gICAgaWYgKHBsYXllci5lcnJvcigpICYmIHBsYXllci5lcnJvcigpLmNvZGUgPT09IC0yKSB7XG4gICAgICBwbGF5ZXIuZXJyb3IobnVsbCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGNsZWFyIGFueSBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgbGlzdGVuZXJzXG4gIGNvbnN0IGNsZWFudXAgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGlzdGVuZXI7XG5cbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgbGlzdGVuZXIgPSBsaXN0ZW5lcnMuc2hpZnQoKTtcbiAgICAgIHBsYXllci5vZmYobGlzdGVuZXJbMF0sIGxpc3RlbmVyWzFdKTtcbiAgICB9XG4gICAgd2luZG93LmNsZWFyVGltZW91dChtb25pdG9yKTtcbiAgfTtcblxuICAvLyBjcmVhdGVzIGFuZCB0cmFja3MgYSBwbGF5ZXIgbGlzdGVuZXIgaWYgdGhlIHBsYXllciBsb29rcyBhbGl2ZVxuICBjb25zdCBoZWFsdGhjaGVjayA9IGZ1bmN0aW9uKHR5cGUsIGZuKSB7XG4gICAgY29uc3QgY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGlmIHRoZXJlJ3MgYW4gZXJyb3IgZG8gbm90IHJlc2V0IHRoZSBtb25pdG9yIGFuZFxuICAgICAgLy8gY2xlYXIgdGhlIGVycm9yIHVubGVzcyB0aW1lIGlzIHByb2dyZXNzaW5nXG4gICAgICBpZiAoIXBsYXllci5lcnJvcigpKSB7XG4gICAgICAgIC8vIGVycm9yIGlmIHVzaW5nIEZsYXNoIGFuZCBpdHMgQVBJIGlzIHVuYXZhaWxhYmxlXG4gICAgICAgIGNvbnN0IHRlY2ggPSBwbGF5ZXIuJCgnLnZqcy10ZWNoJyk7XG5cbiAgICAgICAgaWYgKHRlY2ggJiZcbiAgICAgICAgICAgIHRlY2gudHlwZSA9PT0gJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJyAmJlxuICAgICAgICAgICAgIXRlY2gudmpzX2dldFByb3BlcnR5KSB7XG4gICAgICAgICAgcGxheWVyLmVycm9yKHtcbiAgICAgICAgICAgIGNvZGU6IC0yLFxuICAgICAgICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfVElNRU9VVCdcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwbGF5YmFjayBpc24ndCBleHBlY3RlZCBpZiB0aGUgcGxheWVyIGlzIHBhdXNlZFxuICAgICAgICBpZiAocGxheWVyLnBhdXNlZCgpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc2V0TW9uaXRvcigpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHBsYXliYWNrIGlzbid0IGV4cGVjdGVkIG9uY2UgdGhlIHZpZGVvIGhhcyBlbmRlZFxuICAgICAgICBpZiAocGxheWVyLmVuZGVkKCkpIHtcbiAgICAgICAgICByZXR1cm4gcmVzZXRNb25pdG9yKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm4uY2FsbCh0aGlzKTtcbiAgICB9O1xuXG4gICAgcGxheWVyLm9uKHR5cGUsIGNoZWNrKTtcbiAgICBsaXN0ZW5lcnMucHVzaChbdHlwZSwgY2hlY2tdKTtcbiAgfTtcblxuICBjb25zdCBvblBsYXlTdGFydE1vbml0b3IgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGFzdFRpbWUgPSAwO1xuXG4gICAgY2xlYW51cCgpO1xuXG4gICAgLy8gaWYgbm8gcGxheWJhY2sgaXMgZGV0ZWN0ZWQgZm9yIGxvbmcgZW5vdWdoLCB0cmlnZ2VyIGEgdGltZW91dCBlcnJvclxuICAgIHJlc2V0TW9uaXRvcigpO1xuICAgIGhlYWx0aGNoZWNrKFsndGltZXVwZGF0ZScsICdhZHRpbWV1cGRhdGUnXSwgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjdXJyZW50VGltZSA9IHBsYXllci5jdXJyZW50VGltZSgpO1xuXG4gICAgICAvLyBwbGF5YmFjayBpcyBvcGVyYXRpbmcgbm9ybWFsbHkgb3IgaGFzIHJlY292ZXJlZFxuICAgICAgaWYgKGN1cnJlbnRUaW1lICE9PSBsYXN0VGltZSkge1xuICAgICAgICBsYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgICByZXNldE1vbml0b3IoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBoZWFsdGhjaGVjaygncHJvZ3Jlc3MnLCByZXNldE1vbml0b3IpO1xuICB9O1xuXG4gIGNvbnN0IG9uUGxheU5vU291cmNlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFwbGF5ZXIuY3VycmVudFNyYygpKSB7XG4gICAgICBwbGF5ZXIuZXJyb3Ioe1xuICAgICAgICBjb2RlOiAtMSxcbiAgICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfTk9fU1JDJ1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IG9uRXJyb3JIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGRldGFpbHMgPSAnJztcbiAgICBsZXQgZXJyb3IgPSBwbGF5ZXIuZXJyb3IoKTtcbiAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbGV0IGRpYWxvZ0NvbnRlbnQgPSAnJztcblxuICAgIC8vIEluIHRoZSByYXJlIGNhc2Ugd2hlbiBgZXJyb3IoKWAgZG9lcyBub3QgcmV0dXJuIGFuIGVycm9yIG9iamVjdCxcbiAgICAvLyBkZWZlbnNpdmVseSBlc2NhcGUgdGhlIGhhbmRsZXIgZnVuY3Rpb24uXG4gICAgaWYgKCFlcnJvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGVycm9yID0gdmlkZW9qcy5tZXJnZU9wdGlvbnMoZXJyb3IsIG9wdGlvbnMuZXJyb3JzW2Vycm9yLmNvZGUgfHwgMF0pO1xuXG4gICAgaWYgKGVycm9yLm1lc3NhZ2UpIHtcbiAgICAgIGRldGFpbHMgPSBgPGRpdiBjbGFzcz1cInZqcy1lcnJvcnMtZGV0YWlsc1wiPiR7cGxheWVyLmxvY2FsaXplKCdUZWNobmljYWwgZGV0YWlscycpfVxuICAgICAgICA6IDxkaXYgY2xhc3M9XCJ2anMtZXJyb3JzLW1lc3NhZ2VcIj4ke3BsYXllci5sb2NhbGl6ZShlcnJvci5tZXNzYWdlKX08L2Rpdj5cbiAgICAgICAgPC9kaXY+YDtcbiAgICB9XG5cbiAgICBpZiAoZXJyb3IuY29kZSA9PT0gNCAmJiBGbGFzaE9iaiAmJiAhRmxhc2hPYmouaXNTdXBwb3J0ZWQoKSkge1xuICAgICAgY29uc3QgZmxhc2hNZXNzYWdlID0gcGxheWVyLmxvY2FsaXplKCdJZiB5b3UgYXJlIHVzaW5nIGFuIG9sZGVyIGJyb3dzZXIgcGxlYXNlIHRyeSB1cGdyYWRpbmcgb3IgaW5zdGFsbGluZyBGbGFzaC4nKTtcblxuICAgICAgZGV0YWlscyArPSBgPHNwYW4gY2xhc3M9XCJ2anMtZXJyb3JzLWZsYXNobWVzc2FnZVwiPiR7Zmxhc2hNZXNzYWdlfTwvc3Bhbj5gO1xuICAgIH1cblxuICAgIGNvbnN0IGRpc3BsYXkgPSBwbGF5ZXIuZ2V0Q2hpbGQoJ2Vycm9yRGlzcGxheScpO1xuXG4gICAgY29udGVudC5jbGFzc05hbWUgPSAndmpzLWVycm9ycy1kaWFsb2cnO1xuICAgIGNvbnRlbnQuaWQgPSAndmpzLWVycm9ycy1kaWFsb2cnO1xuICAgIGRpYWxvZ0NvbnRlbnQgPVxuICAgICBgPGRpdiBjbGFzcz1cInZqcy1lcnJvcnMtY29udGVudC1jb250YWluZXJcIj5cbiAgICAgIDxoMiBjbGFzcz1cInZqcy1lcnJvcnMtaGVhZGxpbmVcIj4ke3RoaXMubG9jYWxpemUoZXJyb3IuaGVhZGxpbmUpfTwvaDI+XG4gICAgICAgIDxkaXY+PGI+JHt0aGlzLmxvY2FsaXplKCdFcnJvciBDb2RlJyl9PC9iPjogJHsoZXJyb3IudHlwZSB8fCBlcnJvci5jb2RlKX08L2Rpdj5cbiAgICAgICAgJHtkZXRhaWxzfVxuICAgICAgPC9kaXY+YDtcblxuICAgIGNvbnN0IGNsb3NlYWJsZSA9IGRpc3BsYXkuY2xvc2VhYmxlKCEoJ2Rpc21pc3MnIGluIGVycm9yKSB8fCBlcnJvci5kaXNtaXNzKTtcblxuICAgIC8vIFdlIHNob3VsZCBnZXQgYSBjbG9zZSBidXR0b25cbiAgICBpZiAoY2xvc2VhYmxlKSB7XG4gICAgICBkaWFsb2dDb250ZW50ICs9XG4gICAgICAgYDxkaXYgY2xhc3M9XCJ2anMtZXJyb3JzLW9rLWJ1dHRvbi1jb250YWluZXJcIj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwidmpzLWVycm9ycy1vay1idXR0b25cIj4ke3RoaXMubG9jYWxpemUoJ09LJyl9PC9idXR0b24+XG4gICAgICAgIDwvZGl2PmA7XG4gICAgICBjb250ZW50LmlubmVySFRNTCA9IGRpYWxvZ0NvbnRlbnQ7XG4gICAgICBkaXNwbGF5LmZpbGxXaXRoKGNvbnRlbnQpO1xuICAgICAgLy8gR2V0IHRoZSBjbG9zZSBidXR0b24gaW5zaWRlIHRoZSBlcnJvciBkaXNwbGF5XG4gICAgICBkaXNwbGF5LmNvbnRlbnRFbCgpLmZpcnN0Q2hpbGQuYXBwZW5kQ2hpbGQoZGlzcGxheS5nZXRDaGlsZCgnY2xvc2VCdXR0b24nKS5lbCgpKTtcblxuICAgICAgY29uc3Qgb2tCdXR0b24gPSBkaXNwbGF5LmVsKCkucXVlcnlTZWxlY3RvcignLnZqcy1lcnJvcnMtb2stYnV0dG9uJyk7XG5cbiAgICAgIHBsYXllci5vbihva0J1dHRvbiwgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRpc3BsYXkuY2xvc2UoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50LmlubmVySFRNTCA9IGRpYWxvZ0NvbnRlbnQ7XG4gICAgICBkaXNwbGF5LmZpbGxXaXRoKGNvbnRlbnQpO1xuICAgIH1cblxuICAgIGlmIChwbGF5ZXIud2lkdGgoKSA8PSA2MDAgfHwgcGxheWVyLmhlaWdodCgpIDw9IDI1MCkge1xuICAgICAgZGlzcGxheS5hZGRDbGFzcygndmpzLXhzJyk7XG4gICAgfVxuXG4gICAgZGlzcGxheS5vbmUoJ21vZGFsY2xvc2UnLCAoKSA9PiBwbGF5ZXIuZXJyb3IobnVsbCkpO1xuICB9O1xuXG4gIGNvbnN0IG9uRGlzcG9zZUhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjbGVhbnVwKCk7XG5cbiAgICBwbGF5ZXIucmVtb3ZlQ2xhc3MoJ3Zqcy1lcnJvcnMnKTtcbiAgICBwbGF5ZXIub2ZmKCdwbGF5Jywgb25QbGF5U3RhcnRNb25pdG9yKTtcbiAgICBwbGF5ZXIub2ZmKCdwbGF5Jywgb25QbGF5Tm9Tb3VyY2UpO1xuICAgIHBsYXllci5vZmYoJ2Rpc3Bvc2UnLCBvbkRpc3Bvc2VIYW5kbGVyKTtcbiAgICBwbGF5ZXIub2ZmKCdlcnJvcicsIG9uRXJyb3JIYW5kbGVyKTtcbiAgfTtcblxuICBjb25zdCByZUluaXRQbHVnaW4gPSBmdW5jdGlvbihuZXdPcHRpb25zKSB7XG4gICAgb25EaXNwb3NlSGFuZGxlcigpO1xuICAgIGluaXRQbHVnaW4ocGxheWVyLCB2aWRlb2pzLm1lcmdlT3B0aW9ucyhkZWZhdWx0cywgbmV3T3B0aW9ucykpO1xuICB9O1xuXG4gIHJlSW5pdFBsdWdpbi5leHRlbmQgPSBmdW5jdGlvbihlcnJvcnMpIHtcbiAgICBvcHRpb25zLmVycm9ycyA9IHZpZGVvanMubWVyZ2VPcHRpb25zKG9wdGlvbnMuZXJyb3JzLCBlcnJvcnMpO1xuICB9O1xuXG4gIHBsYXllci5vbigncGxheScsIG9uUGxheVN0YXJ0TW9uaXRvcik7XG4gIHBsYXllci5vbigncGxheScsIG9uUGxheU5vU291cmNlKTtcbiAgcGxheWVyLm9uKCdkaXNwb3NlJywgb25EaXNwb3NlSGFuZGxlcik7XG4gIHBsYXllci5vbignZXJyb3InLCBvbkVycm9ySGFuZGxlcik7XG5cbiAgcGxheWVyLnJlYWR5KCgpID0+IHtcbiAgICBwbGF5ZXIuYWRkQ2xhc3MoJ3Zqcy1lcnJvcnMnKTtcbiAgfSk7XG5cbiAgcGxheWVyLmVycm9ycyA9IHJlSW5pdFBsdWdpbjtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgcGx1Z2luLiBXYWl0cyB1bnRpbCB0aGUgcGxheWVyIGlzIHJlYWR5IHRvIGRvIGFueXRoaW5nLlxuICovXG5jb25zdCBlcnJvcnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGluaXRQbHVnaW4odGhpcywgdmlkZW9qcy5tZXJnZU9wdGlvbnMoZGVmYXVsdHMsIG9wdGlvbnMpKTtcbn07XG5cbi8vIFJlZ2lzdGVyIHRoZSBwbHVnaW4gd2l0aCB2aWRlby5qcy5cbnJlZ2lzdGVyUGx1Z2luKCdlcnJvcnMnLCBlcnJvcnMpO1xuXG5leHBvcnQgZGVmYXVsdCBlcnJvcnM7XG4iXX0=
