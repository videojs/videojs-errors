import document from 'global/document';

import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';

import plugin from '../src/plugin';

const Player = videojs.getComponent('Player');

const sources = [{
  src: 'movie.mp4',
  type: 'video/mp4'
}, {
  src: 'movie.webm',
  type: 'video/webm'
}];

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

QUnit.module('videojs-errors', {

  beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5.
    this.clock = sinon.useFakeTimers();
    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);

    this.player.buffered = function() {
      return videojs.createTimeRange(0, 0);
    };
    this.player.paused = function() {
      return false;
    };
    this.player.pause = function() {
      return false;
    };

    // initialize the plugin with the default options
    this.player.errors();

    // Tick forward so the player is ready.
    this.clock.tick(1);
  },

  afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

QUnit.test('registers itself with video.js', function(assert) {
  assert.expect(2);

  assert.strictEqual(
    Player.prototype.errors,
    plugin,
    'videojs-errors plugin was registered'
  );

  this.player.errors();

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  assert.ok(
    this.player.hasClass('vjs-errors'),
    'the plugin adds a class to the player'
  );
});

QUnit.test('play() without a src is an error', function(assert) {
  let errors = 0;

  this.player.on('error', function() {
    errors++;
  });
  this.player.trigger('play');

  assert.strictEqual(errors, 1, 'emitted an error');
  assert.strictEqual(this.player.error().code, -1, 'error code is -1');
  assert.strictEqual(this.player.error().type,
    'PLAYER_ERR_NO_SRC',
    'error type is no source');
});

QUnit.test('no progress for 45 seconds is an error', function(assert) {
  let errors = 0;

  this.player.on('error', function() {
    errors++;
  });
  this.player.src(sources);
  this.player.trigger('play');
  this.clock.tick(45 * 1000);

  assert.strictEqual(errors, 1, 'emitted an error');
  assert.strictEqual(this.player.error().code, -2, 'error code is -2');
  assert.strictEqual(this.player.error().type, 'PLAYER_ERR_TIMEOUT');
});

QUnit.test('when dispose is triggered should not throw error ', function(assert) {
  this.player.src(sources);
  this.player.trigger('play');
  this.player.trigger('dispose');
  this.clock.tick(45 * 1000);

  assert.ok(!this.player.error(),
    'should not throw player error when dispose is called.');
});

QUnit.test('progress clears player timeout errors', function(assert) {
  let errors = 0;

  this.player.on('error', function() {
    errors++;
  });
  this.player.src(sources);
  this.player.trigger('play');

  this.clock.tick(45 * 1000);

  assert.strictEqual(errors, 1, 'emitted an error');
  assert.strictEqual(this.player.error().code, -2, 'error code is -2');
  assert.strictEqual(this.player.error().type, 'PLAYER_ERR_TIMEOUT');

  this.player.trigger('progress');
  assert.strictEqual(this.player.error(), null, 'error removed');
});

// safari 7 on OSX can emit stalls when playback is just fine
QUnit.test('stalling by itself is not an error', function(assert) {
  this.player.src(sources);
  this.player.trigger('play');
  this.player.trigger('stalled');

  assert.ok(!this.player.error(), 'no error fired');
});

QUnit.test('timing out multiple times only throws a single error', function(assert) {
  let errors = 0;

  this.player.on('error', function() {
    errors++;
  });
  this.player.src(sources);
  this.player.trigger('play');
  // trigger a player timeout
  this.clock.tick(45 * 1000);
  assert.strictEqual(errors, 1, 'one error fired');

  // wait long enough for another timeout
  this.clock.tick(50 * 1000);
  assert.strictEqual(errors, 1, 'only one error fired');
});

QUnit.test('progress events while playing reset the player timeout', function(assert) {
  let errors = 0;

  this.player.on('error', function() {
    errors++;
  });
  this.player.src(sources);
  this.player.trigger('play');
  // stalled for awhile
  this.clock.tick(44 * 1000);
  // but playback resumes!
  this.player.trigger('progress');
  this.clock.tick(44 * 1000);

  assert.strictEqual(errors, 0, 'no errors emitted');
});

QUnit.test('no signs of playback triggers a player timeout', function(assert) {
  let errors = 0;

  this.player.src(sources);
  this.player.on('error', function() {
    errors++;
  });
  // swallow any timeupdate events
  this.player.on('timeupdate', function(event) {
    event.stopImmediatePropagation();
  });
  this.player.trigger('play');
  this.clock.tick(45 * 1000);

  assert.strictEqual(errors, 1, 'emitted a single error');
  assert.strictEqual(this.player.error().code, -2, 'error code is -2');
  assert.strictEqual(this.player.error().type,
    'PLAYER_ERR_TIMEOUT',
    'type is player timeout');
});

QUnit.test('time changes while playing reset the player timeout', function(assert) {
  let errors = 0;

  this.player.src(sources);
  this.player.on('error', function() {
    errors++;
  });
  this.player.trigger('play');
  this.clock.tick(44 * 1000);
  this.player.currentTime = function() {
    return 1;
  };
  this.player.trigger('timeupdate');
  this.clock.tick(10 * 1000);

  assert.strictEqual(errors, 0, 'no error emitted');
});

QUnit.test('time changes after a player timeout clears the error', function(assert) {
  this.player.src(sources);
  this.player.trigger('play');
  this.clock.tick(45 * 1000);
  this.player.currentTime = function() {
    return 1;
  };
  this.player.trigger('timeupdate');

  assert.ok(!this.player.error(), 'cleared the timeout');
});

QUnit.test('player timeouts do not occur if the player is paused', function(assert) {
  let errors = 0;

  this.player.src(sources);
  this.player.on('error', function() {
    errors++;
  });
  this.player.on('timeupdate', function(event) {
    event.stopImmediatePropagation();
  });
  this.player.trigger('play');
  // simulate a misbehaving player that doesn't fire `paused`
  this.player.paused = function() {
    return true;
  };
  this.clock.tick(45 * 1000);

  assert.strictEqual(errors, 0, 'no error emitted');
});

// video.paused is false at the end of a video on IE11, Win8 RT
QUnit.test('player timeouts do not occur if the video is ended', function(assert) {
  let errors = 0;

  this.player.src(sources);
  this.player.on('error', function() {
    errors++;
  });
  this.player.on('timeupdate', function(event) {
    event.stopImmediatePropagation();
  });
  this.player.trigger('play');
  // simulate a misbehaving player that doesn't fire `ended`
  this.player.ended = function() {
    return true;
  };
  this.clock.tick(45 * 1000);

  assert.strictEqual(errors, 0, 'no error emitted');
});

QUnit.test('player timeouts do not overwrite existing errors', function(assert) {
  this.player.src(sources);
  this.player.trigger('play');
  this.player.error({
    type: 'custom',
    code: -7
  });
  this.clock.tick(45 * 1000);

  assert.strictEqual(-7, this.player.error().code, 'error was not overwritten');
});

QUnit.test('unrecognized error codes do not cause exceptions', function(assert) {
  let errors = 0;

  this.player.on('error', function() {
    errors++;
  });
  this.player.error({
    code: 'something-custom-that-no-one-could-have-predicted',
    type: 'NOT_AN_ERROR_CONSTANT'
  });
  assert.ok(true, 'does not throw an exception');
  assert.strictEqual(errors, 1, 'emitted an error');

  // intentionally missing properties
  this.player.error({});
  assert.ok(true, 'does not throw an exception');

  assert.strictEqual(errors, 2, 'emitted an error');
});

QUnit.test('custom error details should override defaults', function(assert) {
  let customError = {headline: 'test headline', message: 'test details'};

  // initialize the plugin with custom options
  this.player.errors({errors: {4: customError}});
  // tick forward enough to ready the player
  this.clock.tick(1);
  // trigger the error in question
  this.player.error(4);
  // confirm results
  assert.strictEqual(document.querySelector('.vjs-errors-headline').textContent,
    customError.headline, 'headline should match custom override value');
  assert.strictEqual(document.querySelector('.vjs-errors-message').textContent,
    customError.message, 'message should match custom override value');
});
