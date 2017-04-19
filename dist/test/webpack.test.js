/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _video = __webpack_require__(5);

var _video2 = _interopRequireDefault(_video);

var _window = __webpack_require__(3);

var _window2 = _interopRequireDefault(_window);

var _document = __webpack_require__(2);

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

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = __webpack_require__(6);

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _index = __webpack_require__(1);

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

QUnit.module("webpack require"); /**
                                  * webpack test 
                                  */

QUnit.test("videojs-errors should be requireable via webpack", function (assert) {
  assert.ok(_index2["default"], "videojs-errors is required properly");
});

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = videojs;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgN2UzZmU2MjkyNWIxNzM1M2E2OTIiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9nbG9iYWwvZG9jdW1lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9nbG9iYWwvd2luZG93LmpzIiwid2VicGFjazovLy8uL2Rpc3QvdGVzdC93ZWJwYWNrLnN0YXJ0LmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcInZpZGVvanNcIiIsIndlYnBhY2s6Ly8vbWluLWRvY3VtZW50IChpZ25vcmVkKSJdLCJuYW1lcyI6WyJGbGFzaE9iaiIsImdldENvbXBvbmVudCIsImRlZmF1bHREaXNtaXNzIiwiYnJvd3NlciIsIklTX0lQSE9ORSIsInJlZ2lzdGVyUGx1Z2luIiwicGx1Z2luIiwiZGVmYXVsdHMiLCJoZWFkZXIiLCJjb2RlIiwibWVzc2FnZSIsInRpbWVvdXQiLCJkaXNtaXNzIiwiZXJyb3JzIiwidHlwZSIsImhlYWRsaW5lIiwiaW5pdFBsdWdpbiIsInBsYXllciIsIm9wdGlvbnMiLCJtb25pdG9yIiwibGlzdGVuZXJzIiwicmVzZXRNb25pdG9yIiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsImVycm9yIiwicGF1c2VkIiwiZW5kZWQiLCJjbGVhbnVwIiwibGlzdGVuZXIiLCJsZW5ndGgiLCJzaGlmdCIsIm9mZiIsImhlYWx0aGNoZWNrIiwiZm4iLCJjaGVjayIsInRlY2giLCIkIiwidmpzX2dldFByb3BlcnR5IiwiY2FsbCIsIm9uIiwicHVzaCIsIm9uUGxheVN0YXJ0TW9uaXRvciIsImxhc3RUaW1lIiwiY3VycmVudFRpbWUiLCJvblBsYXlOb1NvdXJjZSIsImN1cnJlbnRTcmMiLCJvbkVycm9ySGFuZGxlciIsImRldGFpbHMiLCJjb250ZW50IiwiY3JlYXRlRWxlbWVudCIsImRpYWxvZ0NvbnRlbnQiLCJtZXJnZU9wdGlvbnMiLCJsb2NhbGl6ZSIsImlzU3VwcG9ydGVkIiwiZmxhc2hNZXNzYWdlIiwiZGlzcGxheSIsImdldENoaWxkIiwiY2xhc3NOYW1lIiwiaWQiLCJjbG9zZWFibGUiLCJpbm5lckhUTUwiLCJmaWxsV2l0aCIsImNvbnRlbnRFbCIsImZpcnN0Q2hpbGQiLCJhcHBlbmRDaGlsZCIsImVsIiwib2tCdXR0b24iLCJxdWVyeVNlbGVjdG9yIiwiY2xvc2UiLCJjdXJyZW50V2lkdGgiLCJjdXJyZW50SGVpZ2h0IiwiYWRkQ2xhc3MiLCJvbmUiLCJvbkRpc3Bvc2VIYW5kbGVyIiwicmVtb3ZlQ2xhc3MiLCJyZUluaXRQbHVnaW4iLCJuZXdPcHRpb25zIiwiZXh0ZW5kIiwicmVhZHkiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJvayJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLG1EQUEyQyxjQUFjOztBQUV6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7QUNoRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDRDQUE0Qzs7QUFFNUM7Ozs7Ozs7Ozs7OztBQ3BCQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLFdBQVcsbUJBQVFDLFlBQVIsQ0FB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TUUsSUFBTixDQUFXLGtEQUFYLEVBQStELFVBQUNDLE1BQUQsRUFBWTtBQUN6RUEsU0FBT0MsRUFBUCxxQkFBZSxxQ0FBZjtBQUNELENBRkQsRTs7Ozs7O0FDTkEseUI7Ozs7OztBQ0FBLGUiLCJmaWxlIjoid2VicGFjay50ZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbiBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gNCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgN2UzZmU2MjkyNWIxNzM1M2E2OTIiLCJ2YXIgZztcclxuXHJcbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXHJcbmcgPSAoZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn0pKCk7XHJcblxyXG50cnkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxyXG5cdGcgPSBnIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSB8fCAoMSxldmFsKShcInRoaXNcIik7XHJcbn0gY2F0Y2goZSkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXHJcblx0aWYodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIilcclxuXHRcdGcgPSB3aW5kb3c7XHJcbn1cclxuXHJcbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cclxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3NcclxuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnO1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHZpZGVvanMgZnJvbSAndmlkZW8uanMnO1xuaW1wb3J0IHdpbmRvdyBmcm9tICdnbG9iYWwvd2luZG93JztcbmltcG9ydCBkb2N1bWVudCBmcm9tICdnbG9iYWwvZG9jdW1lbnQnO1xuXG5jb25zdCBGbGFzaE9iaiA9IHZpZGVvanMuZ2V0Q29tcG9uZW50KCdGbGFzaCcpO1xuY29uc3QgZGVmYXVsdERpc21pc3MgPSAhdmlkZW9qcy5icm93c2VyLklTX0lQSE9ORTtcblxuLy8gVmlkZW8uanMgNS82IGNyb3NzLWNvbXBhdGliaWxpdHkuXG5jb25zdCByZWdpc3RlclBsdWdpbiA9IHZpZGVvanMucmVnaXN0ZXJQbHVnaW4gfHwgdmlkZW9qcy5wbHVnaW47XG5cbi8vIERlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIHBsdWdpbi5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBoZWFkZXI6ICcnLFxuICBjb2RlOiAnJyxcbiAgbWVzc2FnZTogJycsXG4gIHRpbWVvdXQ6IDQ1ICogMTAwMCxcbiAgZGlzbWlzczogZGVmYXVsdERpc21pc3MsXG4gIGVycm9yczoge1xuICAgICcxJzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9BQk9SVEVEJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhlIHZpZGVvIGRvd25sb2FkIHdhcyBjYW5jZWxsZWQnXG4gICAgfSxcbiAgICAnMic6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfTkVUV09SSycsXG4gICAgICBoZWFkbGluZTogJ1RoZSB2aWRlbyBjb25uZWN0aW9uIHdhcyBsb3N0LCBwbGVhc2UgY29uZmlybSB5b3UgYXJlICcgK1xuICAgICAgICAgICAgICAgICdjb25uZWN0ZWQgdG8gdGhlIGludGVybmV0J1xuICAgIH0sXG4gICAgJzMnOiB7XG4gICAgICB0eXBlOiAnTUVESUFfRVJSX0RFQ09ERScsXG4gICAgICBoZWFkbGluZTogJ1RoZSB2aWRlbyBpcyBiYWQgb3IgaW4gYSBmb3JtYXQgdGhhdCBjYW5ub3QgYmUgcGxheWVkIG9uIHlvdXIgYnJvd3NlcidcbiAgICB9LFxuICAgICc0Jzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9TUkNfTk9UX1NVUFBPUlRFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoaXMgdmlkZW8gaXMgZWl0aGVyIHVuYXZhaWxhYmxlIG9yIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJ1xuICAgIH0sXG4gICAgJzUnOiB7XG4gICAgICB0eXBlOiAnTUVESUFfRVJSX0VOQ1JZUFRFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoZSB2aWRlbyB5b3UgYXJlIHRyeWluZyB0byB3YXRjaCBpcyBlbmNyeXB0ZWQgYW5kIHdlIGRvIG5vdCBrbm93IGhvdyAnICtcbiAgICAgICAgICAgICAgICAndG8gZGVjcnlwdCBpdCdcbiAgICB9LFxuICAgICd1bmtub3duJzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9VTktOT1dOJyxcbiAgICAgIGhlYWRsaW5lOiAnQW4gdW5hbnRpY2lwYXRlZCBwcm9ibGVtIHdhcyBlbmNvdW50ZXJlZCwgY2hlY2sgYmFjayBzb29uIGFuZCB0cnkgYWdhaW4nXG4gICAgfSxcbiAgICAnLTEnOiB7XG4gICAgICB0eXBlOiAnUExBWUVSX0VSUl9OT19TUkMnLFxuICAgICAgaGVhZGxpbmU6ICdObyB2aWRlbyBoYXMgYmVlbiBsb2FkZWQnXG4gICAgfSxcbiAgICAnLTInOiB7XG4gICAgICB0eXBlOiAnUExBWUVSX0VSUl9USU1FT1VUJyxcbiAgICAgIGhlYWRsaW5lOiAnQ291bGQgbm90IGRvd25sb2FkIHRoZSB2aWRlbydcbiAgICB9LFxuICAgICctMyc6IHtcbiAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX0RPTUFJTl9SRVNUUklDVEVEJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhpcyB2aWRlbyBpcyByZXN0cmljdGVkIGZyb20gcGxheWluZyBvbiB5b3VyIGN1cnJlbnQgZG9tYWluJ1xuICAgIH0sXG4gICAgJy00Jzoge1xuICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfSVBfUkVTVFJJQ1RFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoaXMgdmlkZW8gaXMgcmVzdHJpY3RlZCBhdCB5b3VyIGN1cnJlbnQgSVAgYWRkcmVzcydcbiAgICB9LFxuICAgICctNSc6IHtcbiAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX0dFT19SRVNUUklDVEVEJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhpcyB2aWRlbyBpcyByZXN0cmljdGVkIGZyb20gcGxheWluZyBpbiB5b3VyIGN1cnJlbnQgZ2VvZ3JhcGhpYyByZWdpb24nXG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIE1vbml0b3JzIGEgcGxheWVyIGZvciBzaWducyBvZiBsaWZlIGR1cmluZyBwbGF5YmFjayBhbmRcbiAqIHRyaWdnZXJzIFBMQVlFUl9FUlJfVElNRU9VVCBpZiBub25lIG9jY3VyIHdpdGhpbiBhIHJlYXNvbmFibGVcbiAqIHRpbWVmcmFtZS5cbiAqL1xuY29uc3QgaW5pdFBsdWdpbiA9IGZ1bmN0aW9uKHBsYXllciwgb3B0aW9ucykge1xuICBsZXQgbW9uaXRvcjtcbiAgY29uc3QgbGlzdGVuZXJzID0gW107XG5cbiAgLy8gY2xlYXJzIHRoZSBwcmV2aW91cyBtb25pdG9yIHRpbWVvdXQgYW5kIHNldHMgdXAgYSBuZXcgb25lXG4gIGNvbnN0IHJlc2V0TW9uaXRvciA9IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQobW9uaXRvcik7XG4gICAgbW9uaXRvciA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgLy8gcGxheWVyIGFscmVhZHkgaGFzIGFuIGVycm9yXG4gICAgICAvLyBvciBpcyBub3QgcGxheWluZyB1bmRlciBub3JtYWwgY29uZGl0aW9uc1xuICAgICAgaWYgKHBsYXllci5lcnJvcigpIHx8IHBsYXllci5wYXVzZWQoKSB8fCBwbGF5ZXIuZW5kZWQoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHBsYXllci5lcnJvcih7XG4gICAgICAgIGNvZGU6IC0yLFxuICAgICAgICB0eXBlOiAnUExBWUVSX0VSUl9USU1FT1VUJ1xuICAgICAgfSk7XG4gICAgfSwgb3B0aW9ucy50aW1lb3V0KTtcblxuICAgIC8vIGNsZWFyIG91dCBhbnkgZXhpc3RpbmcgcGxheWVyIHRpbWVvdXRcbiAgICAvLyBwbGF5YmFjayBoYXMgcmVjb3ZlcmVkXG4gICAgaWYgKHBsYXllci5lcnJvcigpICYmIHBsYXllci5lcnJvcigpLmNvZGUgPT09IC0yKSB7XG4gICAgICBwbGF5ZXIuZXJyb3IobnVsbCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGNsZWFyIGFueSBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgbGlzdGVuZXJzXG4gIGNvbnN0IGNsZWFudXAgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGlzdGVuZXI7XG5cbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgbGlzdGVuZXIgPSBsaXN0ZW5lcnMuc2hpZnQoKTtcbiAgICAgIHBsYXllci5vZmYobGlzdGVuZXJbMF0sIGxpc3RlbmVyWzFdKTtcbiAgICB9XG4gICAgd2luZG93LmNsZWFyVGltZW91dChtb25pdG9yKTtcbiAgfTtcblxuICAvLyBjcmVhdGVzIGFuZCB0cmFja3MgYSBwbGF5ZXIgbGlzdGVuZXIgaWYgdGhlIHBsYXllciBsb29rcyBhbGl2ZVxuICBjb25zdCBoZWFsdGhjaGVjayA9IGZ1bmN0aW9uKHR5cGUsIGZuKSB7XG4gICAgY29uc3QgY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGlmIHRoZXJlJ3MgYW4gZXJyb3IgZG8gbm90IHJlc2V0IHRoZSBtb25pdG9yIGFuZFxuICAgICAgLy8gY2xlYXIgdGhlIGVycm9yIHVubGVzcyB0aW1lIGlzIHByb2dyZXNzaW5nXG4gICAgICBpZiAoIXBsYXllci5lcnJvcigpKSB7XG4gICAgICAgIC8vIGVycm9yIGlmIHVzaW5nIEZsYXNoIGFuZCBpdHMgQVBJIGlzIHVuYXZhaWxhYmxlXG4gICAgICAgIGNvbnN0IHRlY2ggPSBwbGF5ZXIuJCgnLnZqcy10ZWNoJyk7XG5cbiAgICAgICAgaWYgKHRlY2ggJiZcbiAgICAgICAgICAgIHRlY2gudHlwZSA9PT0gJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJyAmJlxuICAgICAgICAgICAgIXRlY2gudmpzX2dldFByb3BlcnR5KSB7XG4gICAgICAgICAgcGxheWVyLmVycm9yKHtcbiAgICAgICAgICAgIGNvZGU6IC0yLFxuICAgICAgICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfVElNRU9VVCdcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwbGF5YmFjayBpc24ndCBleHBlY3RlZCBpZiB0aGUgcGxheWVyIGlzIHBhdXNlZFxuICAgICAgICBpZiAocGxheWVyLnBhdXNlZCgpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc2V0TW9uaXRvcigpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHBsYXliYWNrIGlzbid0IGV4cGVjdGVkIG9uY2UgdGhlIHZpZGVvIGhhcyBlbmRlZFxuICAgICAgICBpZiAocGxheWVyLmVuZGVkKCkpIHtcbiAgICAgICAgICByZXR1cm4gcmVzZXRNb25pdG9yKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm4uY2FsbCh0aGlzKTtcbiAgICB9O1xuXG4gICAgcGxheWVyLm9uKHR5cGUsIGNoZWNrKTtcbiAgICBsaXN0ZW5lcnMucHVzaChbdHlwZSwgY2hlY2tdKTtcbiAgfTtcblxuICBjb25zdCBvblBsYXlTdGFydE1vbml0b3IgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGFzdFRpbWUgPSAwO1xuXG4gICAgY2xlYW51cCgpO1xuXG4gICAgLy8gaWYgbm8gcGxheWJhY2sgaXMgZGV0ZWN0ZWQgZm9yIGxvbmcgZW5vdWdoLCB0cmlnZ2VyIGEgdGltZW91dCBlcnJvclxuICAgIHJlc2V0TW9uaXRvcigpO1xuICAgIGhlYWx0aGNoZWNrKFsndGltZXVwZGF0ZScsICdhZHRpbWV1cGRhdGUnXSwgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjdXJyZW50VGltZSA9IHBsYXllci5jdXJyZW50VGltZSgpO1xuXG4gICAgICAvLyBwbGF5YmFjayBpcyBvcGVyYXRpbmcgbm9ybWFsbHkgb3IgaGFzIHJlY292ZXJlZFxuICAgICAgaWYgKGN1cnJlbnRUaW1lICE9PSBsYXN0VGltZSkge1xuICAgICAgICBsYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgICByZXNldE1vbml0b3IoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBoZWFsdGhjaGVjaygncHJvZ3Jlc3MnLCByZXNldE1vbml0b3IpO1xuICB9O1xuXG4gIGNvbnN0IG9uUGxheU5vU291cmNlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFwbGF5ZXIuY3VycmVudFNyYygpKSB7XG4gICAgICBwbGF5ZXIuZXJyb3Ioe1xuICAgICAgICBjb2RlOiAtMSxcbiAgICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfTk9fU1JDJ1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IG9uRXJyb3JIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGRldGFpbHMgPSAnJztcbiAgICBsZXQgZXJyb3IgPSBwbGF5ZXIuZXJyb3IoKTtcbiAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbGV0IGRpYWxvZ0NvbnRlbnQgPSAnJztcblxuICAgIC8vIEluIHRoZSByYXJlIGNhc2Ugd2hlbiBgZXJyb3IoKWAgZG9lcyBub3QgcmV0dXJuIGFuIGVycm9yIG9iamVjdCxcbiAgICAvLyBkZWZlbnNpdmVseSBlc2NhcGUgdGhlIGhhbmRsZXIgZnVuY3Rpb24uXG4gICAgaWYgKCFlcnJvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGVycm9yID0gdmlkZW9qcy5tZXJnZU9wdGlvbnMoZXJyb3IsIG9wdGlvbnMuZXJyb3JzW2Vycm9yLmNvZGUgfHwgMF0pO1xuXG4gICAgaWYgKGVycm9yLm1lc3NhZ2UpIHtcbiAgICAgIGRldGFpbHMgPSBgPGRpdiBjbGFzcz1cInZqcy1lcnJvcnMtZGV0YWlsc1wiPiR7cGxheWVyLmxvY2FsaXplKCdUZWNobmljYWwgZGV0YWlscycpfVxuICAgICAgICA6IDxkaXYgY2xhc3M9XCJ2anMtZXJyb3JzLW1lc3NhZ2VcIj4ke3BsYXllci5sb2NhbGl6ZShlcnJvci5tZXNzYWdlKX08L2Rpdj5cbiAgICAgICAgPC9kaXY+YDtcbiAgICB9XG5cbiAgICBpZiAoZXJyb3IuY29kZSA9PT0gNCAmJiBGbGFzaE9iaiAmJiAhRmxhc2hPYmouaXNTdXBwb3J0ZWQoKSkge1xuICAgICAgY29uc3QgZmxhc2hNZXNzYWdlID0gcGxheWVyLmxvY2FsaXplKCdJZiB5b3UgYXJlIHVzaW5nIGFuIG9sZGVyIGJyb3dzZXIgcGxlYXNlIHRyeSB1cGdyYWRpbmcgb3IgaW5zdGFsbGluZyBGbGFzaC4nKTtcblxuICAgICAgZGV0YWlscyArPSBgPHNwYW4gY2xhc3M9XCJ2anMtZXJyb3JzLWZsYXNobWVzc2FnZVwiPiR7Zmxhc2hNZXNzYWdlfTwvc3Bhbj5gO1xuICAgIH1cblxuICAgIGNvbnN0IGRpc3BsYXkgPSBwbGF5ZXIuZ2V0Q2hpbGQoJ2Vycm9yRGlzcGxheScpO1xuXG4gICAgY29udGVudC5jbGFzc05hbWUgPSAndmpzLWVycm9ycy1kaWFsb2cnO1xuICAgIGNvbnRlbnQuaWQgPSAndmpzLWVycm9ycy1kaWFsb2cnO1xuICAgIGRpYWxvZ0NvbnRlbnQgPVxuICAgICBgPGRpdiBjbGFzcz1cInZqcy1lcnJvcnMtY29udGVudC1jb250YWluZXJcIj5cbiAgICAgIDxoMiBjbGFzcz1cInZqcy1lcnJvcnMtaGVhZGxpbmVcIj4ke3RoaXMubG9jYWxpemUoZXJyb3IuaGVhZGxpbmUpfTwvaDI+XG4gICAgICAgIDxkaXY+PGI+JHt0aGlzLmxvY2FsaXplKCdFcnJvciBDb2RlJyl9PC9iPjogJHsoZXJyb3IudHlwZSB8fCBlcnJvci5jb2RlKX08L2Rpdj5cbiAgICAgICAgJHtkZXRhaWxzfVxuICAgICAgPC9kaXY+YDtcblxuICAgIGNvbnN0IGNsb3NlYWJsZSA9IGRpc3BsYXkuY2xvc2VhYmxlKCEoJ2Rpc21pc3MnIGluIGVycm9yKSB8fCBlcnJvci5kaXNtaXNzKTtcblxuICAgIC8vIFdlIHNob3VsZCBnZXQgYSBjbG9zZSBidXR0b25cbiAgICBpZiAoY2xvc2VhYmxlKSB7XG4gICAgICBkaWFsb2dDb250ZW50ICs9XG4gICAgICAgYDxkaXYgY2xhc3M9XCJ2anMtZXJyb3JzLW9rLWJ1dHRvbi1jb250YWluZXJcIj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwidmpzLWVycm9ycy1vay1idXR0b25cIj4ke3RoaXMubG9jYWxpemUoJ09LJyl9PC9idXR0b24+XG4gICAgICAgIDwvZGl2PmA7XG4gICAgICBjb250ZW50LmlubmVySFRNTCA9IGRpYWxvZ0NvbnRlbnQ7XG4gICAgICBkaXNwbGF5LmZpbGxXaXRoKGNvbnRlbnQpO1xuICAgICAgLy8gR2V0IHRoZSBjbG9zZSBidXR0b24gaW5zaWRlIHRoZSBlcnJvciBkaXNwbGF5XG4gICAgICBkaXNwbGF5LmNvbnRlbnRFbCgpLmZpcnN0Q2hpbGQuYXBwZW5kQ2hpbGQoZGlzcGxheS5nZXRDaGlsZCgnY2xvc2VCdXR0b24nKS5lbCgpKTtcblxuICAgICAgY29uc3Qgb2tCdXR0b24gPSBkaXNwbGF5LmVsKCkucXVlcnlTZWxlY3RvcignLnZqcy1lcnJvcnMtb2stYnV0dG9uJyk7XG5cbiAgICAgIHBsYXllci5vbihva0J1dHRvbiwgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRpc3BsYXkuY2xvc2UoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50LmlubmVySFRNTCA9IGRpYWxvZ0NvbnRlbnQ7XG4gICAgICBkaXNwbGF5LmZpbGxXaXRoKGNvbnRlbnQpO1xuICAgIH1cblxuICAgIGlmIChwbGF5ZXIuY3VycmVudFdpZHRoKCkgPD0gNjAwIHx8IHBsYXllci5jdXJyZW50SGVpZ2h0KCkgPD0gMjUwKSB7XG4gICAgICBkaXNwbGF5LmFkZENsYXNzKCd2anMteHMnKTtcbiAgICB9XG5cbiAgICBkaXNwbGF5Lm9uZSgnbW9kYWxjbG9zZScsICgpID0+IHBsYXllci5lcnJvcihudWxsKSk7XG4gIH07XG5cbiAgY29uc3Qgb25EaXNwb3NlSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFudXAoKTtcblxuICAgIHBsYXllci5yZW1vdmVDbGFzcygndmpzLWVycm9ycycpO1xuICAgIHBsYXllci5vZmYoJ3BsYXknLCBvblBsYXlTdGFydE1vbml0b3IpO1xuICAgIHBsYXllci5vZmYoJ3BsYXknLCBvblBsYXlOb1NvdXJjZSk7XG4gICAgcGxheWVyLm9mZignZGlzcG9zZScsIG9uRGlzcG9zZUhhbmRsZXIpO1xuICAgIHBsYXllci5vZmYoJ2Vycm9yJywgb25FcnJvckhhbmRsZXIpO1xuICB9O1xuXG4gIGNvbnN0IHJlSW5pdFBsdWdpbiA9IGZ1bmN0aW9uKG5ld09wdGlvbnMpIHtcbiAgICBvbkRpc3Bvc2VIYW5kbGVyKCk7XG4gICAgaW5pdFBsdWdpbihwbGF5ZXIsIHZpZGVvanMubWVyZ2VPcHRpb25zKGRlZmF1bHRzLCBuZXdPcHRpb25zKSk7XG4gIH07XG5cbiAgcmVJbml0UGx1Z2luLmV4dGVuZCA9IGZ1bmN0aW9uKGVycm9ycykge1xuICAgIG9wdGlvbnMuZXJyb3JzID0gdmlkZW9qcy5tZXJnZU9wdGlvbnMob3B0aW9ucy5lcnJvcnMsIGVycm9ycyk7XG4gIH07XG5cbiAgcGxheWVyLm9uKCdwbGF5Jywgb25QbGF5U3RhcnRNb25pdG9yKTtcbiAgcGxheWVyLm9uKCdwbGF5Jywgb25QbGF5Tm9Tb3VyY2UpO1xuICBwbGF5ZXIub24oJ2Rpc3Bvc2UnLCBvbkRpc3Bvc2VIYW5kbGVyKTtcbiAgcGxheWVyLm9uKCdlcnJvcicsIG9uRXJyb3JIYW5kbGVyKTtcblxuICBwbGF5ZXIucmVhZHkoKCkgPT4ge1xuICAgIHBsYXllci5hZGRDbGFzcygndmpzLWVycm9ycycpO1xuICB9KTtcblxuICBwbGF5ZXIuZXJyb3JzID0gcmVJbml0UGx1Z2luO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBwbHVnaW4uIFdhaXRzIHVudGlsIHRoZSBwbGF5ZXIgaXMgcmVhZHkgdG8gZG8gYW55dGhpbmcuXG4gKi9cbmNvbnN0IGVycm9ycyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgaW5pdFBsdWdpbih0aGlzLCB2aWRlb2pzLm1lcmdlT3B0aW9ucyhkZWZhdWx0cywgb3B0aW9ucykpO1xufTtcblxuLy8gUmVnaXN0ZXIgdGhlIHBsdWdpbiB3aXRoIHZpZGVvLmpzLlxucmVnaXN0ZXJQbHVnaW4oJ2Vycm9ycycsIGVycm9ycyk7XG5cbmV4cG9ydCBkZWZhdWx0IGVycm9ycztcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9qcy9pbmRleC5qcyIsInZhciB0b3BMZXZlbCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDpcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHt9XG52YXIgbWluRG9jID0gcmVxdWlyZSgnbWluLWRvY3VtZW50Jyk7XG5cbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkb2N1bWVudDtcbn0gZWxzZSB7XG4gICAgdmFyIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXTtcblxuICAgIGlmICghZG9jY3kpIHtcbiAgICAgICAgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddID0gbWluRG9jO1xuICAgIH1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gZG9jY3k7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vZ2xvYmFsL2RvY3VtZW50LmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIG1vZHVsZS5leHBvcnRzID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7fTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9nbG9iYWwvd2luZG93LmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qKlxuICogd2VicGFjayB0ZXN0IFxuICovXG5pbXBvcnQgcGtnIGZyb20gXCIuLi8uLi9zcmMvanMvaW5kZXguanNcIjtcblxuUVVuaXQubW9kdWxlKFwid2VicGFjayByZXF1aXJlXCIpO1xuUVVuaXQudGVzdChcInZpZGVvanMtZXJyb3JzIHNob3VsZCBiZSByZXF1aXJlYWJsZSB2aWEgd2VicGFja1wiLCAoYXNzZXJ0KSA9PiB7XG4gIGFzc2VydC5vayhwa2csIFwidmlkZW9qcy1lcnJvcnMgaXMgcmVxdWlyZWQgcHJvcGVybHlcIik7XG59KTtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9kaXN0L3Rlc3Qvd2VicGFjay5zdGFydC5qcyIsIm1vZHVsZS5leHBvcnRzID0gdmlkZW9qcztcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInZpZGVvanNcIlxuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiAoaWdub3JlZCkgKi9cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBtaW4tZG9jdW1lbnQgKGlnbm9yZWQpXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=