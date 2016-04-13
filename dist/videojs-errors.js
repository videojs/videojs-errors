/**
 * videojs-errors
 * @version 1.0.4
 * @copyright 2016 Brightcove
 * @license Apache-2.0
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.videojsErrors = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

// Default options for the plugin.
var defaults = {
  header: '',
  code: '',
  message: '',
  timeout: 45 * 1000,
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
    }
  }
};

/**
 * Monitors a player for signs of life during playback and
 * triggers PLAYER_ERR_TIMEOUT if none occur within a reasonable
 * timeframe.
 */
var monitorPlayback = function monitorPlayback(player, options) {
  var monitor = undefined;

  // clears the previous monitor timeout and sets up a new one
  var resetMonitor = function resetMonitor() {
    window.clearTimeout(monitor);
    monitor = window.setTimeout(function () {
      if (player.error() || player.paused() || player.ended()) {
        // never overwrite existing errors or display a new one
        // if the player is paused or ended.
        return;
      }

      player.error({
        code: -2,
        type: 'PLAYER_ERR_TIMEOUT'
      });
    }, options.timeout);

    // clear out any existing player timeout
    if (player.error() && player.error().code === -2) {
      player.error(null);
    }
  };

  var listeners = [];

  // clear any previously registered listeners
  var cleanup = function cleanup() {
    var listener = undefined;

    while (listeners.length) {
      listener = listeners.shift();
      player.off(listener[0], listener[1]);
    }
    window.clearTimeout(monitor);
  };

  // creates and tracks a player listener if the player looks alive
  var healthcheck = function healthcheck(type, fn) {
    var check = function check() {
      // playback isn't expected if the player is paused, shut
      // down monitoring
      if (player.paused()) {
        return cleanup();
      }
      // playback isn't expected once the video has ended
      if (player.ended()) {
        return cleanup();
      }
      fn.call(this);
    };

    player.on(type, check);
    listeners.push([type, check]);
  };

  player.on('play', function () {
    var lastTime = 0;

    cleanup();

    // if no playback is detected for long enough, trigger a timeout error
    resetMonitor();
    healthcheck(['timeupdate', 'adtimeupdate'], function () {
      var currentTime = player.currentTime();

      if (currentTime !== lastTime) {
        lastTime = currentTime;
        resetMonitor();
      }
    });
    healthcheck('progress', resetMonitor);
  });

  player.on('dispose', function () {
    cleanup();
  });
};

// Setup Custom Error Conditions
var initCustomErrorConditions = function initCustomErrorConditions(player, options) {

  // PLAYER_ERR_TIMEOUT
  monitorPlayback(player, options);

  // PLAYER_ERR_NO_SRC
  player.on('play', function () {
    if (!player.currentSrc()) {
      player.error({
        code: -1,
        type: 'PLAYER_ERR_NO_SRC'
      });
    }
  });
};

/**
 * Set up the plugin.
 */
var onPlayerReady = function onPlayerReady(player, options) {

  player.addClass('vjs-errors');

  // Add to the error dialog when an error occurs
  player.on('error', function () {
    var display = undefined;
    var details = '';
    var error = player.error();
    var content = document.createElement('div');

    // In the rare case when `error()` does not return an error object,
    // defensively escape the handler function.
    if (!error) {
      return;
    }

    error = _videoJs2['default'].mergeOptions(error, options.errors[error.code || 0]);

    if (error.message) {
      details = '<div class="vjs-errors-details">' + player.localize('Technical details') + '\n        : <div class="vjs-errors-message">' + player.localize(error.message) + '</div>\n        </div>';
    }

    display = player.errorDisplay;

    content.className = 'vjs-errors-dialog';
    content.innerHTML = '<button class="vjs-errors-close-button"></button>\n        <div class="vjs-errors-content-container">\n          <h2 class="vjs-errors-headline">' + this.localize(error.headline) + '</h2>\n          <div><b>' + this.localize('Error Code') + '</b>: ' + (error.type || error.code) + '</div>\n          ' + details + '\n        </div>\n        <div class="vjs-errors-ok-button-container">\n          <button class="vjs-errors-ok-button">' + this.localize('OK') + '</button>\n        </div>';

    display.fillWith(content);

    if (player.width() <= 600 || player.height() <= 250) {
      display.addClass('vjs-xs');
    }

    var closeButton = display.el().querySelector('.vjs-errors-close-button');
    var okButton = display.el().querySelector('.vjs-errors-ok-button');

    _videoJs2['default'].on(closeButton, 'click', function () {
      display.close();
    });
    _videoJs2['default'].on(okButton, 'click', function () {
      display.close();
    });
  });

  // Initialize custom error conditions
  initCustomErrorConditions(player, options);
};

/**
 * Initialize the plugin. Waits until the player is ready to do anything.
 */
var errors = function errors(options) {
  var _this = this;

  this.ready(function () {
    onPlayerReady(_this, _videoJs2['default'].mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
_videoJs2['default'].plugin('errors', errors);

exports['default'] = errors;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});