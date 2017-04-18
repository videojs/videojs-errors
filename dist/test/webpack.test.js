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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOGU0MDNlZWRiYmM5MWY3Mjc3NzAiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9nbG9iYWwvZG9jdW1lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9nbG9iYWwvd2luZG93LmpzIiwid2VicGFjazovLy8uL2Rpc3QvdGVzdC93ZWJwYWNrLnN0YXJ0LmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcInZpZGVvanNcIiIsIndlYnBhY2s6Ly8vbWluLWRvY3VtZW50IChpZ25vcmVkKSJdLCJuYW1lcyI6WyJGbGFzaE9iaiIsImdldENvbXBvbmVudCIsImRlZmF1bHREaXNtaXNzIiwiYnJvd3NlciIsIklTX0lQSE9ORSIsInJlZ2lzdGVyUGx1Z2luIiwicGx1Z2luIiwiZGVmYXVsdHMiLCJoZWFkZXIiLCJjb2RlIiwibWVzc2FnZSIsInRpbWVvdXQiLCJkaXNtaXNzIiwiZXJyb3JzIiwidHlwZSIsImhlYWRsaW5lIiwiaW5pdFBsdWdpbiIsInBsYXllciIsIm9wdGlvbnMiLCJtb25pdG9yIiwibGlzdGVuZXJzIiwicmVzZXRNb25pdG9yIiwiY2xlYXJUaW1lb3V0Iiwic2V0VGltZW91dCIsImVycm9yIiwicGF1c2VkIiwiZW5kZWQiLCJjbGVhbnVwIiwibGlzdGVuZXIiLCJsZW5ndGgiLCJzaGlmdCIsIm9mZiIsImhlYWx0aGNoZWNrIiwiZm4iLCJjaGVjayIsInRlY2giLCIkIiwidmpzX2dldFByb3BlcnR5IiwiY2FsbCIsIm9uIiwicHVzaCIsIm9uUGxheVN0YXJ0TW9uaXRvciIsImxhc3RUaW1lIiwiY3VycmVudFRpbWUiLCJvblBsYXlOb1NvdXJjZSIsImN1cnJlbnRTcmMiLCJvbkVycm9ySGFuZGxlciIsImRldGFpbHMiLCJjb250ZW50IiwiY3JlYXRlRWxlbWVudCIsImRpYWxvZ0NvbnRlbnQiLCJtZXJnZU9wdGlvbnMiLCJsb2NhbGl6ZSIsImlzU3VwcG9ydGVkIiwiZmxhc2hNZXNzYWdlIiwiZGlzcGxheSIsImdldENoaWxkIiwiY2xhc3NOYW1lIiwiaWQiLCJjbG9zZWFibGUiLCJpbm5lckhUTUwiLCJmaWxsV2l0aCIsImNvbnRlbnRFbCIsImZpcnN0Q2hpbGQiLCJhcHBlbmRDaGlsZCIsImVsIiwib2tCdXR0b24iLCJxdWVyeVNlbGVjdG9yIiwiY2xvc2UiLCJ3aWR0aCIsImhlaWdodCIsImFkZENsYXNzIiwib25lIiwib25EaXNwb3NlSGFuZGxlciIsInJlbW92ZUNsYXNzIiwicmVJbml0UGx1Z2luIiwibmV3T3B0aW9ucyIsImV4dGVuZCIsInJlYWR5IiwiUVVuaXQiLCJtb2R1bGUiLCJ0ZXN0IiwiYXNzZXJ0Iiwib2siXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxtREFBMkMsY0FBYzs7QUFFekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDaEVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0Q0FBNEM7O0FBRTVDOzs7Ozs7Ozs7Ozs7QUNwQkE7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxXQUFXLG1CQUFRQyxZQUFSLENBQXFCLE9BQXJCLENBQWpC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REFBWCxFQUErRCxVQUFDQyxNQUFELEVBQVk7QUFDekVBLFNBQU9DLEVBQVAscUJBQWUscUNBQWY7QUFDRCxDQUZELEU7Ozs7OztBQ05BLHlCOzs7Ozs7QUNBQSxlIiwiZmlsZSI6IndlYnBhY2sudGVzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDQpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDhlNDAzZWVkYmJjOTFmNzI3NzcwIiwidmFyIGc7XHJcblxyXG4vLyBUaGlzIHdvcmtzIGluIG5vbi1zdHJpY3QgbW9kZVxyXG5nID0gKGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB0aGlzO1xyXG59KSgpO1xyXG5cclxudHJ5IHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIGV2YWwgaXMgYWxsb3dlZCAoc2VlIENTUClcclxuXHRnID0gZyB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCkgfHwgKDEsZXZhbCkoXCJ0aGlzXCIpO1xyXG59IGNhdGNoKGUpIHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIHRoZSB3aW5kb3cgcmVmZXJlbmNlIGlzIGF2YWlsYWJsZVxyXG5cdGlmKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIpXHJcblx0XHRnID0gd2luZG93O1xyXG59XHJcblxyXG4vLyBnIGNhbiBzdGlsbCBiZSB1bmRlZmluZWQsIGJ1dCBub3RoaW5nIHRvIGRvIGFib3V0IGl0Li4uXHJcbi8vIFdlIHJldHVybiB1bmRlZmluZWQsIGluc3RlYWQgb2Ygbm90aGluZyBoZXJlLCBzbyBpdCdzXHJcbi8vIGVhc2llciB0byBoYW5kbGUgdGhpcyBjYXNlLiBpZighZ2xvYmFsKSB7IC4uLn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZztcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB2aWRlb2pzIGZyb20gJ3ZpZGVvLmpzJztcbmltcG9ydCB3aW5kb3cgZnJvbSAnZ2xvYmFsL3dpbmRvdyc7XG5pbXBvcnQgZG9jdW1lbnQgZnJvbSAnZ2xvYmFsL2RvY3VtZW50JztcblxuY29uc3QgRmxhc2hPYmogPSB2aWRlb2pzLmdldENvbXBvbmVudCgnRmxhc2gnKTtcbmNvbnN0IGRlZmF1bHREaXNtaXNzID0gIXZpZGVvanMuYnJvd3Nlci5JU19JUEhPTkU7XG5cbi8vIFZpZGVvLmpzIDUvNiBjcm9zcy1jb21wYXRpYmlsaXR5LlxuY29uc3QgcmVnaXN0ZXJQbHVnaW4gPSB2aWRlb2pzLnJlZ2lzdGVyUGx1Z2luIHx8IHZpZGVvanMucGx1Z2luO1xuXG4vLyBEZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSBwbHVnaW4uXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgaGVhZGVyOiAnJyxcbiAgY29kZTogJycsXG4gIG1lc3NhZ2U6ICcnLFxuICB0aW1lb3V0OiA0NSAqIDEwMDAsXG4gIGRpc21pc3M6IGRlZmF1bHREaXNtaXNzLFxuICBlcnJvcnM6IHtcbiAgICAnMSc6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfQUJPUlRFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoZSB2aWRlbyBkb3dubG9hZCB3YXMgY2FuY2VsbGVkJ1xuICAgIH0sXG4gICAgJzInOiB7XG4gICAgICB0eXBlOiAnTUVESUFfRVJSX05FVFdPUksnLFxuICAgICAgaGVhZGxpbmU6ICdUaGUgdmlkZW8gY29ubmVjdGlvbiB3YXMgbG9zdCwgcGxlYXNlIGNvbmZpcm0geW91IGFyZSAnICtcbiAgICAgICAgICAgICAgICAnY29ubmVjdGVkIHRvIHRoZSBpbnRlcm5ldCdcbiAgICB9LFxuICAgICczJzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9ERUNPREUnLFxuICAgICAgaGVhZGxpbmU6ICdUaGUgdmlkZW8gaXMgYmFkIG9yIGluIGEgZm9ybWF0IHRoYXQgY2Fubm90IGJlIHBsYXllZCBvbiB5b3VyIGJyb3dzZXInXG4gICAgfSxcbiAgICAnNCc6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfU1JDX05PVF9TVVBQT1JURUQnLFxuICAgICAgaGVhZGxpbmU6ICdUaGlzIHZpZGVvIGlzIGVpdGhlciB1bmF2YWlsYWJsZSBvciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcidcbiAgICB9LFxuICAgICc1Jzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9FTkNSWVBURUQnLFxuICAgICAgaGVhZGxpbmU6ICdUaGUgdmlkZW8geW91IGFyZSB0cnlpbmcgdG8gd2F0Y2ggaXMgZW5jcnlwdGVkIGFuZCB3ZSBkbyBub3Qga25vdyBob3cgJyArXG4gICAgICAgICAgICAgICAgJ3RvIGRlY3J5cHQgaXQnXG4gICAgfSxcbiAgICAndW5rbm93bic6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfVU5LTk9XTicsXG4gICAgICBoZWFkbGluZTogJ0FuIHVuYW50aWNpcGF0ZWQgcHJvYmxlbSB3YXMgZW5jb3VudGVyZWQsIGNoZWNrIGJhY2sgc29vbiBhbmQgdHJ5IGFnYWluJ1xuICAgIH0sXG4gICAgJy0xJzoge1xuICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfTk9fU1JDJyxcbiAgICAgIGhlYWRsaW5lOiAnTm8gdmlkZW8gaGFzIGJlZW4gbG9hZGVkJ1xuICAgIH0sXG4gICAgJy0yJzoge1xuICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfVElNRU9VVCcsXG4gICAgICBoZWFkbGluZTogJ0NvdWxkIG5vdCBkb3dubG9hZCB0aGUgdmlkZW8nXG4gICAgfSxcbiAgICAnLTMnOiB7XG4gICAgICB0eXBlOiAnUExBWUVSX0VSUl9ET01BSU5fUkVTVFJJQ1RFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoaXMgdmlkZW8gaXMgcmVzdHJpY3RlZCBmcm9tIHBsYXlpbmcgb24geW91ciBjdXJyZW50IGRvbWFpbidcbiAgICB9LFxuICAgICctNCc6IHtcbiAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX0lQX1JFU1RSSUNURUQnLFxuICAgICAgaGVhZGxpbmU6ICdUaGlzIHZpZGVvIGlzIHJlc3RyaWN0ZWQgYXQgeW91ciBjdXJyZW50IElQIGFkZHJlc3MnXG4gICAgfSxcbiAgICAnLTUnOiB7XG4gICAgICB0eXBlOiAnUExBWUVSX0VSUl9HRU9fUkVTVFJJQ1RFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoaXMgdmlkZW8gaXMgcmVzdHJpY3RlZCBmcm9tIHBsYXlpbmcgaW4geW91ciBjdXJyZW50IGdlb2dyYXBoaWMgcmVnaW9uJ1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBNb25pdG9ycyBhIHBsYXllciBmb3Igc2lnbnMgb2YgbGlmZSBkdXJpbmcgcGxheWJhY2sgYW5kXG4gKiB0cmlnZ2VycyBQTEFZRVJfRVJSX1RJTUVPVVQgaWYgbm9uZSBvY2N1ciB3aXRoaW4gYSByZWFzb25hYmxlXG4gKiB0aW1lZnJhbWUuXG4gKi9cbmNvbnN0IGluaXRQbHVnaW4gPSBmdW5jdGlvbihwbGF5ZXIsIG9wdGlvbnMpIHtcbiAgbGV0IG1vbml0b3I7XG4gIGNvbnN0IGxpc3RlbmVycyA9IFtdO1xuXG4gIC8vIGNsZWFycyB0aGUgcHJldmlvdXMgbW9uaXRvciB0aW1lb3V0IGFuZCBzZXRzIHVwIGEgbmV3IG9uZVxuICBjb25zdCByZXNldE1vbml0b3IgPSBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KG1vbml0b3IpO1xuICAgIG1vbml0b3IgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIC8vIHBsYXllciBhbHJlYWR5IGhhcyBhbiBlcnJvclxuICAgICAgLy8gb3IgaXMgbm90IHBsYXlpbmcgdW5kZXIgbm9ybWFsIGNvbmRpdGlvbnNcbiAgICAgIGlmIChwbGF5ZXIuZXJyb3IoKSB8fCBwbGF5ZXIucGF1c2VkKCkgfHwgcGxheWVyLmVuZGVkKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBwbGF5ZXIuZXJyb3Ioe1xuICAgICAgICBjb2RlOiAtMixcbiAgICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfVElNRU9VVCdcbiAgICAgIH0pO1xuICAgIH0sIG9wdGlvbnMudGltZW91dCk7XG5cbiAgICAvLyBjbGVhciBvdXQgYW55IGV4aXN0aW5nIHBsYXllciB0aW1lb3V0XG4gICAgLy8gcGxheWJhY2sgaGFzIHJlY292ZXJlZFxuICAgIGlmIChwbGF5ZXIuZXJyb3IoKSAmJiBwbGF5ZXIuZXJyb3IoKS5jb2RlID09PSAtMikge1xuICAgICAgcGxheWVyLmVycm9yKG51bGwpO1xuICAgIH1cbiAgfTtcblxuICAvLyBjbGVhciBhbnkgcHJldmlvdXNseSByZWdpc3RlcmVkIGxpc3RlbmVyc1xuICBjb25zdCBjbGVhbnVwID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGxpc3RlbmVyO1xuXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgIGxpc3RlbmVyID0gbGlzdGVuZXJzLnNoaWZ0KCk7XG4gICAgICBwbGF5ZXIub2ZmKGxpc3RlbmVyWzBdLCBsaXN0ZW5lclsxXSk7XG4gICAgfVxuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQobW9uaXRvcik7XG4gIH07XG5cbiAgLy8gY3JlYXRlcyBhbmQgdHJhY2tzIGEgcGxheWVyIGxpc3RlbmVyIGlmIHRoZSBwbGF5ZXIgbG9va3MgYWxpdmVcbiAgY29uc3QgaGVhbHRoY2hlY2sgPSBmdW5jdGlvbih0eXBlLCBmbikge1xuICAgIGNvbnN0IGNoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBpZiB0aGVyZSdzIGFuIGVycm9yIGRvIG5vdCByZXNldCB0aGUgbW9uaXRvciBhbmRcbiAgICAgIC8vIGNsZWFyIHRoZSBlcnJvciB1bmxlc3MgdGltZSBpcyBwcm9ncmVzc2luZ1xuICAgICAgaWYgKCFwbGF5ZXIuZXJyb3IoKSkge1xuICAgICAgICAvLyBlcnJvciBpZiB1c2luZyBGbGFzaCBhbmQgaXRzIEFQSSBpcyB1bmF2YWlsYWJsZVxuICAgICAgICBjb25zdCB0ZWNoID0gcGxheWVyLiQoJy52anMtdGVjaCcpO1xuXG4gICAgICAgIGlmICh0ZWNoICYmXG4gICAgICAgICAgICB0ZWNoLnR5cGUgPT09ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCcgJiZcbiAgICAgICAgICAgICF0ZWNoLnZqc19nZXRQcm9wZXJ0eSkge1xuICAgICAgICAgIHBsYXllci5lcnJvcih7XG4gICAgICAgICAgICBjb2RlOiAtMixcbiAgICAgICAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX1RJTUVPVVQnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGxheWJhY2sgaXNuJ3QgZXhwZWN0ZWQgaWYgdGhlIHBsYXllciBpcyBwYXVzZWRcbiAgICAgICAgaWYgKHBsYXllci5wYXVzZWQoKSkge1xuICAgICAgICAgIHJldHVybiByZXNldE1vbml0b3IoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBwbGF5YmFjayBpc24ndCBleHBlY3RlZCBvbmNlIHRoZSB2aWRlbyBoYXMgZW5kZWRcbiAgICAgICAgaWYgKHBsYXllci5lbmRlZCgpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc2V0TW9uaXRvcigpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZuLmNhbGwodGhpcyk7XG4gICAgfTtcblxuICAgIHBsYXllci5vbih0eXBlLCBjaGVjayk7XG4gICAgbGlzdGVuZXJzLnB1c2goW3R5cGUsIGNoZWNrXSk7XG4gIH07XG5cbiAgY29uc3Qgb25QbGF5U3RhcnRNb25pdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGxhc3RUaW1lID0gMDtcblxuICAgIGNsZWFudXAoKTtcblxuICAgIC8vIGlmIG5vIHBsYXliYWNrIGlzIGRldGVjdGVkIGZvciBsb25nIGVub3VnaCwgdHJpZ2dlciBhIHRpbWVvdXQgZXJyb3JcbiAgICByZXNldE1vbml0b3IoKTtcbiAgICBoZWFsdGhjaGVjayhbJ3RpbWV1cGRhdGUnLCAnYWR0aW1ldXBkYXRlJ10sIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBwbGF5ZXIuY3VycmVudFRpbWUoKTtcblxuICAgICAgLy8gcGxheWJhY2sgaXMgb3BlcmF0aW5nIG5vcm1hbGx5IG9yIGhhcyByZWNvdmVyZWRcbiAgICAgIGlmIChjdXJyZW50VGltZSAhPT0gbGFzdFRpbWUpIHtcbiAgICAgICAgbGFzdFRpbWUgPSBjdXJyZW50VGltZTtcbiAgICAgICAgcmVzZXRNb25pdG9yKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaGVhbHRoY2hlY2soJ3Byb2dyZXNzJywgcmVzZXRNb25pdG9yKTtcbiAgfTtcblxuICBjb25zdCBvblBsYXlOb1NvdXJjZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghcGxheWVyLmN1cnJlbnRTcmMoKSkge1xuICAgICAgcGxheWVyLmVycm9yKHtcbiAgICAgICAgY29kZTogLTEsXG4gICAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX05PX1NSQydcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBvbkVycm9ySGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBkZXRhaWxzID0gJyc7XG4gICAgbGV0IGVycm9yID0gcGxheWVyLmVycm9yKCk7XG4gICAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxldCBkaWFsb2dDb250ZW50ID0gJyc7XG5cbiAgICAvLyBJbiB0aGUgcmFyZSBjYXNlIHdoZW4gYGVycm9yKClgIGRvZXMgbm90IHJldHVybiBhbiBlcnJvciBvYmplY3QsXG4gICAgLy8gZGVmZW5zaXZlbHkgZXNjYXBlIHRoZSBoYW5kbGVyIGZ1bmN0aW9uLlxuICAgIGlmICghZXJyb3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBlcnJvciA9IHZpZGVvanMubWVyZ2VPcHRpb25zKGVycm9yLCBvcHRpb25zLmVycm9yc1tlcnJvci5jb2RlIHx8IDBdKTtcblxuICAgIGlmIChlcnJvci5tZXNzYWdlKSB7XG4gICAgICBkZXRhaWxzID0gYDxkaXYgY2xhc3M9XCJ2anMtZXJyb3JzLWRldGFpbHNcIj4ke3BsYXllci5sb2NhbGl6ZSgnVGVjaG5pY2FsIGRldGFpbHMnKX1cbiAgICAgICAgOiA8ZGl2IGNsYXNzPVwidmpzLWVycm9ycy1tZXNzYWdlXCI+JHtwbGF5ZXIubG9jYWxpemUoZXJyb3IubWVzc2FnZSl9PC9kaXY+XG4gICAgICAgIDwvZGl2PmA7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yLmNvZGUgPT09IDQgJiYgRmxhc2hPYmogJiYgIUZsYXNoT2JqLmlzU3VwcG9ydGVkKCkpIHtcbiAgICAgIGNvbnN0IGZsYXNoTWVzc2FnZSA9IHBsYXllci5sb2NhbGl6ZSgnSWYgeW91IGFyZSB1c2luZyBhbiBvbGRlciBicm93c2VyIHBsZWFzZSB0cnkgdXBncmFkaW5nIG9yIGluc3RhbGxpbmcgRmxhc2guJyk7XG5cbiAgICAgIGRldGFpbHMgKz0gYDxzcGFuIGNsYXNzPVwidmpzLWVycm9ycy1mbGFzaG1lc3NhZ2VcIj4ke2ZsYXNoTWVzc2FnZX08L3NwYW4+YDtcbiAgICB9XG5cbiAgICBjb25zdCBkaXNwbGF5ID0gcGxheWVyLmdldENoaWxkKCdlcnJvckRpc3BsYXknKTtcblxuICAgIGNvbnRlbnQuY2xhc3NOYW1lID0gJ3Zqcy1lcnJvcnMtZGlhbG9nJztcbiAgICBjb250ZW50LmlkID0gJ3Zqcy1lcnJvcnMtZGlhbG9nJztcbiAgICBkaWFsb2dDb250ZW50ID1cbiAgICAgYDxkaXYgY2xhc3M9XCJ2anMtZXJyb3JzLWNvbnRlbnQtY29udGFpbmVyXCI+XG4gICAgICA8aDIgY2xhc3M9XCJ2anMtZXJyb3JzLWhlYWRsaW5lXCI+JHt0aGlzLmxvY2FsaXplKGVycm9yLmhlYWRsaW5lKX08L2gyPlxuICAgICAgICA8ZGl2PjxiPiR7dGhpcy5sb2NhbGl6ZSgnRXJyb3IgQ29kZScpfTwvYj46ICR7KGVycm9yLnR5cGUgfHwgZXJyb3IuY29kZSl9PC9kaXY+XG4gICAgICAgICR7ZGV0YWlsc31cbiAgICAgIDwvZGl2PmA7XG5cbiAgICBjb25zdCBjbG9zZWFibGUgPSBkaXNwbGF5LmNsb3NlYWJsZSghKCdkaXNtaXNzJyBpbiBlcnJvcikgfHwgZXJyb3IuZGlzbWlzcyk7XG5cbiAgICAvLyBXZSBzaG91bGQgZ2V0IGEgY2xvc2UgYnV0dG9uXG4gICAgaWYgKGNsb3NlYWJsZSkge1xuICAgICAgZGlhbG9nQ29udGVudCArPVxuICAgICAgIGA8ZGl2IGNsYXNzPVwidmpzLWVycm9ycy1vay1idXR0b24tY29udGFpbmVyXCI+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInZqcy1lcnJvcnMtb2stYnV0dG9uXCI+JHt0aGlzLmxvY2FsaXplKCdPSycpfTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5gO1xuICAgICAgY29udGVudC5pbm5lckhUTUwgPSBkaWFsb2dDb250ZW50O1xuICAgICAgZGlzcGxheS5maWxsV2l0aChjb250ZW50KTtcbiAgICAgIC8vIEdldCB0aGUgY2xvc2UgYnV0dG9uIGluc2lkZSB0aGUgZXJyb3IgZGlzcGxheVxuICAgICAgZGlzcGxheS5jb250ZW50RWwoKS5maXJzdENoaWxkLmFwcGVuZENoaWxkKGRpc3BsYXkuZ2V0Q2hpbGQoJ2Nsb3NlQnV0dG9uJykuZWwoKSk7XG5cbiAgICAgIGNvbnN0IG9rQnV0dG9uID0gZGlzcGxheS5lbCgpLnF1ZXJ5U2VsZWN0b3IoJy52anMtZXJyb3JzLW9rLWJ1dHRvbicpO1xuXG4gICAgICBwbGF5ZXIub24ob2tCdXR0b24sICdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICBkaXNwbGF5LmNsb3NlKCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudC5pbm5lckhUTUwgPSBkaWFsb2dDb250ZW50O1xuICAgICAgZGlzcGxheS5maWxsV2l0aChjb250ZW50KTtcbiAgICB9XG5cbiAgICBpZiAocGxheWVyLndpZHRoKCkgPD0gNjAwIHx8IHBsYXllci5oZWlnaHQoKSA8PSAyNTApIHtcbiAgICAgIGRpc3BsYXkuYWRkQ2xhc3MoJ3Zqcy14cycpO1xuICAgIH1cblxuICAgIGRpc3BsYXkub25lKCdtb2RhbGNsb3NlJywgKCkgPT4gcGxheWVyLmVycm9yKG51bGwpKTtcbiAgfTtcblxuICBjb25zdCBvbkRpc3Bvc2VIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY2xlYW51cCgpO1xuXG4gICAgcGxheWVyLnJlbW92ZUNsYXNzKCd2anMtZXJyb3JzJyk7XG4gICAgcGxheWVyLm9mZigncGxheScsIG9uUGxheVN0YXJ0TW9uaXRvcik7XG4gICAgcGxheWVyLm9mZigncGxheScsIG9uUGxheU5vU291cmNlKTtcbiAgICBwbGF5ZXIub2ZmKCdkaXNwb3NlJywgb25EaXNwb3NlSGFuZGxlcik7XG4gICAgcGxheWVyLm9mZignZXJyb3InLCBvbkVycm9ySGFuZGxlcik7XG4gIH07XG5cbiAgY29uc3QgcmVJbml0UGx1Z2luID0gZnVuY3Rpb24obmV3T3B0aW9ucykge1xuICAgIG9uRGlzcG9zZUhhbmRsZXIoKTtcbiAgICBpbml0UGx1Z2luKHBsYXllciwgdmlkZW9qcy5tZXJnZU9wdGlvbnMoZGVmYXVsdHMsIG5ld09wdGlvbnMpKTtcbiAgfTtcblxuICByZUluaXRQbHVnaW4uZXh0ZW5kID0gZnVuY3Rpb24oZXJyb3JzKSB7XG4gICAgb3B0aW9ucy5lcnJvcnMgPSB2aWRlb2pzLm1lcmdlT3B0aW9ucyhvcHRpb25zLmVycm9ycywgZXJyb3JzKTtcbiAgfTtcblxuICBwbGF5ZXIub24oJ3BsYXknLCBvblBsYXlTdGFydE1vbml0b3IpO1xuICBwbGF5ZXIub24oJ3BsYXknLCBvblBsYXlOb1NvdXJjZSk7XG4gIHBsYXllci5vbignZGlzcG9zZScsIG9uRGlzcG9zZUhhbmRsZXIpO1xuICBwbGF5ZXIub24oJ2Vycm9yJywgb25FcnJvckhhbmRsZXIpO1xuXG4gIHBsYXllci5yZWFkeSgoKSA9PiB7XG4gICAgcGxheWVyLmFkZENsYXNzKCd2anMtZXJyb3JzJyk7XG4gIH0pO1xuXG4gIHBsYXllci5lcnJvcnMgPSByZUluaXRQbHVnaW47XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIHBsdWdpbi4gV2FpdHMgdW50aWwgdGhlIHBsYXllciBpcyByZWFkeSB0byBkbyBhbnl0aGluZy5cbiAqL1xuY29uc3QgZXJyb3JzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBpbml0UGx1Z2luKHRoaXMsIHZpZGVvanMubWVyZ2VPcHRpb25zKGRlZmF1bHRzLCBvcHRpb25zKSk7XG59O1xuXG4vLyBSZWdpc3RlciB0aGUgcGx1Z2luIHdpdGggdmlkZW8uanMuXG5yZWdpc3RlclBsdWdpbignZXJyb3JzJywgZXJyb3JzKTtcblxuZXhwb3J0IGRlZmF1bHQgZXJyb3JzO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2pzL2luZGV4LmpzIiwidmFyIHRvcExldmVsID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDoge31cbnZhciBtaW5Eb2MgPSByZXF1aXJlKCdtaW4tZG9jdW1lbnQnKTtcblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50O1xufSBlbHNlIHtcbiAgICB2YXIgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddO1xuXG4gICAgaWYgKCFkb2NjeSkge1xuICAgICAgICBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J10gPSBtaW5Eb2M7XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkb2NjeTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vfi9nbG9iYWwvZG9jdW1lbnQuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHdpbmRvdztcbn0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBzZWxmO1xufSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHt9O1xufVxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2dsb2JhbC93aW5kb3cuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiB3ZWJwYWNrIHRlc3QgXG4gKi9cbmltcG9ydCBwa2cgZnJvbSBcIi4uLy4uL3NyYy9qcy9pbmRleC5qc1wiO1xuXG5RVW5pdC5tb2R1bGUoXCJ3ZWJwYWNrIHJlcXVpcmVcIik7XG5RVW5pdC50ZXN0KFwidmlkZW9qcy1lcnJvcnMgc2hvdWxkIGJlIHJlcXVpcmVhYmxlIHZpYSB3ZWJwYWNrXCIsIChhc3NlcnQpID0+IHtcbiAgYXNzZXJ0Lm9rKHBrZywgXCJ2aWRlb2pzLWVycm9ycyBpcyByZXF1aXJlZCBwcm9wZXJseVwiKTtcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Rpc3QvdGVzdC93ZWJwYWNrLnN0YXJ0LmpzIiwibW9kdWxlLmV4cG9ydHMgPSB2aWRlb2pzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwidmlkZW9qc1wiXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIChpZ25vcmVkKSAqL1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIG1pbi1kb2N1bWVudCAoaWdub3JlZClcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==