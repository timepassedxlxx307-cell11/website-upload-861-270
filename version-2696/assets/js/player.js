(function () {
  function initPlayer(frame) {
    var video = frame.querySelector('video[data-src]');
    var button = frame.querySelector('[data-player-button]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    var hls = null;
    var started = false;

    function attachSource() {
      if (started) {
        return Promise.resolve();
      }
      started = true;
      frame.classList.add('is-playing');
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hls) {
              hls.destroy();
              hls = null;
              video.src = source;
            }
            resolve();
          });
        });
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      return Promise.resolve();
    }

    function play() {
      attachSource().then(function () {
        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === 'function') {
          playAttempt.catch(function () {
            frame.classList.add('is-playing');
          });
        }
      });
    }

    frame.addEventListener('click', function (event) {
      if (event.target === video && started) {
        return;
      }
      play();
    });

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        frame.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(initPlayer);
  });
})();
