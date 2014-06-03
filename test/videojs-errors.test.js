/*! videojs-errors - v0.0.0 - 2014-4-30
 * Copyright (c) 2014 Brightcove
 * Licensed under the Apache-2.0 license. */
(function(window, videojs, sinon, qunit) {
  'use strict';

  var realIsHtmlSupported,
      realCanPlaySource,
      player,
      clock,

      // local QUnit aliases
      // http://api.qunitjs.com/

      // module(name, {[setup][ ,teardown]})
      module = qunit.module,
      // test(name, callback)
      test = qunit.test,
      // ok(value, [message])
      ok = qunit.ok,
      // equal(actual, expected, [message])
      equal = qunit.equal,
      // strictEqual(actual, expected, [message])
      strictEqual = qunit.strictEqual,
      // deepEqual(actual, expected, [message])
      deepEqual = qunit.deepEqual,
      // notEqual(actual, expected, [message])
      notEqual = qunit.notEqual,
      // throws(block, [expected], [message])
      throws = qunit.throws;

  module('videojs-errors', {
    setup: function() {
      // force HTML support so the tests run in a reasonable
      // environment under phantomjs
      realIsHtmlSupported = videojs.Html5.isSupported;
      videojs.Html5.isSupported = function() {
        return true;
      };
      realCanPlaySource = videojs.Html5.canPlaySource;
      videojs.Html5.canPlaySource = function() {
        return true;
      };

      // setup sinon fake timers
      clock = sinon.useFakeTimers();

      // create a video element
      var video = document.createElement('video');
      document.querySelector('#qunit-fixture').appendChild(video);

      // create a video.js player
      player = videojs(video);
      player.buffered = function() {
        return videojs.createTimeRange(0, 0);
      };

      // initialize the plugin with the default options
      player.errors();
    },
    teardown: function() {
      videojs.Html5.isSupported = realIsHtmlSupported;
      videojs.Html5.canPlaySource = realCanPlaySource;
      clock.restore();
    }
  });

  test('registers itself', function() {
    ok(player.errors, 'registered the plugin');
  });

  test('play() without a src is an error', function() {
    var errors = 0;
    player.on('error', function() {
      errors++;
    });
    player.trigger('play');

    strictEqual(errors, 1, 'emitted an error');
    strictEqual(player.error().code, -1, 'error code is -1');
    strictEqual(player.error().type, 'PLAYER_ERR_NO_SRC', 'error type is no source');
  });

  test('no progress for 45 seconds is an error', function() {
    var errors = 0;
    player.on('error', function() {
      errors++;
    });
    player.trigger('stalled');

    clock.tick(45 * 1000);

    strictEqual(errors, 1, 'emitted an error');
    strictEqual(player.error().code, -2, 'error code is -2');
    strictEqual(player.error().type, 'PLAYER_ERR_TIMEOUT');
  });

  test('progress clears player timeout errors', function() {
    var errors = 0;
    player.on('error', function() {
      errors++;
    });
    player.on('errorrecover', function() {
      errors--;
    });
    player.trigger('stalled');

    clock.tick(45 * 1000);

    strictEqual(errors, 1, 'emitted an error');
    strictEqual(player.error().code, -2, 'error code is -2');
    strictEqual(player.error().type, 'PLAYER_ERR_TIMEOUT');

    player.trigger('progress');
    strictEqual(errors, 0, 'player recovered from error');
    strictEqual(player.error(), null, 'error removed');

  });

  test('stalling multiple times only throws a single error', function() {
    var errors = 0;
    player.on('error', function() {
      errors++;
    });
    player.on('errorrecover', function() {
      errors--;
    });
    player.trigger('stalled');
    player.trigger('stalled');
    clock.tick(45 * 1000);
    strictEqual(errors, 1, 'emitted a single error');
    strictEqual(player.error().code, -2, 'error code is -2');
    strictEqual(player.error().type, 'PLAYER_ERR_TIMEOUT');
  });

  test('playback after stalling clears the timeout', function() {
    var errors = 0;
    player.on('error', function() {
      errors++;
    });
    player.trigger('stalled');
    // stalled for awhile
    clock.tick(44 * 1000);
    // but playback resumes!
    player.trigger('progress');
    clock.tick(45 * 1000);

    strictEqual(errors, 0, 'no errors emitted');
  });

  test('no timeupdates while playing triggers a player timeout', function() {
    var errors = 0;
    player.src({
      src: 'http://example.com/movie.mp4',
      type: 'video/mp4'
    });
    player.on('error', function() {
      errors++;
    });
    // swallow any timeupdate events
    player.on('timeupdate', function(event) {
      event.stopImmediatePropagation();
    });
    player.trigger('play');
    clock.tick(45 * 1000);

    strictEqual(errors, 1, 'emitted a single error');
    strictEqual(player.error().code, -2, 'error code is -2');
    strictEqual(player.error().type, 'PLAYER_ERR_TIMEOUT', 'type is player timeout');
  });

  test('timeupdate events while playing clears the player timeout', function() {
    var errors = 0;
    player.src({
      src: 'http://example.com/movie.mp4',
      type: 'video/mp4'
    });
    player.on('error', function() {
      errors++;
    });
    player.trigger('play');
    clock.tick(44 * 1000);
    player.trigger('timeupdate');
    clock.tick(10 * 1000);

    strictEqual(errors, 0, 'no error emitted');
  });

  test('timeupdates after a player timeout clears the error', function() {
    player.src({
      src: 'http://example.com/movie.mp4',
      type: 'video/mp4'
    });
    player.trigger('play');
    clock.tick(45 * 1000);
    player.trigger('timeupdate');

    ok(!player.error(), 'cleared the timeout');
  });

  test('player timeouts do not occur if the player is paused', function() {
    player.src({
      src: 'http://example.com/movie.mp4',
      type: 'video/mp4'
    });
    player.trigger('play');
    // simulate a misbehaving player that doesn't fire `paused`
    player.paused = function() {
      return true;
    };
    clock.tick(45 * 1000);

    ok(!player.error(), 'no error fired');
  });

  test('unrecognized error codes do not cause exceptions', function() {
    var errors = 0;
    player.on('error', function() {
      errors++;
    });
    try {
      player.error({
        code: 'something-custom-that-no-one-could-have-predicted',
        type: 'NOT_AN_ERROR_CONSTANT'
      });
    } catch (e) {
      equal(e, undefined, 'does not throw an exception');
    }
    strictEqual(errors, 1, 'emitted an error');

    try {
      player.error({ /* intentionally missing properties */ });
    } catch (e) {
      equal(e, undefined, 'does not throw an exception');
    }
    strictEqual(errors, 2, 'emitted an error');
  });
})(window, window.videojs, window.sinon, window.QUnit);
