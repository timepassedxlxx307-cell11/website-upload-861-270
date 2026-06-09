(function () {
  function attach(video, url) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = url;
  }

  window.MoviePlayer = {
    init: function (videoId, overlayId, url) {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      if (!video || !url) {
        return;
      }
      var prepared = false;

      function prepare() {
        if (!prepared) {
          attach(video, url);
          prepared = true;
        }
      }

      function start() {
        prepare();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("loadedmetadata", function () {
        if (video.paused && overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  };
})();
