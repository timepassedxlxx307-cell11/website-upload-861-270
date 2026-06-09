import { H as Hls } from './hls.js';

function bootPlayer(panel) {
  var video = panel.querySelector('video');
  var button = panel.querySelector('[data-play-button]');
  var stream = video ? video.getAttribute('data-stream') : '';
  var active = false;
  var engine = null;

  if (!video || !button || !stream) {
    return;
  }

  function hideButton() {
    button.setAttribute('hidden', 'hidden');
  }

  function begin() {
    if (active) {
      video.play().catch(function () {});
      return;
    }

    active = true;
    hideButton();
    video.setAttribute('controls', 'controls');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.load();
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
      window.setTimeout(function () {
        video.play().catch(function () {});
      }, 300);
      return;
    }

    if (Hls && Hls.isSupported()) {
      engine = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      engine.loadSource(stream);
      engine.attachMedia(video);
      engine.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      engine.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && engine) {
          engine.destroy();
          engine = null;
          video.src = stream;
          video.load();
        }
      });
      window.setTimeout(function () {
        video.play().catch(function () {});
      }, 700);
      return;
    }

    video.src = stream;
    video.load();
    video.play().catch(function () {});
  }

  button.addEventListener('click', begin);
  video.addEventListener('click', function () {
    if (!active) {
      begin();
    }
  });

  window.addEventListener('pagehide', function () {
    if (engine) {
      engine.destroy();
      engine = null;
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bootPlayer);
});
