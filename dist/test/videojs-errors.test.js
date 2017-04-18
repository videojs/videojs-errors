(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require(3);

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

},{"3":3}],2:[function(require,module,exports){
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
    initPlugin(player, videojs.mergeOptions(defaults, newOptions));
  };

  reInitPlugin.extend = function (errors) {
    options.errors = videojs.mergeOptions(options.errors, errors);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy92aWRlb2pzLXNwZWxsYm9vay9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibm9kZV9tb2R1bGVzL2dsb2JhbC9kb2N1bWVudC5qcyIsIm5vZGVfbW9kdWxlcy9nbG9iYWwvd2luZG93LmpzIiwibm9kZV9tb2R1bGVzL3ZpZGVvanMtc3BlbGxib29rL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXJlc29sdmUvZW1wdHkuanMiLCJ0ZXN0L2luZGV4LnRlc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNUQTs7O0FDQUE7Ozs7QUFFQSxTQUFTLGVBQVQsQ0FBMEIsRUFBMUIsRUFBOEI7QUFBRSxTQUFRLE1BQU8sUUFBTyxFQUFQLHlDQUFPLEVBQVAsT0FBYyxRQUFyQixJQUFrQyxhQUFhLEVBQWhELEdBQXNELEdBQUcsU0FBSCxDQUF0RCxHQUFzRSxFQUE3RTtBQUFrRjs7QUFFbEgsSUFBSSxXQUFXLGdCQUFnQixRQUFRLGlCQUFSLENBQWhCLENBQWY7QUFDQSxJQUFJLFFBQVEsZ0JBQWdCLFFBQVEsT0FBUixDQUFoQixDQUFaO0FBQ0EsSUFBSSxRQUFRLGdCQUFnQixRQUFRLE9BQVIsQ0FBaEIsQ0FBWjtBQUNBLElBQUksVUFBVSxnQkFBZ0IsUUFBUSxVQUFSLENBQWhCLENBQWQ7QUFDQSxJQUFJLFNBQVMsZ0JBQWdCLFFBQVEsZUFBUixDQUFoQixDQUFiOztBQUVBLElBQU0sV0FBVyxRQUFRLFlBQVIsQ0FBcUIsT0FBckIsQ0FBakI7QUFDQSxJQUFNLGlCQUFpQixDQUFDLFFBQVEsT0FBUixDQUFnQixTQUF4Qzs7QUFFQTtBQUNBLElBQU0saUJBQWlCLFFBQVEsY0FBUixJQUEwQixRQUFRLE1BQXpEOztBQUVBO0FBQ0EsSUFBTSxXQUFXO0FBQ2YsVUFBUSxFQURPO0FBRWYsUUFBTSxFQUZTO0FBR2YsV0FBUyxFQUhNO0FBSWYsV0FBUyxLQUFLLElBSkM7QUFLZixXQUFTLGNBTE07QUFNZixVQUFRO0FBQ04sU0FBSztBQUNILFlBQU0sbUJBREg7QUFFSCxnQkFBVTtBQUZQLEtBREM7QUFLTixTQUFLO0FBQ0gsWUFBTSxtQkFESDtBQUVILGdCQUFVLDJEQUNBO0FBSFAsS0FMQztBQVVOLFNBQUs7QUFDSCxZQUFNLGtCQURIO0FBRUgsZ0JBQVU7QUFGUCxLQVZDO0FBY04sU0FBSztBQUNILFlBQU0sNkJBREg7QUFFSCxnQkFBVTtBQUZQLEtBZEM7QUFrQk4sU0FBSztBQUNILFlBQU0scUJBREg7QUFFSCxnQkFBVSwyRUFDQTtBQUhQLEtBbEJDO0FBdUJOLGVBQVc7QUFDVCxZQUFNLG1CQURHO0FBRVQsZ0JBQVU7QUFGRCxLQXZCTDtBQTJCTixVQUFNO0FBQ0osWUFBTSxtQkFERjtBQUVKLGdCQUFVO0FBRk4sS0EzQkE7QUErQk4sVUFBTTtBQUNKLFlBQU0sb0JBREY7QUFFSixnQkFBVTtBQUZOLEtBL0JBO0FBbUNOLFVBQU07QUFDSixZQUFNLDhCQURGO0FBRUosZ0JBQVU7QUFGTixLQW5DQTtBQXVDTixVQUFNO0FBQ0osWUFBTSwwQkFERjtBQUVKLGdCQUFVO0FBRk4sS0F2Q0E7QUEyQ04sVUFBTTtBQUNKLFlBQU0sMkJBREY7QUFFSixnQkFBVTtBQUZOO0FBM0NBO0FBTk8sQ0FBakI7O0FBd0RBOzs7OztBQUtBLElBQU0sYUFBYSxTQUFiLFVBQWEsQ0FBUyxNQUFULEVBQWlCLE9BQWpCLEVBQTBCO0FBQzNDLE1BQUksZ0JBQUo7QUFDQSxNQUFNLFlBQVksRUFBbEI7O0FBRUE7QUFDQSxNQUFNLGVBQWUsU0FBZixZQUFlLEdBQVc7QUFDOUIsV0FBTyxZQUFQLENBQW9CLE9BQXBCO0FBQ0EsY0FBVSxPQUFPLFVBQVAsQ0FBa0IsWUFBVztBQUNyQztBQUNBO0FBQ0EsVUFBSSxPQUFPLEtBQVAsTUFBa0IsT0FBTyxNQUFQLEVBQWxCLElBQXFDLE9BQU8sS0FBUCxFQUF6QyxFQUF5RDtBQUN2RDtBQUNEOztBQUVELGFBQU8sS0FBUCxDQUFhO0FBQ1gsY0FBTSxDQUFDLENBREk7QUFFWCxjQUFNO0FBRkssT0FBYjtBQUlELEtBWFMsRUFXUCxRQUFRLE9BWEQsQ0FBVjs7QUFhQTtBQUNBO0FBQ0EsUUFBSSxPQUFPLEtBQVAsTUFBa0IsT0FBTyxLQUFQLEdBQWUsSUFBZixLQUF3QixDQUFDLENBQS9DLEVBQWtEO0FBQ2hELGFBQU8sS0FBUCxDQUFhLElBQWI7QUFDRDtBQUNGLEdBcEJEOztBQXNCQTtBQUNBLE1BQU0sVUFBVSxTQUFWLE9BQVUsR0FBVztBQUN6QixRQUFJLGlCQUFKOztBQUVBLFdBQU8sVUFBVSxNQUFqQixFQUF5QjtBQUN2QixpQkFBVyxVQUFVLEtBQVYsRUFBWDtBQUNBLGFBQU8sR0FBUCxDQUFXLFNBQVMsQ0FBVCxDQUFYLEVBQXdCLFNBQVMsQ0FBVCxDQUF4QjtBQUNEO0FBQ0QsV0FBTyxZQUFQLENBQW9CLE9BQXBCO0FBQ0QsR0FSRDs7QUFVQTtBQUNBLE1BQU0sY0FBYyxTQUFkLFdBQWMsQ0FBUyxJQUFULEVBQWUsRUFBZixFQUFtQjtBQUNyQyxRQUFNLFFBQVEsU0FBUixLQUFRLEdBQVc7QUFDdkI7QUFDQTtBQUNBLFVBQUksQ0FBQyxPQUFPLEtBQVAsRUFBTCxFQUFxQjtBQUNuQjtBQUNBLFlBQU0sT0FBTyxPQUFPLENBQVAsQ0FBUyxXQUFULENBQWI7O0FBRUEsWUFBSSxRQUNBLEtBQUssSUFBTCxLQUFjLCtCQURkLElBRUEsQ0FBQyxLQUFLLGVBRlYsRUFFMkI7QUFDekIsaUJBQU8sS0FBUCxDQUFhO0FBQ1gsa0JBQU0sQ0FBQyxDQURJO0FBRVgsa0JBQU07QUFGSyxXQUFiO0FBSUE7QUFDRDs7QUFFRDtBQUNBLFlBQUksT0FBTyxNQUFQLEVBQUosRUFBcUI7QUFDbkIsaUJBQU8sY0FBUDtBQUNEO0FBQ0Q7QUFDQSxZQUFJLE9BQU8sS0FBUCxFQUFKLEVBQW9CO0FBQ2xCLGlCQUFPLGNBQVA7QUFDRDtBQUNGOztBQUVELFNBQUcsSUFBSCxDQUFRLElBQVI7QUFDRCxLQTVCRDs7QUE4QkEsV0FBTyxFQUFQLENBQVUsSUFBVixFQUFnQixLQUFoQjtBQUNBLGNBQVUsSUFBVixDQUFlLENBQUMsSUFBRCxFQUFPLEtBQVAsQ0FBZjtBQUNELEdBakNEOztBQW1DQSxNQUFNLHFCQUFxQixTQUFyQixrQkFBcUIsR0FBVztBQUNwQyxRQUFJLFdBQVcsQ0FBZjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EsZ0JBQVksQ0FBQyxZQUFELEVBQWUsY0FBZixDQUFaLEVBQTRDLFlBQVc7QUFDckQsVUFBTSxjQUFjLE9BQU8sV0FBUCxFQUFwQjs7QUFFQTtBQUNBLFVBQUksZ0JBQWdCLFFBQXBCLEVBQThCO0FBQzVCLG1CQUFXLFdBQVg7QUFDQTtBQUNEO0FBQ0YsS0FSRDtBQVNBLGdCQUFZLFVBQVosRUFBd0IsWUFBeEI7QUFDRCxHQWpCRDs7QUFtQkEsTUFBTSxpQkFBaUIsU0FBakIsY0FBaUIsR0FBVztBQUNoQyxRQUFJLENBQUMsT0FBTyxVQUFQLEVBQUwsRUFBMEI7QUFDeEIsYUFBTyxLQUFQLENBQWE7QUFDWCxjQUFNLENBQUMsQ0FESTtBQUVYLGNBQU07QUFGSyxPQUFiO0FBSUQ7QUFDRixHQVBEOztBQVNBLE1BQU0saUJBQWlCLFNBQWpCLGNBQWlCLEdBQVc7QUFDaEMsUUFBSSxVQUFVLEVBQWQ7QUFDQSxRQUFJLFFBQVEsT0FBTyxLQUFQLEVBQVo7QUFDQSxRQUFNLFVBQVUsU0FBUyxhQUFULENBQXVCLEtBQXZCLENBQWhCO0FBQ0EsUUFBSSxnQkFBZ0IsRUFBcEI7O0FBRUE7QUFDQTtBQUNBLFFBQUksQ0FBQyxLQUFMLEVBQVk7QUFDVjtBQUNEOztBQUVELFlBQVEsUUFBUSxZQUFSLENBQXFCLEtBQXJCLEVBQTRCLFFBQVEsTUFBUixDQUFlLE1BQU0sSUFBTixJQUFjLENBQTdCLENBQTVCLENBQVI7O0FBRUEsUUFBSSxNQUFNLE9BQVYsRUFBbUI7QUFDakIscURBQTZDLE9BQU8sUUFBUCxDQUFnQixtQkFBaEIsQ0FBN0Msb0RBQ3NDLE9BQU8sUUFBUCxDQUFnQixNQUFNLE9BQXRCLENBRHRDO0FBR0Q7O0FBRUQsUUFBSSxNQUFNLElBQU4sS0FBZSxDQUFmLElBQW9CLFFBQXBCLElBQWdDLENBQUMsU0FBUyxXQUFULEVBQXJDLEVBQTZEO0FBQzNELFVBQU0sZUFBZSxPQUFPLFFBQVAsQ0FBZ0IsNkVBQWhCLENBQXJCOztBQUVBLDREQUFvRCxZQUFwRDtBQUNEOztBQUVELFFBQU0sVUFBVSxPQUFPLFFBQVAsQ0FBZ0IsY0FBaEIsQ0FBaEI7O0FBRUEsWUFBUSxTQUFSLEdBQW9CLG1CQUFwQjtBQUNBLFlBQVEsRUFBUixHQUFhLG1CQUFiO0FBQ0EsMkdBRW9DLEtBQUssUUFBTCxDQUFjLE1BQU0sUUFBcEIsQ0FGcEMsK0JBR2MsS0FBSyxRQUFMLENBQWMsWUFBZCxDQUhkLGVBR21ELE1BQU0sSUFBTixJQUFjLE1BQU0sSUFIdkUseUJBSU0sT0FKTjs7QUFPQSxRQUFNLFlBQVksUUFBUSxTQUFSLENBQWtCLEVBQUUsYUFBYSxLQUFmLEtBQXlCLE1BQU0sT0FBakQsQ0FBbEI7O0FBRUE7QUFDQSxRQUFJLFNBQUosRUFBZTtBQUNiLHlIQUUyQyxLQUFLLFFBQUwsQ0FBYyxJQUFkLENBRjNDO0FBSUEsY0FBUSxTQUFSLEdBQW9CLGFBQXBCO0FBQ0EsY0FBUSxRQUFSLENBQWlCLE9BQWpCO0FBQ0E7QUFDQSxjQUFRLFNBQVIsR0FBb0IsVUFBcEIsQ0FBK0IsV0FBL0IsQ0FBMkMsUUFBUSxRQUFSLENBQWlCLGFBQWpCLEVBQWdDLEVBQWhDLEVBQTNDOztBQUVBLFVBQU0sV0FBVyxRQUFRLEVBQVIsR0FBYSxhQUFiLENBQTJCLHVCQUEzQixDQUFqQjs7QUFFQSxhQUFPLEVBQVAsQ0FBVSxRQUFWLEVBQW9CLE9BQXBCLEVBQTZCLFlBQVc7QUFDdEMsZ0JBQVEsS0FBUjtBQUNELE9BRkQ7QUFHRCxLQWZELE1BZU87QUFDTCxjQUFRLFNBQVIsR0FBb0IsYUFBcEI7QUFDQSxjQUFRLFFBQVIsQ0FBaUIsT0FBakI7QUFDRDs7QUFFRCxRQUFJLE9BQU8sS0FBUCxNQUFrQixHQUFsQixJQUF5QixPQUFPLE1BQVAsTUFBbUIsR0FBaEQsRUFBcUQ7QUFDbkQsY0FBUSxRQUFSLENBQWlCLFFBQWpCO0FBQ0Q7O0FBRUQsWUFBUSxHQUFSLENBQVksWUFBWixFQUEwQjtBQUFBLGFBQU0sT0FBTyxLQUFQLENBQWEsSUFBYixDQUFOO0FBQUEsS0FBMUI7QUFDRCxHQWpFRDs7QUFtRUEsTUFBTSxtQkFBbUIsU0FBbkIsZ0JBQW1CLEdBQVc7QUFDbEM7O0FBRUEsV0FBTyxXQUFQLENBQW1CLFlBQW5CO0FBQ0EsV0FBTyxHQUFQLENBQVcsTUFBWCxFQUFtQixrQkFBbkI7QUFDQSxXQUFPLEdBQVAsQ0FBVyxNQUFYLEVBQW1CLGNBQW5CO0FBQ0EsV0FBTyxHQUFQLENBQVcsU0FBWCxFQUFzQixnQkFBdEI7QUFDQSxXQUFPLEdBQVAsQ0FBVyxPQUFYLEVBQW9CLGNBQXBCO0FBQ0QsR0FSRDs7QUFVQSxNQUFNLGVBQWUsU0FBZixZQUFlLENBQVMsVUFBVCxFQUFxQjtBQUN4QztBQUNBLGVBQVcsTUFBWCxFQUFtQixRQUFRLFlBQVIsQ0FBcUIsUUFBckIsRUFBK0IsVUFBL0IsQ0FBbkI7QUFDRCxHQUhEOztBQUtBLGVBQWEsTUFBYixHQUFzQixVQUFTLE1BQVQsRUFBaUI7QUFDckMsWUFBUSxNQUFSLEdBQWlCLFFBQVEsWUFBUixDQUFxQixRQUFRLE1BQTdCLEVBQXFDLE1BQXJDLENBQWpCO0FBQ0QsR0FGRDs7QUFJQSxTQUFPLEVBQVAsQ0FBVSxNQUFWLEVBQWtCLGtCQUFsQjtBQUNBLFNBQU8sRUFBUCxDQUFVLE1BQVYsRUFBa0IsY0FBbEI7QUFDQSxTQUFPLEVBQVAsQ0FBVSxTQUFWLEVBQXFCLGdCQUFyQjtBQUNBLFNBQU8sRUFBUCxDQUFVLE9BQVYsRUFBbUIsY0FBbkI7O0FBRUEsU0FBTyxLQUFQLENBQWEsWUFBTTtBQUNqQixXQUFPLFFBQVAsQ0FBZ0IsWUFBaEI7QUFDRCxHQUZEOztBQUlBLFNBQU8sTUFBUCxHQUFnQixZQUFoQjtBQUNELENBdE1EOztBQXdNQTs7O0FBR0EsSUFBTSxTQUFTLFNBQVQsTUFBUyxDQUFTLE9BQVQsRUFBa0I7QUFDL0IsYUFBVyxJQUFYLEVBQWlCLFFBQVEsWUFBUixDQUFxQixRQUFyQixFQUErQixPQUEvQixDQUFqQjtBQUNELENBRkQ7O0FBSUE7QUFDQSxlQUFlLFFBQWYsRUFBeUIsTUFBekI7O0FBRUEsSUFBTSxTQUFTLFFBQVEsWUFBUixDQUFxQixRQUFyQixDQUFmOztBQUVBLElBQU0sVUFBVSxDQUFDO0FBQ2YsT0FBSyxXQURVO0FBRWYsUUFBTTtBQUZTLENBQUQsRUFHYjtBQUNELE9BQUssWUFESjtBQUVELFFBQU07QUFGTCxDQUhhLENBQWhCOztBQVFBLE1BQU0sSUFBTixDQUFXLHlCQUFYLEVBQXNDLFVBQVMsTUFBVCxFQUFpQjtBQUNyRCxTQUFPLFdBQVAsU0FBMEIsTUFBTSxPQUFoQyxHQUF5QyxVQUF6QyxFQUFxRCxZQUFyRDtBQUNBLFNBQU8sV0FBUCxRQUEwQixLQUExQix5Q0FBMEIsS0FBMUIsR0FBaUMsUUFBakMsRUFBMkMsY0FBM0M7QUFDQSxTQUFPLFdBQVAsUUFBMEIsT0FBMUIseUNBQTBCLE9BQTFCLEdBQW1DLFVBQW5DLEVBQStDLGdCQUEvQztBQUNBLFNBQU8sV0FBUCxRQUEwQixNQUExQix5Q0FBMEIsTUFBMUIsR0FBa0MsVUFBbEMsRUFBOEMsc0JBQTlDO0FBQ0QsQ0FMRDs7QUFPQSxNQUFNLE1BQU4sQ0FBYSxnQkFBYixFQUErQjtBQUU3QixZQUY2Qix3QkFFaEI7O0FBRVg7QUFDQTtBQUNBLFNBQUssS0FBTCxHQUFhLE1BQU0sYUFBTixFQUFiO0FBQ0EsU0FBSyxPQUFMLEdBQWUsU0FBUyxjQUFULENBQXdCLGVBQXhCLENBQWY7QUFDQSxTQUFLLEtBQUwsR0FBYSxTQUFTLGFBQVQsQ0FBdUIsT0FBdkIsQ0FBYjtBQUNBLFNBQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsS0FBSyxLQUE5QjtBQUNBLFNBQUssTUFBTCxHQUFjLFFBQVEsS0FBSyxLQUFiLENBQWQ7O0FBRUEsU0FBSyxNQUFMLENBQVksUUFBWixHQUF1QixZQUFXO0FBQ2hDLGFBQU8sUUFBUSxlQUFSLENBQXdCLENBQXhCLEVBQTJCLENBQTNCLENBQVA7QUFDRCxLQUZEO0FBR0EsU0FBSyxNQUFMLENBQVksTUFBWixHQUFxQixZQUFXO0FBQzlCLGFBQU8sS0FBUDtBQUNELEtBRkQ7QUFHQSxTQUFLLE1BQUwsQ0FBWSxLQUFaLEdBQW9CLFlBQVc7QUFDN0IsYUFBTyxLQUFQO0FBQ0QsS0FGRDs7QUFJQTtBQUNBLFNBQUssTUFBTCxDQUFZLE1BQVo7QUFDQSxTQUFLLFlBQUwsR0FBb0IsS0FBSyxNQUFMLENBQVksUUFBWixDQUFxQixjQUFyQixDQUFwQjs7QUFFQTtBQUNBLFNBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsQ0FBaEI7QUFDRCxHQTVCNEI7QUE4QjdCLFdBOUI2Qix1QkE4QmpCO0FBQ1YsU0FBSyxNQUFMLENBQVksT0FBWjtBQUNBLFNBQUssS0FBTCxDQUFXLE9BQVg7QUFDRDtBQWpDNEIsQ0FBL0I7O0FBb0NBLE1BQU0sSUFBTixDQUFXLGdDQUFYLEVBQTZDLFVBQVMsTUFBVCxFQUFpQjtBQUM1RCxTQUFPLE1BQVAsQ0FBYyxDQUFkOztBQUVBLFNBQU8sV0FBUCxTQUNTLE9BQU8sU0FBUCxDQUFpQixNQUQxQixHQUVFLFVBRkYsRUFHRSxzQ0FIRjs7QUFNQSxPQUFLLE1BQUwsQ0FBWSxNQUFaOztBQUVBO0FBQ0EsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixDQUFoQjs7QUFFQSxTQUFPLEVBQVAsQ0FDRSxLQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLFlBQXJCLENBREYsRUFFRSx1Q0FGRjtBQUlELENBbEJEOztBQW9CQSxNQUFNLElBQU4sQ0FBVyxrQ0FBWCxFQUErQyxVQUFTLE1BQVQsRUFBaUI7QUFDOUQsTUFBSSxZQUFZLENBQWhCOztBQUVBLE9BQUssTUFBTCxDQUFZLEVBQVosQ0FBZSxPQUFmLEVBQXdCLFlBQVc7QUFDakM7QUFDRCxHQUZEO0FBR0EsT0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixNQUFwQjs7QUFFQSxTQUFPLFdBQVAsQ0FBbUIsU0FBbkIsRUFBOEIsQ0FBOUIsRUFBaUMsa0JBQWpDO0FBQ0EsU0FBTyxXQUFQLENBQW1CLEtBQUssTUFBTCxDQUFZLEtBQVosR0FBb0IsSUFBdkMsRUFBNkMsQ0FBQyxDQUE5QyxFQUFpRCxrQkFBakQ7QUFDQSxTQUFPLFdBQVAsQ0FBbUIsS0FBSyxNQUFMLENBQVksS0FBWixHQUFvQixJQUF2QyxFQUNFLG1CQURGLEVBRUUseUJBRkY7QUFHRCxDQWJEOztBQWVBLE1BQU0sSUFBTixDQUFXLHdDQUFYLEVBQXFELFVBQVMsTUFBVCxFQUFpQjtBQUNwRSxNQUFJLFlBQVksQ0FBaEI7O0FBRUEsT0FBSyxNQUFMLENBQVksRUFBWixDQUFlLE9BQWYsRUFBd0IsWUFBVztBQUNqQztBQUNELEdBRkQ7QUFHQSxPQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLE9BQWhCO0FBQ0EsT0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixNQUFwQjtBQUNBLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBSyxJQUFyQjs7QUFFQSxTQUFPLFdBQVAsQ0FBbUIsU0FBbkIsRUFBOEIsQ0FBOUIsRUFBaUMsa0JBQWpDO0FBQ0EsU0FBTyxXQUFQLENBQW1CLEtBQUssTUFBTCxDQUFZLEtBQVosR0FBb0IsSUFBdkMsRUFBNkMsQ0FBQyxDQUE5QyxFQUFpRCxrQkFBakQ7QUFDQSxTQUFPLFdBQVAsQ0FBbUIsS0FBSyxNQUFMLENBQVksS0FBWixHQUFvQixJQUF2QyxFQUE2QyxvQkFBN0M7QUFDRCxDQWJEOztBQWVBLE1BQU0sSUFBTixDQUFXLHVEQUFYLEVBQW9FLFVBQVMsTUFBVCxFQUFpQjtBQUNuRixPQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQWxCLENBQXNCLElBQXRCLEdBQTZCLCtCQUE3QjtBQUNBO0FBQ0E7QUFDQSxPQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQWxCLENBQXNCLGVBQXRCLEdBQXdDLElBQXhDO0FBQ0E7QUFDQSxPQUFLLE1BQUwsQ0FBWSxNQUFaLEdBQXFCLFlBQVc7QUFDOUIsV0FBTyxJQUFQO0FBQ0QsR0FGRDs7QUFJQSxNQUFJLFlBQVksQ0FBaEI7O0FBRUEsT0FBSyxNQUFMLENBQVksRUFBWixDQUFlLE9BQWYsRUFBd0IsWUFBVztBQUNqQztBQUNELEdBRkQ7QUFHQSxPQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLE9BQWhCO0FBQ0EsT0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixNQUFwQjtBQUNBLE9BQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsWUFBcEI7O0FBRUEsU0FBTyxXQUFQLENBQW1CLFNBQW5CLEVBQThCLENBQTlCLEVBQWlDLGtCQUFqQztBQUNBLFNBQU8sV0FBUCxDQUFtQixLQUFLLE1BQUwsQ0FBWSxLQUFaLEdBQW9CLElBQXZDLEVBQTZDLENBQUMsQ0FBOUMsRUFBaUQsa0JBQWpEO0FBQ0EsU0FBTyxXQUFQLENBQW1CLEtBQUssTUFBTCxDQUFZLEtBQVosR0FBb0IsSUFBdkMsRUFBNkMsb0JBQTdDO0FBQ0QsQ0F0QkQ7O0FBd0JBLE1BQU0sSUFBTixDQUFXLHVFQUFYLEVBQ0UsVUFBUyxNQUFULEVBQWlCO0FBQ2YsTUFBSSxZQUFZLENBQWhCOztBQUVBLE9BQUssTUFBTCxDQUFZLEVBQVosQ0FBZSxPQUFmLEVBQXdCO0FBQUEsV0FBTSxXQUFOO0FBQUEsR0FBeEI7O0FBRUE7QUFDQSxPQUFLLE1BQUwsQ0FBWSxNQUFaO0FBQ0EsT0FBSyxNQUFMLENBQVksTUFBWjs7QUFFQTtBQUNBLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsQ0FBaEI7O0FBRUEsT0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixNQUFwQjs7QUFFQSxTQUFPLFdBQVAsQ0FBbUIsU0FBbkIsRUFBOEIsQ0FBOUIsRUFBaUMsd0JBQWpDO0FBQ0EsU0FBTyxXQUFQLENBQW1CLEtBQUssTUFBTCxDQUFZLEtBQVosR0FBb0IsSUFBdkMsRUFBNkMsQ0FBQyxDQUE5QyxFQUFpRCxrQkFBakQ7QUFDQSxTQUFPLFdBQVAsQ0FBbUIsS0FBSyxNQUFMLENBQVksS0FBWixHQUFvQixJQUF2QyxFQUE2QyxtQkFBN0M7QUFDRCxDQWxCSDs7QUFvQkEsTUFBTSxJQUFOLENBQVcsbURBQVgsRUFBZ0UsVUFBUyxNQUFULEVBQWlCO0FBQy9FLE9BQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsT0FBaEI7QUFDQSxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLE1BQXBCO0FBQ0EsT0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixTQUFwQjtBQUNBLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBSyxJQUFyQjs7QUFFQSxTQUFPLEVBQVAsQ0FBVSxDQUFDLEtBQUssTUFBTCxDQUFZLEtBQVosRUFBWCxFQUNFLHVEQURGO0FBRUQsQ0FSRDs7QUFVQSxNQUFNLElBQU4sQ0FBVyx1Q0FBWCxFQUFvRCxVQUFTLE1BQVQsRUFBaUI7QUFDbkUsTUFBSSxZQUFZLENBQWhCOztBQUVBLE9BQUssTUFBTCxDQUFZLEVBQVosQ0FBZSxPQUFmLEVBQXdCLFlBQVc7QUFDakM7QUFDRCxHQUZEO0FBR0EsT0FBSyxNQUFMLENBQVksR0FBWixDQUFnQixPQUFoQjtBQUNBLE9BQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsTUFBcEI7O0FBRUEsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFLLElBQXJCOztBQUVBLFNBQU8sV0FBUCxDQUFtQixTQUFuQixFQUE4QixDQUE5QixFQUFpQyxrQkFBakM7QUFDQSxTQUFPLFdBQVAsQ0FBbUIsS0FBSyxNQUFMLENBQVksS0FBWixHQUFvQixJQUF2QyxFQUE2QyxDQUFDLENBQTlDLEVBQWlELGtCQUFqRDtBQUNBLFNBQU8sV0FBUCxDQUFtQixLQUFLLE1BQUwsQ0FBWSxLQUFaLEdBQW9CLElBQXZDLEVBQTZDLG9CQUE3Qzs7QUFFQSxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLFVBQXBCO0FBQ0EsU0FBTyxXQUFQLENBQW1CLEtBQUssTUFBTCxDQUFZLEtBQVosRUFBbkIsRUFBd0MsSUFBeEMsRUFBOEMsZUFBOUM7QUFDRCxDQWpCRDs7QUFtQkE7QUFDQSxNQUFNLElBQU4sQ0FBVyxvQ0FBWCxFQUFpRCxVQUFTLE1BQVQsRUFBaUI7QUFDaEUsT0FBSyxNQUFMLENBQVksR0FBWixDQUFnQixPQUFoQjtBQUNBLE9BQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsTUFBcEI7QUFDQSxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLFNBQXBCOztBQUVBLFNBQU8sRUFBUCxDQUFVLENBQUMsS0FBSyxNQUFMLENBQVksS0FBWixFQUFYLEVBQWdDLGdCQUFoQztBQUNELENBTkQ7O0FBUUEsTUFBTSxJQUFOLENBQVcsc0RBQVgsRUFBbUUsVUFBUyxNQUFULEVBQWlCO0FBQ2xGLE1BQUksWUFBWSxDQUFoQjs7QUFFQSxPQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsT0FBZixFQUF3QixZQUFXO0FBQ2pDO0FBQ0QsR0FGRDtBQUdBLE9BQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsT0FBaEI7QUFDQSxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLE1BQXBCO0FBQ0E7QUFDQSxPQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEtBQUssSUFBckI7QUFDQSxTQUFPLFdBQVAsQ0FBbUIsU0FBbkIsRUFBOEIsQ0FBOUIsRUFBaUMsaUJBQWpDOztBQUVBO0FBQ0EsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFLLElBQXJCO0FBQ0EsU0FBTyxXQUFQLENBQW1CLFNBQW5CLEVBQThCLENBQTlCLEVBQWlDLHNCQUFqQztBQUNELENBZkQ7O0FBaUJBLE1BQU0sSUFBTixDQUFXLHdEQUFYLEVBQXFFLFVBQVMsTUFBVCxFQUFpQjtBQUNwRixNQUFJLFlBQVksQ0FBaEI7O0FBRUEsT0FBSyxNQUFMLENBQVksRUFBWixDQUFlLE9BQWYsRUFBd0IsWUFBVztBQUNqQztBQUNELEdBRkQ7QUFHQSxPQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLE9BQWhCO0FBQ0EsT0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixNQUFwQjtBQUNBO0FBQ0EsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFLLElBQXJCO0FBQ0E7QUFDQSxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLFVBQXBCO0FBQ0EsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFLLElBQXJCOztBQUVBLFNBQU8sV0FBUCxDQUFtQixTQUFuQixFQUE4QixDQUE5QixFQUFpQyxtQkFBakM7QUFDRCxDQWZEOztBQWlCQSxNQUFNLElBQU4sQ0FBVyxnREFBWCxFQUE2RCxVQUFTLE1BQVQsRUFBaUI7QUFDNUUsTUFBSSxZQUFZLENBQWhCOztBQUVBLE9BQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsT0FBaEI7QUFDQSxPQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsT0FBZixFQUF3QixZQUFXO0FBQ2pDO0FBQ0QsR0FGRDtBQUdBO0FBQ0EsT0FBSyxNQUFMLENBQVksRUFBWixDQUFlLFlBQWYsRUFBNkIsVUFBUyxLQUFULEVBQWdCO0FBQzNDLFVBQU0sd0JBQU47QUFDRCxHQUZEO0FBR0EsT0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixNQUFwQjtBQUNBLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBSyxJQUFyQjs7QUFFQSxTQUFPLFdBQVAsQ0FBbUIsU0FBbkIsRUFBOEIsQ0FBOUIsRUFBaUMsd0JBQWpDO0FBQ0EsU0FBTyxXQUFQLENBQW1CLEtBQUssTUFBTCxDQUFZLEtBQVosR0FBb0IsSUFBdkMsRUFBNkMsQ0FBQyxDQUE5QyxFQUFpRCxrQkFBakQ7QUFDQSxTQUFPLFdBQVAsQ0FBbUIsS0FBSyxNQUFMLENBQVksS0FBWixHQUFvQixJQUF2QyxFQUNFLG9CQURGLEVBRUUsd0JBRkY7QUFHRCxDQW5CRDs7QUFxQkEsTUFBTSxJQUFOLENBQVcscURBQVgsRUFBa0UsVUFBUyxNQUFULEVBQWlCO0FBQ2pGLE1BQUksWUFBWSxDQUFoQjs7QUFFQSxPQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLE9BQWhCO0FBQ0EsT0FBSyxNQUFMLENBQVksRUFBWixDQUFlLE9BQWYsRUFBd0IsWUFBVztBQUNqQztBQUNELEdBRkQ7QUFHQSxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLE1BQXBCO0FBQ0EsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFLLElBQXJCO0FBQ0EsT0FBSyxNQUFMLENBQVksV0FBWixHQUEwQixZQUFXO0FBQ25DLFdBQU8sQ0FBUDtBQUNELEdBRkQ7QUFHQSxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLFlBQXBCO0FBQ0EsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFLLElBQXJCOztBQUVBLFNBQU8sV0FBUCxDQUFtQixTQUFuQixFQUE4QixDQUE5QixFQUFpQyxrQkFBakM7QUFDRCxDQWhCRDs7QUFrQkEsTUFBTSxJQUFOLENBQVcseURBQVgsRUFBc0UsVUFBUyxNQUFULEVBQWlCO0FBQ3JGLE1BQUksWUFBWSxDQUFoQjs7QUFFQSxPQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLE9BQWhCO0FBQ0EsT0FBSyxNQUFMLENBQVksRUFBWixDQUFlLE9BQWYsRUFBd0IsWUFBVztBQUNqQztBQUNELEdBRkQ7QUFHQSxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLE1BQXBCO0FBQ0EsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFLLElBQXJCO0FBQ0EsT0FBSyxNQUFMLENBQVksV0FBWixHQUEwQixZQUFXO0FBQ25DLFdBQU8sQ0FBUDtBQUNELEdBRkQ7QUFHQSxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLGNBQXBCO0FBQ0EsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFLLElBQXJCOztBQUVBLFNBQU8sV0FBUCxDQUFtQixTQUFuQixFQUE4QixDQUE5QixFQUFpQyxrQkFBakM7QUFDRCxDQWhCRDs7QUFrQkEsTUFBTSxJQUFOLENBQVcsc0RBQVgsRUFBbUUsVUFBUyxNQUFULEVBQWlCO0FBQ2xGLE9BQUssTUFBTCxDQUFZLEdBQVosQ0FBZ0IsT0FBaEI7QUFDQSxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLE1BQXBCO0FBQ0EsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFLLElBQXJCO0FBQ0EsT0FBSyxNQUFMLENBQVksV0FBWixHQUEwQixZQUFXO0FBQ25DLFdBQU8sQ0FBUDtBQUNELEdBRkQ7QUFHQSxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLFlBQXBCOztBQUVBLFNBQU8sRUFBUCxDQUFVLENBQUMsS0FBSyxNQUFMLENBQVksS0FBWixFQUFYLEVBQWdDLHFCQUFoQztBQUNELENBVkQ7O0FBWUEsTUFBTSxJQUFOLENBQVcsc0RBQVgsRUFBbUUsVUFBUyxNQUFULEVBQWlCO0FBQ2xGLE1BQUksWUFBWSxDQUFoQjs7QUFFQSxPQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLE9BQWhCO0FBQ0EsT0FBSyxNQUFMLENBQVksRUFBWixDQUFlLE9BQWYsRUFBd0IsWUFBVztBQUNqQztBQUNELEdBRkQ7QUFHQSxPQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsWUFBZixFQUE2QixVQUFTLEtBQVQsRUFBZ0I7QUFDM0MsVUFBTSx3QkFBTjtBQUNELEdBRkQ7QUFHQSxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLE1BQXBCO0FBQ0E7QUFDQSxPQUFLLE1BQUwsQ0FBWSxNQUFaLEdBQXFCLFlBQVc7QUFDOUIsV0FBTyxJQUFQO0FBQ0QsR0FGRDtBQUdBLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBSyxJQUFyQjs7QUFFQSxTQUFPLFdBQVAsQ0FBbUIsU0FBbkIsRUFBOEIsQ0FBOUIsRUFBaUMsa0JBQWpDO0FBQ0QsQ0FsQkQ7O0FBb0JBO0FBQ0EsTUFBTSxJQUFOLENBQVcsb0RBQVgsRUFBaUUsVUFBUyxNQUFULEVBQWlCO0FBQ2hGLE1BQUksWUFBWSxDQUFoQjs7QUFFQSxPQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLE9BQWhCO0FBQ0EsT0FBSyxNQUFMLENBQVksRUFBWixDQUFlLE9BQWYsRUFBd0IsWUFBVztBQUNqQztBQUNELEdBRkQ7QUFHQSxPQUFLLE1BQUwsQ0FBWSxFQUFaLENBQWUsWUFBZixFQUE2QixVQUFTLEtBQVQsRUFBZ0I7QUFDM0MsVUFBTSx3QkFBTjtBQUNELEdBRkQ7QUFHQSxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLE1BQXBCO0FBQ0E7QUFDQSxPQUFLLE1BQUwsQ0FBWSxLQUFaLEdBQW9CLFlBQVc7QUFDN0IsV0FBTyxJQUFQO0FBQ0QsR0FGRDtBQUdBLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsS0FBSyxJQUFyQjs7QUFFQSxTQUFPLFdBQVAsQ0FBbUIsU0FBbkIsRUFBOEIsQ0FBOUIsRUFBaUMsa0JBQWpDO0FBQ0QsQ0FsQkQ7O0FBb0JBLE1BQU0sSUFBTixDQUFXLGtEQUFYLEVBQStELFVBQVMsTUFBVCxFQUFpQjtBQUM5RSxPQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLE9BQWhCO0FBQ0EsT0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixNQUFwQjtBQUNBLE9BQUssTUFBTCxDQUFZLEtBQVosQ0FBa0I7QUFDaEIsVUFBTSxRQURVO0FBRWhCLFVBQU0sQ0FBQztBQUZTLEdBQWxCO0FBSUEsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixLQUFLLElBQXJCOztBQUVBLFNBQU8sV0FBUCxDQUFtQixDQUFDLENBQXBCLEVBQXVCLEtBQUssTUFBTCxDQUFZLEtBQVosR0FBb0IsSUFBM0MsRUFBaUQsMkJBQWpEO0FBQ0QsQ0FWRDs7QUFZQSxNQUFNLElBQU4sQ0FBVyxrREFBWCxFQUErRCxVQUFTLE1BQVQsRUFBaUI7QUFDOUUsTUFBSSxZQUFZLENBQWhCOztBQUVBLE9BQUssTUFBTCxDQUFZLEVBQVosQ0FBZSxPQUFmLEVBQXdCLFlBQVc7QUFDakM7QUFDRCxHQUZEO0FBR0EsT0FBSyxNQUFMLENBQVksS0FBWixDQUFrQjtBQUNoQixVQUFNLG1EQURVO0FBRWhCLFVBQU07QUFGVSxHQUFsQjtBQUlBLFNBQU8sRUFBUCxDQUFVLElBQVYsRUFBZ0IsNkJBQWhCO0FBQ0EsU0FBTyxXQUFQLENBQW1CLFNBQW5CLEVBQThCLENBQTlCLEVBQWlDLGtCQUFqQzs7QUFFQTtBQUNBLE9BQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsRUFBbEI7QUFDQSxTQUFPLEVBQVAsQ0FBVSxJQUFWLEVBQWdCLDZCQUFoQjs7QUFFQSxTQUFPLFdBQVAsQ0FBbUIsU0FBbkIsRUFBOEIsQ0FBOUIsRUFBaUMsa0JBQWpDO0FBQ0QsQ0FsQkQ7O0FBb0JBLE1BQU0sSUFBTixDQUFXLCtDQUFYLEVBQTRELFVBQVMsTUFBVCxFQUFpQjtBQUMzRSxNQUFNLGNBQWMsRUFBQyxVQUFVLGVBQVgsRUFBNEIsU0FBUyxjQUFyQyxFQUFwQjs7QUFFQTtBQUNBLE9BQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsRUFBQyxRQUFRLEVBQUMsR0FBRyxXQUFKLEVBQVQsRUFBbkI7QUFDQTtBQUNBLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsQ0FBaEI7QUFDQTtBQUNBLE9BQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsQ0FBbEI7QUFDQTtBQUNBLFNBQU8sV0FBUCxDQUFtQixLQUFLLFlBQUwsQ0FBa0IsQ0FBbEIsQ0FBb0Isc0JBQXBCLEVBQTRDLFdBQS9ELEVBQ0UsWUFBWSxRQURkLEVBQ3dCLDZDQUR4QjtBQUVBLFNBQU8sV0FBUCxDQUFtQixLQUFLLFlBQUwsQ0FBa0IsQ0FBbEIsQ0FBb0IscUJBQXBCLEVBQTJDLFdBQTlELEVBQ0UsWUFBWSxPQURkLEVBQ3VCLDRDQUR2QjtBQUVELENBZEQ7O0FBZ0JBLE1BQU0sSUFBTixDQUFXLHdEQUFYLEVBQXFFLFVBQVMsTUFBVCxFQUFpQjtBQUNwRixNQUFNLFFBQVEsUUFBUSxPQUFSLENBQWdCLE9BQWhCLENBQWQ7O0FBRUE7QUFDQSxNQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1YsV0FBTyxLQUFQLENBQWEsS0FBYixFQUFvQiw4Q0FBcEI7QUFDQTtBQUNEOztBQUVELE1BQU0saUJBQWlCLFFBQVEsWUFBUixDQUFxQixPQUFyQixFQUE4QixXQUFyRDs7QUFFQTtBQUNBLFVBQVEsWUFBUixDQUFxQixPQUFyQixFQUE4QixXQUE5QixHQUE0QztBQUFBLFdBQU0sS0FBTjtBQUFBLEdBQTVDOztBQUVBO0FBQ0EsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixDQUFoQjtBQUNBO0FBQ0EsT0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixDQUFsQjtBQUNBO0FBQ0EsU0FBTyxLQUFQLENBQWEsS0FBSyxZQUFMLENBQWtCLENBQWxCLENBQW9CLDBCQUFwQixFQUFnRCxXQUE3RCxFQUNFLDZFQURGLEVBRUUseUNBRkY7QUFHQTtBQUNBLFVBQVEsWUFBUixDQUFxQixPQUFyQixFQUE4QixXQUE5QixHQUE0QyxjQUE1QztBQUNELENBeEJEOztBQTBCQSxNQUFNLElBQU4sQ0FBVyw4QkFBWCxFQUEyQyxVQUFTLE1BQVQsRUFBaUI7QUFDMUQ7QUFDQSxPQUFLLE1BQUwsQ0FBWSxNQUFaO0FBQ0E7QUFDQSxPQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLENBQWhCO0FBQ0E7QUFDQSxPQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLENBQWxCO0FBQ0E7QUFDQSxTQUFPLEVBQVAsQ0FBVSxLQUFLLFlBQUwsQ0FBa0IsQ0FBbEIsQ0FBb0IsdUJBQXBCLENBQVYsRUFBd0Qsc0JBQXhEO0FBQ0EsU0FBTyxFQUFQLENBQVUsS0FBSyxZQUFMLENBQWtCLENBQWxCLENBQW9CLG1CQUFwQixDQUFWLEVBQW9ELHlCQUFwRDtBQUNELENBVkQ7O0FBWUEsTUFBTSxJQUFOLENBQVcsNkJBQVgsRUFBMEMsVUFBUyxNQUFULEVBQWlCO0FBQ3pELE1BQU0scUJBQXFCO0FBQ3pCLGNBQVUsZUFEZTtBQUV6QixhQUFTLGNBRmdCO0FBR3pCLGFBQVM7QUFIZ0IsR0FBM0I7O0FBTUE7QUFDQSxPQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLEVBQUMsUUFBUSxFQUFDLEdBQUcsa0JBQUosRUFBVCxFQUFuQjtBQUNBO0FBQ0EsT0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixDQUFoQjtBQUNBO0FBQ0EsT0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixDQUFsQjtBQUNBO0FBQ0EsU0FBTyxFQUFQLENBQVUsS0FBSyxZQUFMLENBQWtCLENBQWxCLENBQW9CLHVCQUFwQixDQUFWLEVBQXdELHNCQUF4RDtBQUNBLFNBQU8sRUFBUCxDQUFVLEtBQUssWUFBTCxDQUFrQixDQUFsQixDQUFvQixtQkFBcEIsQ0FBVixFQUFvRCx5QkFBcEQ7QUFDRCxDQWhCRDs7QUFrQkEsTUFBTSxJQUFOLENBQVcsaUNBQVgsRUFBOEMsVUFBUyxNQUFULEVBQWlCO0FBQzdELE1BQU0sc0JBQXNCO0FBQzFCLGNBQVUsZUFEZ0I7QUFFMUIsYUFBUyxjQUZpQjtBQUcxQixhQUFTO0FBSGlCLEdBQTVCOztBQU1BO0FBQ0EsT0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixFQUFDLFFBQVEsRUFBQyxHQUFHLG1CQUFKLEVBQVQsRUFBbkI7QUFDQTtBQUNBLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsQ0FBaEI7QUFDQTtBQUNBLE9BQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsQ0FBbEI7QUFDQTtBQUNBLFNBQU8sRUFBUCxDQUFVLENBQUMsS0FBSyxZQUFMLENBQWtCLENBQWxCLENBQW9CLHVCQUFwQixDQUFYLEVBQXlELDBCQUF6RDtBQUNBLFNBQU8sRUFBUCxDQUFVLENBQUMsS0FBSyxZQUFMLENBQWtCLENBQWxCLENBQW9CLG1CQUFwQixDQUFYLEVBQXFELDZCQUFyRDtBQUNELENBaEJEOztBQWtCQSxNQUFNLElBQU4sQ0FBVyx1Q0FBWCxFQUFvRCxVQUFTLE1BQVQsRUFBaUI7QUFDbkUsT0FBSyxNQUFMLENBQVksTUFBWjs7QUFFQTtBQUNBLE9BQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsQ0FBaEI7O0FBRUEsTUFBTSxRQUFRO0FBQ1osVUFBTTtBQUNKLFlBQU0sTUFERjtBQUVKLGdCQUFVLE1BRk47QUFHSixlQUFTO0FBSEw7QUFETSxHQUFkOztBQVFBLE9BQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsTUFBbkIsQ0FBMEIsS0FBMUI7O0FBRUEsT0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixFQUFDLE1BQU0sQ0FBQyxDQUFSLEVBQWxCOztBQUVBLFNBQU8sV0FBUCxDQUNFLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsQ0FBekIsQ0FBMkIsc0JBQTNCLEVBQW1ELFdBRHJELEVBRUUsTUFBTSxJQUFOLEVBQVksUUFGZCxFQUdFLDZDQUhGOztBQU1BLFNBQU8sV0FBUCxDQUNFLEtBQUssTUFBTCxDQUFZLFlBQVosQ0FBeUIsQ0FBekIsQ0FBMkIscUJBQTNCLEVBQWtELFdBRHBELEVBRUUsTUFBTSxJQUFOLEVBQVksT0FGZCxFQUdFLDRDQUhGO0FBS0QsQ0E3QkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIHRvcExldmVsID0gdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOlxuICAgIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDoge31cbnZhciBtaW5Eb2MgPSByZXF1aXJlKCdtaW4tZG9jdW1lbnQnKTtcblxuaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGRvY3VtZW50O1xufSBlbHNlIHtcbiAgICB2YXIgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddO1xuXG4gICAgaWYgKCFkb2NjeSkge1xuICAgICAgICBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J10gPSBtaW5Eb2M7XG4gICAgfVxuXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBkb2NjeTtcbn1cbiIsImlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGdsb2JhbDtcbn0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe1xuICAgIG1vZHVsZS5leHBvcnRzID0gc2VsZjtcbn0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7fTtcbn1cbiIsIiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gX2ludGVyb3BEZWZhdWx0IChleCkgeyByZXR1cm4gKGV4ICYmICh0eXBlb2YgZXggPT09ICdvYmplY3QnKSAmJiAnZGVmYXVsdCcgaW4gZXgpID8gZXhbJ2RlZmF1bHQnXSA6IGV4OyB9XG5cbnZhciBkb2N1bWVudCA9IF9pbnRlcm9wRGVmYXVsdChyZXF1aXJlKCdnbG9iYWwvZG9jdW1lbnQnKSk7XG52YXIgUVVuaXQgPSBfaW50ZXJvcERlZmF1bHQocmVxdWlyZSgncXVuaXQnKSk7XG52YXIgc2lub24gPSBfaW50ZXJvcERlZmF1bHQocmVxdWlyZSgnc2lub24nKSk7XG52YXIgdmlkZW9qcyA9IF9pbnRlcm9wRGVmYXVsdChyZXF1aXJlKCd2aWRlby5qcycpKTtcbnZhciB3aW5kb3cgPSBfaW50ZXJvcERlZmF1bHQocmVxdWlyZSgnZ2xvYmFsL3dpbmRvdycpKTtcblxuY29uc3QgRmxhc2hPYmogPSB2aWRlb2pzLmdldENvbXBvbmVudCgnRmxhc2gnKTtcbmNvbnN0IGRlZmF1bHREaXNtaXNzID0gIXZpZGVvanMuYnJvd3Nlci5JU19JUEhPTkU7XG5cbi8vIFZpZGVvLmpzIDUvNiBjcm9zcy1jb21wYXRpYmlsaXR5LlxuY29uc3QgcmVnaXN0ZXJQbHVnaW4gPSB2aWRlb2pzLnJlZ2lzdGVyUGx1Z2luIHx8IHZpZGVvanMucGx1Z2luO1xuXG4vLyBEZWZhdWx0IG9wdGlvbnMgZm9yIHRoZSBwbHVnaW4uXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgaGVhZGVyOiAnJyxcbiAgY29kZTogJycsXG4gIG1lc3NhZ2U6ICcnLFxuICB0aW1lb3V0OiA0NSAqIDEwMDAsXG4gIGRpc21pc3M6IGRlZmF1bHREaXNtaXNzLFxuICBlcnJvcnM6IHtcbiAgICAnMSc6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfQUJPUlRFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoZSB2aWRlbyBkb3dubG9hZCB3YXMgY2FuY2VsbGVkJ1xuICAgIH0sXG4gICAgJzInOiB7XG4gICAgICB0eXBlOiAnTUVESUFfRVJSX05FVFdPUksnLFxuICAgICAgaGVhZGxpbmU6ICdUaGUgdmlkZW8gY29ubmVjdGlvbiB3YXMgbG9zdCwgcGxlYXNlIGNvbmZpcm0geW91IGFyZSAnICtcbiAgICAgICAgICAgICAgICAnY29ubmVjdGVkIHRvIHRoZSBpbnRlcm5ldCdcbiAgICB9LFxuICAgICczJzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9ERUNPREUnLFxuICAgICAgaGVhZGxpbmU6ICdUaGUgdmlkZW8gaXMgYmFkIG9yIGluIGEgZm9ybWF0IHRoYXQgY2Fubm90IGJlIHBsYXllZCBvbiB5b3VyIGJyb3dzZXInXG4gICAgfSxcbiAgICAnNCc6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfU1JDX05PVF9TVVBQT1JURUQnLFxuICAgICAgaGVhZGxpbmU6ICdUaGlzIHZpZGVvIGlzIGVpdGhlciB1bmF2YWlsYWJsZSBvciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcidcbiAgICB9LFxuICAgICc1Jzoge1xuICAgICAgdHlwZTogJ01FRElBX0VSUl9FTkNSWVBURUQnLFxuICAgICAgaGVhZGxpbmU6ICdUaGUgdmlkZW8geW91IGFyZSB0cnlpbmcgdG8gd2F0Y2ggaXMgZW5jcnlwdGVkIGFuZCB3ZSBkbyBub3Qga25vdyBob3cgJyArXG4gICAgICAgICAgICAgICAgJ3RvIGRlY3J5cHQgaXQnXG4gICAgfSxcbiAgICAndW5rbm93bic6IHtcbiAgICAgIHR5cGU6ICdNRURJQV9FUlJfVU5LTk9XTicsXG4gICAgICBoZWFkbGluZTogJ0FuIHVuYW50aWNpcGF0ZWQgcHJvYmxlbSB3YXMgZW5jb3VudGVyZWQsIGNoZWNrIGJhY2sgc29vbiBhbmQgdHJ5IGFnYWluJ1xuICAgIH0sXG4gICAgJy0xJzoge1xuICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfTk9fU1JDJyxcbiAgICAgIGhlYWRsaW5lOiAnTm8gdmlkZW8gaGFzIGJlZW4gbG9hZGVkJ1xuICAgIH0sXG4gICAgJy0yJzoge1xuICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfVElNRU9VVCcsXG4gICAgICBoZWFkbGluZTogJ0NvdWxkIG5vdCBkb3dubG9hZCB0aGUgdmlkZW8nXG4gICAgfSxcbiAgICAnLTMnOiB7XG4gICAgICB0eXBlOiAnUExBWUVSX0VSUl9ET01BSU5fUkVTVFJJQ1RFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoaXMgdmlkZW8gaXMgcmVzdHJpY3RlZCBmcm9tIHBsYXlpbmcgb24geW91ciBjdXJyZW50IGRvbWFpbidcbiAgICB9LFxuICAgICctNCc6IHtcbiAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX0lQX1JFU1RSSUNURUQnLFxuICAgICAgaGVhZGxpbmU6ICdUaGlzIHZpZGVvIGlzIHJlc3RyaWN0ZWQgYXQgeW91ciBjdXJyZW50IElQIGFkZHJlc3MnXG4gICAgfSxcbiAgICAnLTUnOiB7XG4gICAgICB0eXBlOiAnUExBWUVSX0VSUl9HRU9fUkVTVFJJQ1RFRCcsXG4gICAgICBoZWFkbGluZTogJ1RoaXMgdmlkZW8gaXMgcmVzdHJpY3RlZCBmcm9tIHBsYXlpbmcgaW4geW91ciBjdXJyZW50IGdlb2dyYXBoaWMgcmVnaW9uJ1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBNb25pdG9ycyBhIHBsYXllciBmb3Igc2lnbnMgb2YgbGlmZSBkdXJpbmcgcGxheWJhY2sgYW5kXG4gKiB0cmlnZ2VycyBQTEFZRVJfRVJSX1RJTUVPVVQgaWYgbm9uZSBvY2N1ciB3aXRoaW4gYSByZWFzb25hYmxlXG4gKiB0aW1lZnJhbWUuXG4gKi9cbmNvbnN0IGluaXRQbHVnaW4gPSBmdW5jdGlvbihwbGF5ZXIsIG9wdGlvbnMpIHtcbiAgbGV0IG1vbml0b3I7XG4gIGNvbnN0IGxpc3RlbmVycyA9IFtdO1xuXG4gIC8vIGNsZWFycyB0aGUgcHJldmlvdXMgbW9uaXRvciB0aW1lb3V0IGFuZCBzZXRzIHVwIGEgbmV3IG9uZVxuICBjb25zdCByZXNldE1vbml0b3IgPSBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KG1vbml0b3IpO1xuICAgIG1vbml0b3IgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIC8vIHBsYXllciBhbHJlYWR5IGhhcyBhbiBlcnJvclxuICAgICAgLy8gb3IgaXMgbm90IHBsYXlpbmcgdW5kZXIgbm9ybWFsIGNvbmRpdGlvbnNcbiAgICAgIGlmIChwbGF5ZXIuZXJyb3IoKSB8fCBwbGF5ZXIucGF1c2VkKCkgfHwgcGxheWVyLmVuZGVkKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBwbGF5ZXIuZXJyb3Ioe1xuICAgICAgICBjb2RlOiAtMixcbiAgICAgICAgdHlwZTogJ1BMQVlFUl9FUlJfVElNRU9VVCdcbiAgICAgIH0pO1xuICAgIH0sIG9wdGlvbnMudGltZW91dCk7XG5cbiAgICAvLyBjbGVhciBvdXQgYW55IGV4aXN0aW5nIHBsYXllciB0aW1lb3V0XG4gICAgLy8gcGxheWJhY2sgaGFzIHJlY292ZXJlZFxuICAgIGlmIChwbGF5ZXIuZXJyb3IoKSAmJiBwbGF5ZXIuZXJyb3IoKS5jb2RlID09PSAtMikge1xuICAgICAgcGxheWVyLmVycm9yKG51bGwpO1xuICAgIH1cbiAgfTtcblxuICAvLyBjbGVhciBhbnkgcHJldmlvdXNseSByZWdpc3RlcmVkIGxpc3RlbmVyc1xuICBjb25zdCBjbGVhbnVwID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGxpc3RlbmVyO1xuXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgIGxpc3RlbmVyID0gbGlzdGVuZXJzLnNoaWZ0KCk7XG4gICAgICBwbGF5ZXIub2ZmKGxpc3RlbmVyWzBdLCBsaXN0ZW5lclsxXSk7XG4gICAgfVxuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQobW9uaXRvcik7XG4gIH07XG5cbiAgLy8gY3JlYXRlcyBhbmQgdHJhY2tzIGEgcGxheWVyIGxpc3RlbmVyIGlmIHRoZSBwbGF5ZXIgbG9va3MgYWxpdmVcbiAgY29uc3QgaGVhbHRoY2hlY2sgPSBmdW5jdGlvbih0eXBlLCBmbikge1xuICAgIGNvbnN0IGNoZWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBpZiB0aGVyZSdzIGFuIGVycm9yIGRvIG5vdCByZXNldCB0aGUgbW9uaXRvciBhbmRcbiAgICAgIC8vIGNsZWFyIHRoZSBlcnJvciB1bmxlc3MgdGltZSBpcyBwcm9ncmVzc2luZ1xuICAgICAgaWYgKCFwbGF5ZXIuZXJyb3IoKSkge1xuICAgICAgICAvLyBlcnJvciBpZiB1c2luZyBGbGFzaCBhbmQgaXRzIEFQSSBpcyB1bmF2YWlsYWJsZVxuICAgICAgICBjb25zdCB0ZWNoID0gcGxheWVyLiQoJy52anMtdGVjaCcpO1xuXG4gICAgICAgIGlmICh0ZWNoICYmXG4gICAgICAgICAgICB0ZWNoLnR5cGUgPT09ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCcgJiZcbiAgICAgICAgICAgICF0ZWNoLnZqc19nZXRQcm9wZXJ0eSkge1xuICAgICAgICAgIHBsYXllci5lcnJvcih7XG4gICAgICAgICAgICBjb2RlOiAtMixcbiAgICAgICAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX1RJTUVPVVQnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGxheWJhY2sgaXNuJ3QgZXhwZWN0ZWQgaWYgdGhlIHBsYXllciBpcyBwYXVzZWRcbiAgICAgICAgaWYgKHBsYXllci5wYXVzZWQoKSkge1xuICAgICAgICAgIHJldHVybiByZXNldE1vbml0b3IoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBwbGF5YmFjayBpc24ndCBleHBlY3RlZCBvbmNlIHRoZSB2aWRlbyBoYXMgZW5kZWRcbiAgICAgICAgaWYgKHBsYXllci5lbmRlZCgpKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc2V0TW9uaXRvcigpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZuLmNhbGwodGhpcyk7XG4gICAgfTtcblxuICAgIHBsYXllci5vbih0eXBlLCBjaGVjayk7XG4gICAgbGlzdGVuZXJzLnB1c2goW3R5cGUsIGNoZWNrXSk7XG4gIH07XG5cbiAgY29uc3Qgb25QbGF5U3RhcnRNb25pdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgbGV0IGxhc3RUaW1lID0gMDtcblxuICAgIGNsZWFudXAoKTtcblxuICAgIC8vIGlmIG5vIHBsYXliYWNrIGlzIGRldGVjdGVkIGZvciBsb25nIGVub3VnaCwgdHJpZ2dlciBhIHRpbWVvdXQgZXJyb3JcbiAgICByZXNldE1vbml0b3IoKTtcbiAgICBoZWFsdGhjaGVjayhbJ3RpbWV1cGRhdGUnLCAnYWR0aW1ldXBkYXRlJ10sIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBwbGF5ZXIuY3VycmVudFRpbWUoKTtcblxuICAgICAgLy8gcGxheWJhY2sgaXMgb3BlcmF0aW5nIG5vcm1hbGx5IG9yIGhhcyByZWNvdmVyZWRcbiAgICAgIGlmIChjdXJyZW50VGltZSAhPT0gbGFzdFRpbWUpIHtcbiAgICAgICAgbGFzdFRpbWUgPSBjdXJyZW50VGltZTtcbiAgICAgICAgcmVzZXRNb25pdG9yKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaGVhbHRoY2hlY2soJ3Byb2dyZXNzJywgcmVzZXRNb25pdG9yKTtcbiAgfTtcblxuICBjb25zdCBvblBsYXlOb1NvdXJjZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghcGxheWVyLmN1cnJlbnRTcmMoKSkge1xuICAgICAgcGxheWVyLmVycm9yKHtcbiAgICAgICAgY29kZTogLTEsXG4gICAgICAgIHR5cGU6ICdQTEFZRVJfRVJSX05PX1NSQydcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBvbkVycm9ySGFuZGxlciA9IGZ1bmN0aW9uKCkge1xuICAgIGxldCBkZXRhaWxzID0gJyc7XG4gICAgbGV0IGVycm9yID0gcGxheWVyLmVycm9yKCk7XG4gICAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxldCBkaWFsb2dDb250ZW50ID0gJyc7XG5cbiAgICAvLyBJbiB0aGUgcmFyZSBjYXNlIHdoZW4gYGVycm9yKClgIGRvZXMgbm90IHJldHVybiBhbiBlcnJvciBvYmplY3QsXG4gICAgLy8gZGVmZW5zaXZlbHkgZXNjYXBlIHRoZSBoYW5kbGVyIGZ1bmN0aW9uLlxuICAgIGlmICghZXJyb3IpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBlcnJvciA9IHZpZGVvanMubWVyZ2VPcHRpb25zKGVycm9yLCBvcHRpb25zLmVycm9yc1tlcnJvci5jb2RlIHx8IDBdKTtcblxuICAgIGlmIChlcnJvci5tZXNzYWdlKSB7XG4gICAgICBkZXRhaWxzID0gYDxkaXYgY2xhc3M9XCJ2anMtZXJyb3JzLWRldGFpbHNcIj4ke3BsYXllci5sb2NhbGl6ZSgnVGVjaG5pY2FsIGRldGFpbHMnKX1cbiAgICAgICAgOiA8ZGl2IGNsYXNzPVwidmpzLWVycm9ycy1tZXNzYWdlXCI+JHtwbGF5ZXIubG9jYWxpemUoZXJyb3IubWVzc2FnZSl9PC9kaXY+XG4gICAgICAgIDwvZGl2PmA7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yLmNvZGUgPT09IDQgJiYgRmxhc2hPYmogJiYgIUZsYXNoT2JqLmlzU3VwcG9ydGVkKCkpIHtcbiAgICAgIGNvbnN0IGZsYXNoTWVzc2FnZSA9IHBsYXllci5sb2NhbGl6ZSgnSWYgeW91IGFyZSB1c2luZyBhbiBvbGRlciBicm93c2VyIHBsZWFzZSB0cnkgdXBncmFkaW5nIG9yIGluc3RhbGxpbmcgRmxhc2guJyk7XG5cbiAgICAgIGRldGFpbHMgKz0gYDxzcGFuIGNsYXNzPVwidmpzLWVycm9ycy1mbGFzaG1lc3NhZ2VcIj4ke2ZsYXNoTWVzc2FnZX08L3NwYW4+YDtcbiAgICB9XG5cbiAgICBjb25zdCBkaXNwbGF5ID0gcGxheWVyLmdldENoaWxkKCdlcnJvckRpc3BsYXknKTtcblxuICAgIGNvbnRlbnQuY2xhc3NOYW1lID0gJ3Zqcy1lcnJvcnMtZGlhbG9nJztcbiAgICBjb250ZW50LmlkID0gJ3Zqcy1lcnJvcnMtZGlhbG9nJztcbiAgICBkaWFsb2dDb250ZW50ID1cbiAgICAgYDxkaXYgY2xhc3M9XCJ2anMtZXJyb3JzLWNvbnRlbnQtY29udGFpbmVyXCI+XG4gICAgICA8aDIgY2xhc3M9XCJ2anMtZXJyb3JzLWhlYWRsaW5lXCI+JHt0aGlzLmxvY2FsaXplKGVycm9yLmhlYWRsaW5lKX08L2gyPlxuICAgICAgICA8ZGl2PjxiPiR7dGhpcy5sb2NhbGl6ZSgnRXJyb3IgQ29kZScpfTwvYj46ICR7KGVycm9yLnR5cGUgfHwgZXJyb3IuY29kZSl9PC9kaXY+XG4gICAgICAgICR7ZGV0YWlsc31cbiAgICAgIDwvZGl2PmA7XG5cbiAgICBjb25zdCBjbG9zZWFibGUgPSBkaXNwbGF5LmNsb3NlYWJsZSghKCdkaXNtaXNzJyBpbiBlcnJvcikgfHwgZXJyb3IuZGlzbWlzcyk7XG5cbiAgICAvLyBXZSBzaG91bGQgZ2V0IGEgY2xvc2UgYnV0dG9uXG4gICAgaWYgKGNsb3NlYWJsZSkge1xuICAgICAgZGlhbG9nQ29udGVudCArPVxuICAgICAgIGA8ZGl2IGNsYXNzPVwidmpzLWVycm9ycy1vay1idXR0b24tY29udGFpbmVyXCI+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInZqcy1lcnJvcnMtb2stYnV0dG9uXCI+JHt0aGlzLmxvY2FsaXplKCdPSycpfTwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5gO1xuICAgICAgY29udGVudC5pbm5lckhUTUwgPSBkaWFsb2dDb250ZW50O1xuICAgICAgZGlzcGxheS5maWxsV2l0aChjb250ZW50KTtcbiAgICAgIC8vIEdldCB0aGUgY2xvc2UgYnV0dG9uIGluc2lkZSB0aGUgZXJyb3IgZGlzcGxheVxuICAgICAgZGlzcGxheS5jb250ZW50RWwoKS5maXJzdENoaWxkLmFwcGVuZENoaWxkKGRpc3BsYXkuZ2V0Q2hpbGQoJ2Nsb3NlQnV0dG9uJykuZWwoKSk7XG5cbiAgICAgIGNvbnN0IG9rQnV0dG9uID0gZGlzcGxheS5lbCgpLnF1ZXJ5U2VsZWN0b3IoJy52anMtZXJyb3JzLW9rLWJ1dHRvbicpO1xuXG4gICAgICBwbGF5ZXIub24ob2tCdXR0b24sICdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICBkaXNwbGF5LmNsb3NlKCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGVudC5pbm5lckhUTUwgPSBkaWFsb2dDb250ZW50O1xuICAgICAgZGlzcGxheS5maWxsV2l0aChjb250ZW50KTtcbiAgICB9XG5cbiAgICBpZiAocGxheWVyLndpZHRoKCkgPD0gNjAwIHx8IHBsYXllci5oZWlnaHQoKSA8PSAyNTApIHtcbiAgICAgIGRpc3BsYXkuYWRkQ2xhc3MoJ3Zqcy14cycpO1xuICAgIH1cblxuICAgIGRpc3BsYXkub25lKCdtb2RhbGNsb3NlJywgKCkgPT4gcGxheWVyLmVycm9yKG51bGwpKTtcbiAgfTtcblxuICBjb25zdCBvbkRpc3Bvc2VIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgY2xlYW51cCgpO1xuXG4gICAgcGxheWVyLnJlbW92ZUNsYXNzKCd2anMtZXJyb3JzJyk7XG4gICAgcGxheWVyLm9mZigncGxheScsIG9uUGxheVN0YXJ0TW9uaXRvcik7XG4gICAgcGxheWVyLm9mZigncGxheScsIG9uUGxheU5vU291cmNlKTtcbiAgICBwbGF5ZXIub2ZmKCdkaXNwb3NlJywgb25EaXNwb3NlSGFuZGxlcik7XG4gICAgcGxheWVyLm9mZignZXJyb3InLCBvbkVycm9ySGFuZGxlcik7XG4gIH07XG5cbiAgY29uc3QgcmVJbml0UGx1Z2luID0gZnVuY3Rpb24obmV3T3B0aW9ucykge1xuICAgIG9uRGlzcG9zZUhhbmRsZXIoKTtcbiAgICBpbml0UGx1Z2luKHBsYXllciwgdmlkZW9qcy5tZXJnZU9wdGlvbnMoZGVmYXVsdHMsIG5ld09wdGlvbnMpKTtcbiAgfTtcblxuICByZUluaXRQbHVnaW4uZXh0ZW5kID0gZnVuY3Rpb24oZXJyb3JzKSB7XG4gICAgb3B0aW9ucy5lcnJvcnMgPSB2aWRlb2pzLm1lcmdlT3B0aW9ucyhvcHRpb25zLmVycm9ycywgZXJyb3JzKTtcbiAgfTtcblxuICBwbGF5ZXIub24oJ3BsYXknLCBvblBsYXlTdGFydE1vbml0b3IpO1xuICBwbGF5ZXIub24oJ3BsYXknLCBvblBsYXlOb1NvdXJjZSk7XG4gIHBsYXllci5vbignZGlzcG9zZScsIG9uRGlzcG9zZUhhbmRsZXIpO1xuICBwbGF5ZXIub24oJ2Vycm9yJywgb25FcnJvckhhbmRsZXIpO1xuXG4gIHBsYXllci5yZWFkeSgoKSA9PiB7XG4gICAgcGxheWVyLmFkZENsYXNzKCd2anMtZXJyb3JzJyk7XG4gIH0pO1xuXG4gIHBsYXllci5lcnJvcnMgPSByZUluaXRQbHVnaW47XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIHBsdWdpbi4gV2FpdHMgdW50aWwgdGhlIHBsYXllciBpcyByZWFkeSB0byBkbyBhbnl0aGluZy5cbiAqL1xuY29uc3QgZXJyb3JzID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICBpbml0UGx1Z2luKHRoaXMsIHZpZGVvanMubWVyZ2VPcHRpb25zKGRlZmF1bHRzLCBvcHRpb25zKSk7XG59O1xuXG4vLyBSZWdpc3RlciB0aGUgcGx1Z2luIHdpdGggdmlkZW8uanMuXG5yZWdpc3RlclBsdWdpbignZXJyb3JzJywgZXJyb3JzKTtcblxuY29uc3QgUGxheWVyID0gdmlkZW9qcy5nZXRDb21wb25lbnQoJ1BsYXllcicpO1xuXG5jb25zdCBzb3VyY2VzID0gW3tcbiAgc3JjOiAnbW92aWUubXA0JyxcbiAgdHlwZTogJ3ZpZGVvL21wNCdcbn0sIHtcbiAgc3JjOiAnbW92aWUud2VibScsXG4gIHR5cGU6ICd2aWRlby93ZWJtJ1xufV07XG5cblFVbml0LnRlc3QoJ3RoZSBlbnZpcm9ubWVudCBpcyBzYW5lJywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0eXBlb2YgQXJyYXkuaXNBcnJheSwgJ2Z1bmN0aW9uJywgJ2VzNSBleGlzdHMnKTtcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKHR5cGVvZiBzaW5vbiwgJ29iamVjdCcsICdzaW5vbiBleGlzdHMnKTtcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKHR5cGVvZiB2aWRlb2pzLCAnZnVuY3Rpb24nLCAndmlkZW9qcyBleGlzdHMnKTtcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKHR5cGVvZiBlcnJvcnMsICdmdW5jdGlvbicsICdwbHVnaW4gaXMgYSBmdW5jdGlvbicpO1xufSk7XG5cblFVbml0Lm1vZHVsZSgndmlkZW9qcy1lcnJvcnMnLCB7XG5cbiAgYmVmb3JlRWFjaCgpIHtcblxuICAgIC8vIE1vY2sgdGhlIGVudmlyb25tZW50J3MgdGltZXJzIGJlY2F1c2UgY2VydGFpbiB0aGluZ3MgLSBwYXJ0aWN1bGFybHlcbiAgICAvLyBwbGF5ZXIgcmVhZGluZXNzIC0gYXJlIGFzeW5jaHJvbm91cyBpbiB2aWRlby5qcyA1LlxuICAgIHRoaXMuY2xvY2sgPSBzaW5vbi51c2VGYWtlVGltZXJzKCk7XG4gICAgdGhpcy5maXh0dXJlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3F1bml0LWZpeHR1cmUnKTtcbiAgICB0aGlzLnZpZGVvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKTtcbiAgICB0aGlzLmZpeHR1cmUuYXBwZW5kQ2hpbGQodGhpcy52aWRlbyk7XG4gICAgdGhpcy5wbGF5ZXIgPSB2aWRlb2pzKHRoaXMudmlkZW8pO1xuXG4gICAgdGhpcy5wbGF5ZXIuYnVmZmVyZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB2aWRlb2pzLmNyZWF0ZVRpbWVSYW5nZSgwLCAwKTtcbiAgICB9O1xuICAgIHRoaXMucGxheWVyLnBhdXNlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgdGhpcy5wbGF5ZXIucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgLy8gaW5pdGlhbGl6ZSB0aGUgcGx1Z2luIHdpdGggdGhlIGRlZmF1bHQgb3B0aW9uc1xuICAgIHRoaXMucGxheWVyLmVycm9ycygpO1xuICAgIHRoaXMuZXJyb3JEaXNwbGF5ID0gdGhpcy5wbGF5ZXIuZ2V0Q2hpbGQoJ2Vycm9yRGlzcGxheScpO1xuXG4gICAgLy8gVGljayBmb3J3YXJkIHNvIHRoZSBwbGF5ZXIgaXMgcmVhZHkuXG4gICAgdGhpcy5jbG9jay50aWNrKDEpO1xuICB9LFxuXG4gIGFmdGVyRWFjaCgpIHtcbiAgICB0aGlzLnBsYXllci5kaXNwb3NlKCk7XG4gICAgdGhpcy5jbG9jay5yZXN0b3JlKCk7XG4gIH1cbn0pO1xuXG5RVW5pdC50ZXN0KCdyZWdpc3RlcnMgaXRzZWxmIHdpdGggdmlkZW8uanMnLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgYXNzZXJ0LmV4cGVjdCgyKTtcblxuICBhc3NlcnQuc3RyaWN0RXF1YWwoXG4gICAgdHlwZW9mIFBsYXllci5wcm90b3R5cGUuZXJyb3JzLFxuICAgICdmdW5jdGlvbicsXG4gICAgJ3ZpZGVvanMtZXJyb3JzIHBsdWdpbiB3YXMgcmVnaXN0ZXJlZCdcbiAgKTtcblxuICB0aGlzLnBsYXllci5lcnJvcnMoKTtcblxuICAvLyBUaWNrIHRoZSBjbG9jayBmb3J3YXJkIGVub3VnaCB0byB0cmlnZ2VyIHRoZSBwbGF5ZXIgdG8gYmUgXCJyZWFkeVwiLlxuICB0aGlzLmNsb2NrLnRpY2soMSk7XG5cbiAgYXNzZXJ0Lm9rKFxuICAgIHRoaXMucGxheWVyLmhhc0NsYXNzKCd2anMtZXJyb3JzJyksXG4gICAgJ3RoZSBwbHVnaW4gYWRkcyBhIGNsYXNzIHRvIHRoZSBwbGF5ZXInXG4gICk7XG59KTtcblxuUVVuaXQudGVzdCgncGxheSgpIHdpdGhvdXQgYSBzcmMgaXMgYW4gZXJyb3InLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgbGV0IGVycm9ycyQkMSA9IDA7XG5cbiAgdGhpcy5wbGF5ZXIub24oJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgZXJyb3JzJCQxKys7XG4gIH0pO1xuICB0aGlzLnBsYXllci50cmlnZ2VyKCdwbGF5Jyk7XG5cbiAgYXNzZXJ0LnN0cmljdEVxdWFsKGVycm9ycyQkMSwgMSwgJ2VtaXR0ZWQgYW4gZXJyb3InKTtcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKHRoaXMucGxheWVyLmVycm9yKCkuY29kZSwgLTEsICdlcnJvciBjb2RlIGlzIC0xJyk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLnBsYXllci5lcnJvcigpLnR5cGUsXG4gICAgJ1BMQVlFUl9FUlJfTk9fU1JDJyxcbiAgICAnZXJyb3IgdHlwZSBpcyBubyBzb3VyY2UnKTtcbn0pO1xuXG5RVW5pdC50ZXN0KCdubyBwcm9ncmVzcyBmb3IgNDUgc2Vjb25kcyBpcyBhbiBlcnJvcicsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBsZXQgZXJyb3JzJCQxID0gMDtcblxuICB0aGlzLnBsYXllci5vbignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICBlcnJvcnMkJDErKztcbiAgfSk7XG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncGxheScpO1xuICB0aGlzLmNsb2NrLnRpY2soNDUgKiAxMDAwKTtcblxuICBhc3NlcnQuc3RyaWN0RXF1YWwoZXJyb3JzJCQxLCAxLCAnZW1pdHRlZCBhbiBlcnJvcicpO1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodGhpcy5wbGF5ZXIuZXJyb3IoKS5jb2RlLCAtMiwgJ2Vycm9yIGNvZGUgaXMgLTInKTtcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKHRoaXMucGxheWVyLmVycm9yKCkudHlwZSwgJ1BMQVlFUl9FUlJfVElNRU9VVCcpO1xufSk7XG5cblFVbml0LnRlc3QoJ0ZsYXNoIEFQSSBpcyB1bmF2YWlsYWJsZSB3aGVuIHVzaW5nIEZsYXNoIGlzIGFuIGVycm9yJywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gIHRoaXMucGxheWVyLnRlY2hfLmVsXy50eXBlID0gJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJztcbiAgLy8gd2hlbiBGbGFzaCBkaWVzIHRoZSBvYmplY3QgbWV0aG9kcyBnbyBhd2F5XG4gIC8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuICB0aGlzLnBsYXllci50ZWNoXy5lbF8udmpzX2dldFByb3BlcnR5ID0gbnVsbDtcbiAgLyogZXNsaW50LWVuYWJsZSBjYW1lbGNhc2UgKi9cbiAgdGhpcy5wbGF5ZXIucGF1c2VkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgbGV0IGVycm9ycyQkMSA9IDA7XG5cbiAgdGhpcy5wbGF5ZXIub24oJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgZXJyb3JzJCQxKys7XG4gIH0pO1xuICB0aGlzLnBsYXllci5zcmMoc291cmNlcyk7XG4gIHRoaXMucGxheWVyLnRyaWdnZXIoJ3BsYXknKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigndGltZXVwZGF0ZScpO1xuXG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDEsICdlbWl0dGVkIGFuIGVycm9yJyk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLnBsYXllci5lcnJvcigpLmNvZGUsIC0yLCAnZXJyb3IgY29kZSBpcyAtMicpO1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodGhpcy5wbGF5ZXIuZXJyb3IoKS50eXBlLCAnUExBWUVSX0VSUl9USU1FT1VUJyk7XG59KTtcblxuUVVuaXQudGVzdCgndGhlIHBsdWdpbiBjbGVhbnMgdXAgYWZ0ZXIgaXRzIHByZXZpb3VzIGluY2FybmF0aW9uIHdoZW4gY2FsbGVkIGFnYWluJyxcbiAgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgbGV0IGVycm9ycyQkMSA9IDA7XG5cbiAgICB0aGlzLnBsYXllci5vbignZXJyb3InLCAoKSA9PiBlcnJvcnMkJDErKyk7XG5cbiAgICAvLyBDYWxsIHBsdWdpbiBtdWx0aXBsZSB0aW1lc1xuICAgIHRoaXMucGxheWVyLmVycm9ycygpO1xuICAgIHRoaXMucGxheWVyLmVycm9ycygpO1xuXG4gICAgLy8gVGljayB0aGUgY2xvY2sgZm9yd2FyZCBlbm91Z2ggdG8gdHJpZ2dlciB0aGUgcGxheWVyIHRvIGJlIFwicmVhZHlcIi5cbiAgICB0aGlzLmNsb2NrLnRpY2soMSk7XG5cbiAgICB0aGlzLnBsYXllci50cmlnZ2VyKCdwbGF5Jyk7XG5cbiAgICBhc3NlcnQuc3RyaWN0RXF1YWwoZXJyb3JzJCQxLCAxLCAnZW1pdHRlZCBhIHNpbmdsZSBlcnJvcicpO1xuICAgIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLnBsYXllci5lcnJvcigpLmNvZGUsIC0xLCAnZXJyb3IgY29kZSBpcyAtMScpO1xuICAgIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLnBsYXllci5lcnJvcigpLnR5cGUsICdQTEFZRVJfRVJSX05PX1NSQycpO1xuICB9KTtcblxuUVVuaXQudGVzdCgnd2hlbiBkaXNwb3NlIGlzIHRyaWdnZXJlZCBzaG91bGQgbm90IHRocm93IGVycm9yICcsIGZ1bmN0aW9uKGFzc2VydCkge1xuICB0aGlzLnBsYXllci5zcmMoc291cmNlcyk7XG4gIHRoaXMucGxheWVyLnRyaWdnZXIoJ3BsYXknKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcignZGlzcG9zZScpO1xuICB0aGlzLmNsb2NrLnRpY2soNDUgKiAxMDAwKTtcblxuICBhc3NlcnQub2soIXRoaXMucGxheWVyLmVycm9yKCksXG4gICAgJ3Nob3VsZCBub3QgdGhyb3cgcGxheWVyIGVycm9yIHdoZW4gZGlzcG9zZSBpcyBjYWxsZWQuJyk7XG59KTtcblxuUVVuaXQudGVzdCgncHJvZ3Jlc3MgY2xlYXJzIHBsYXllciB0aW1lb3V0IGVycm9ycycsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBsZXQgZXJyb3JzJCQxID0gMDtcblxuICB0aGlzLnBsYXllci5vbignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICBlcnJvcnMkJDErKztcbiAgfSk7XG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncGxheScpO1xuXG4gIHRoaXMuY2xvY2sudGljayg0NSAqIDEwMDApO1xuXG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDEsICdlbWl0dGVkIGFuIGVycm9yJyk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLnBsYXllci5lcnJvcigpLmNvZGUsIC0yLCAnZXJyb3IgY29kZSBpcyAtMicpO1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodGhpcy5wbGF5ZXIuZXJyb3IoKS50eXBlLCAnUExBWUVSX0VSUl9USU1FT1VUJyk7XG5cbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncHJvZ3Jlc3MnKTtcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKHRoaXMucGxheWVyLmVycm9yKCksIG51bGwsICdlcnJvciByZW1vdmVkJyk7XG59KTtcblxuLy8gc2FmYXJpIDcgb24gT1NYIGNhbiBlbWl0IHN0YWxscyB3aGVuIHBsYXliYWNrIGlzIGp1c3QgZmluZVxuUVVuaXQudGVzdCgnc3RhbGxpbmcgYnkgaXRzZWxmIGlzIG5vdCBhbiBlcnJvcicsIGZ1bmN0aW9uKGFzc2VydCkge1xuICB0aGlzLnBsYXllci5zcmMoc291cmNlcyk7XG4gIHRoaXMucGxheWVyLnRyaWdnZXIoJ3BsYXknKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcignc3RhbGxlZCcpO1xuXG4gIGFzc2VydC5vayghdGhpcy5wbGF5ZXIuZXJyb3IoKSwgJ25vIGVycm9yIGZpcmVkJyk7XG59KTtcblxuUVVuaXQudGVzdCgndGltaW5nIG91dCBtdWx0aXBsZSB0aW1lcyBvbmx5IHRocm93cyBhIHNpbmdsZSBlcnJvcicsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBsZXQgZXJyb3JzJCQxID0gMDtcblxuICB0aGlzLnBsYXllci5vbignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICBlcnJvcnMkJDErKztcbiAgfSk7XG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncGxheScpO1xuICAvLyB0cmlnZ2VyIGEgcGxheWVyIHRpbWVvdXRcbiAgdGhpcy5jbG9jay50aWNrKDQ1ICogMTAwMCk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDEsICdvbmUgZXJyb3IgZmlyZWQnKTtcblxuICAvLyB3YWl0IGxvbmcgZW5vdWdoIGZvciBhbm90aGVyIHRpbWVvdXRcbiAgdGhpcy5jbG9jay50aWNrKDUwICogMTAwMCk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDEsICdvbmx5IG9uZSBlcnJvciBmaXJlZCcpO1xufSk7XG5cblFVbml0LnRlc3QoJ3Byb2dyZXNzIGV2ZW50cyB3aGlsZSBwbGF5aW5nIHJlc2V0IHRoZSBwbGF5ZXIgdGltZW91dCcsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBsZXQgZXJyb3JzJCQxID0gMDtcblxuICB0aGlzLnBsYXllci5vbignZXJyb3InLCBmdW5jdGlvbigpIHtcbiAgICBlcnJvcnMkJDErKztcbiAgfSk7XG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncGxheScpO1xuICAvLyBzdGFsbGVkIGZvciBhd2hpbGVcbiAgdGhpcy5jbG9jay50aWNrKDQ0ICogMTAwMCk7XG4gIC8vIGJ1dCBwbGF5YmFjayByZXN1bWVzIVxuICB0aGlzLnBsYXllci50cmlnZ2VyKCdwcm9ncmVzcycpO1xuICB0aGlzLmNsb2NrLnRpY2soNDQgKiAxMDAwKTtcblxuICBhc3NlcnQuc3RyaWN0RXF1YWwoZXJyb3JzJCQxLCAwLCAnbm8gZXJyb3JzIGVtaXR0ZWQnKTtcbn0pO1xuXG5RVW5pdC50ZXN0KCdubyBzaWducyBvZiBwbGF5YmFjayB0cmlnZ2VycyBhIHBsYXllciB0aW1lb3V0JywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gIGxldCBlcnJvcnMkJDEgPSAwO1xuXG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIub24oJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgZXJyb3JzJCQxKys7XG4gIH0pO1xuICAvLyBzd2FsbG93IGFueSB0aW1ldXBkYXRlIGV2ZW50c1xuICB0aGlzLnBsYXllci5vbigndGltZXVwZGF0ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gIH0pO1xuICB0aGlzLnBsYXllci50cmlnZ2VyKCdwbGF5Jyk7XG4gIHRoaXMuY2xvY2sudGljayg0NSAqIDEwMDApO1xuXG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDEsICdlbWl0dGVkIGEgc2luZ2xlIGVycm9yJyk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLnBsYXllci5lcnJvcigpLmNvZGUsIC0yLCAnZXJyb3IgY29kZSBpcyAtMicpO1xuICBhc3NlcnQuc3RyaWN0RXF1YWwodGhpcy5wbGF5ZXIuZXJyb3IoKS50eXBlLFxuICAgICdQTEFZRVJfRVJSX1RJTUVPVVQnLFxuICAgICd0eXBlIGlzIHBsYXllciB0aW1lb3V0Jyk7XG59KTtcblxuUVVuaXQudGVzdCgndGltZSBjaGFuZ2VzIHdoaWxlIHBsYXlpbmcgcmVzZXQgdGhlIHBsYXllciB0aW1lb3V0JywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gIGxldCBlcnJvcnMkJDEgPSAwO1xuXG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIub24oJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgZXJyb3JzJCQxKys7XG4gIH0pO1xuICB0aGlzLnBsYXllci50cmlnZ2VyKCdwbGF5Jyk7XG4gIHRoaXMuY2xvY2sudGljayg0NCAqIDEwMDApO1xuICB0aGlzLnBsYXllci5jdXJyZW50VGltZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAxO1xuICB9O1xuICB0aGlzLnBsYXllci50cmlnZ2VyKCd0aW1ldXBkYXRlJyk7XG4gIHRoaXMuY2xvY2sudGljaygxMCAqIDEwMDApO1xuXG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDAsICdubyBlcnJvciBlbWl0dGVkJyk7XG59KTtcblxuUVVuaXQudGVzdCgndGltZSBjaGFuZ2VzIHdoaWxlIHBsYXlpbmcgYWRzIHJlc2V0IHRoZSBwbGF5ZXIgdGltZW91dCcsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBsZXQgZXJyb3JzJCQxID0gMDtcblxuICB0aGlzLnBsYXllci5zcmMoc291cmNlcyk7XG4gIHRoaXMucGxheWVyLm9uKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgIGVycm9ycyQkMSsrO1xuICB9KTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncGxheScpO1xuICB0aGlzLmNsb2NrLnRpY2soNDQgKiAxMDAwKTtcbiAgdGhpcy5wbGF5ZXIuY3VycmVudFRpbWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gMTtcbiAgfTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcignYWR0aW1ldXBkYXRlJyk7XG4gIHRoaXMuY2xvY2sudGljaygxMCAqIDEwMDApO1xuXG4gIGFzc2VydC5zdHJpY3RFcXVhbChlcnJvcnMkJDEsIDAsICdubyBlcnJvciBlbWl0dGVkJyk7XG59KTtcblxuUVVuaXQudGVzdCgndGltZSBjaGFuZ2VzIGFmdGVyIGEgcGxheWVyIHRpbWVvdXQgY2xlYXJzIHRoZSBlcnJvcicsIGZ1bmN0aW9uKGFzc2VydCkge1xuICB0aGlzLnBsYXllci5zcmMoc291cmNlcyk7XG4gIHRoaXMucGxheWVyLnRyaWdnZXIoJ3BsYXknKTtcbiAgdGhpcy5jbG9jay50aWNrKDQ1ICogMTAwMCk7XG4gIHRoaXMucGxheWVyLmN1cnJlbnRUaW1lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIDE7XG4gIH07XG4gIHRoaXMucGxheWVyLnRyaWdnZXIoJ3RpbWV1cGRhdGUnKTtcblxuICBhc3NlcnQub2soIXRoaXMucGxheWVyLmVycm9yKCksICdjbGVhcmVkIHRoZSB0aW1lb3V0Jyk7XG59KTtcblxuUVVuaXQudGVzdCgncGxheWVyIHRpbWVvdXRzIGRvIG5vdCBvY2N1ciBpZiB0aGUgcGxheWVyIGlzIHBhdXNlZCcsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBsZXQgZXJyb3JzJCQxID0gMDtcblxuICB0aGlzLnBsYXllci5zcmMoc291cmNlcyk7XG4gIHRoaXMucGxheWVyLm9uKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgIGVycm9ycyQkMSsrO1xuICB9KTtcbiAgdGhpcy5wbGF5ZXIub24oJ3RpbWV1cGRhdGUnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICB9KTtcbiAgdGhpcy5wbGF5ZXIudHJpZ2dlcigncGxheScpO1xuICAvLyBzaW11bGF0ZSBhIG1pc2JlaGF2aW5nIHBsYXllciB0aGF0IGRvZXNuJ3QgZmlyZSBgcGF1c2VkYFxuICB0aGlzLnBsYXllci5wYXVzZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgdGhpcy5jbG9jay50aWNrKDQ1ICogMTAwMCk7XG5cbiAgYXNzZXJ0LnN0cmljdEVxdWFsKGVycm9ycyQkMSwgMCwgJ25vIGVycm9yIGVtaXR0ZWQnKTtcbn0pO1xuXG4vLyB2aWRlby5wYXVzZWQgaXMgZmFsc2UgYXQgdGhlIGVuZCBvZiBhIHZpZGVvIG9uIElFMTEsIFdpbjggUlRcblFVbml0LnRlc3QoJ3BsYXllciB0aW1lb3V0cyBkbyBub3Qgb2NjdXIgaWYgdGhlIHZpZGVvIGlzIGVuZGVkJywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gIGxldCBlcnJvcnMkJDEgPSAwO1xuXG4gIHRoaXMucGxheWVyLnNyYyhzb3VyY2VzKTtcbiAgdGhpcy5wbGF5ZXIub24oJ2Vycm9yJywgZnVuY3Rpb24oKSB7XG4gICAgZXJyb3JzJCQxKys7XG4gIH0pO1xuICB0aGlzLnBsYXllci5vbigndGltZXVwZGF0ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gIH0pO1xuICB0aGlzLnBsYXllci50cmlnZ2VyKCdwbGF5Jyk7XG4gIC8vIHNpbXVsYXRlIGEgbWlzYmVoYXZpbmcgcGxheWVyIHRoYXQgZG9lc24ndCBmaXJlIGBlbmRlZGBcbiAgdGhpcy5wbGF5ZXIuZW5kZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcbiAgdGhpcy5jbG9jay50aWNrKDQ1ICogMTAwMCk7XG5cbiAgYXNzZXJ0LnN0cmljdEVxdWFsKGVycm9ycyQkMSwgMCwgJ25vIGVycm9yIGVtaXR0ZWQnKTtcbn0pO1xuXG5RVW5pdC50ZXN0KCdwbGF5ZXIgdGltZW91dHMgZG8gbm90IG92ZXJ3cml0ZSBleGlzdGluZyBlcnJvcnMnLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgdGhpcy5wbGF5ZXIuc3JjKHNvdXJjZXMpO1xuICB0aGlzLnBsYXllci50cmlnZ2VyKCdwbGF5Jyk7XG4gIHRoaXMucGxheWVyLmVycm9yKHtcbiAgICB0eXBlOiAnY3VzdG9tJyxcbiAgICBjb2RlOiAtN1xuICB9KTtcbiAgdGhpcy5jbG9jay50aWNrKDQ1ICogMTAwMCk7XG5cbiAgYXNzZXJ0LnN0cmljdEVxdWFsKC03LCB0aGlzLnBsYXllci5lcnJvcigpLmNvZGUsICdlcnJvciB3YXMgbm90IG92ZXJ3cml0dGVuJyk7XG59KTtcblxuUVVuaXQudGVzdCgndW5yZWNvZ25pemVkIGVycm9yIGNvZGVzIGRvIG5vdCBjYXVzZSBleGNlcHRpb25zJywgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gIGxldCBlcnJvcnMkJDEgPSAwO1xuXG4gIHRoaXMucGxheWVyLm9uKCdlcnJvcicsIGZ1bmN0aW9uKCkge1xuICAgIGVycm9ycyQkMSsrO1xuICB9KTtcbiAgdGhpcy5wbGF5ZXIuZXJyb3Ioe1xuICAgIGNvZGU6ICdzb21ldGhpbmctY3VzdG9tLXRoYXQtbm8tb25lLWNvdWxkLWhhdmUtcHJlZGljdGVkJyxcbiAgICB0eXBlOiAnTk9UX0FOX0VSUk9SX0NPTlNUQU5UJ1xuICB9KTtcbiAgYXNzZXJ0Lm9rKHRydWUsICdkb2VzIG5vdCB0aHJvdyBhbiBleGNlcHRpb24nKTtcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKGVycm9ycyQkMSwgMSwgJ2VtaXR0ZWQgYW4gZXJyb3InKTtcblxuICAvLyBpbnRlbnRpb25hbGx5IG1pc3NpbmcgcHJvcGVydGllc1xuICB0aGlzLnBsYXllci5lcnJvcih7fSk7XG4gIGFzc2VydC5vayh0cnVlLCAnZG9lcyBub3QgdGhyb3cgYW4gZXhjZXB0aW9uJyk7XG5cbiAgYXNzZXJ0LnN0cmljdEVxdWFsKGVycm9ycyQkMSwgMiwgJ2VtaXR0ZWQgYW4gZXJyb3InKTtcbn0pO1xuXG5RVW5pdC50ZXN0KCdjdXN0b20gZXJyb3IgZGV0YWlscyBzaG91bGQgb3ZlcnJpZGUgZGVmYXVsdHMnLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgY29uc3QgY3VzdG9tRXJyb3IgPSB7aGVhZGxpbmU6ICd0ZXN0IGhlYWRsaW5lJywgbWVzc2FnZTogJ3Rlc3QgZGV0YWlscyd9O1xuXG4gIC8vIGluaXRpYWxpemUgdGhlIHBsdWdpbiB3aXRoIGN1c3RvbSBvcHRpb25zXG4gIHRoaXMucGxheWVyLmVycm9ycyh7ZXJyb3JzOiB7NDogY3VzdG9tRXJyb3J9fSk7XG4gIC8vIHRpY2sgZm9yd2FyZCBlbm91Z2ggdG8gcmVhZHkgdGhlIHBsYXllclxuICB0aGlzLmNsb2NrLnRpY2soMSk7XG4gIC8vIHRyaWdnZXIgdGhlIGVycm9yIGluIHF1ZXN0aW9uXG4gIHRoaXMucGxheWVyLmVycm9yKDQpO1xuICAvLyBjb25maXJtIHJlc3VsdHNcbiAgYXNzZXJ0LnN0cmljdEVxdWFsKHRoaXMuZXJyb3JEaXNwbGF5LiQoJy52anMtZXJyb3JzLWhlYWRsaW5lJykudGV4dENvbnRlbnQsXG4gICAgY3VzdG9tRXJyb3IuaGVhZGxpbmUsICdoZWFkbGluZSBzaG91bGQgbWF0Y2ggY3VzdG9tIG92ZXJyaWRlIHZhbHVlJyk7XG4gIGFzc2VydC5zdHJpY3RFcXVhbCh0aGlzLmVycm9yRGlzcGxheS4kKCcudmpzLWVycm9ycy1tZXNzYWdlJykudGV4dENvbnRlbnQsXG4gICAgY3VzdG9tRXJyb3IubWVzc2FnZSwgJ21lc3NhZ2Ugc2hvdWxkIG1hdGNoIGN1c3RvbSBvdmVycmlkZSB2YWx1ZScpO1xufSk7XG5cblFVbml0LnRlc3QoJ0FwcGVuZCBGbGFzaCBlcnJvciBkZXRhaWxzIHdoZW4gZmxhc2ggaXMgbm90IHN1cHBvcnRlZCcsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBjb25zdCBGbGFzaCA9IHZpZGVvanMuZ2V0VGVjaCgnRmxhc2gnKTtcblxuICAvLyB2anM2IHdvbid0IGhhdmUgZmxhc2ggYnkgZGVmYXVsdFxuICBpZiAoIUZsYXNoKSB7XG4gICAgYXNzZXJ0Lm5vdE9rKEZsYXNoLCAnZmxhc2ggdGVjaCBub3QgYXZhaWxhYmxlLCBza2lwcGluZyB1bml0IHRlc3QnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCBvbGRJc1N1cHBvcnRlZCA9IHZpZGVvanMuZ2V0Q29tcG9uZW50KCdGbGFzaCcpLmlzU3VwcG9ydGVkO1xuXG4gIC8vIE1vY2sgdXAgaXNTdXBwb3J0ZWQgdG8gYmUgZmFsc2VcbiAgdmlkZW9qcy5nZXRDb21wb25lbnQoJ0ZsYXNoJykuaXNTdXBwb3J0ZWQgPSAoKSA9PiBmYWxzZTtcblxuICAvLyB0aWNrIGZvcndhcmQgZW5vdWdoIHRvIHJlYWR5IHRoZSBwbGF5ZXJcbiAgdGhpcy5jbG9jay50aWNrKDEpO1xuICAvLyB0cmlnZ2VyIHRoZSBlcnJvciBpbiBxdWVzdGlvblxuICB0aGlzLnBsYXllci5lcnJvcig0KTtcbiAgLy8gY29uZmlybSByZXN1bHRzXG4gIGFzc2VydC5lcXVhbCh0aGlzLmVycm9yRGlzcGxheS4kKCcudmpzLWVycm9ycy1mbGFzaG1lc3NhZ2UnKS50ZXh0Q29udGVudCxcbiAgICAnSWYgeW91IGFyZSB1c2luZyBhbiBvbGRlciBicm93c2VyIHBsZWFzZSB0cnkgdXBncmFkaW5nIG9yIGluc3RhbGxpbmcgRmxhc2guJyxcbiAgICAnRmxhc2ggRXJyb3IgbWVzc2FnZSBzaG91bGQgYmUgZGlzcGxheWVkJyk7XG4gIC8vIFJlc3RvcmluZyBpc1N1cHBvcnRlZCB0byB0aGUgb2xkIHZhbHVlXG4gIHZpZGVvanMuZ2V0Q29tcG9uZW50KCdGbGFzaCcpLmlzU3VwcG9ydGVkID0gb2xkSXNTdXBwb3J0ZWQ7XG59KTtcblxuUVVuaXQudGVzdCgnZGVmYXVsdCBlcnJvciBpcyBkaXNtaXNzaWJsZScsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAvLyBpbml0aWFsaXplIHRoZSBwbHVnaW5cbiAgdGhpcy5wbGF5ZXIuZXJyb3JzKCk7XG4gIC8vIHRpY2sgZm9yd2FyZCBlbm91Z2ggdG8gcmVhZHkgdGhlIHBsYXllclxuICB0aGlzLmNsb2NrLnRpY2soMSk7XG4gIC8vIHRyaWdnZXIgdGhlIGVycm9yIGluIHF1ZXN0aW9uXG4gIHRoaXMucGxheWVyLmVycm9yKDIpO1xuICAvLyBjb25maXJtIHJlc3VsdHNcbiAgYXNzZXJ0Lm9rKHRoaXMuZXJyb3JEaXNwbGF5LiQoJy52anMtZXJyb3JzLW9rLWJ1dHRvbicpLCAnb2sgYnV0dG9uIGlzIHByZXNlbnQnKTtcbiAgYXNzZXJ0Lm9rKHRoaXMuZXJyb3JEaXNwbGF5LiQoJy52anMtY2xvc2UtYnV0dG9uJyksICdjbG9zZSBidXR0b24gaXMgcHJlc2VudCcpO1xufSk7XG5cblFVbml0LnRlc3QoJ2N1c3RvbSBlcnJvciBpcyBkaXNtaXNzaWJsZScsIGZ1bmN0aW9uKGFzc2VydCkge1xuICBjb25zdCBjdXN0b21FcnJvckRpc21pc3MgPSB7XG4gICAgaGVhZGxpbmU6ICd0ZXN0IGhlYWRsaW5lJyxcbiAgICBtZXNzYWdlOiAndGVzdCBkZXRhaWxzJyxcbiAgICBkaXNtaXNzOiB0cnVlXG4gIH07XG5cbiAgLy8gaW5pdGlhbGl6ZSB0aGUgcGx1Z2luIHdpdGggY3VzdG9tIG9wdGlvbnNcbiAgdGhpcy5wbGF5ZXIuZXJyb3JzKHtlcnJvcnM6IHs0OiBjdXN0b21FcnJvckRpc21pc3N9fSk7XG4gIC8vIHRpY2sgZm9yd2FyZCBlbm91Z2ggdG8gcmVhZHkgdGhlIHBsYXllclxuICB0aGlzLmNsb2NrLnRpY2soMSk7XG4gIC8vIHRyaWdnZXIgdGhlIGVycm9yIGluIHF1ZXN0aW9uXG4gIHRoaXMucGxheWVyLmVycm9yKDQpO1xuICAvLyBjb25maXJtIHJlc3VsdHNcbiAgYXNzZXJ0Lm9rKHRoaXMuZXJyb3JEaXNwbGF5LiQoJy52anMtZXJyb3JzLW9rLWJ1dHRvbicpLCAnb2sgYnV0dG9uIGlzIHByZXNlbnQnKTtcbiAgYXNzZXJ0Lm9rKHRoaXMuZXJyb3JEaXNwbGF5LiQoJy52anMtY2xvc2UtYnV0dG9uJyksICdjbG9zZSBidXR0b24gaXMgcHJlc2VudCcpO1xufSk7XG5cblFVbml0LnRlc3QoJ2N1c3RvbSBlcnJvciBpcyBub3QgZGlzbWlzc2libGUnLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgY29uc3QgY3VzdG9tRXJyb3JOb0RpbWlzcyA9IHtcbiAgICBoZWFkbGluZTogJ3Rlc3QgaGVhZGxpbmUnLFxuICAgIG1lc3NhZ2U6ICd0ZXN0IGRldGFpbHMnLFxuICAgIGRpc21pc3M6IGZhbHNlXG4gIH07XG5cbiAgLy8gaW5pdGlhbGl6ZSB0aGUgcGx1Z2luIHdpdGggY3VzdG9tIG9wdGlvbnNcbiAgdGhpcy5wbGF5ZXIuZXJyb3JzKHtlcnJvcnM6IHs0OiBjdXN0b21FcnJvck5vRGltaXNzfX0pO1xuICAvLyB0aWNrIGZvcndhcmQgZW5vdWdoIHRvIHJlYWR5IHRoZSBwbGF5ZXJcbiAgdGhpcy5jbG9jay50aWNrKDEpO1xuICAvLyB0cmlnZ2VyIHRoZSBlcnJvciBpbiBxdWVzdGlvblxuICB0aGlzLnBsYXllci5lcnJvcig0KTtcbiAgLy8gY29uZmlybSByZXN1bHRzXG4gIGFzc2VydC5vayghdGhpcy5lcnJvckRpc3BsYXkuJCgnLnZqcy1lcnJvcnMtb2stYnV0dG9uJyksICdvayBidXR0b24gaXMgbm90IHByZXNlbnQnKTtcbiAgYXNzZXJ0Lm9rKCF0aGlzLmVycm9yRGlzcGxheS4kKCcudmpzLWNsb3NlLWJ1dHRvbicpLCAnY2xvc2UgYnV0dG9uIGlzIG5vdCBwcmVzZW50Jyk7XG59KTtcblxuUVVuaXQudGVzdCgnY3VzdG9tIGVycm9ycyBjYW4gYmUgYWRkZWQgYXQgcnVudGltZScsIGZ1bmN0aW9uKGFzc2VydCkge1xuICB0aGlzLnBsYXllci5lcnJvcnMoKTtcblxuICAvLyB0aWNrIGZvcndhcmQgZW5vdWdoIHRvIHJlYWR5IHRoZSBwbGF5ZXJcbiAgdGhpcy5jbG9jay50aWNrKDEpO1xuXG4gIGNvbnN0IGVycm9yID0ge1xuICAgICctMyc6IHtcbiAgICAgIHR5cGU6ICdURVNUJyxcbiAgICAgIGhlYWRsaW5lOiAndGVzdCcsXG4gICAgICBtZXNzYWdlOiAndGVzdCB0ZXN0J1xuICAgIH1cbiAgfTtcblxuICB0aGlzLnBsYXllci5lcnJvcnMuZXh0ZW5kKGVycm9yKTtcblxuICB0aGlzLnBsYXllci5lcnJvcih7Y29kZTogLTN9KTtcblxuICBhc3NlcnQuc3RyaWN0RXF1YWwoXG4gICAgdGhpcy5wbGF5ZXIuZXJyb3JEaXNwbGF5LiQoJy52anMtZXJyb3JzLWhlYWRsaW5lJykudGV4dENvbnRlbnQsXG4gICAgZXJyb3JbJy0zJ10uaGVhZGxpbmUsXG4gICAgJ2hlYWRsaW5lIHNob3VsZCBtYXRjaCBjdXN0b20gb3ZlcnJpZGUgdmFsdWUnXG4gICk7XG5cbiAgYXNzZXJ0LnN0cmljdEVxdWFsKFxuICAgIHRoaXMucGxheWVyLmVycm9yRGlzcGxheS4kKCcudmpzLWVycm9ycy1tZXNzYWdlJykudGV4dENvbnRlbnQsXG4gICAgZXJyb3JbJy0zJ10ubWVzc2FnZSxcbiAgICAnbWVzc2FnZSBzaG91bGQgbWF0Y2ggY3VzdG9tIG92ZXJyaWRlIHZhbHVlJ1xuICApO1xufSk7XG4iXX0=
