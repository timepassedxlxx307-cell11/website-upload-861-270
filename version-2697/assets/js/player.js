(function () {
    function canPlayNative(video) {
        return Boolean(
            video.canPlayType("application/vnd.apple.mpegurl") ||
            video.canPlayType("application/x-mpegURL")
        );
    }

    function bindSource(video, source) {
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);

            video._hlsInstance = hls;
            return;
        }

        if (canPlayNative(video)) {
            video.src = source;
            return;
        }

        video.src = source;
    }

    window.initMoviePlayer = function (playerId, source) {
        var video = document.getElementById(playerId);

        if (!video || !source) {
            return;
        }

        var shell = video.closest(".player-shell");
        var button = shell ? shell.querySelector("[data-player-start]") : null;
        var ready = false;

        function prepare() {
            if (ready) {
                return;
            }

            ready = true;
            bindSource(video, source);
            video.load();
        }

        function play() {
            prepare();

            if (shell) {
                shell.classList.add("is-playing");
            }

            var request = video.play();

            if (request && typeof request.catch === "function") {
                request.catch(function () {
                    if (shell) {
                        shell.classList.remove("is-playing");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }

        video.addEventListener("play", function () {
            if (shell) {
                shell.classList.add("is-playing");
            }
        });

        video.addEventListener("pause", function () {
            if (shell && video.currentTime === 0) {
                shell.classList.remove("is-playing");
            }
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
    };
})();
