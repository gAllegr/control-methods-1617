var manifestUri = 'video/packaged/live/live.mpd';
var licenseServer = 'http://localhost:8584';

function initApp() {
  // Verbose logs, which can generate a lot of output:
  shaka.log.setLevel(shaka.log.Level.V1);

  // Install built-in polyfills to patch browser incompatibilities.
  shaka.polyfill.installAll();

  // Check to see if the browser supports the basic APIs Shaka needs.
  if (shaka.Player.isBrowserSupported()) {
    // Everything looks good!
    initPlayer();
  } else {
    // This browser does not have the minimum set of APIs we need.
    console.error('Browser not supported!');
  }
}

function initPlayer() {
  // Create a Player instance.
  var video = document.getElementById('video');
  var player = new shaka.Player(video);

  // Attach player to the window to make it easy to access in the JS console.
  window.player = player;

  // Listen for error events.
  player.addEventListener('error', onErrorEvent);

  // Server configuration
  player.configure({
    drm: {
      servers: {
        'org.w3.clearkey': licenseServer
      }
    }
  });

  // Create the request to be sent
  player.getNetworkingEngine().registerRequestFilter(function(type, request) {
    // Only add headers to license requests:
    if (type == shaka.net.NetworkingEngine.RequestType.LICENSE) {
      // This is the specific parameter name and value the server wants:
      // Note that all network requests can have multiple URIs (for fallback),
      // and therefore this is an array. But there should only be one license
      // server URI in this tutorial.
      request.uris[0] += '?keyid=a1b1c1d1a2b2a3b3a4b4a5b5c5d5e5f5';
    }
  });



  // Try to load a manifest.
  // This is an asynchronous process.
  player.load(manifestUri).then(function() {
    // This runs if the asynchronous load is successful.
    console.log('The video has now been loaded!');
  }).catch(onError);  // onError is executed if the asynchronous load fails.
}

function onErrorEvent(event) {
  // Extract the shaka.util.Error object from the event.
  onError(event.detail);
}

function onError(error) {
  // Log the error.
  console.error('Error code', error.code, 'object', error);
}

document.addEventListener('DOMContentLoaded', initApp);
