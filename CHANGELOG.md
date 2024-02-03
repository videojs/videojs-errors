<a name="6.2.0"></a>
# [6.2.0](https://github.com/brightcove/videojs-errors/compare/v6.1.0...v6.2.0) (2024-02-03)

### Features

* remove Flash errors ([#237](https://github.com/brightcove/videojs-errors/issues/237)) ([929b6ea](https://github.com/brightcove/videojs-errors/commit/929b6ea))

### Chores

* **deps-dev:** bump [@babel](https://github.com/babel)/traverse from 7.16.3 to 7.23.9 ([#240](https://github.com/brightcove/videojs-errors/issues/240)) ([92daba3](https://github.com/brightcove/videojs-errors/commit/92daba3))
* **deps-dev:** bump follow-redirects from 1.15.1 to 1.15.5 ([#239](https://github.com/brightcove/videojs-errors/issues/239)) ([9ea936e](https://github.com/brightcove/videojs-errors/commit/9ea936e))
* **deps-dev:** bump postcss from 8.4.14 to 8.4.31 ([#241](https://github.com/brightcove/videojs-errors/issues/241)) ([37110bf](https://github.com/brightcove/videojs-errors/commit/37110bf))
* **deps:** bump [@xmldom](https://github.com/xmldom)/xmldom from 0.7.5 to 0.7.8 ([#229](https://github.com/brightcove/videojs-errors/issues/229)) ([31ebae8](https://github.com/brightcove/videojs-errors/commit/31ebae8))
* **deps:** bump decode-uri-component from 0.2.0 to 0.2.2 ([#232](https://github.com/brightcove/videojs-errors/issues/232)) ([0c16a00](https://github.com/brightcove/videojs-errors/commit/0c16a00))
* **deps:** bump engine.io from 6.2.0 to 6.2.1 ([#231](https://github.com/brightcove/videojs-errors/issues/231)) ([7f2a4b4](https://github.com/brightcove/videojs-errors/commit/7f2a4b4))
* **deps:** bump json5 from 2.2.0 to 2.2.3 ([#233](https://github.com/brightcove/videojs-errors/issues/233)) ([661c16b](https://github.com/brightcove/videojs-errors/commit/661c16b))
* **deps:** bump minimatch from 3.0.4 to 3.1.2 ([#236](https://github.com/brightcove/videojs-errors/issues/236)) ([e74d664](https://github.com/brightcove/videojs-errors/commit/e74d664))
* **deps:** bump shell-quote from 1.7.2 to 1.7.3 ([#225](https://github.com/brightcove/videojs-errors/issues/225)) ([344733b](https://github.com/brightcove/videojs-errors/commit/344733b))
* **deps:** bump socket.io-parser and socket.io ([#242](https://github.com/brightcove/videojs-errors/issues/242)) ([90caad9](https://github.com/brightcove/videojs-errors/commit/90caad9))
* **deps:** bump socket.io-parser from 4.0.4 to 4.0.5 ([#230](https://github.com/brightcove/videojs-errors/issues/230)) ([713f3c0](https://github.com/brightcove/videojs-errors/commit/713f3c0))
* **deps:** bump terser from 5.10.0 to 5.14.2 ([#227](https://github.com/brightcove/videojs-errors/issues/227)) ([5b8026d](https://github.com/brightcove/videojs-errors/commit/5b8026d))
* **deps:** bump ua-parser-js from 0.7.31 to 0.7.33 ([#234](https://github.com/brightcove/videojs-errors/issues/234)) ([4148ab6](https://github.com/brightcove/videojs-errors/commit/4148ab6))
* **deps:** use video.js 8.x by default, but maintain backward compatibility ([#243](https://github.com/brightcove/videojs-errors/issues/243)) ([7f7c5b1](https://github.com/brightcove/videojs-errors/commit/7f7c5b1))

<a name="6.1.0"></a>
# [6.1.0](https://github.com/brightcove/videojs-errors/compare/v6.0.0...v6.1.0) (2023-11-01)

### Features

* remove old flash errors ([#238](https://github.com/brightcove/videojs-errors/issues/238)) ([8697517](https://github.com/brightcove/videojs-errors/commit/8697517))

### Bug Fixes

* prevent lint-staged git add warning and mergeOptions warning on Video.js[@8](https://github.com/8) ([#235](https://github.com/brightcove/videojs-errors/issues/235)) ([2b0966f](https://github.com/brightcove/videojs-errors/commit/2b0966f))

<a name="6.0.0"></a>
# [6.0.0](https://github.com/brightcove/videojs-errors/compare/v5.1.0...v6.0.0) (2022-07-18)

### Features

* Remove vjs-errors-dialog id ([#226](https://github.com/brightcove/videojs-errors/issues/226)) ([54aed49](https://github.com/brightcove/videojs-errors/commit/54aed49))

### Chores

* update dependenices, use postcss instead of node-sass, remove .travis.yml ([#224](https://github.com/brightcove/videojs-errors/issues/224)) ([0b724bf](https://github.com/brightcove/videojs-errors/commit/0b724bf))


### BREAKING CHANGES

* The `vjs-errors-dialog` id attribute will no longer be available to target the div wrapping error content and UI elements. A `vjs-errors-dialog` class will still be present on instances of the div, as per usual.

<a name="5.1.0"></a>
# [5.1.0](https://github.com/brightcove/videojs-errors/compare/v5.0.0...v5.1.0) (2022-06-13)

### Features

* improve the playback timeout error experience ([#223](https://github.com/brightcove/videojs-errors/issues/223)) ([235ff8f](https://github.com/brightcove/videojs-errors/commit/235ff8f))

<a name="5.0.0"></a>
# [5.0.0](https://github.com/brightcove/videojs-errors/compare/v4.5.0...v5.0.0) (2021-12-17)

### Chores

* skip vjsverify es check ([#214](https://github.com/brightcove/videojs-errors/issues/214)) ([df89683](https://github.com/brightcove/videojs-errors/commit/df89683))
* Update generate-rollup-config to drop older browser support ([#211](https://github.com/brightcove/videojs-errors/issues/211)) ([e992df7](https://github.com/brightcove/videojs-errors/commit/e992df7))


### BREAKING CHANGES

* This removes support for some older browsers like IE 11

Co-authored-by: Gary Katsevman <git@gkatsev.com>

<a name="4.5.0"></a>
# [4.5.0](https://github.com/brightcove/videojs-errors/compare/v4.4.0...v4.5.0) (2021-05-04)

### Features

* add support for -1 timeout and backgroundTimeout values ([#206](https://github.com/brightcove/videojs-errors/issues/206)) ([cf0ea56](https://github.com/brightcove/videojs-errors/commit/cf0ea56))

<a name="4.4.0"></a>
# [4.4.0](https://github.com/brightcove/videojs-errors/compare/v4.3.2...v4.4.0) (2021-04-13)

### Features

* Add backgroundTimeout option ([#198](https://github.com/brightcove/videojs-errors/issues/198)) ([d8d9efc](https://github.com/brightcove/videojs-errors/commit/d8d9efc))
* allow turning off timeout by setting it to Infinity ([#204](https://github.com/brightcove/videojs-errors/issues/204)) ([b73f160](https://github.com/brightcove/videojs-errors/commit/b73f160)), closes [#134](https://github.com/brightcove/videojs-errors/issues/134)

### Chores

* don't run tests on version ([#205](https://github.com/brightcove/videojs-errors/issues/205)) ([c349883](https://github.com/brightcove/videojs-errors/commit/c349883))

<a name="4.3.2"></a>
## [4.3.2](https://github.com/brightcove/videojs-errors/compare/v4.3.1...v4.3.2) (2020-03-13)

### Bug Fixes

* Trigger error handler on contenterror as well ([#191](https://github.com/brightcove/videojs-errors/issues/191)) ([723b2a6](https://github.com/brightcove/videojs-errors/commit/723b2a6))

<a name="4.3.1"></a>
## [4.3.1](https://github.com/brightcove/videojs-errors/compare/v4.3.0...v4.3.1) (2020-02-08)

### Bug Fixes

* **lang:** Add missing Arabic translations ([#185](https://github.com/brightcove/videojs-errors/issues/185)) ([708b398](https://github.com/brightcove/videojs-errors/commit/708b398))

### Chores

* **package:** Update development dependencies ([#186](https://github.com/brightcove/videojs-errors/issues/186)) ([98ce727](https://github.com/brightcove/videojs-errors/commit/98ce727))

<a name="4.3.0"></a>
# [4.3.0](https://github.com/brightcove/videojs-errors/compare/v4.2.0...v4.3.0) (2019-08-06)

### Features

* Add class to error code line and make colon bold ([#164](https://github.com/brightcove/videojs-errors/issues/164)) ([7734d36](https://github.com/brightcove/videojs-errors/commit/7734d36))

### Bug Fixes

* **lang:** Improved translations ([#165](https://github.com/brightcove/videojs-errors/issues/165)) ([5aa4877](https://github.com/brightcove/videojs-errors/commit/5aa4877))
* **lang:** Update Chinese (Simplified) and Chinese (Traditional) and clone them to more correct language codes ([#176](https://github.com/brightcove/videojs-errors/issues/176)) ([568d41d](https://github.com/brightcove/videojs-errors/commit/568d41d))

### Chores

* **package:** Update dependencies ([#172](https://github.com/brightcove/videojs-errors/issues/172)) ([90e8bbe](https://github.com/brightcove/videojs-errors/commit/90e8bbe))
* **package:** Update development dependencies. ([#167](https://github.com/brightcove/videojs-errors/issues/167)) ([a0f4f96](https://github.com/brightcove/videojs-errors/commit/a0f4f96))
* **package:** update lint-staged to version 8.1.0 ([#153](https://github.com/brightcove/videojs-errors/issues/153)) ([9322988](https://github.com/brightcove/videojs-errors/commit/9322988))
* **package:** update npm-run-all/videojs-generator-verify for security ([d355dd5](https://github.com/brightcove/videojs-errors/commit/d355dd5))
* **package:** update videojs-generate-karma-config to version 5.0.0 ([#152](https://github.com/brightcove/videojs-errors/issues/152)) ([7ffd25f](https://github.com/brightcove/videojs-errors/commit/7ffd25f))
* **package:** update videojs-generate-karma-config to version 5.1.0 ([553b961](https://github.com/brightcove/videojs-errors/commit/553b961))
* **package:** update videojs-generate-rollup-config to version 2.3.1 ([#154](https://github.com/brightcove/videojs-errors/issues/154)) ([f67d225](https://github.com/brightcove/videojs-errors/commit/f67d225))
* **package:** update videojs-languages to version 2.0.0 ([#142](https://github.com/brightcove/videojs-errors/issues/142)) ([0299e75](https://github.com/brightcove/videojs-errors/commit/0299e75))
* **package:** update videojs-standard to version 8.0.2 ([#155](https://github.com/brightcove/videojs-errors/issues/155)) ([cd0f8ca](https://github.com/brightcove/videojs-errors/commit/cd0f8ca))

<a name="4.2.0"></a>
# [4.2.0](https://github.com/brightcove/videojs-errors/compare/v4.1.3...v4.2.0) (2018-10-04)

### Bug Fixes

* ignore progress events ([#143](https://github.com/brightcove/videojs-errors/issues/143)) ([348f670](https://github.com/brightcove/videojs-errors/commit/348f670))
* Remove the postinstall script to prevent install issues ([#138](https://github.com/brightcove/videojs-errors/issues/138)) ([a2b2839](https://github.com/brightcove/videojs-errors/commit/a2b2839))

### Chores

* update to generator-videojs-plugin[@7](https://github.com/7).2.0 ([1e77e8c](https://github.com/brightcove/videojs-errors/commit/1e77e8c))
* **package:** update rollup to version 0.66.0 ([#140](https://github.com/brightcove/videojs-errors/issues/140)) ([459f9fb](https://github.com/brightcove/videojs-errors/commit/459f9fb))

<a name="4.1.3"></a>
## [4.1.3](https://github.com/brightcove/videojs-errors/compare/v4.1.2...v4.1.3) (2018-08-23)

### Chores

* generator v7 ([#133](https://github.com/brightcove/videojs-errors/issues/133)) ([365e7b8](https://github.com/brightcove/videojs-errors/commit/365e7b8))

<a name="4.1.2"></a>
## [4.1.2](https://github.com/brightcove/videojs-errors/compare/v4.1.1...v4.1.2) (2018-08-03)

### Bug Fixes

* babel the es dist, by updating the generator ([#127](https://github.com/brightcove/videojs-errors/issues/127)) ([983b83f](https://github.com/brightcove/videojs-errors/commit/983b83f))

### Chores

* **package:** update dependencies, enable greenkeeper ([#126](https://github.com/brightcove/videojs-errors/issues/126)) ([7e95841](https://github.com/brightcove/videojs-errors/commit/7e95841))

<a name="4.1.1"></a>
## [4.1.1](https://github.com/brightcove/videojs-errors/compare/v4.1.0...v4.1.1) (2018-07-05)

### Chores

* generator v6 ([#122](https://github.com/brightcove/videojs-errors/issues/122)) ([846d151](https://github.com/brightcove/videojs-errors/commit/846d151))

<a name="4.1.0"></a>
# [4.1.0](https://github.com/brightcove/videojs-errors/compare/v4.0.0...v4.1.0) (2018-05-08)

### Features

* add standard VERSION property ([#120](https://github.com/brightcove/videojs-errors/issues/120)) ([c475d12](https://github.com/brightcove/videojs-errors/commit/c475d12))

<a name="4.0.0"></a>
# [4.0.0](https://github.com/brightcove/videojs-errors/compare/v3.1.0...v4.0.0) (2018-05-02)

### Features

* Add timeout getter/setter ([#114](https://github.com/brightcove/videojs-errors/issues/114)) ([cb45723](https://github.com/brightcove/videojs-errors/commit/cb45723))
* drop v5 support ([#119](https://github.com/brightcove/videojs-errors/issues/119)) ([f4440c1](https://github.com/brightcove/videojs-errors/commit/f4440c1))

### Bug Fixes

* make the plugin ready for videojs 7 ([#117](https://github.com/brightcove/videojs-errors/issues/117)) ([8d96f2a](https://github.com/brightcove/videojs-errors/commit/8d96f2a)), closes [#116](https://github.com/brightcove/videojs-errors/issues/116)
* Restart timeout monitor if playing when reinitialised ([#113](https://github.com/brightcove/videojs-errors/issues/113)) ([af868ed](https://github.com/brightcove/videojs-errors/commit/af868ed))

### Documentation

* **README:** Add usage npm/bundler usage ([#108](https://github.com/brightcove/videojs-errors/issues/108)) ([ec86764](https://github.com/brightcove/videojs-errors/commit/ec86764))
* **README:** fix typo ([ec724b7](https://github.com/brightcove/videojs-errors/commit/ec724b7))


### BREAKING CHANGES

* drop v5 support.

<a name="3.1.0"></a>
# [3.1.0](https://github.com/brightcove/videojs-errors/compare/v1.0.0...v3.1.0) (2017-12-13)

### Features

* add custom error for flashls crossdomain errors ([#111](https://github.com/brightcove/videojs-errors/issues/111)) ([9d20fbd](https://github.com/brightcove/videojs-errors/commit/9d20fbd))
* Add Czech translation ([#106](https://github.com/brightcove/videojs-errors/issues/106)) ([3cb9c1e](https://github.com/brightcove/videojs-errors/commit/3cb9c1e))
* Add new custom errors and allow defining custom errors at runtime ([#90](https://github.com/brightcove/videojs-errors/issues/90)) ([4bd0cd9](https://github.com/brightcove/videojs-errors/commit/4bd0cd9))
* Change codes of recently-added errors, allow type and code to be shared, and add `getAll()` method. ([#96](https://github.com/brightcove/videojs-errors/issues/96)) ([f39c0f6](https://github.com/brightcove/videojs-errors/commit/f39c0f6))

### Bug Fixes

* Fix tests for video.js 6 ([#77](https://github.com/brightcove/videojs-errors/issues/77)) ([0d71164](https://github.com/brightcove/videojs-errors/commit/0d71164))
* Resolve an issue where 'error' events triggered on the player during contrib-ads playback would not be recognized. ([#109](https://github.com/brightcove/videojs-errors/issues/109)) ([3b48430](https://github.com/brightcove/videojs-errors/commit/3b48430))
* show spinner if player has stalled ([#104](https://github.com/brightcove/videojs-errors/issues/104)) ([a89513f](https://github.com/brightcove/videojs-errors/commit/a89513f))

### Chores

* **package:** update browserify to version 13.3.0 ([#58](https://github.com/brightcove/videojs-errors/issues/58)) ([e61edb6](https://github.com/brightcove/videojs-errors/commit/e61edb6))
* **package:** update karma to version 1.4.1 ([#69](https://github.com/brightcove/videojs-errors/issues/69)) ([7cd5e45](https://github.com/brightcove/videojs-errors/commit/7cd5e45))
* **package:** update node-sass to version 4.5.0 ([#70](https://github.com/brightcove/videojs-errors/issues/70)) ([f7d7793](https://github.com/brightcove/videojs-errors/commit/f7d7793))
* **package:** update npm-run-all to version 3.1.2 ([#48](https://github.com/brightcove/videojs-errors/issues/48)) ([0b3f13d](https://github.com/brightcove/videojs-errors/commit/0b3f13d))
* **package:** update portscanner to version 2.1.1 ([#47](https://github.com/brightcove/videojs-errors/issues/47)) ([b83b979](https://github.com/brightcove/videojs-errors/commit/b83b979))
* **package:** update shelljs to version 0.7.6 ([#60](https://github.com/brightcove/videojs-errors/issues/60)) ([9b966f6](https://github.com/brightcove/videojs-errors/commit/9b966f6))
* Add translations for some new strings. ([#101](https://github.com/brightcove/videojs-errors/issues/101)) ([b3dc97a](https://github.com/brightcove/videojs-errors/commit/b3dc97a))
* Update tooling using generator v5 prerelease. ([#99](https://github.com/brightcove/videojs-errors/issues/99)) ([b0e53e5](https://github.com/brightcove/videojs-errors/commit/b0e53e5))
* update travis ([#71](https://github.com/brightcove/videojs-errors/issues/71)) ([86d7807](https://github.com/brightcove/videojs-errors/commit/86d7807))

### Code Refactoring

* Updates for Video.js 6.0 compatibility. ([48ed04a](https://github.com/brightcove/videojs-errors/commit/48ed04a))


### BREAKING CHANGES

* Removed Bower support.
* Changed the codes of recently-added errors; so, they will no avoid collisions more reliably with 1.x implementations.

<a name="3.0.3"></a>
## [3.0.3](https://github.com/brightcove/videojs-errors/compare/v3.0.2...v3.0.3) (2017-09-06)

### Features

* Add Czech translation ([#106](https://github.com/brightcove/videojs-errors/issues/106)) ([3cb9c1e](https://github.com/brightcove/videojs-errors/commit/3cb9c1e))

### Bug Fixes

* Resolve an issue where 'error' events triggered on the player during contrib-ads playback would not be recognized. ([#109](https://github.com/brightcove/videojs-errors/issues/109)) ([3b48430](https://github.com/brightcove/videojs-errors/commit/3b48430))

<a name="3.0.2"></a>
## [3.0.2](https://github.com/brightcove/videojs-errors/compare/v3.0.1...v3.0.2) (2017-06-08)

### Bug Fixes

* show spinner if player has stalled ([#104](https://github.com/brightcove/videojs-errors/issues/104)) ([a89513f](https://github.com/brightcove/videojs-errors/commit/a89513f))

<a name="3.0.1"></a>
## [3.0.1](https://github.com/brightcove/videojs-errors/compare/v3.0.0...v3.0.1) (2017-05-22)

### Chores

* Add translations for some new strings. ([#101](https://github.com/brightcove/videojs-errors/issues/101)) ([b3dc97a](https://github.com/brightcove/videojs-errors/commit/b3dc97a))

<a name="3.0.0"></a>
# [3.0.0](https://github.com/brightcove/videojs-errors/compare/v1.0.0...v3.0.0) (2017-05-19)

### Chores

* Update tooling using generator v5 prerelease. ([#99](https://github.com/brightcove/videojs-errors/issues/99)) ([b0e53e5](https://github.com/brightcove/videojs-errors/commit/b0e53e5))

### BREAKING CHANGES

* Removed Bower support.

## 2.0.2 (2017-05-15)
* Fixed some tooling issues, including missing `dist/lang` files.

## 2.0.1 (2017-05-15)
* Fixed mis-configured `package.json` fields.

## 2.0.0 (2017-05-15)
* @misteroneill Move off of Spellbook for now and add pkg.module. ([#95](https://github.com/brightcove/videojs-errors/pull/95))
* @misteroneill __BREAKING CHANGE__: Change codes of recently-added errors, allow type and code to be shared, and add `getAll()` method. ([#95](https://github.com/brightcove/videojs-errors/pull/95))

## 1.3.2 (2017-04-24)
* @forbesjo Added option to disable watching progress events ([#91](https://github.com/brightcove/videojs-errors/pull/91))

## 1.3.1 (2017-04-19)
* @misteroneill Fix size detection to account for players that have no configured dimensions ([#92](https://github.com/brightcove/videojs-errors/pull/92))

## 1.3.0 (2017-04-18)
* @misteroneill Add new custom errors and an `extend` method to customize errors at runtime ([#90](https://github.com/brightcove/videojs-errors/pull/90))

## 1.2.0 (2017-02-21)
* @gfviegas Add support for Portuguese ([#42](https://github.com/brightcove/videojs-errors/pull/42))
* @bc-paul Allow errors to be non-dismissible ([#54](https://github.com/brightcove/videojs-errors/pull/54))

## v1.1.4 (2017-02-09)
* @misteroneill Remove deprecation warning about using videojs.plugin (#72)
* @BrandonOCasey Update Travis build to run w/ Video.js 5 and 6 (#71)

## v1.1.3 (2017-01-27)
* @BrandonOCasey Updates for Video.js 6.0 compatibility. (#67)

## v1.1.2 (2016-12-07)
* @forbesjo Error if Flash tech is unusable (#50)

## v1.1.1 (2016-11-11)
* @mjneil Cleanup event bindings when reinitialized (#44)

## v1.1.0 (2016-09-08)
* @vdeshpande Add in a user-friendly message for disabled Flash in IE (#41)

## v1.0.5 (2016-08-10)
* @vdeshpande Close-button errors message accessible fix (#40)
* @mkody Fix typo in French translation (#39)

## v1.0.4 (2016-04-13)
* Added listening for `'adtimeupdate'` ([#36](https://github.com/brightcove/videojs-errors/pull/36))
* Added Arabic and Turkish ([#38](https://github.com/brightcove/videojs-errors/pull/38))

## v1.0.3 (2016-03-01)
* Add Italian, Russian and Chinese (traditional and simplified).
* Add English translations as a canonical template.

## v1.0.2 (2016-01-11)
* Bower :)

## v1.0.1 (2016-01-11)
* Updated to use `generator-videojs-plugin` conventions.

## v1.0.0 (2015-11-22)
* Updates for video.js 5.0.

## v0.1.8 (2015-05-05)
* Do not display errors when the player is paused or ended for timeouts.
* Fix a vdata exception when dispose is called.

## v0.1.6 (2014-09-10)
* Remove `dist/` from `.npmignore`.

## v0.1.5 (2014-09-03)
* More localization improvements.

## v0.1.4 (2014-08-27)
* Fix `dist/`.

## v0.1.3 (2014-08-27)
* Localization improvements.

## v0.1.2 (2014-08-19)
* Localization

## v0.1.1 (2014-06-13)
* Ended videos should not cause player timeouts on IE11/Win8rt.

## v0.1.0 (2014-06-05)
* Initial release.

