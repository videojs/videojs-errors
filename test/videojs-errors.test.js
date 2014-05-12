/*! videojs-errors - v0.0.0 - 2014-4-30
 * Copyright (c) 2014 Brightcove
 * Licensed under the Apache-2.0 license. */
(function(window, videojs, sinon, qunit) {
  'use strict';

  var realIsHtmlSupported,
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

      // setup sinon fake timers
      clock = sinon.useFakeTimers();

      // create a video element
      var video = document.createElement('video');
      document.querySelector('#qunit-fixture').appendChild(video);

      // create a video.js player
      player = videojs(video);

      // initialize the plugin with the default options
      player.errors();
    },
    teardown: function() {
      videojs.Html5.isSupported = realIsHtmlSupported;
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

  test('playback after stalling clears the timeout', function() {
    var errors = 0;
    player.on('error', function() {
      errors++;
    });
    player.trigger('stalled');
    // stalled for awhile
    clock.tick(44 * 1000);
    // but playback resumes!
    player.trigger('timeupdate');
    clock.tick(45 * 1000);

    strictEqual(errors, 0, 'no errors emitted');
  });
})(window, window.videojs, window.sinon, window.QUnit);
