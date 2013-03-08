Video.js Error Messages
=======================
A plugin that displays user-friendly messages when video.js encounters an error.

Using the Plugin
----------------
The plugin automatically registers itself when you include videojs.errors.js in your page:

    <script src='videojs.errors.js'></script>

You probably want to include the default stylesheet, too. It displays error messages as a semi-transparent overlay on top of the video element itself. It's designed to match up fairly well with the default video.js styles:

    <link href='videojs.errors.css' rel='stylesheet'>

If you're not a fan of the default styling, you can drop in your own stylesheet. The only new element to worry about is `vjs-errors-dialog` which is the container for the error messages.

Once you've initialized video.js, you can activate the errors plugin. The plugin has a set of default error messages for the standard HTML5 video errors keyed off their runtime values:

- MEDIA_ERR_ABORTED (numeric value `1`)
- MEDIA_ERR_NETWORK (numeric value `2`)
- MEDIA_ERR_DECODE (numeric value `3`)
- MEDIA_ERR_SRC_NOT_SUPPORTED (numeric value `4`)

If the video element emits any of those errors, the corresponding error message will be displayed. You can override and add custom error codes by supplying options to the plugin:

    video.errors({
      messages: {
        3: 'This is an override for the generic MEDIA_ERR_DECODE',
        'custom': 'This is a custom error message'
      }
    });

If you define custom error messages, you'll need to let video.js know when to emit them yourself:

    video.trigger({
      type: 'error',
      code: 'custom',
      target: video.el()
    });

If an error is emitted that doesn't have an associated key, a generic, catch-all message is displayed. You can override that text by supplying a message for the key `unknown`.

Known Issues
------------
On iPhones, the video element intercepts all user interaction so error message dialogs miss the tap events and don't dismiss themselves. If your video is busted anyways, you may not be that upset about this.