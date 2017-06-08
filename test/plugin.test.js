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
    this.errorDisplay = this.player.getChild('errorDisplay');

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
    typeof Player.prototype.errors,
    'function',
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

QUnit.test('no progress for 1 second shows the loading spinner', function(assert) {
  this.player.src(sources);
  this.player.trigger('play');
  this.clock.tick(1 * 1000);

  assert.ok(
    this.player.hasClass('vjs-waiting'),
    'the plugin adds spinner class to the player'
  );
});

QUnit.test('progress events while playing reset the spinner', function(assert) {
  this.player.src(sources);
  this.player.trigger('play');
  // stalled for awhile
  this.clock.tick(44 * 1000);
  assert.ok(
    this.player.hasClass('vjs-waiting'),
    'the plugin adds spinner class to the player'
  );

  // resume playback
  this.player.currentTime = function() {
    return 1;
  };
  this.player.trigger('timeupdate');
  assert.notOk(this.player.hasClass('vjs-waiting'), 'spinner removed');
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

QUnit.test('when progress watching is disabled, progress within 45 seconds is an error', function(assert) {
  let errors = 0;

  this.player.errors.disableProgress(true);

  this.player.on('error', function() {
    errors++;
  });
  this.player.src(sources);
  this.player.trigger('play');
  this.clock.tick(40 * 1000);
  this.player.trigger('progress');
  this.clock.tick(5 * 1000);

  assert.strictEqual(errors, 1, 'emitted an error');
  assert.strictEqual(this.player.error().code, -2, 'error code is -2');
  assert.strictEqual(this.player.error().type, 'PLAYER_ERR_TIMEOUT');

  this.player.errors.disableProgress(false);
});

QUnit.test('Flash API is unavailable when using Flash is an error', function(assert) {
  this.player.tech_.el_.type = 'application/x-shockwave-flash';
  // when Flash dies the object methods go away
  /* eslint-disable camelcase */
  this.player.tech_.el_.vjs_getProperty = null;
  /* eslint-enable camelcase */
  this.player.paused = function() {
    return true;
  };

  let errors = 0;

  this.player.on('error', function() {
    errors++;
  });
  this.player.src(sources);
  this.player.trigger('play');
  this.player.trigger('timeupdate');

  assert.strictEqual(errors, 1, 'emitted an error');
  assert.strictEqual(this.player.error().code, -2, 'error code is -2');
  assert.strictEqual(this.player.error().type, 'PLAYER_ERR_TIMEOUT');
});

QUnit.test('the plugin cleans up after its previous incarnation when called again',
  function(assert) {
    let errors = 0;

    this.player.on('error', () => errors++);

    // Call plugin multiple times
    this.player.errors();
    this.player.errors();

    // Tick the clock forward enough to trigger the player to be "ready".
    this.clock.tick(1);

    this.player.trigger('play');

    assert.strictEqual(errors, 1, 'emitted a single error');
    assert.strictEqual(this.player.error().code, -1, 'error code is -1');
    assert.strictEqual(this.player.error().type, 'PLAYER_ERR_NO_SRC');
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

QUnit.test('time changes while playing ads reset the player timeout', function(assert) {
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
  this.player.trigger('adtimeupdate');
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
  const customError = {headline: 'test headline', message: 'test details'};

  // initialize the plugin with custom options
  this.player.errors({errors: {4: customError}});
  // tick forward enough to ready the player
  this.clock.tick(1);
  // trigger the error in question
  this.player.error(4);
  // confirm results
  assert.strictEqual(this.errorDisplay.$('.vjs-errors-headline').textContent,
    customError.headline, 'headline should match custom override value');
  assert.strictEqual(this.errorDisplay.$('.vjs-errors-message').textContent,
    customError.message, 'message should match custom override value');
});

QUnit.test('Append Flash error details when flash is not supported', function(assert) {
  const Flash = videojs.getTech('Flash');

  // vjs6 won't have flash by default
  if (!Flash) {
    assert.notOk(Flash, 'flash tech not available, skipping unit test');
    return;
  }

  const oldIsSupported = videojs.getComponent('Flash').isSupported;

  // Mock up isSupported to be false
  videojs.getComponent('Flash').isSupported = () => false;

  // tick forward enough to ready the player
  this.clock.tick(1);
  // trigger the error in question
  this.player.error(4);
  // confirm results
  assert.equal(this.errorDisplay.$('.vjs-errors-flashmessage').textContent,
    'If you are using an older browser please try upgrading or installing Flash.',
    'Flash Error message should be displayed');
  // Restoring isSupported to the old value
  videojs.getComponent('Flash').isSupported = oldIsSupported;
});

QUnit.test('default error is dismissible', function(assert) {
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

QUnit.test('custom error is dismissible', function(assert) {
  const customErrorDismiss = {
    headline: 'test headline',
    message: 'test details',
    dismiss: true
  };

  // initialize the plugin with custom options
  this.player.errors({errors: {4: customErrorDismiss}});
  // tick forward enough to ready the player
  this.clock.tick(1);
  // trigger the error in question
  this.player.error(4);
  // confirm results
  assert.ok(this.errorDisplay.$('.vjs-errors-ok-button'), 'ok button is present');
  assert.ok(this.errorDisplay.$('.vjs-close-button'), 'close button is present');
});

QUnit.test('custom error is not dismissible', function(assert) {
  const customErrorNoDimiss = {
    headline: 'test headline',
    message: 'test details',
    dismiss: false
  };

  // initialize the plugin with custom options
  this.player.errors({errors: {4: customErrorNoDimiss}});
  // tick forward enough to ready the player
  this.clock.tick(1);
  // trigger the error in question
  this.player.error(4);
  // confirm results
  assert.ok(!this.errorDisplay.$('.vjs-errors-ok-button'), 'ok button is not present');
  assert.ok(!this.errorDisplay.$('.vjs-close-button'), 'close button is not present');
});

QUnit.test('custom errors can be added at runtime', function(assert) {
  this.player.errors();

  // tick forward enough to ready the player
  this.clock.tick(1);

  const error = {
    '-3': {
      type: 'TEST',
      headline: 'test',
      message: 'test test'
    }
  };

  this.player.errors.extend(error);

  this.player.error({code: -3});

  assert.strictEqual(
    this.player.errorDisplay.$('.vjs-errors-headline').textContent,
    error['-3'].headline,
    'headline should match custom override value'
  );

  assert.strictEqual(
    this.player.errorDisplay.$('.vjs-errors-message').textContent,
    error['-3'].message,
    'message should match custom override value'
  );
});

QUnit.test('custom errors can be defined without a type at init time', function(assert) {
  const error = {
    TEST: {
      headline: 'test',
      message: 'test test'
    }
  };

  this.player.errors({errors: error});

  // tick forward enough to ready the player
  this.clock.tick(1);

  this.player.error({code: 'TEST'});

  assert.strictEqual(
    this.player.errorDisplay.$('.vjs-errors-headline').textContent,
    error.TEST.headline,
    'headline should match custom override value'
  );

  assert.strictEqual(
    this.player.errorDisplay.$('.vjs-errors-message').textContent,
    error.TEST.message,
    'message should match custom override value'
  );
});

QUnit.test('custom errors can be defined without a type at init time', function(assert) {
  const error = {
    TEST: {
      headline: 'test',
      message: 'test test'
    }
  };

  this.player.errors();

  // tick forward enough to ready the player
  this.clock.tick(1);

  this.player.errors.extend(error);
  this.player.error({code: 'TEST'});

  assert.strictEqual(
    this.player.errorDisplay.$('.vjs-errors-headline').textContent,
    error.TEST.headline,
    'headline should match custom override value'
  );

  assert.strictEqual(
    this.player.errorDisplay.$('.vjs-errors-message').textContent,
    error.TEST.message,
    'message should match custom override value'
  );
});

QUnit.test('getAll()', function(assert) {
  this.player.errors();

  let errors = this.player.errors.getAll();

  assert.strictEqual(errors['1'].type, 'MEDIA_ERR_ABORTED');
  assert.strictEqual(errors['2'].type, 'MEDIA_ERR_NETWORK');

  this.player.errors.extend({
    TEST: {
      headline: 'test',
      message: 'test test'
    }
  });

  errors = this.player.errors.getAll();

  assert.strictEqual(errors['1'].type, 'MEDIA_ERR_ABORTED');
  assert.strictEqual(errors['2'].type, 'MEDIA_ERR_NETWORK');
  assert.strictEqual(errors.TEST.type, 'TEST');
});
