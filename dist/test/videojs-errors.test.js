(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require(3);

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

},{"3":3}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _interopDefault(ex) {
  return ex && (typeof ex === 'undefined' ? 'undefined' : _typeof(ex)) === 'object' && 'default' in ex ? ex['default'] : ex;
}

var document = _interopDefault(require(1));
var QUnit = _interopDefault((typeof window !== "undefined" ? window['QUnit'] : typeof global !== "undefined" ? global['QUnit'] : null));
var sinon = _interopDefault((typeof window !== "undefined" ? window['sinon'] : typeof global !== "undefined" ? global['sinon'] : null));
var videojs = _interopDefault((typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null));
var window = _interopDefault(require(2));

var FlashObj = videojs.getComponent('Flash');
var defaultDismiss = !videojs.browser.IS_IPHONE;

// Video.js 5/6 cross-compatibility.
var registerPlugin = videojs.registerPlugin || videojs.plugin;

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
    window.clearTimeout(monitor);
    monitor = window.setTimeout(function () {
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
    window.clearTimeout(monitor);
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
    var content = document.createElement('div');
    var dialogContent = '';

    // In the rare case when `error()` does not return an error object,
    // defensively escape the handler function.
    if (!error) {
      return;
    }

    error = videojs.mergeOptions(error, options.errors[error.code || 0]);

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
    initPlugin(player, videojs.mergeOptions(defaults, newOptions));
  };

  reInitPlugin.extend = function (errors) {
    options.errors = videojs.mergeOptions(options.errors, errors);
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
  initPlugin(this, videojs.mergeOptions(defaults, options));
};

// Register the plugin with video.js.
registerPlugin('errors', errors);

var Player = videojs.getComponent('Player');

var sources = [{
  src: 'movie.mp4',
  type: 'video/mp4'
}, {
  src: 'movie.webm',
  type: 'video/webm'
}];

QUnit.test('the environment is sane', function (assert) {
  assert.strictEqual(_typeof(Array.isArray), 'function', 'es5 exists');
  assert.strictEqual(typeof sinon === 'undefined' ? 'undefined' : _typeof(sinon), 'object', 'sinon exists');
  assert.strictEqual(typeof videojs === 'undefined' ? 'undefined' : _typeof(videojs), 'function', 'videojs exists');
  assert.strictEqual(typeof errors === 'undefined' ? 'undefined' : _typeof(errors), 'function', 'plugin is a function');
});

QUnit.module('videojs-errors', {
  beforeEach: function beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5.
    this.clock = sinon.useFakeTimers();
    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);

    this.player.buffered = function () {
      return videojs.createTimeRange(0, 0);
    };
    this.player.paused = function () {
      return false;
    };
    this.player.pause = function () {
      return false;
    };

    // initialize the plugin with the default options
    this.player.errors();
    this.errorDisplay = this.player.getChild('errorDisplay');

    // Tick forward so the player is ready.
    this.clock.tick(1);
  },
  afterEach: function afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

QUnit.test('registers itself with video.js', function (assert) {
  assert.expect(2);

  assert.strictEqual(_typeof(Player.prototype.errors), 'function', 'videojs-errors plugin was registered');

  this.player.errors();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  assert.ok(this.player.hasClass('vjs-errors'), 'the plugin adds a class to the player');
});

QUnit.test('play() without a src is an error', function (assert) {
  var errors$$1 = 0;

  this.player.on('error', function () {
    errors$$1++;
  });
  this.player.trigger('play');

  assert.strictEqual(errors$$1, 1, 'emitted an error');
  assert.strictEqual(this.player.error().code, -1, 'error code is -1');
  assert.strictEqual(this.player.error().type, 'PLAYER_ERR_NO_SRC', 'error type is no source');
});

QUnit.test('no progress for 45 seconds is an error', function (assert) {
  var errors$$1 = 0;

  this.player.on('error', function () {
    errors$$1++;
  });
  this.player.src(sources);
  this.player.trigger('play');
  this.clock.tick(45 * 1000);

  assert.strictEqual(errors$$1, 1, 'emitted an error');
  assert.strictEqual(this.player.error().code, -2, 'error code is -2');
  assert.strictEqual(this.player.error().type, 'PLAYER_ERR_TIMEOUT');
});

QUnit.test('when progress watching is disabled, progress within 45 seconds is an error', function (assert) {
  var errors$$1 = 0;

  this.player.errors.disableProgress(true);

  this.player.on('error', function () {
    errors$$1++;
  });
  this.player.src(sources);
  this.player.trigger('play');
  this.clock.tick(40 * 1000);
  this.player.trigger('progress');
  this.clock.tick(5 * 1000);

  assert.strictEqual(errors$$1, 1, 'emitted an error');
  assert.strictEqual(this.player.error().code, -2, 'error code is -2');
  assert.strictEqual(this.player.error().type, 'PLAYER_ERR_TIMEOUT');

  this.player.errors.disableProgress(false);
});

QUnit.test('Flash API is unavailable when using Flash is an error', function (assert) {
  this.player.tech_.el_.type = 'application/x-shockwave-flash';
  // when Flash dies the object methods go away
  /* eslint-disable camelcase */
  this.player.tech_.el_.vjs_getProperty = null;
  /* eslint-enable camelcase */
  this.player.paused = function () {
    return true;
  };

  var errors$$1 = 0;

  this.player.on('error', function () {
    errors$$1++;
  });
  this.player.src(sources);
  this.player.trigger('play');
  this.player.trigger('timeupdate');

  assert.strictEqual(errors$$1, 1, 'emitted an error');
  assert.strictEqual(this.player.error().code, -2, 'error code is -2');
  assert.strictEqual(this.player.error().type, 'PLAYER_ERR_TIMEOUT');
});

QUnit.test('the plugin cleans up after its previous incarnation when called again', function (assert) {
  var errors$$1 = 0;

  this.player.on('error', function () {
    return errors$$1++;
  });

  // Call plugin multiple times
  this.player.errors();
  this.player.errors();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  this.player.trigger('play');

  assert.strictEqual(errors$$1, 1, 'emitted a single error');
  assert.strictEqual(this.player.error().code, -1, 'error code is -1');
  assert.strictEqual(this.player.error().type, 'PLAYER_ERR_NO_SRC');
});

QUnit.test('when dispose is triggered should not throw error ', function (assert) {
  this.player.src(sources);
  this.player.trigger('play');
  this.player.trigger('dispose');
  this.clock.tick(45 * 1000);

  assert.ok(!this.player.error(), 'should not throw player error when dispose is called.');
});

QUnit.test('progress clears player timeout errors', function (assert) {
  var errors$$1 = 0;

  this.player.on('error', function () {
    errors$$1++;
  });
  this.player.src(sources);
  this.player.trigger('play');

  this.clock.tick(45 * 1000);

  assert.strictEqual(errors$$1, 1, 'emitted an error');
  assert.strictEqual(this.player.error().code, -2, 'error code is -2');
  assert.strictEqual(this.player.error().type, 'PLAYER_ERR_TIMEOUT');

  this.player.trigger('progress');
  assert.strictEqual(this.player.error(), null, 'error removed');
});

// safari 7 on OSX can emit stalls when playback is just fine
QUnit.test('stalling by itself is not an error', function (assert) {
  this.player.src(sources);
  this.player.trigger('play');
  this.player.trigger('stalled');

  assert.ok(!this.player.error(), 'no error fired');
});

QUnit.test('timing out multiple times only throws a single error', function (assert) {
  var errors$$1 = 0;

  this.player.on('error', function () {
    errors$$1++;
  });
  this.player.src(sources);
  this.player.trigger('play');
  // trigger a player timeout
  this.clock.tick(45 * 1000);
  assert.strictEqual(errors$$1, 1, 'one error fired');

  // wait long enough for another timeout
  this.clock.tick(50 * 1000);
  assert.strictEqual(errors$$1, 1, 'only one error fired');
});

QUnit.test('progress events while playing reset the player timeout', function (assert) {
  var errors$$1 = 0;

  this.player.on('error', function () {
    errors$$1++;
  });
  this.player.src(sources);
  this.player.trigger('play');
  // stalled for awhile
  this.clock.tick(44 * 1000);
  // but playback resumes!
  this.player.trigger('progress');
  this.clock.tick(44 * 1000);

  assert.strictEqual(errors$$1, 0, 'no errors emitted');
});

QUnit.test('no signs of playback triggers a player timeout', function (assert) {
  var errors$$1 = 0;

  this.player.src(sources);
  this.player.on('error', function () {
    errors$$1++;
  });
  // swallow any timeupdate events
  this.player.on('timeupdate', function (event) {
    event.stopImmediatePropagation();
  });
  this.player.trigger('play');
  this.clock.tick(45 * 1000);

  assert.strictEqual(errors$$1, 1, 'emitted a single error');
  assert.strictEqual(this.player.error().code, -2, 'error code is -2');
  assert.strictEqual(this.player.error().type, 'PLAYER_ERR_TIMEOUT', 'type is player timeout');
});

QUnit.test('time changes while playing reset the player timeout', function (assert) {
  var errors$$1 = 0;

  this.player.src(sources);
  this.player.on('error', function () {
    errors$$1++;
  });
  this.player.trigger('play');
  this.clock.tick(44 * 1000);
  this.player.currentTime = function () {
    return 1;
  };
  this.player.trigger('timeupdate');
  this.clock.tick(10 * 1000);

  assert.strictEqual(errors$$1, 0, 'no error emitted');
});

QUnit.test('time changes while playing ads reset the player timeout', function (assert) {
  var errors$$1 = 0;

  this.player.src(sources);
  this.player.on('error', function () {
    errors$$1++;
  });
  this.player.trigger('play');
  this.clock.tick(44 * 1000);
  this.player.currentTime = function () {
    return 1;
  };
  this.player.trigger('adtimeupdate');
  this.clock.tick(10 * 1000);

  assert.strictEqual(errors$$1, 0, 'no error emitted');
});

QUnit.test('time changes after a player timeout clears the error', function (assert) {
  this.player.src(sources);
  this.player.trigger('play');
  this.clock.tick(45 * 1000);
  this.player.currentTime = function () {
    return 1;
  };
  this.player.trigger('timeupdate');

  assert.ok(!this.player.error(), 'cleared the timeout');
});

QUnit.test('player timeouts do not occur if the player is paused', function (assert) {
  var errors$$1 = 0;

  this.player.src(sources);
  this.player.on('error', function () {
    errors$$1++;
  });
  this.player.on('timeupdate', function (event) {
    event.stopImmediatePropagation();
  });
  this.player.trigger('play');
  // simulate a misbehaving player that doesn't fire `paused`
  this.player.paused = function () {
    return true;
  };
  this.clock.tick(45 * 1000);

  assert.strictEqual(errors$$1, 0, 'no error emitted');
});

// video.paused is false at the end of a video on IE11, Win8 RT
QUnit.test('player timeouts do not occur if the video is ended', function (assert) {
  var errors$$1 = 0;

  this.player.src(sources);
  this.player.on('error', function () {
    errors$$1++;
  });
  this.player.on('timeupdate', function (event) {
    event.stopImmediatePropagation();
  });
  this.player.trigger('play');
  // simulate a misbehaving player that doesn't fire `ended`
  this.player.ended = function () {
    return true;
  };
  this.clock.tick(45 * 1000);

  assert.strictEqual(errors$$1, 0, 'no error emitted');
});

QUnit.test('player timeouts do not overwrite existing errors', function (assert) {
  this.player.src(sources);
  this.player.trigger('play');
  this.player.error({
    type: 'custom',
    code: -7
  });
  this.clock.tick(45 * 1000);

  assert.strictEqual(-7, this.player.error().code, 'error was not overwritten');
});

QUnit.test('unrecognized error codes do not cause exceptions', function (assert) {
  var errors$$1 = 0;

  this.player.on('error', function () {
    errors$$1++;
  });
  this.player.error({
    code: 'something-custom-that-no-one-could-have-predicted',
    type: 'NOT_AN_ERROR_CONSTANT'
  });
  assert.ok(true, 'does not throw an exception');
  assert.strictEqual(errors$$1, 1, 'emitted an error');

  // intentionally missing properties
  this.player.error({});
  assert.ok(true, 'does not throw an exception');

  assert.strictEqual(errors$$1, 2, 'emitted an error');
});

QUnit.test('custom error details should override defaults', function (assert) {
  var customError = { headline: 'test headline', message: 'test details' };

  // initialize the plugin with custom options
  this.player.errors({ errors: { 4: customError } });
  // tick forward enough to ready the player
  this.clock.tick(1);
  // trigger the error in question
  this.player.error(4);
  // confirm results
  assert.strictEqual(this.errorDisplay.$('.vjs-errors-headline').textContent, customError.headline, 'headline should match custom override value');
  assert.strictEqual(this.errorDisplay.$('.vjs-errors-message').textContent, customError.message, 'message should match custom override value');
});

QUnit.test('Append Flash error details when flash is not supported', function (assert) {
  var Flash = videojs.getTech('Flash');

  // vjs6 won't have flash by default
  if (!Flash) {
    assert.notOk(Flash, 'flash tech not available, skipping unit test');
    return;
  }

  var oldIsSupported = videojs.getComponent('Flash').isSupported;

  // Mock up isSupported to be false
  videojs.getComponent('Flash').isSupported = function () {
    return false;
  };

  // tick forward enough to ready the player
  this.clock.tick(1);
  // trigger the error in question
  this.player.error(4);
  // confirm results
  assert.equal(this.errorDisplay.$('.vjs-errors-flashmessage').textContent, 'If you are using an older browser please try upgrading or installing Flash.', 'Flash Error message should be displayed');
  // Restoring isSupported to the old value
  videojs.getComponent('Flash').isSupported = oldIsSupported;
});

QUnit.test('default error is dismissible', function (assert) {
  // initialize the plugin
  this.player.errors();
  // tick forward enough to ready the player
  this.clock.tick(1);
  // trigger the error in question
  this.player.error(2);
  // confirm results
  assert.ok(this.errorDisplay.$('.vjs-errors-ok-button'), 'ok button is present');
  assert.ok(this.errorDisplay.$('.vjs-close-button'), 'close button is present');
});

QUnit.test('custom error is dismissible', function (assert) {
  var customErrorDismiss = {
    headline: 'test headline',
    message: 'test details',
    dismiss: true
  };

  // initialize the plugin with custom options
  this.player.errors({ errors: { 4: customErrorDismiss } });
  // tick forward enough to ready the player
  this.clock.tick(1);
  // trigger the error in question
  this.player.error(4);
  // confirm results
  assert.ok(this.errorDisplay.$('.vjs-errors-ok-button'), 'ok button is present');
  assert.ok(this.errorDisplay.$('.vjs-close-button'), 'close button is present');
});

QUnit.test('custom error is not dismissible', function (assert) {
  var customErrorNoDimiss = {
    headline: 'test headline',
    message: 'test details',
    dismiss: false
  };

  // initialize the plugin with custom options
  this.player.errors({ errors: { 4: customErrorNoDimiss } });
  // tick forward enough to ready the player
  this.clock.tick(1);
  // trigger the error in question
  this.player.error(4);
  // confirm results
  assert.ok(!this.errorDisplay.$('.vjs-errors-ok-button'), 'ok button is not present');
  assert.ok(!this.errorDisplay.$('.vjs-close-button'), 'close button is not present');
});

QUnit.test('custom errors can be added at runtime', function (assert) {
  this.player.errors();

  // tick forward enough to ready the player
  this.clock.tick(1);

  var error = {
    '-3': {
      type: 'TEST',
      headline: 'test',
      message: 'test test'
    }
  };

  this.player.errors.extend(error);

  this.player.error({ code: -3 });

  assert.strictEqual(this.player.errorDisplay.$('.vjs-errors-headline').textContent, error['-3'].headline, 'headline should match custom override value');

  assert.strictEqual(this.player.errorDisplay.$('.vjs-errors-message').textContent, error['-3'].message, 'message should match custom override value');
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"1":1,"2":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy92aWRlb2pzLXNwZWxsYm9vay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL2dsb2JhbC9kb2N1bWVudC5qcyIsIm5vZGVfbW9kdWxlcy9nbG9iYWwvd2luZG93LmpzIiwibm9kZV9tb2R1bGVzL3ZpZGVvanMtc3BlbGxib29rL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXJlc29sdmUvZW1wdHkuanMiLCJ0ZXN0L2luZGV4LnRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDYkE7OztBQ0FBOzs7O0FBRUEsU0FBUyxlQUFULENBQTBCLEVBQTFCLEVBQThCO0FBQUUsU0FBUSxNQUFPLFFBQU8sRUFBUCx5Q0FBTyxFQUFQLE9BQWMsUUFBckIsSUFBa0MsYUFBYSxFQUFoRCxHQUFzRCxHQUFHLFNBQUgsQ0FBdEQsR0FBc0UsRUFBN0U7QUFBa0Y7O0FBRWxILElBQUksV0FBVyxnQkFBZ0IsUUFBUSxpQkFBUixDQUFoQixDQUFmO0FBQ0EsSUFBSSxRQUFRLGdCQUFnQixRQUFRLE9BQVIsQ0FBaEIsQ0FBWjtBQUNBLElBQUksUUFBUSxnQkFBZ0IsUUFBUSxPQUFSLENBQWhCLENBQVo7QUFDQSxJQUFJLFVBQVUsZ0JBQWdCLFFBQVEsVUFBUixDQUFoQixDQUFkO0FBQ0EsSUFBSSxTQUFTLGdCQUFnQixRQUFRLGVBQVIsQ0FBaEIsQ0FBYjs7QUFFQSxJQUFNLFdBQVcsUUFBUSxZQUFSLENBQXFC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LElBQU4sRUFBWSxRQUZkLEVBR0UsNkNBSEY7O0FBTUEsU0FBTyxXQUFQLENBQ0UsS0FBSyxNQUFMLENBQVksWUFBWixDQUF5QixDQUF6QixDQUEyQixxQkFBM0IsRUFBa0QsV0FEcEQsRUFFRSxNQUFNLElBQU4sRUFBWSxPQUZkLEVBR0UsNENBSEY7QUFLRCxDQTdCRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgdG9wTGV2ZWwgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6XG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB7fVxudmFyIG1pbkRvYyA9IHJlcXVpcmUoJ21pbi1kb2N1bWVudCcpO1xuXG52YXIgZG9jY3k7XG5cbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZG9jY3kgPSBkb2N1bWVudDtcbn0gZWxzZSB7XG4gICAgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddO1xuXG4gICAgaWYgKCFkb2NjeSkge1xuICAgICAgICBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J10gPSBtaW5Eb2M7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRvY2N5O1xuIiwidmFyIHdpbjtcblxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB3aW4gPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB3aW4gPSBnbG9iYWw7XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICB3aW4gPSBzZWxmO1xufSBlbHNlIHtcbiAgICB3aW4gPSB7fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB3aW47XG4iLCIiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wRGVmYXVsdCAoZXgpIHsgcmV0dXJuIChleCAmJiAodHlwZW9mIGV4ID09PSAnb2JqZWN0JykgJiYgJ2RlZmF1bHQnIGluIGV4KSA/IGV4WydkZWZhdWx0J10gOiBleDsgfVxuXG52YXIgZG9jdW1lbnQgPSBfaW50ZXJvcERlZmF1bHQocmVxdWlyZSgnZ2xvYmFsL2RvY3VtZW50JykpO1xudmFyIFFVbml0ID0gX2ludGVyb3BEZWZhdWx0KHJlcXVpcmUoJ3F1bml0JykpO1xudmFyIHNpbm9uID0gX2ludGVyb3BEZWZhdWx0KHJlcXVpcmUoJ3Npbm9uJykpO1xudmFyIHZpZGVvanMgPSBfaW50ZXJvcERlZmF1bHQocmVxdWlyZSgndmlkZW8uanMnKSk7XG52YXIgd2luZG93ID0gX2ludGVyb3BEZWZhdWx0KHJlcXVpcmUoJ2dsb2JhbC93aW5kb3cnKSk7XG5cbmNvbnN0IEZsYXNoT2JqID0gdmlkZW9qcy5nZXRDb21wb25lbnQoJ0ZsYXNoJyk7XG5jb25zdCBkZWZhdWx0RGlzbWlzcyA9ICF2aWRlb2pzLmJyb3dzZXIuSVNfSVBIT05FO1xuXG4vLyBWaWRlby5qcyA1LzYgY3Jvc3MtY29tcGF0aWJpbGl0eS5cbmNvbnN0IHJlZ2lzdGVyUGx1Z2luID0gdmlkZW9qcy5yZWdpc3RlclBsdWdpbiB8fCB2aWRlb2pzLnBsdWdpbjtcblxuLy8gRGVmYXVsdCBvcHRpb25zIGZvciB0aGUgcGx1Z2luLlxuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGhlYWRlcjogJycsXG4gIGNvZGU6ICcnLFxuICBtZXNzYWdlOiAnJyxcbiAgdGltZW91dDogNDUgKiAxMDAwLFxuICBkaXNtaXNzOiBkZWZhdWx0RGlzbWlzcyxcbiAgcHJvZ3Jlc3NEaXNhYmxlZDogZmFsc2UsXG4gIGVycm9yczoge1xuICAgICcxJzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9BQk9SVEVEJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhlIHZpZGVvIGRvd25sb2FkIHdhcyBjYW5jZWxsZWQnXG4gICAgfSxcbiAgICAnMic6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfTkVUV09SSycsXG4gICAgICBoZWFkbGluZTogJ1RoZSB2aWRlbyBjb25uZWN0aW9uIHdhcyBsb3N0LCBwbGVhc2UgY29uZmlybSB5b3UgYXJlICcgK1xuICAgICAgICAgICAgICAgICdjb25uZWN0ZWQgdG8gdGhlIGludGVybmV0J1xuICAgIH0sXG4gICAgJzMnOiB7XG4gICAgICB0eXBlOiAnTUVESUFfRVJSX0RFQ09ERScsXG4gICAgICBoZWFkbGluZTogJ1RoZSB2aWRlbyBpcyBiYWQgb3IgaW4gYSBmb3JtYXQgdGhhdCBjYW5ub3QgYmUgcGxheWVkIG9uIHlvdXIgYnJvd3NlcidcbiAgICB9LFxuICAgICc0Jzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9TUkNfTk9UX1NVUFBPUlRFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoaXMgdmlkZW8gaXMgZWl0aGVyIHVuYXZhaWxhYmxlIG9yIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJ1xuICAgIH0sXG4gICAgJzUnOiB7XG4gICAgICB0eXBlOiAnTUVESUFfRVJSX0VOQ1JZUFRFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoZSB2aWRlbyB5b3UgYXJlIHRyeWluZyB0byB3YXRjaCBpcyBlbmNyeXB0ZWQgYW5kIHdlIGRvIG5vdCBrbm93IGhvdyAnICtcbiAgICAgICAgICAgICAgICAndG8gZGVjcnlwdCBpdCdcbiAgICB9LFxuICAgICd1bmtub3duJzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9VTktOT1dOJyxcbiAgICAgIGhlYWRsaW5lOiAnQW4gdW5hbnRpY2lwYXRlZCBwcm9ibGVtIHdhcyBlbmNvdW50ZXJlZCwgY2hlY2sgYmFjayBzb29uIGFuZCB0cnkgYWdhaW4nXG4gICAgfSxcbiAgICAnLTEnOiB7XG4gICAgICB0eXBlOiAnUExBWUVSX0VSUl9OT19TUkMnLFxuICAgICAgaGVhZGxpbmU6ICdObyB2aWRlbyBoYXMgYmVlbiBsb2FkZWQnXG4gICAgfSxcbiAgICAnLTInOiB7XG4gICAgICB0eXBlOiAnUExBWUVSX0VSUl9USU1FT1VUJyxcbiAgICAgIGhlYWRsaW5lOiAnQ291bGQgbm90IGRvd25sb2FkIHRoZSB2aWRlbydcbiAgICB9LFxuICAgICctMyc6IHtcbiAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX0RPTUFJTl9SRVNUUklDVEVEJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhpcyB2aWRlbyBpcyByZXN0cmljdGVkIGZyb20gcGxheWluZyBvbiB5b3VyIGN1cnJlbnQgZG9tYWluJ1xuICAgIH0sXG4gICAgJy00Jzoge1xuICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfSVBfUkVTVFJJQ1RFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoaXMgdmlkZW8gaXMgcmVzdHJpY3RlZCBhdCB5b3VyIGN1cnJlbnQgSVAgYWRkcmVzcydcbiAgICB9LFxuICAgICctNSc6IHtcbiAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX0dFT19SRVNUUklDVEVEJyxcbiAgICAgIGhlYWRsaW5lOiAnVGhpcyB2aWRlbyBpcyByZXN0cmljdGVkIGZyb20gcGxheWluZyBpbiB5b3VyIGN1cnJlbnQgZ2VvZ3JhcGhpYyByZWdpb24nXG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIE1vbml0b3JzIGEgcGxheWVyIGZvciBzaWducyBvZiBsaWZlIGR1cmluZyBwbGF5YmFjayBhbmRcbiAqIHRyaWdnZXJzIFBMQVlFUl9FUlJfVElNRU9VVCBpZiBub25lIG9jY3VyIHdpdGhpbiBhIHJlYXNvbmFibGVcbiAqIHRpbWVmcmFtZS5cbiAqL1xuY29uc3QgaW5pdFBsdWdpbiA9IGZ1bmN0aW9uKHBsYXllciwgb3B0aW9ucykge1xuICBsZXQgbW9uaXRvcjtcbiAgY29uc3QgbGlzdGVuZXJzID0gW107XG5cbiAgLy8gY2xlYXJzIHRoZSBwcmV2aW91cyBtb25pdG9yIHRpbWVvdXQgYW5kIHNldHMgdXAgYSBuZXcgb25lXG4gIGNvbnN0IHJlc2V0TW9uaXRvciA9IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQobW9uaXRvcik7XG4gICAgbW9uaXRvciA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgLy8gcGxheWVyIGFscmVhZHkgaGFzIGFuIGVycm9yXG4gICAgICAvLyBvciBpcyBub3QgcGxheWluZyB1bmRlciBub3JtYWwgY29uZGl0aW9uc1xuICAgICAgaWYgKHBsYXllci5lcnJvcigpIHx8IHBsYXllci5wYXVzZWQoKSB8fCBwbGF5ZXIuZW5kZWQoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHBsYXllci5lcnJvcih7XG4gICAgICAgIGNvZGU6IC0yLFxuICAgICAgICB0eXBlOiAnUExBWUVSX0VSUl9USU1FT1VUJ1xuICAgICAgfSk7XG4gICAgfSwgb3B0aW9ucy50aW1lb3V0KTtcblxuICAgIC8vIGNsZWFyIG91dCBhbnkgZXhpc3RpbmcgcGxheWVyIHRpbWVvdXRcbiAgICAvLyBwbGF5YmFjayBoYXMgcmVjb3ZlcmVkXG4gICAgaWYgKHBsYXllci5lcnJvcigpICYmIHBsYXllci5lcnJvcigpLmNvZGUgPT09IC0yKSB7XG4gICAgICBwbGF5ZXIuZXJyb3IobnVsbCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGNsZWFyIGFueSBwcmV2aW91c2x5IHJlZ2lzdGVyZWQgbGlzdGVuZXJzXG4gIGNvbnN0IGNsZWFudXAgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGlzdGVuZXI7XG5cbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgbGlzdGVuZXIgPSBsaXN0ZW5lcnMuc2hpZnQoKTtcbiAgICAgIHBsYXllci5vZmYobGlzdGVuZXJbMF0sIGxpc3RlbmVyWzFdKTtcbiAgICB9XG4gICAgd2luZG93LmNsZWFyVGltZW91dChtb25pdG9yKTtcbiAgfTtcblxuICAvLyBjcmVhdGVzIGFuZCB0cmFja3MgYSBwbGF5ZXIgbGlzdGVuZXIgaWYgdGhlIHBsYXllciBsb29rcyBhbGl2ZVxuICBjb25zdCBoZWFsdGhjaGVjayA9IGZ1bmN0aW9uKHR5cGUsIGZuKSB7XG4gICAgY29uc3QgY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGlmIHRoZXJlJ3MgYW4gZXJyb3IgZG8gbm90IHJlc2V0IHRoZSBtb25pdG9yIGFuZFxuICAgICAgLy8gY2xlYXIgdGhlIGVycm9yIHVubGVzcyB0aW1lIGlzIHByb2dyZXNzaW5nXG4gICAgICBpZiAoIXBsYXllci5lcnJvcigpKSB7XG4gICAgICAgIC8vIGVycm9yIGlmIHVzaW5nIEZsYXNoIGFuZCBpdHMgQVBJIGlzIHVuYXZhaWxhYmxlXG4gICAgICAgIGNvbnN0IHRlY2ggPSBwbGF5ZXIuJCgnLnZqcy10ZWNoJyk7XG5cbiAgICAgICAgaWYgKHRlY2ggJiZcbiAgICAgICAgICAgIHRlY2gudHlwZSA9PT0gJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJyAmJlxuICAgICAgICAgICAgIXRlY2gudmpzX2dldFByb3BlcnR5KSB7XG4gICAgICAgICAgcGxheWVyLmVycm9yKHtcbiAgICAgICAgICAgIGNvZGU6IC0yLFxuICAgICAgICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfVElNRU9VVCdcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwbGF5YmFjayBpc24ndCBleHBlY3RlZCBpZiB0aGUgcGxheWVyIGlzIHBhdXNlZFxuICAgICAgICBpZiAocGxheWVyLnBhdXNlZCgpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc2V0TW9uaXRvcigpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHBsYXliYWNrIGlzbid0IGV4cGVjdGVkIG9uY2UgdGhlIHZpZGVvIGhhcyBlbmRlZFxuICAgICAgICBpZiAocGxheWVyLmVuZGVkKCkpIHtcbiAgICAgICAgICByZXR1cm4gcmVzZXRNb25pdG9yKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm4uY2FsbCh0aGlzKTtcbiAgICB9O1xuXG4gICAgcGxheWVyLm9uKHR5cGUsIGNoZWNrKTtcbiAgICBsaXN0ZW5lcnMucHVzaChbdHlwZSwgY2hlY2tdKTtcbiAgfTtcblxuICBjb25zdCBvblBsYXlTdGFydE1vbml0b3IgPSBmdW5jdGlvbigpIHtcbiAgICBsZXQgbGFzdFRpbWUgPSAwO1xuXG4gICAgY2xlYW51cCgpO1xuXG4gICAgLy8gaWYgbm8gcGxheWJhY2sgaXMgZGV0ZWN0ZWQgZm9yIGxvbmcgZW5vdWdoLCB0cmlnZ2VyIGEgdGltZW91dCBlcnJvclxuICAgIHJlc2V0TW9uaXRvcigpO1xuICAgIGhlYWx0aGNoZWNrKFsndGltZXVwZGF0ZScsICdhZHRpbWV1cGRhdGUnXSwgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zdCBjdXJyZW50VGltZSA9IHBsYXllci5jdXJyZW50VGltZSgpO1xuXG4gICAgICAvLyBwbGF5YmFjayBpcyBvcGVyYXRpbmcgbm9ybWFsbHkgb3IgaGFzIHJlY292ZXJlZFxuICAgICAgaWYgKGN1cnJlbnRUaW1lICE9PSBsYXN0VGltZSkge1xuICAgICAgICBsYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgICAgICByZXNldE1vbml0b3IoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICghb3B0aW9ucy5wcm9ncmVzc0Rpc2FibGVkKSB7XG4gICAgICBoZWFsdGhjaGVjaygncHJvZ3Jlc3MnLCByZXNldE1vbml0b3IpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBvblBsYXlOb1NvdXJjZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghcGxheWVyLmN1cnJlbnRTcmMoKSkge1xuICAgICAgcGxheWVyLmVycm9yKHtcbiAgICAgICAgY29kZTogLTEsXG4gICAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX05PX1NSQydcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBvbkVycm9ySGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBkZXRhaWxzID0gJyc7XG4gICAgbGV0IGVycm9yID0gcGxheWVyLmVycm9yKCk7XG4gICAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxldCBkaWFsb2dDb250ZW50ID0gJyc7XG5cbiAgICAvLyBJbiB0aGUgcmFyZSBjYXNlIHdoZW4gYGVycm9yKClgIGRvZXMgbm90IHJldHVybiBhbiBlcnJvciBvYmplY3QsXG4gICAgLy8gZGVmZW5zaXZlbHkgZXNjYXBlIHRoZSBoYW5kbGVyIGZ1bmN0aW9uLlxuICAgIGlmICghZXJyb3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBlcnJvciA9IHZpZGVvanMubWVyZ2VPcHRpb25zKGVycm9yLCBvcHRpb25zLmVycm9yc1tlcnJvci5jb2RlIHx8IDBdKTtcblxuICAgIGlmIChlcnJvci5tZXNzYWdlKSB7XG4gICAgICBkZXRhaWxzID0gYDxkaXYgY2xhc3M9XCJ2anMtZXJyb3JzLWRldGFpbHNcIj4ke3BsYXllci5sb2NhbGl6ZSgnVGVjaG5pY2FsIGRldGFpbHMnKX1cbiAgICAgICAgOiA8ZGl2IGNsYXNzPVwidmpzLWVycm9ycy1tZXNzYWdlXCI+JHtwbGF5ZXIubG9jYWxpemUoZXJyb3IubWVzc2FnZSl9PC9kaXY+XG4gICAgICAgIDwvZGl2PmA7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yLmNvZGUgPT09IDQgJiYgRmxhc2hPYmogJiYgIUZsYXNoT2JqLmlzU3VwcG9ydGVkKCkpIHtcbiAgICAgIGNvbnN0IGZsYXNoTWVzc2FnZSA9IHBsYXllci5sb2NhbGl6ZSgnSWYgeW91IGFyZSB1c2luZyBhbiBvbGRlciBicm93c2VyIHBsZWFzZSB0cnkgdXBncmFkaW5nIG9yIGluc3RhbGxpbmcgRmxhc2guJyk7XG5cbiAgICAgIGRldGFpbHMgKz0gYDxzcGFuIGNsYXNzPVwidmpzLWVycm9ycy1mbGFzaG1lc3NhZ2VcIj4ke2ZsYXNoTWVzc2FnZX08L3NwYW4+YDtcbiAgICB9XG5cbiAgICBjb25zdCBkaXNwbGF5ID0gcGxheWVyLmdldENoaWxkKCdlcnJvckRpc3BsYXknKTtcblxuICAgIGNvbnRlbnQuY2xhc3NOYW1lID0gJ3Zqcy1lcnJvcnMtZGlhbG9nJztcbiAgICBjb250ZW50LmlkID0gJ3Zqcy1lcnJvcnMtZGlhbG9nJztcbiAgICBkaWFsb2dDb250ZW50ID1cbiAgICAgYDxkaXYgY2xhc3M9XCJ2anMtZXJyb3JzLWNvbnRlbnQtY29udGFpbmVyXCI+XG4gICAgICA8aDIgY2xhc3M9XCJ2anMtZXJyb3JzLWhlYWRsaW5lXCI+JHt0aGlzLmxvY2FsaXplKGVycm9yLmhlYWRsaW5lKX08L2gyPlxuICAgICAgICA8ZGl2PjxiPiR7dGhpcy5sb2NhbGl6ZSgnRXJyb3IgQ29kZScpfTwvYj46ICR7KGVycm9yLnR5cGUgfHwgZXJyb3IuY29kZSl9PC9kaXY+XG4gICAgICAgICR7ZGV0YWlsc31cbiAgICAgIDwvZGl2PmA7XG5cbiAgICBjb25zdCBjbG9zZWFibGUgPSBkaXNwbGF5LmNsb3NlYWJsZSghKCdkaXNtaXNzJyBpbiBlcnJvcikgfHwgZXJyb3IuZGlzbWlzcyk7XG5cbiAgICAvLyBXZSBzaG91bGQgZ2V0IGEgY2xvc2UgYnV0dG9uXG4gICAgaWYgKGNsb3NlYWJsZSkge1xuICAgICAgZGlhbG9nQ29udGVudCArPVxuICAgICAgIGA8ZGl2IGNsYXNzPVwidmpzLWVycm9ycy1vay1idXR0b24tY29udGFpbmVyXCI+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInZqcy1lcnJvcnMtb2stYnV0dG9uXCI+JHt0aGlzLmxvY2FsaXplKCdPSycpfTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5gO1xuICAgICAgY29udGVudC5pbm5lckhUTUwgPSBkaWFsb2dDb250ZW50O1xuICAgICAgZGlzcGxheS5maWxsV2l0aChjb250ZW50KTtcbiAgICAgIC8vIEdldCB0aGUgY2xvc2UgYnV0dG9uIGluc2lkZSB0aGUgZXJyb3IgZGlzcGxheVxuICAgICAgZGlzcGxheS5jb250ZW50RWwoKS5maXJzdENoaWxkLmFwcGVuZENoaWxkKGRpc3BsYXkuZ2V0Q2hpbGQoJ2Nsb3NlQnV0dG9uJykuZWwoKSk7XG5cbiAgICAgIGNvbnN0IG9rQnV0dG9uID0gZGlzcGxheS5lbCgpLnF1ZXJ5U2VsZWN0b3IoJy52anMtZXJyb3JzLW9rLWJ1dHRvbicpO1xuXG4gICAgICBwbGF5ZXIub24ob2tCdXR0b24sICdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICBkaXNwbGF5LmNsb3NlKCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudC5pbm5lckhUTUwgPSBkaWFsb2dDb250ZW50O1xuICAgICAgZGlzcGxheS5maWxsV2l0aChjb250ZW50KTtcbiAgICB9XG5cbiAgICBpZiAocGxheWVyLmN1cnJlbnRXaWR0aCgpIDw9IDYwMCB8fCBwbGF5ZXIuY3VycmVudEhlaWdodCgpIDw9IDI1MCkge1xuICAgICAgZGlzcGxheS5hZGRDbGFzcygndmpzLXhzJyk7XG4gICAgfVxuXG4gICAgZGlzcGxheS5vbmUoJ21vZGFsY2xvc2UnLCAoKSA9PiBwbGF5ZXIuZXJyb3IobnVsbCkpO1xuICB9O1xuXG4gIGNvbnN0IG9uRGlzcG9zZUhhbmRsZXIgPSBmdW5jdGlvbigpIHtcbiAgICBjbGVhbnVwKCk7XG5cbiAgICBwbGF5ZXIucmVtb3ZlQ2xhc3MoJ3Zqcy1lcnJvcnMnKTtcbiAgICBwbGF5ZXIub2ZmKCdwbGF5Jywgb25QbGF5U3RhcnRNb25pdG9yKTtcbiAgICBwbGF5ZXIub2ZmKCdwbGF5Jywgb25QbGF5Tm9Tb3VyY2UpO1xuICAgIHBsYXllci5vZmYoJ2Rpc3Bvc2UnLCBvbkRpc3Bvc2VIYW5kbGVyKTtcbiAgICBwbGF5ZXIub2ZmKCdlcnJvcicsIG9uRXJyb3JIYW5kbGVyKTtcbiAgfTtcblxuICBjb25zdCByZUluaXRQbHVnaW4gPSBmdW5jdGlvbihuZXdPcHRpb25zKSB7XG4gICAgb25EaXNwb3NlSGFuZGxlcigpO1xuICAgIGluaXRQbHVnaW4ocGxheWVyLCB2aWRlb2pzLm1lcmdlT3B0aW9ucyhkZWZhdWx0cywgbmV3T3B0aW9ucykpO1xuICB9O1xuXG4gIHJlSW5pdFBsdWdpbi5leHRlbmQgPSBmdW5jdGlvbihlcnJvcnMpIHtcbiAgICBvcHRpb25zLmVycm9ycyA9IHZpZGVvanMubWVyZ2VPcHRpb25zKG9wdGlvbnMuZXJyb3JzLCBlcnJvcnMpO1xuICB9O1xuXG4gIHJlSW5pdFBsdWdpbi5kaXNhYmxlUHJvZ3Jlc3MgPSBmdW5jdGlvbihkaXNhYmxlZCkge1xuICAgIG9wdGlvbnMucHJvZ3Jlc3NEaXNhYmxlZCA9IGRpc2FibGVkO1xuICAgIG9uUGxheVN0YXJ0TW9uaXRvcigpO1xuICB9O1xuXG4gIHBsYXllci5vbigncGxheScsIG9uUGxheVN0YXJ0TW9uaXRvcik7XG4gIHBsYXllci5vbigncGxheScsIG9uUGxheU5vU291cmNlKTtcbiAgcGxheWVyLm9uKCdkaXNwb3NlJywgb25EaXNwb3NlSGFuZGxlcik7XG4gIHBsYXllci5vbignZXJyb3InLCBvbkVycm9ySGFuZGxlcik7XG5cbiAgcGxheWVyLnJlYWR5KCgpID0+IHtcbiAgICBwbGF5ZXIuYWRkQ2xhc3MoJ3Zqcy1lcnJvcnMnKTtcbiAgfSk7XG5cbiAgcGxheWVyLmVycm9ycyA9IHJlSW5pdFBsdWdpbjtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgcGx1Z2luLiBXYWl0cyB1bnRpbCB0aGUgcGxheWVyIGlzIHJlYWR5IHRvIGRvIGFueXRoaW5nLlxuICovXG5jb25zdCBlcnJvcnMgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIGluaXRQbHVnaW4odGhpcywgdmlkZW9qcy5tZXJnZU9wdGlvbnMoZGVmYXVsdHMsIG9wdGlvbnMpKTtcbn07XG5cbi8vIFJlZ2lzdGVyIHRoZSBwbHVnaW4gd2l0aCB2aWRlby5qcy5cbnJlZ2lzdGVyUGx1Z2luKCdlcnJvcnMnLCBlcnJvcnMpO1xuXG5jb25zdCBQbGF5ZXIgPSB2aWRlb2pzLmdldENvbXBvbmVudCgnUGxheWVyJyk7XG5cbmNvbnN0IHNvdXJjZXMgPSBbe1xuICBzcmM6ICdtb3ZpZS5tcDQnLFxuICB0eXBlOiAndmlkZW8vbXA0J1xufSwge1xuICBzcmM6ICdtb3ZpZS53ZWJtJyxcbiAgdHlwZTogJ3ZpZGVvL3dlYm0nXG59XTtcblxuUVVuaXQudGVzdCgndGhlIGVudmlyb25tZW50IGlzIHNhbmUnLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKHR5cGVvZiBBcnJheS5pc0FycmF5LCAnZnVuY3Rpb24nLCAnZXM1IGV4aXN0cycpO1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodHlwZW9mIHNpbm9uLCAnb2JqZWN0JywgJ3Npbm9uIGV4aXN0cycpO1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodHlwZW9mIHZpZGVvanMsICdmdW5jdGlvbicsICd2aWRlb2pzIGV4aXN0cycpO1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodHlwZW9mIGVycm9ycywgJ2Z1bmN0aW9uJywgJ3BsdWdpbiBpcyBhIGZ1bmN0aW9uJyk7XG59KTtcblxuUVVuaXQubW9kdWxlKCd2aWRlb2pzLWVycm9ycycsIHtcblxuICBiZWZvcmVFYWNoKCkge1xuXG4gICAgLy8gTW9jayB0aGUgZW52aXJvbm1lbnQncyB0aW1lcnMgYmVjYXVzZSBjZXJ0YWluIHRoaW5ncyAtIHBhcnRpY3VsYXJseVxuICAgIC8vIHBsYXllciByZWFkaW5lc3MgLSBhcmUgYXN5bmNocm9ub3VzIGluIHZpZGVvLmpzIDUuXG4gICAgdGhpcy5jbG9jayA9IHNpbm9uLnVzZUZha2VUaW1lcnMoKTtcbiAgICB0aGlzLmZpeHR1cmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncXVuaXQtZml4dHVyZScpO1xuICAgIHRoaXMudmlkZW8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpO1xuICAgIHRoaXMuZml4dHVyZS5hcHBlbmRDaGlsZCh0aGlzLnZpZGVvKTtcbiAgICB0aGlzLnBsYXllciA9IHZpZGVvanModGhpcy52aWRlbyk7XG5cbiAgICB0aGlzLnBsYXllci5idWZmZXJlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHZpZGVvanMuY3JlYXRlVGltZVJhbmdlKDAsIDApO1xuICAgIH07XG4gICAgdGhpcy5wbGF5ZXIucGF1c2VkID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICB0aGlzLnBsYXllci5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICAvLyBpbml0aWFsaXplIHRoZSBwbHVnaW4gd2l0aCB0aGUgZGVmYXVsdCBvcHRpb25zXG4gICAgdGhpcy5wbGF5ZXIuZXJyb3JzKCk7XG4gICAgdGhpcy5lcnJvckRpc3BsYXkgPSB0aGlzLnBsYXllci5nZXRDaGlsZCgnZXJyb3JEaXNwbGF5Jyk7XG5cbiAgICAvLyBUaWNrIGZvcndhcmQgc28gdGhlIHBsYXllciBpcyByZWFkeS5cbiAgICB0aGlzLmNsb2NrLnRpY2soMSk7XG4gIH0sXG5cbiAgYWZ0ZXJFYWNoKCkge1xuICAgIHRoaXMucGxheWVyLmRpc3Bvc2UoKTtcbiAgICB0aGlzLmNsb2NrLnJlc3RvcmUoKTtcbiAgfVxufSk7XG5cblFVbml0LnRlc3QoJ3JlZ2lzdGVycyBpdHNlbGYgd2l0aCB2aWRlby5qcycsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBhc3NlcnQuZXhwZWN0KDIpO1xuXG4gIGFzc2VydC5zdHJpY3RFcXVhbChcbiAgICB0eXBlb2YgUGxheWVyLnByb3RvdHlwZS5lcnJvcnMsXG4gICAgJ2Z1bmN0aW9uJyxcbiAgICAndmlkZW9qcy1lcnJvcnMgcGx1Z2luIHdhcyByZWdpc3RlcmVkJ1xuICApO1xuXG4gIHRoaXMucGxheWVyLmVycm9ycygpO1xuXG4gIC8vIFRpY2sgdGhlIGNsb2NrIGZvcndhcmQgZW5vdWdoIHRvIHRyaWdnZXIgdGhlIHBsYXllciB0byBiZSBcInJlYWR5XCIuXG4gIHRoaXMuY2xvY2sudGljaygxKTtcblxuICBhc3NlcnQub2soXG4gICAgdGhpcy5wbGF5ZXIuaGFzQ2xhc3MoJ3Zqcy1lcnJvcnMnKSxcbiAgICAndGhlIHBsdWdpbiBhZGRzIGEgY2xhc3MgdG8gdGhlIHBsYXllcidcbiAgKTtcbn0pO1xuXG5RVW5pdC50ZXN0KCdwbGF5KCkgd2l0aG91dCBhIHNyYyBpcyBhbiBlcnJvcicsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBsZXQgZXJyb3JzJCQxID0gMDtcblxuICB0aGlzLnBsYXllci5vbignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICBlcnJvcnMkJDErKztcbiAgfSk7XG4gIHRoaXMucGxheWVyLnRyaWdnZXIoJ3BsYXknKTtcblxuICBhc3NlcnQuc3RyaWN0RXF1YWwoZXJyb3JzJCQxLCAxLCAnZW1pdHRlZCBhbiBlcnJvcicpO1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodGhpcy5wbGF5ZXIuZXJyb3IoKS5jb2RlLCAtMSwgJ2Vycm9yIGNvZGUgaXMgLTEnKTtcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKHRoaXMucGxheWVyLmVycm9yKCkudHlwZSxcbiAgICAnUExBWUVSX0VSUl9OT19TUkMnLFxuICAgICdlcnJvciB0eXBlIGlzIG5vIHNvdXJjZScpO1xufSk7XG5cblFVbml0LnRlc3QoJ25vIHByb2dyZXNzIGZvciA0NSBzZWNvbmRzIGlzIGFuIGVycm9yJywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gIGxldCBlcnJvcnMkJDEgPSAwO1xuXG4gIHRoaXMucGxheWVyLm9uKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgIGVycm9ycyQkMSsrO1xuICB9KTtcbiAgdGhpcy5wbGF5ZXIuc3JjKHNvdXJjZXMpO1xuICB0aGlzLnBsYXllci50cmlnZ2VyKCdwbGF5Jyk7XG4gIHRoaXMuY2xvY2sudGljayg0NSAqIDEwMDApO1xuXG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDEsICdlbWl0dGVkIGFuIGVycm9yJyk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLnBsYXllci5lcnJvcigpLmNvZGUsIC0yLCAnZXJyb3IgY29kZSBpcyAtMicpO1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodGhpcy5wbGF5ZXIuZXJyb3IoKS50eXBlLCAnUExBWUVSX0VSUl9USU1FT1VUJyk7XG59KTtcblxuUVVuaXQudGVzdCgnd2hlbiBwcm9ncmVzcyB3YXRjaGluZyBpcyBkaXNhYmxlZCwgcHJvZ3Jlc3Mgd2l0aGluIDQ1IHNlY29uZHMgaXMgYW4gZXJyb3InLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgbGV0IGVycm9ycyQkMSA9IDA7XG5cbiAgdGhpcy5wbGF5ZXIuZXJyb3JzLmRpc2FibGVQcm9ncmVzcyh0cnVlKTtcblxuICB0aGlzLnBsYXllci5vbignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICBlcnJvcnMkJDErKztcbiAgfSk7XG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncGxheScpO1xuICB0aGlzLmNsb2NrLnRpY2soNDAgKiAxMDAwKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncHJvZ3Jlc3MnKTtcbiAgdGhpcy5jbG9jay50aWNrKDUgKiAxMDAwKTtcblxuICBhc3NlcnQuc3RyaWN0RXF1YWwoZXJyb3JzJCQxLCAxLCAnZW1pdHRlZCBhbiBlcnJvcicpO1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodGhpcy5wbGF5ZXIuZXJyb3IoKS5jb2RlLCAtMiwgJ2Vycm9yIGNvZGUgaXMgLTInKTtcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKHRoaXMucGxheWVyLmVycm9yKCkudHlwZSwgJ1BMQVlFUl9FUlJfVElNRU9VVCcpO1xuXG4gIHRoaXMucGxheWVyLmVycm9ycy5kaXNhYmxlUHJvZ3Jlc3MoZmFsc2UpO1xufSk7XG5cblFVbml0LnRlc3QoJ0ZsYXNoIEFQSSBpcyB1bmF2YWlsYWJsZSB3aGVuIHVzaW5nIEZsYXNoIGlzIGFuIGVycm9yJywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gIHRoaXMucGxheWVyLnRlY2hfLmVsXy50eXBlID0gJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJztcbiAgLy8gd2hlbiBGbGFzaCBkaWVzIHRoZSBvYmplY3QgbWV0aG9kcyBnbyBhd2F5XG4gIC8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuICB0aGlzLnBsYXllci50ZWNoXy5lbF8udmpzX2dldFByb3BlcnR5ID0gbnVsbDtcbiAgLyogZXNsaW50LWVuYWJsZSBjYW1lbGNhc2UgKi9cbiAgdGhpcy5wbGF5ZXIucGF1c2VkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgbGV0IGVycm9ycyQkMSA9IDA7XG5cbiAgdGhpcy5wbGF5ZXIub24oJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgZXJyb3JzJCQxKys7XG4gIH0pO1xuICB0aGlzLnBsYXllci5zcmMoc291cmNlcyk7XG4gIHRoaXMucGxheWVyLnRyaWdnZXIoJ3BsYXknKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigndGltZXVwZGF0ZScpO1xuXG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDEsICdlbWl0dGVkIGFuIGVycm9yJyk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLnBsYXllci5lcnJvcigpLmNvZGUsIC0yLCAnZXJyb3IgY29kZSBpcyAtMicpO1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodGhpcy5wbGF5ZXIuZXJyb3IoKS50eXBlLCAnUExBWUVSX0VSUl9USU1FT1VUJyk7XG59KTtcblxuUVVuaXQudGVzdCgndGhlIHBsdWdpbiBjbGVhbnMgdXAgYWZ0ZXIgaXRzIHByZXZpb3VzIGluY2FybmF0aW9uIHdoZW4gY2FsbGVkIGFnYWluJyxcbiAgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgbGV0IGVycm9ycyQkMSA9IDA7XG5cbiAgICB0aGlzLnBsYXllci5vbignZXJyb3InLCAoKSA9PiBlcnJvcnMkJDErKyk7XG5cbiAgICAvLyBDYWxsIHBsdWdpbiBtdWx0aXBsZSB0aW1lc1xuICAgIHRoaXMucGxheWVyLmVycm9ycygpO1xuICAgIHRoaXMucGxheWVyLmVycm9ycygpO1xuXG4gICAgLy8gVGljayB0aGUgY2xvY2sgZm9yd2FyZCBlbm91Z2ggdG8gdHJpZ2dlciB0aGUgcGxheWVyIHRvIGJlIFwicmVhZHlcIi5cbiAgICB0aGlzLmNsb2NrLnRpY2soMSk7XG5cbiAgICB0aGlzLnBsYXllci50cmlnZ2VyKCdwbGF5Jyk7XG5cbiAgICBhc3NlcnQuc3RyaWN0RXF1YWwoZXJyb3JzJCQxLCAxLCAnZW1pdHRlZCBhIHNpbmdsZSBlcnJvcicpO1xuICAgIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLnBsYXllci5lcnJvcigpLmNvZGUsIC0xLCAnZXJyb3IgY29kZSBpcyAtMScpO1xuICAgIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLnBsYXllci5lcnJvcigpLnR5cGUsICdQTEFZRVJfRVJSX05PX1NSQycpO1xuICB9KTtcblxuUVVuaXQudGVzdCgnd2hlbiBkaXNwb3NlIGlzIHRyaWdnZXJlZCBzaG91bGQgbm90IHRocm93IGVycm9yICcsIGZ1bmN0aW9uKGFzc2VydCkge1xuICB0aGlzLnBsYXllci5zcmMoc291cmNlcyk7XG4gIHRoaXMucGxheWVyLnRyaWdnZXIoJ3BsYXknKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcignZGlzcG9zZScpO1xuICB0aGlzLmNsb2NrLnRpY2soNDUgKiAxMDAwKTtcblxuICBhc3NlcnQub2soIXRoaXMucGxheWVyLmVycm9yKCksXG4gICAgJ3Nob3VsZCBub3QgdGhyb3cgcGxheWVyIGVycm9yIHdoZW4gZGlzcG9zZSBpcyBjYWxsZWQuJyk7XG59KTtcblxuUVVuaXQudGVzdCgncHJvZ3Jlc3MgY2xlYXJzIHBsYXllciB0aW1lb3V0IGVycm9ycycsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBsZXQgZXJyb3JzJCQxID0gMDtcblxuICB0aGlzLnBsYXllci5vbignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICBlcnJvcnMkJDErKztcbiAgfSk7XG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncGxheScpO1xuXG4gIHRoaXMuY2xvY2sudGljayg0NSAqIDEwMDApO1xuXG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDEsICdlbWl0dGVkIGFuIGVycm9yJyk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLnBsYXllci5lcnJvcigpLmNvZGUsIC0yLCAnZXJyb3IgY29kZSBpcyAtMicpO1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodGhpcy5wbGF5ZXIuZXJyb3IoKS50eXBlLCAnUExBWUVSX0VSUl9USU1FT1VUJyk7XG5cbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncHJvZ3Jlc3MnKTtcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKHRoaXMucGxheWVyLmVycm9yKCksIG51bGwsICdlcnJvciByZW1vdmVkJyk7XG59KTtcblxuLy8gc2FmYXJpIDcgb24gT1NYIGNhbiBlbWl0IHN0YWxscyB3aGVuIHBsYXliYWNrIGlzIGp1c3QgZmluZVxuUVVuaXQudGVzdCgnc3RhbGxpbmcgYnkgaXRzZWxmIGlzIG5vdCBhbiBlcnJvcicsIGZ1bmN0aW9uKGFzc2VydCkge1xuICB0aGlzLnBsYXllci5zcmMoc291cmNlcyk7XG4gIHRoaXMucGxheWVyLnRyaWdnZXIoJ3BsYXknKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcignc3RhbGxlZCcpO1xuXG4gIGFzc2VydC5vayghdGhpcy5wbGF5ZXIuZXJyb3IoKSwgJ25vIGVycm9yIGZpcmVkJyk7XG59KTtcblxuUVVuaXQudGVzdCgndGltaW5nIG91dCBtdWx0aXBsZSB0aW1lcyBvbmx5IHRocm93cyBhIHNpbmdsZSBlcnJvcicsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBsZXQgZXJyb3JzJCQxID0gMDtcblxuICB0aGlzLnBsYXllci5vbignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICBlcnJvcnMkJDErKztcbiAgfSk7XG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncGxheScpO1xuICAvLyB0cmlnZ2VyIGEgcGxheWVyIHRpbWVvdXRcbiAgdGhpcy5jbG9jay50aWNrKDQ1ICogMTAwMCk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDEsICdvbmUgZXJyb3IgZmlyZWQnKTtcblxuICAvLyB3YWl0IGxvbmcgZW5vdWdoIGZvciBhbm90aGVyIHRpbWVvdXRcbiAgdGhpcy5jbG9jay50aWNrKDUwICogMTAwMCk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDEsICdvbmx5IG9uZSBlcnJvciBmaXJlZCcpO1xufSk7XG5cblFVbml0LnRlc3QoJ3Byb2dyZXNzIGV2ZW50cyB3aGlsZSBwbGF5aW5nIHJlc2V0IHRoZSBwbGF5ZXIgdGltZW91dCcsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBsZXQgZXJyb3JzJCQxID0gMDtcblxuICB0aGlzLnBsYXllci5vbignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICBlcnJvcnMkJDErKztcbiAgfSk7XG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncGxheScpO1xuICAvLyBzdGFsbGVkIGZvciBhd2hpbGVcbiAgdGhpcy5jbG9jay50aWNrKDQ0ICogMTAwMCk7XG4gIC8vIGJ1dCBwbGF5YmFjayByZXN1bWVzIVxuICB0aGlzLnBsYXllci50cmlnZ2VyKCdwcm9ncmVzcycpO1xuICB0aGlzLmNsb2NrLnRpY2soNDQgKiAxMDAwKTtcblxuICBhc3NlcnQuc3RyaWN0RXF1YWwoZXJyb3JzJCQxLCAwLCAnbm8gZXJyb3JzIGVtaXR0ZWQnKTtcbn0pO1xuXG5RVW5pdC50ZXN0KCdubyBzaWducyBvZiBwbGF5YmFjayB0cmlnZ2VycyBhIHBsYXllciB0aW1lb3V0JywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gIGxldCBlcnJvcnMkJDEgPSAwO1xuXG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIub24oJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgZXJyb3JzJCQxKys7XG4gIH0pO1xuICAvLyBzd2FsbG93IGFueSB0aW1ldXBkYXRlIGV2ZW50c1xuICB0aGlzLnBsYXllci5vbigndGltZXVwZGF0ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gIH0pO1xuICB0aGlzLnBsYXllci50cmlnZ2VyKCdwbGF5Jyk7XG4gIHRoaXMuY2xvY2sudGljayg0NSAqIDEwMDApO1xuXG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDEsICdlbWl0dGVkIGEgc2luZ2xlIGVycm9yJyk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLnBsYXllci5lcnJvcigpLmNvZGUsIC0yLCAnZXJyb3IgY29kZSBpcyAtMicpO1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodGhpcy5wbGF5ZXIuZXJyb3IoKS50eXBlLFxuICAgICdQTEFZRVJfRVJSX1RJTUVPVVQnLFxuICAgICd0eXBlIGlzIHBsYXllciB0aW1lb3V0Jyk7XG59KTtcblxuUVVuaXQudGVzdCgndGltZSBjaGFuZ2VzIHdoaWxlIHBsYXlpbmcgcmVzZXQgdGhlIHBsYXllciB0aW1lb3V0JywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gIGxldCBlcnJvcnMkJDEgPSAwO1xuXG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIub24oJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgZXJyb3JzJCQxKys7XG4gIH0pO1xuICB0aGlzLnBsYXllci50cmlnZ2VyKCdwbGF5Jyk7XG4gIHRoaXMuY2xvY2sudGljayg0NCAqIDEwMDApO1xuICB0aGlzLnBsYXllci5jdXJyZW50VGltZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAxO1xuICB9O1xuICB0aGlzLnBsYXllci50cmlnZ2VyKCd0aW1ldXBkYXRlJyk7XG4gIHRoaXMuY2xvY2sudGljaygxMCAqIDEwMDApO1xuXG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDAsICdubyBlcnJvciBlbWl0dGVkJyk7XG59KTtcblxuUVVuaXQudGVzdCgndGltZSBjaGFuZ2VzIHdoaWxlIHBsYXlpbmcgYWRzIHJlc2V0IHRoZSBwbGF5ZXIgdGltZW91dCcsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBsZXQgZXJyb3JzJCQxID0gMDtcblxuICB0aGlzLnBsYXllci5zcmMoc291cmNlcyk7XG4gIHRoaXMucGxheWVyLm9uKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgIGVycm9ycyQkMSsrO1xuICB9KTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncGxheScpO1xuICB0aGlzLmNsb2NrLnRpY2soNDQgKiAxMDAwKTtcbiAgdGhpcy5wbGF5ZXIuY3VycmVudFRpbWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gMTtcbiAgfTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcignYWR0aW1ldXBkYXRlJyk7XG4gIHRoaXMuY2xvY2sudGljaygxMCAqIDEwMDApO1xuXG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDAsICdubyBlcnJvciBlbWl0dGVkJyk7XG59KTtcblxuUVVuaXQudGVzdCgndGltZSBjaGFuZ2VzIGFmdGVyIGEgcGxheWVyIHRpbWVvdXQgY2xlYXJzIHRoZSBlcnJvcicsIGZ1bmN0aW9uKGFzc2VydCkge1xuICB0aGlzLnBsYXllci5zcmMoc291cmNlcyk7XG4gIHRoaXMucGxheWVyLnRyaWdnZXIoJ3BsYXknKTtcbiAgdGhpcy5jbG9jay50aWNrKDQ1ICogMTAwMCk7XG4gIHRoaXMucGxheWVyLmN1cnJlbnRUaW1lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIDE7XG4gIH07XG4gIHRoaXMucGxheWVyLnRyaWdnZXIoJ3RpbWV1cGRhdGUnKTtcblxuICBhc3NlcnQub2soIXRoaXMucGxheWVyLmVycm9yKCksICdjbGVhcmVkIHRoZSB0aW1lb3V0Jyk7XG59KTtcblxuUVVuaXQudGVzdCgncGxheWVyIHRpbWVvdXRzIGRvIG5vdCBvY2N1ciBpZiB0aGUgcGxheWVyIGlzIHBhdXNlZCcsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBsZXQgZXJyb3JzJCQxID0gMDtcblxuICB0aGlzLnBsYXllci5zcmMoc291cmNlcyk7XG4gIHRoaXMucGxheWVyLm9uKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgIGVycm9ycyQkMSsrO1xuICB9KTtcbiAgdGhpcy5wbGF5ZXIub24oJ3RpbWV1cGRhdGUnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICB9KTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncGxheScpO1xuICAvLyBzaW11bGF0ZSBhIG1pc2JlaGF2aW5nIHBsYXllciB0aGF0IGRvZXNuJ3QgZmlyZSBgcGF1c2VkYFxuICB0aGlzLnBsYXllci5wYXVzZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgdGhpcy5jbG9jay50aWNrKDQ1ICogMTAwMCk7XG5cbiAgYXNzZXJ0LnN0cmljdEVxdWFsKGVycm9ycyQkMSwgMCwgJ25vIGVycm9yIGVtaXR0ZWQnKTtcbn0pO1xuXG4vLyB2aWRlby5wYXVzZWQgaXMgZmFsc2UgYXQgdGhlIGVuZCBvZiBhIHZpZGVvIG9uIElFMTEsIFdpbjggUlRcblFVbml0LnRlc3QoJ3BsYXllciB0aW1lb3V0cyBkbyBub3Qgb2NjdXIgaWYgdGhlIHZpZGVvIGlzIGVuZGVkJywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gIGxldCBlcnJvcnMkJDEgPSAwO1xuXG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIub24oJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgZXJyb3JzJCQxKys7XG4gIH0pO1xuICB0aGlzLnBsYXllci5vbigndGltZXVwZGF0ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gIH0pO1xuICB0aGlzLnBsYXllci50cmlnZ2VyKCdwbGF5Jyk7XG4gIC8vIHNpbXVsYXRlIGEgbWlzYmVoYXZpbmcgcGxheWVyIHRoYXQgZG9lc24ndCBmaXJlIGBlbmRlZGBcbiAgdGhpcy5wbGF5ZXIuZW5kZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgdGhpcy5jbG9jay50aWNrKDQ1ICogMTAwMCk7XG5cbiAgYXNzZXJ0LnN0cmljdEVxdWFsKGVycm9ycyQkMSwgMCwgJ25vIGVycm9yIGVtaXR0ZWQnKTtcbn0pO1xuXG5RVW5pdC50ZXN0KCdwbGF5ZXIgdGltZW91dHMgZG8gbm90IG92ZXJ3cml0ZSBleGlzdGluZyBlcnJvcnMnLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgdGhpcy5wbGF5ZXIuc3JjKHNvdXJjZXMpO1xuICB0aGlzLnBsYXllci50cmlnZ2VyKCdwbGF5Jyk7XG4gIHRoaXMucGxheWVyLmVycm9yKHtcbiAgICB0eXBlOiAnY3VzdG9tJyxcbiAgICBjb2RlOiAtN1xuICB9KTtcbiAgdGhpcy5jbG9jay50aWNrKDQ1ICogMTAwMCk7XG5cbiAgYXNzZXJ0LnN0cmljdEVxdWFsKC03LCB0aGlzLnBsYXllci5lcnJvcigpLmNvZGUsICdlcnJvciB3YXMgbm90IG92ZXJ3cml0dGVuJyk7XG59KTtcblxuUVVuaXQudGVzdCgndW5yZWNvZ25pemVkIGVycm9yIGNvZGVzIGRvIG5vdCBjYXVzZSBleGNlcHRpb25zJywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gIGxldCBlcnJvcnMkJDEgPSAwO1xuXG4gIHRoaXMucGxheWVyLm9uKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgIGVycm9ycyQkMSsrO1xuICB9KTtcbiAgdGhpcy5wbGF5ZXIuZXJyb3Ioe1xuICAgIGNvZGU6ICdzb21ldGhpbmctY3VzdG9tLXRoYXQtbm8tb25lLWNvdWxkLWhhdmUtcHJlZGljdGVkJyxcbiAgICB0eXBlOiAnTk9UX0FOX0VSUk9SX0NPTlNUQU5UJ1xuICB9KTtcbiAgYXNzZXJ0Lm9rKHRydWUsICdkb2VzIG5vdCB0aHJvdyBhbiBleGNlcHRpb24nKTtcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKGVycm9ycyQkMSwgMSwgJ2VtaXR0ZWQgYW4gZXJyb3InKTtcblxuICAvLyBpbnRlbnRpb25hbGx5IG1pc3NpbmcgcHJvcGVydGllc1xuICB0aGlzLnBsYXllci5lcnJvcih7fSk7XG4gIGFzc2VydC5vayh0cnVlLCAnZG9lcyBub3QgdGhyb3cgYW4gZXhjZXB0aW9uJyk7XG5cbiAgYXNzZXJ0LnN0cmljdEVxdWFsKGVycm9ycyQkMSwgMiwgJ2VtaXR0ZWQgYW4gZXJyb3InKTtcbn0pO1xuXG5RVW5pdC50ZXN0KCdjdXN0b20gZXJyb3IgZGV0YWlscyBzaG91bGQgb3ZlcnJpZGUgZGVmYXVsdHMnLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgY29uc3QgY3VzdG9tRXJyb3IgPSB7aGVhZGxpbmU6ICd0ZXN0IGhlYWRsaW5lJywgbWVzc2FnZTogJ3Rlc3QgZGV0YWlscyd9O1xuXG4gIC8vIGluaXRpYWxpemUgdGhlIHBsdWdpbiB3aXRoIGN1c3RvbSBvcHRpb25zXG4gIHRoaXMucGxheWVyLmVycm9ycyh7ZXJyb3JzOiB7NDogY3VzdG9tRXJyb3J9fSk7XG4gIC8vIHRpY2sgZm9yd2FyZCBlbm91Z2ggdG8gcmVhZHkgdGhlIHBsYXllclxuICB0aGlzLmNsb2NrLnRpY2soMSk7XG4gIC8vIHRyaWdnZXIgdGhlIGVycm9yIGluIHF1ZXN0aW9uXG4gIHRoaXMucGxheWVyLmVycm9yKDQpO1xuICAvLyBjb25maXJtIHJlc3VsdHNcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKHRoaXMuZXJyb3JEaXNwbGF5LiQoJy52anMtZXJyb3JzLWhlYWRsaW5lJykudGV4dENvbnRlbnQsXG4gICAgY3VzdG9tRXJyb3IuaGVhZGxpbmUsICdoZWFkbGluZSBzaG91bGQgbWF0Y2ggY3VzdG9tIG92ZXJyaWRlIHZhbHVlJyk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLmVycm9yRGlzcGxheS4kKCcudmpzLWVycm9ycy1tZXNzYWdlJykudGV4dENvbnRlbnQsXG4gICAgY3VzdG9tRXJyb3IubWVzc2FnZSwgJ21lc3NhZ2Ugc2hvdWxkIG1hdGNoIGN1c3RvbSBvdmVycmlkZSB2YWx1ZScpO1xufSk7XG5cblFVbml0LnRlc3QoJ0FwcGVuZCBGbGFzaCBlcnJvciBkZXRhaWxzIHdoZW4gZmxhc2ggaXMgbm90IHN1cHBvcnRlZCcsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBjb25zdCBGbGFzaCA9IHZpZGVvanMuZ2V0VGVjaCgnRmxhc2gnKTtcblxuICAvLyB2anM2IHdvbid0IGhhdmUgZmxhc2ggYnkgZGVmYXVsdFxuICBpZiAoIUZsYXNoKSB7XG4gICAgYXNzZXJ0Lm5vdE9rKEZsYXNoLCAnZmxhc2ggdGVjaCBub3QgYXZhaWxhYmxlLCBza2lwcGluZyB1bml0IHRlc3QnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBvbGRJc1N1cHBvcnRlZCA9IHZpZGVvanMuZ2V0Q29tcG9uZW50KCdGbGFzaCcpLmlzU3VwcG9ydGVkO1xuXG4gIC8vIE1vY2sgdXAgaXNTdXBwb3J0ZWQgdG8gYmUgZmFsc2VcbiAgdmlkZW9qcy5nZXRDb21wb25lbnQoJ0ZsYXNoJykuaXNTdXBwb3J0ZWQgPSAoKSA9PiBmYWxzZTtcblxuICAvLyB0aWNrIGZvcndhcmQgZW5vdWdoIHRvIHJlYWR5IHRoZSBwbGF5ZXJcbiAgdGhpcy5jbG9jay50aWNrKDEpO1xuICAvLyB0cmlnZ2VyIHRoZSBlcnJvciBpbiBxdWVzdGlvblxuICB0aGlzLnBsYXllci5lcnJvcig0KTtcbiAgLy8gY29uZmlybSByZXN1bHRzXG4gIGFzc2VydC5lcXVhbCh0aGlzLmVycm9yRGlzcGxheS4kKCcudmpzLWVycm9ycy1mbGFzaG1lc3NhZ2UnKS50ZXh0Q29udGVudCxcbiAgICAnSWYgeW91IGFyZSB1c2luZyBhbiBvbGRlciBicm93c2VyIHBsZWFzZSB0cnkgdXBncmFkaW5nIG9yIGluc3RhbGxpbmcgRmxhc2guJyxcbiAgICAnRmxhc2ggRXJyb3IgbWVzc2FnZSBzaG91bGQgYmUgZGlzcGxheWVkJyk7XG4gIC8vIFJlc3RvcmluZyBpc1N1cHBvcnRlZCB0byB0aGUgb2xkIHZhbHVlXG4gIHZpZGVvanMuZ2V0Q29tcG9uZW50KCdGbGFzaCcpLmlzU3VwcG9ydGVkID0gb2xkSXNTdXBwb3J0ZWQ7XG59KTtcblxuUVVuaXQudGVzdCgnZGVmYXVsdCBlcnJvciBpcyBkaXNtaXNzaWJsZScsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAvLyBpbml0aWFsaXplIHRoZSBwbHVnaW5cbiAgdGhpcy5wbGF5ZXIuZXJyb3JzKCk7XG4gIC8vIHRpY2sgZm9yd2FyZCBlbm91Z2ggdG8gcmVhZHkgdGhlIHBsYXllclxuICB0aGlzLmNsb2NrLnRpY2soMSk7XG4gIC8vIHRyaWdnZXIgdGhlIGVycm9yIGluIHF1ZXN0aW9uXG4gIHRoaXMucGxheWVyLmVycm9yKDIpO1xuICAvLyBjb25maXJtIHJlc3VsdHNcbiAgYXNzZXJ0Lm9rKHRoaXMuZXJyb3JEaXNwbGF5LiQoJy52anMtZXJyb3JzLW9rLWJ1dHRvbicpLCAnb2sgYnV0dG9uIGlzIHByZXNlbnQnKTtcbiAgYXNzZXJ0Lm9rKHRoaXMuZXJyb3JEaXNwbGF5LiQoJy52anMtY2xvc2UtYnV0dG9uJyksICdjbG9zZSBidXR0b24gaXMgcHJlc2VudCcpO1xufSk7XG5cblFVbml0LnRlc3QoJ2N1c3RvbSBlcnJvciBpcyBkaXNtaXNzaWJsZScsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBjb25zdCBjdXN0b21FcnJvckRpc21pc3MgPSB7XG4gICAgaGVhZGxpbmU6ICd0ZXN0IGhlYWRsaW5lJyxcbiAgICBtZXNzYWdlOiAndGVzdCBkZXRhaWxzJyxcbiAgICBkaXNtaXNzOiB0cnVlXG4gIH07XG5cbiAgLy8gaW5pdGlhbGl6ZSB0aGUgcGx1Z2luIHdpdGggY3VzdG9tIG9wdGlvbnNcbiAgdGhpcy5wbGF5ZXIuZXJyb3JzKHtlcnJvcnM6IHs0OiBjdXN0b21FcnJvckRpc21pc3N9fSk7XG4gIC8vIHRpY2sgZm9yd2FyZCBlbm91Z2ggdG8gcmVhZHkgdGhlIHBsYXllclxuICB0aGlzLmNsb2NrLnRpY2soMSk7XG4gIC8vIHRyaWdnZXIgdGhlIGVycm9yIGluIHF1ZXN0aW9uXG4gIHRoaXMucGxheWVyLmVycm9yKDQpO1xuICAvLyBjb25maXJtIHJlc3VsdHNcbiAgYXNzZXJ0Lm9rKHRoaXMuZXJyb3JEaXNwbGF5LiQoJy52anMtZXJyb3JzLW9rLWJ1dHRvbicpLCAnb2sgYnV0dG9uIGlzIHByZXNlbnQnKTtcbiAgYXNzZXJ0Lm9rKHRoaXMuZXJyb3JEaXNwbGF5LiQoJy52anMtY2xvc2UtYnV0dG9uJyksICdjbG9zZSBidXR0b24gaXMgcHJlc2VudCcpO1xufSk7XG5cblFVbml0LnRlc3QoJ2N1c3RvbSBlcnJvciBpcyBub3QgZGlzbWlzc2libGUnLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgY29uc3QgY3VzdG9tRXJyb3JOb0RpbWlzcyA9IHtcbiAgICBoZWFkbGluZTogJ3Rlc3QgaGVhZGxpbmUnLFxuICAgIG1lc3NhZ2U6ICd0ZXN0IGRldGFpbHMnLFxuICAgIGRpc21pc3M6IGZhbHNlXG4gIH07XG5cbiAgLy8gaW5pdGlhbGl6ZSB0aGUgcGx1Z2luIHdpdGggY3VzdG9tIG9wdGlvbnNcbiAgdGhpcy5wbGF5ZXIuZXJyb3JzKHtlcnJvcnM6IHs0OiBjdXN0b21FcnJvck5vRGltaXNzfX0pO1xuICAvLyB0aWNrIGZvcndhcmQgZW5vdWdoIHRvIHJlYWR5IHRoZSBwbGF5ZXJcbiAgdGhpcy5jbG9jay50aWNrKDEpO1xuICAvLyB0cmlnZ2VyIHRoZSBlcnJvciBpbiBxdWVzdGlvblxuICB0aGlzLnBsYXllci5lcnJvcig0KTtcbiAgLy8gY29uZmlybSByZXN1bHRzXG4gIGFzc2VydC5vayghdGhpcy5lcnJvckRpc3BsYXkuJCgnLnZqcy1lcnJvcnMtb2stYnV0dG9uJyksICdvayBidXR0b24gaXMgbm90IHByZXNlbnQnKTtcbiAgYXNzZXJ0Lm9rKCF0aGlzLmVycm9yRGlzcGxheS4kKCcudmpzLWNsb3NlLWJ1dHRvbicpLCAnY2xvc2UgYnV0dG9uIGlzIG5vdCBwcmVzZW50Jyk7XG59KTtcblxuUVVuaXQudGVzdCgnY3VzdG9tIGVycm9ycyBjYW4gYmUgYWRkZWQgYXQgcnVudGltZScsIGZ1bmN0aW9uKGFzc2VydCkge1xuICB0aGlzLnBsYXllci5lcnJvcnMoKTtcblxuICAvLyB0aWNrIGZvcndhcmQgZW5vdWdoIHRvIHJlYWR5IHRoZSBwbGF5ZXJcbiAgdGhpcy5jbG9jay50aWNrKDEpO1xuXG4gIGNvbnN0IGVycm9yID0ge1xuICAgICctMyc6IHtcbiAgICAgIHR5cGU6ICdURVNUJyxcbiAgICAgIGhlYWRsaW5lOiAndGVzdCcsXG4gICAgICBtZXNzYWdlOiAndGVzdCB0ZXN0J1xuICAgIH1cbiAgfTtcblxuICB0aGlzLnBsYXllci5lcnJvcnMuZXh0ZW5kKGVycm9yKTtcblxuICB0aGlzLnBsYXllci5lcnJvcih7Y29kZTogLTN9KTtcblxuICBhc3NlcnQuc3RyaWN0RXF1YWwoXG4gICAgdGhpcy5wbGF5ZXIuZXJyb3JEaXNwbGF5LiQoJy52anMtZXJyb3JzLWhlYWRsaW5lJykudGV4dENvbnRlbnQsXG4gICAgZXJyb3JbJy0zJ10uaGVhZGxpbmUsXG4gICAgJ2hlYWRsaW5lIHNob3VsZCBtYXRjaCBjdXN0b20gb3ZlcnJpZGUgdmFsdWUnXG4gICk7XG5cbiAgYXNzZXJ0LnN0cmljdEVxdWFsKFxuICAgIHRoaXMucGxheWVyLmVycm9yRGlzcGxheS4kKCcudmpzLWVycm9ycy1tZXNzYWdlJykudGV4dENvbnRlbnQsXG4gICAgZXJyb3JbJy0zJ10ubWVzc2FnZSxcbiAgICAnbWVzc2FnZSBzaG91bGQgbWF0Y2ggY3VzdG9tIG92ZXJyaWRlIHZhbHVlJ1xuICApO1xufSk7XG4iXX0=
