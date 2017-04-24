/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
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

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = __webpack_require__(6);

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

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var win;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgN2EwZTI2ZGRiYjM5MjY2ZDNkNWQiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL2dsb2JhbC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvanMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9nbG9iYWwvZG9jdW1lbnQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9nbG9iYWwvd2luZG93LmpzIiwid2VicGFjazovLy8uL2Rpc3QvdGVzdC93ZWJwYWNrLnN0YXJ0LmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcInZpZGVvanNcIiIsIndlYnBhY2s6Ly8vbWluLWRvY3VtZW50IChpZ25vcmVkKSJdLCJuYW1lcyI6WyJGbGFzaE9iaiIsImdldENvbXBvbmVudCIsImRlZmF1bHREaXNtaXNzIiwiYnJvd3NlciIsIklTX0lQSE9ORSIsInJlZ2lzdGVyUGx1Z2luIiwicGx1Z2luIiwiZGVmYXVsdHMiLCJoZWFkZXIiLCJjb2RlIiwibWVzc2FnZSIsInRpbWVvdXQiLCJkaXNtaXNzIiwicHJvZ3Jlc3NEaXNhYmxlZCIsImVycm9ycyIsInR5cGUiLCJoZWFkbGluZSIsImluaXRQbHVnaW4iLCJwbGF5ZXIiLCJvcHRpb25zIiwibW9uaXRvciIsImxpc3RlbmVycyIsInJlc2V0TW9uaXRvciIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJlcnJvciIsInBhdXNlZCIsImVuZGVkIiwiY2xlYW51cCIsImxpc3RlbmVyIiwibGVuZ3RoIiwic2hpZnQiLCJvZmYiLCJoZWFsdGhjaGVjayIsImZuIiwiY2hlY2siLCJ0ZWNoIiwiJCIsInZqc19nZXRQcm9wZXJ0eSIsImNhbGwiLCJvbiIsInB1c2giLCJvblBsYXlTdGFydE1vbml0b3IiLCJsYXN0VGltZSIsImN1cnJlbnRUaW1lIiwib25QbGF5Tm9Tb3VyY2UiLCJjdXJyZW50U3JjIiwib25FcnJvckhhbmRsZXIiLCJkZXRhaWxzIiwiY29udGVudCIsImNyZWF0ZUVsZW1lbnQiLCJkaWFsb2dDb250ZW50IiwibWVyZ2VPcHRpb25zIiwibG9jYWxpemUiLCJpc1N1cHBvcnRlZCIsImZsYXNoTWVzc2FnZSIsImRpc3BsYXkiLCJnZXRDaGlsZCIsImNsYXNzTmFtZSIsImlkIiwiY2xvc2VhYmxlIiwiaW5uZXJIVE1MIiwiZmlsbFdpdGgiLCJjb250ZW50RWwiLCJmaXJzdENoaWxkIiwiYXBwZW5kQ2hpbGQiLCJlbCIsIm9rQnV0dG9uIiwicXVlcnlTZWxlY3RvciIsImNsb3NlIiwiY3VycmVudFdpZHRoIiwiY3VycmVudEhlaWdodCIsImFkZENsYXNzIiwib25lIiwib25EaXNwb3NlSGFuZGxlciIsInJlbW92ZUNsYXNzIiwicmVJbml0UGx1Z2luIiwibmV3T3B0aW9ucyIsImV4dGVuZCIsImRpc2FibGVQcm9ncmVzcyIsImRpc2FibGVkIiwicmVhZHkiLCJRVW5pdCIsIm1vZHVsZSIsInRlc3QiLCJhc3NlcnQiLCJvayJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxtREFBMkMsY0FBYzs7QUFFekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7O0FDaEVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0Q0FBNEM7O0FBRTVDOzs7Ozs7Ozs7Ozs7QUNwQkE7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ZUEsTTs7Ozs7O0FDblNmO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsQ0FBQztBQUNEOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7OztBQ2hCQTs7QUFFQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0EsQ0FBQztBQUNEO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7O0FDVEE7Ozs7OztBQUVBb0UsTUFBTUMsTUFBTixDQUFhLGlCQUFiLEUsQ0FMQTs7OztBQU1BRCxNQUFNRSxJQUFOLENBQVcsa0RBQVgsRUFBK0QsVUFBQ0MsTUFBRCxFQUFZO0FBQ3pFQSxTQUFPQyxFQUFQLHFCQUFlLHFDQUFmO0FBQ0QsQ0FGRCxFOzs7Ozs7QUNOQSx5Qjs7Ozs7O0FDQUEsZSIsImZpbGUiOiJ3ZWJwYWNrLnRlc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBpZGVudGl0eSBmdW5jdGlvbiBmb3IgY2FsbGluZyBoYXJtb255IGltcG9ydHMgd2l0aCB0aGUgY29ycmVjdCBjb250ZXh0XG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmkgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDQpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDdhMGUyNmRkYmIzOTI2NmQzZDVkIiwidmFyIGc7XHJcblxyXG4vLyBUaGlzIHdvcmtzIGluIG5vbi1zdHJpY3QgbW9kZVxyXG5nID0gKGZ1bmN0aW9uKCkge1xyXG5cdHJldHVybiB0aGlzO1xyXG59KSgpO1xyXG5cclxudHJ5IHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIGV2YWwgaXMgYWxsb3dlZCAoc2VlIENTUClcclxuXHRnID0gZyB8fCBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCkgfHwgKDEsZXZhbCkoXCJ0aGlzXCIpO1xyXG59IGNhdGNoKGUpIHtcclxuXHQvLyBUaGlzIHdvcmtzIGlmIHRoZSB3aW5kb3cgcmVmZXJlbmNlIGlzIGF2YWlsYWJsZVxyXG5cdGlmKHR5cGVvZiB3aW5kb3cgPT09IFwib2JqZWN0XCIpXHJcblx0XHRnID0gd2luZG93O1xyXG59XHJcblxyXG4vLyBnIGNhbiBzdGlsbCBiZSB1bmRlZmluZWQsIGJ1dCBub3RoaW5nIHRvIGRvIGFib3V0IGl0Li4uXHJcbi8vIFdlIHJldHVybiB1bmRlZmluZWQsIGluc3RlYWQgb2Ygbm90aGluZyBoZXJlLCBzbyBpdCdzXHJcbi8vIGVhc2llciB0byBoYW5kbGUgdGhpcyBjYXNlLiBpZighZ2xvYmFsKSB7IC4uLn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZztcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB2aWRlb2pzIGZyb20gJ3ZpZGVvLmpzJztcbmltcG9ydCB3aW5kb3cgZnJvbSAnZ2xvYmFsL3dpbmRvdyc7XG5pbXBvcnQgZG9jdW1lbnQgZnJvbSAnZ2xvYmFsL2RvY3VtZW50JztcblxuY29uc3QgRmxhc2hPYmogPSB2aWRlb2pzLmdldENvbXBvbmVudCgnRmxhc2gnKTtcbmNvbnN0IGRlZmF1bHREaXNtaXNzID0gIXZpZGVvanMuYnJvd3Nlci5JU19JUEhPTkU7XG5cbi8vIFZpZGVvLmpzIDUvNiBjcm9zcy1jb21wYXRpYmlsaXR5LlxuY29uc3QgcmVnaXN0ZXJQbHVnaW4gPSB2aWRlb2pzLnJlZ2lzdGVyUGx1Z2luIHx8IHZpZGVvanMucGx1Z2luO1xuXG4vLyBEZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSBwbHVnaW4uXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgaGVhZGVyOiAnJyxcbiAgY29kZTogJycsXG4gIG1lc3NhZ2U6ICcnLFxuICB0aW1lb3V0OiA0NSAqIDEwMDAsXG4gIGRpc21pc3M6IGRlZmF1bHREaXNtaXNzLFxuICBwcm9ncmVzc0Rpc2FibGVkOiBmYWxzZSxcbiAgZXJyb3JzOiB7XG4gICAgJzEnOiB7XG4gICAgICB0eXBlOiAnTUVESUFfRVJSX0FCT1JURUQnLFxuICAgICAgaGVhZGxpbmU6ICdUaGUgdmlkZW8gZG93bmxvYWQgd2FzIGNhbmNlbGxlZCdcbiAgICB9LFxuICAgICcyJzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9ORVRXT1JLJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhlIHZpZGVvIGNvbm5lY3Rpb24gd2FzIGxvc3QsIHBsZWFzZSBjb25maXJtIHlvdSBhcmUgJyArXG4gICAgICAgICAgICAgICAgJ2Nvbm5lY3RlZCB0byB0aGUgaW50ZXJuZXQnXG4gICAgfSxcbiAgICAnMyc6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfREVDT0RFJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhlIHZpZGVvIGlzIGJhZCBvciBpbiBhIGZvcm1hdCB0aGF0IGNhbm5vdCBiZSBwbGF5ZWQgb24geW91ciBicm93c2VyJ1xuICAgIH0sXG4gICAgJzQnOiB7XG4gICAgICB0eXBlOiAnTUVESUFfRVJSX1NSQ19OT1RfU1VQUE9SVEVEJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhpcyB2aWRlbyBpcyBlaXRoZXIgdW5hdmFpbGFibGUgb3Igbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInXG4gICAgfSxcbiAgICAnNSc6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfRU5DUllQVEVEJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhlIHZpZGVvIHlvdSBhcmUgdHJ5aW5nIHRvIHdhdGNoIGlzIGVuY3J5cHRlZCBhbmQgd2UgZG8gbm90IGtub3cgaG93ICcgK1xuICAgICAgICAgICAgICAgICd0byBkZWNyeXB0IGl0J1xuICAgIH0sXG4gICAgJ3Vua25vd24nOiB7XG4gICAgICB0eXBlOiAnTUVESUFfRVJSX1VOS05PV04nLFxuICAgICAgaGVhZGxpbmU6ICdBbiB1bmFudGljaXBhdGVkIHByb2JsZW0gd2FzIGVuY291bnRlcmVkLCBjaGVjayBiYWNrIHNvb24gYW5kIHRyeSBhZ2FpbidcbiAgICB9LFxuICAgICctMSc6IHtcbiAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX05PX1NSQycsXG4gICAgICBoZWFkbGluZTogJ05vIHZpZGVvIGhhcyBiZWVuIGxvYWRlZCdcbiAgICB9LFxuICAgICctMic6IHtcbiAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX1RJTUVPVVQnLFxuICAgICAgaGVhZGxpbmU6ICdDb3VsZCBub3QgZG93bmxvYWQgdGhlIHZpZGVvJ1xuICAgIH0sXG4gICAgJy0zJzoge1xuICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfRE9NQUlOX1JFU1RSSUNURUQnLFxuICAgICAgaGVhZGxpbmU6ICdUaGlzIHZpZGVvIGlzIHJlc3RyaWN0ZWQgZnJvbSBwbGF5aW5nIG9uIHlvdXIgY3VycmVudCBkb21haW4nXG4gICAgfSxcbiAgICAnLTQnOiB7XG4gICAgICB0eXBlOiAnUExBWUVSX0VSUl9JUF9SRVNUUklDVEVEJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhpcyB2aWRlbyBpcyByZXN0cmljdGVkIGF0IHlvdXIgY3VycmVudCBJUCBhZGRyZXNzJ1xuICAgIH0sXG4gICAgJy01Jzoge1xuICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfR0VPX1JFU1RSSUNURUQnLFxuICAgICAgaGVhZGxpbmU6ICdUaGlzIHZpZGVvIGlzIHJlc3RyaWN0ZWQgZnJvbSBwbGF5aW5nIGluIHlvdXIgY3VycmVudCBnZW9ncmFwaGljIHJlZ2lvbidcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogTW9uaXRvcnMgYSBwbGF5ZXIgZm9yIHNpZ25zIG9mIGxpZmUgZHVyaW5nIHBsYXliYWNrIGFuZFxuICogdHJpZ2dlcnMgUExBWUVSX0VSUl9USU1FT1VUIGlmIG5vbmUgb2NjdXIgd2l0aGluIGEgcmVhc29uYWJsZVxuICogdGltZWZyYW1lLlxuICovXG5jb25zdCBpbml0UGx1Z2luID0gZnVuY3Rpb24ocGxheWVyLCBvcHRpb25zKSB7XG4gIGxldCBtb25pdG9yO1xuICBjb25zdCBsaXN0ZW5lcnMgPSBbXTtcblxuICAvLyBjbGVhcnMgdGhlIHByZXZpb3VzIG1vbml0b3IgdGltZW91dCBhbmQgc2V0cyB1cCBhIG5ldyBvbmVcbiAgY29uc3QgcmVzZXRNb25pdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmNsZWFyVGltZW91dChtb25pdG9yKTtcbiAgICBtb25pdG9yID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAvLyBwbGF5ZXIgYWxyZWFkeSBoYXMgYW4gZXJyb3JcbiAgICAgIC8vIG9yIGlzIG5vdCBwbGF5aW5nIHVuZGVyIG5vcm1hbCBjb25kaXRpb25zXG4gICAgICBpZiAocGxheWVyLmVycm9yKCkgfHwgcGxheWVyLnBhdXNlZCgpIHx8IHBsYXllci5lbmRlZCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgcGxheWVyLmVycm9yKHtcbiAgICAgICAgY29kZTogLTIsXG4gICAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX1RJTUVPVVQnXG4gICAgICB9KTtcbiAgICB9LCBvcHRpb25zLnRpbWVvdXQpO1xuXG4gICAgLy8gY2xlYXIgb3V0IGFueSBleGlzdGluZyBwbGF5ZXIgdGltZW91dFxuICAgIC8vIHBsYXliYWNrIGhhcyByZWNvdmVyZWRcbiAgICBpZiAocGxheWVyLmVycm9yKCkgJiYgcGxheWVyLmVycm9yKCkuY29kZSA9PT0gLTIpIHtcbiAgICAgIHBsYXllci5lcnJvcihudWxsKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gY2xlYXIgYW55IHByZXZpb3VzbHkgcmVnaXN0ZXJlZCBsaXN0ZW5lcnNcbiAgY29uc3QgY2xlYW51cCA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBsaXN0ZW5lcjtcblxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICBsaXN0ZW5lciA9IGxpc3RlbmVycy5zaGlmdCgpO1xuICAgICAgcGxheWVyLm9mZihsaXN0ZW5lclswXSwgbGlzdGVuZXJbMV0pO1xuICAgIH1cbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KG1vbml0b3IpO1xuICB9O1xuXG4gIC8vIGNyZWF0ZXMgYW5kIHRyYWNrcyBhIHBsYXllciBsaXN0ZW5lciBpZiB0aGUgcGxheWVyIGxvb2tzIGFsaXZlXG4gIGNvbnN0IGhlYWx0aGNoZWNrID0gZnVuY3Rpb24odHlwZSwgZm4pIHtcbiAgICBjb25zdCBjaGVjayA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gaWYgdGhlcmUncyBhbiBlcnJvciBkbyBub3QgcmVzZXQgdGhlIG1vbml0b3IgYW5kXG4gICAgICAvLyBjbGVhciB0aGUgZXJyb3IgdW5sZXNzIHRpbWUgaXMgcHJvZ3Jlc3NpbmdcbiAgICAgIGlmICghcGxheWVyLmVycm9yKCkpIHtcbiAgICAgICAgLy8gZXJyb3IgaWYgdXNpbmcgRmxhc2ggYW5kIGl0cyBBUEkgaXMgdW5hdmFpbGFibGVcbiAgICAgICAgY29uc3QgdGVjaCA9IHBsYXllci4kKCcudmpzLXRlY2gnKTtcblxuICAgICAgICBpZiAodGVjaCAmJlxuICAgICAgICAgICAgdGVjaC50eXBlID09PSAnYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2gnICYmXG4gICAgICAgICAgICAhdGVjaC52anNfZ2V0UHJvcGVydHkpIHtcbiAgICAgICAgICBwbGF5ZXIuZXJyb3Ioe1xuICAgICAgICAgICAgY29kZTogLTIsXG4gICAgICAgICAgICB0eXBlOiAnUExBWUVSX0VSUl9USU1FT1VUJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBsYXliYWNrIGlzbid0IGV4cGVjdGVkIGlmIHRoZSBwbGF5ZXIgaXMgcGF1c2VkXG4gICAgICAgIGlmIChwbGF5ZXIucGF1c2VkKCkpIHtcbiAgICAgICAgICByZXR1cm4gcmVzZXRNb25pdG9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcGxheWJhY2sgaXNuJ3QgZXhwZWN0ZWQgb25jZSB0aGUgdmlkZW8gaGFzIGVuZGVkXG4gICAgICAgIGlmIChwbGF5ZXIuZW5kZWQoKSkge1xuICAgICAgICAgIHJldHVybiByZXNldE1vbml0b3IoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmbi5jYWxsKHRoaXMpO1xuICAgIH07XG5cbiAgICBwbGF5ZXIub24odHlwZSwgY2hlY2spO1xuICAgIGxpc3RlbmVycy5wdXNoKFt0eXBlLCBjaGVja10pO1xuICB9O1xuXG4gIGNvbnN0IG9uUGxheVN0YXJ0TW9uaXRvciA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBsYXN0VGltZSA9IDA7XG5cbiAgICBjbGVhbnVwKCk7XG5cbiAgICAvLyBpZiBubyBwbGF5YmFjayBpcyBkZXRlY3RlZCBmb3IgbG9uZyBlbm91Z2gsIHRyaWdnZXIgYSB0aW1lb3V0IGVycm9yXG4gICAgcmVzZXRNb25pdG9yKCk7XG4gICAgaGVhbHRoY2hlY2soWyd0aW1ldXBkYXRlJywgJ2FkdGltZXVwZGF0ZSddLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gcGxheWVyLmN1cnJlbnRUaW1lKCk7XG5cbiAgICAgIC8vIHBsYXliYWNrIGlzIG9wZXJhdGluZyBub3JtYWxseSBvciBoYXMgcmVjb3ZlcmVkXG4gICAgICBpZiAoY3VycmVudFRpbWUgIT09IGxhc3RUaW1lKSB7XG4gICAgICAgIGxhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgICAgIHJlc2V0TW9uaXRvcigpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKCFvcHRpb25zLnByb2dyZXNzRGlzYWJsZWQpIHtcbiAgICAgIGhlYWx0aGNoZWNrKCdwcm9ncmVzcycsIHJlc2V0TW9uaXRvcik7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IG9uUGxheU5vU291cmNlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFwbGF5ZXIuY3VycmVudFNyYygpKSB7XG4gICAgICBwbGF5ZXIuZXJyb3Ioe1xuICAgICAgICBjb2RlOiAtMSxcbiAgICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfTk9fU1JDJ1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IG9uRXJyb3JIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGRldGFpbHMgPSAnJztcbiAgICBsZXQgZXJyb3IgPSBwbGF5ZXIuZXJyb3IoKTtcbiAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbGV0IGRpYWxvZ0NvbnRlbnQgPSAnJztcblxuICAgIC8vIEluIHRoZSByYXJlIGNhc2Ugd2hlbiBgZXJyb3IoKWAgZG9lcyBub3QgcmV0dXJuIGFuIGVycm9yIG9iamVjdCxcbiAgICAvLyBkZWZlbnNpdmVseSBlc2NhcGUgdGhlIGhhbmRsZXIgZnVuY3Rpb24uXG4gICAgaWYgKCFlcnJvcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGVycm9yID0gdmlkZW9qcy5tZXJnZU9wdGlvbnMoZXJyb3IsIG9wdGlvbnMuZXJyb3JzW2Vycm9yLmNvZGUgfHwgMF0pO1xuXG4gICAgaWYgKGVycm9yLm1lc3NhZ2UpIHtcbiAgICAgIGRldGFpbHMgPSBgPGRpdiBjbGFzcz1cInZqcy1lcnJvcnMtZGV0YWlsc1wiPiR7cGxheWVyLmxvY2FsaXplKCdUZWNobmljYWwgZGV0YWlscycpfVxuICAgICAgICA6IDxkaXYgY2xhc3M9XCJ2anMtZXJyb3JzLW1lc3NhZ2VcIj4ke3BsYXllci5sb2NhbGl6ZShlcnJvci5tZXNzYWdlKX08L2Rpdj5cbiAgICAgICAgPC9kaXY+YDtcbiAgICB9XG5cbiAgICBpZiAoZXJyb3IuY29kZSA9PT0gNCAmJiBGbGFzaE9iaiAmJiAhRmxhc2hPYmouaXNTdXBwb3J0ZWQoKSkge1xuICAgICAgY29uc3QgZmxhc2hNZXNzYWdlID0gcGxheWVyLmxvY2FsaXplKCdJZiB5b3UgYXJlIHVzaW5nIGFuIG9sZGVyIGJyb3dzZXIgcGxlYXNlIHRyeSB1cGdyYWRpbmcgb3IgaW5zdGFsbGluZyBGbGFzaC4nKTtcblxuICAgICAgZGV0YWlscyArPSBgPHNwYW4gY2xhc3M9XCJ2anMtZXJyb3JzLWZsYXNobWVzc2FnZVwiPiR7Zmxhc2hNZXNzYWdlfTwvc3Bhbj5gO1xuICAgIH1cblxuICAgIGNvbnN0IGRpc3BsYXkgPSBwbGF5ZXIuZ2V0Q2hpbGQoJ2Vycm9yRGlzcGxheScpO1xuXG4gICAgY29udGVudC5jbGFzc05hbWUgPSAndmpzLWVycm9ycy1kaWFsb2cnO1xuICAgIGNvbnRlbnQuaWQgPSAndmpzLWVycm9ycy1kaWFsb2cnO1xuICAgIGRpYWxvZ0NvbnRlbnQgPVxuICAgICBgPGRpdiBjbGFzcz1cInZqcy1lcnJvcnMtY29udGVudC1jb250YWluZXJcIj5cbiAgICAgIDxoMiBjbGFzcz1cInZqcy1lcnJvcnMtaGVhZGxpbmVcIj4ke3RoaXMubG9jYWxpemUoZXJyb3IuaGVhZGxpbmUpfTwvaDI+XG4gICAgICAgIDxkaXY+PGI+JHt0aGlzLmxvY2FsaXplKCdFcnJvciBDb2RlJyl9PC9iPjogJHsoZXJyb3IudHlwZSB8fCBlcnJvci5jb2RlKX08L2Rpdj5cbiAgICAgICAgJHtkZXRhaWxzfVxuICAgICAgPC9kaXY+YDtcblxuICAgIGNvbnN0IGNsb3NlYWJsZSA9IGRpc3BsYXkuY2xvc2VhYmxlKCEoJ2Rpc21pc3MnIGluIGVycm9yKSB8fCBlcnJvci5kaXNtaXNzKTtcblxuICAgIC8vIFdlIHNob3VsZCBnZXQgYSBjbG9zZSBidXR0b25cbiAgICBpZiAoY2xvc2VhYmxlKSB7XG4gICAgICBkaWFsb2dDb250ZW50ICs9XG4gICAgICAgYDxkaXYgY2xhc3M9XCJ2anMtZXJyb3JzLW9rLWJ1dHRvbi1jb250YWluZXJcIj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwidmpzLWVycm9ycy1vay1idXR0b25cIj4ke3RoaXMubG9jYWxpemUoJ09LJyl9PC9idXR0b24+XG4gICAgICAgIDwvZGl2PmA7XG4gICAgICBjb250ZW50LmlubmVySFRNTCA9IGRpYWxvZ0NvbnRlbnQ7XG4gICAgICBkaXNwbGF5LmZpbGxXaXRoKGNvbnRlbnQpO1xuICAgICAgLy8gR2V0IHRoZSBjbG9zZSBidXR0b24gaW5zaWRlIHRoZSBlcnJvciBkaXNwbGF5XG4gICAgICBkaXNwbGF5LmNvbnRlbnRFbCgpLmZpcnN0Q2hpbGQuYXBwZW5kQ2hpbGQoZGlzcGxheS5nZXRDaGlsZCgnY2xvc2VCdXR0b24nKS5lbCgpKTtcblxuICAgICAgY29uc3Qgb2tCdXR0b24gPSBkaXNwbGF5LmVsKCkucXVlcnlTZWxlY3RvcignLnZqcy1lcnJvcnMtb2stYnV0dG9uJyk7XG5cbiAgICAgIHBsYXllci5vbihva0J1dHRvbiwgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRpc3BsYXkuY2xvc2UoKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZW50LmlubmVySFRNTCA9IGRpYWxvZ0NvbnRlbnQ7XG4gICAgICBkaXNwbGF5LmZpbGxXaXRoKGNvbnRlbnQpO1xuICAgIH1cblxuICAgIGlmIChwbGF5ZXIuY3VycmVudFdpZHRoKCkgPD0gNjAwIHx8IHBsYXllci5jdXJyZW50SGVpZ2h0KCkgPD0gMjUwKSB7XG4gICAgICBkaXNwbGF5LmFkZENsYXNzKCd2anMteHMnKTtcbiAgICB9XG5cbiAgICBkaXNwbGF5Lm9uZSgnbW9kYWxjbG9zZScsICgpID0+IHBsYXllci5lcnJvcihudWxsKSk7XG4gIH07XG5cbiAgY29uc3Qgb25EaXNwb3NlSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFudXAoKTtcblxuICAgIHBsYXllci5yZW1vdmVDbGFzcygndmpzLWVycm9ycycpO1xuICAgIHBsYXllci5vZmYoJ3BsYXknLCBvblBsYXlTdGFydE1vbml0b3IpO1xuICAgIHBsYXllci5vZmYoJ3BsYXknLCBvblBsYXlOb1NvdXJjZSk7XG4gICAgcGxheWVyLm9mZignZGlzcG9zZScsIG9uRGlzcG9zZUhhbmRsZXIpO1xuICAgIHBsYXllci5vZmYoJ2Vycm9yJywgb25FcnJvckhhbmRsZXIpO1xuICB9O1xuXG4gIGNvbnN0IHJlSW5pdFBsdWdpbiA9IGZ1bmN0aW9uKG5ld09wdGlvbnMpIHtcbiAgICBvbkRpc3Bvc2VIYW5kbGVyKCk7XG4gICAgaW5pdFBsdWdpbihwbGF5ZXIsIHZpZGVvanMubWVyZ2VPcHRpb25zKGRlZmF1bHRzLCBuZXdPcHRpb25zKSk7XG4gIH07XG5cbiAgcmVJbml0UGx1Z2luLmV4dGVuZCA9IGZ1bmN0aW9uKGVycm9ycykge1xuICAgIG9wdGlvbnMuZXJyb3JzID0gdmlkZW9qcy5tZXJnZU9wdGlvbnMob3B0aW9ucy5lcnJvcnMsIGVycm9ycyk7XG4gIH07XG5cbiAgcmVJbml0UGx1Z2luLmRpc2FibGVQcm9ncmVzcyA9IGZ1bmN0aW9uKGRpc2FibGVkKSB7XG4gICAgb3B0aW9ucy5wcm9ncmVzc0Rpc2FibGVkID0gZGlzYWJsZWQ7XG4gICAgb25QbGF5U3RhcnRNb25pdG9yKCk7XG4gIH07XG5cbiAgcGxheWVyLm9uKCdwbGF5Jywgb25QbGF5U3RhcnRNb25pdG9yKTtcbiAgcGxheWVyLm9uKCdwbGF5Jywgb25QbGF5Tm9Tb3VyY2UpO1xuICBwbGF5ZXIub24oJ2Rpc3Bvc2UnLCBvbkRpc3Bvc2VIYW5kbGVyKTtcbiAgcGxheWVyLm9uKCdlcnJvcicsIG9uRXJyb3JIYW5kbGVyKTtcblxuICBwbGF5ZXIucmVhZHkoKCkgPT4ge1xuICAgIHBsYXllci5hZGRDbGFzcygndmpzLWVycm9ycycpO1xuICB9KTtcblxuICBwbGF5ZXIuZXJyb3JzID0gcmVJbml0UGx1Z2luO1xufTtcblxuLyoqXG4gKiBJbml0aWFsaXplIHRoZSBwbHVnaW4uIFdhaXRzIHVudGlsIHRoZSBwbGF5ZXIgaXMgcmVhZHkgdG8gZG8gYW55dGhpbmcuXG4gKi9cbmNvbnN0IGVycm9ycyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgaW5pdFBsdWdpbih0aGlzLCB2aWRlb2pzLm1lcmdlT3B0aW9ucyhkZWZhdWx0cywgb3B0aW9ucykpO1xufTtcblxuLy8gUmVnaXN0ZXIgdGhlIHBsdWdpbiB3aXRoIHZpZGVvLmpzLlxucmVnaXN0ZXJQbHVnaW4oJ2Vycm9ycycsIGVycm9ycyk7XG5cbmV4cG9ydCBkZWZhdWx0IGVycm9ycztcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9qcy9pbmRleC5qcyIsInZhciB0b3BMZXZlbCA9IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDpcbiAgICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHt9XG52YXIgbWluRG9jID0gcmVxdWlyZSgnbWluLWRvY3VtZW50Jyk7XG5cbnZhciBkb2NjeTtcblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBkb2NjeSA9IGRvY3VtZW50O1xufSBlbHNlIHtcbiAgICBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J107XG5cbiAgICBpZiAoIWRvY2N5KSB7XG4gICAgICAgIGRvY2N5ID0gdG9wTGV2ZWxbJ19fR0xPQkFMX0RPQ1VNRU5UX0NBQ0hFQDQnXSA9IG1pbkRvYztcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZG9jY3k7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL34vZ2xvYmFsL2RvY3VtZW50LmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsInZhciB3aW47XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luID0gd2luZG93O1xufSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgd2luID0gZ2xvYmFsO1xufSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgd2luID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgd2luID0ge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2luO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2dsb2JhbC93aW5kb3cuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqXG4gKiB3ZWJwYWNrIHRlc3QgXG4gKi9cbmltcG9ydCBwa2cgZnJvbSBcIi4uLy4uL3NyYy9qcy9pbmRleC5qc1wiO1xuXG5RVW5pdC5tb2R1bGUoXCJ3ZWJwYWNrIHJlcXVpcmVcIik7XG5RVW5pdC50ZXN0KFwidmlkZW9qcy1lcnJvcnMgc2hvdWxkIGJlIHJlcXVpcmVhYmxlIHZpYSB3ZWJwYWNrXCIsIChhc3NlcnQpID0+IHtcbiAgYXNzZXJ0Lm9rKHBrZywgXCJ2aWRlb2pzLWVycm9ycyBpcyByZXF1aXJlZCBwcm9wZXJseVwiKTtcbn0pO1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2Rpc3QvdGVzdC93ZWJwYWNrLnN0YXJ0LmpzIiwibW9kdWxlLmV4cG9ydHMgPSB2aWRlb2pzO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwidmlkZW9qc1wiXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIChpZ25vcmVkKSAqL1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIG1pbi1kb2N1bWVudCAoaWdub3JlZClcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==