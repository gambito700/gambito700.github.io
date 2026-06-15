export class MusicModule {
  static init() {
    const playBtn = document.getElementById('window-music-play')
    const prevBtn = document.getElementById('window-music-prev')
    const nextBtn = document.getElementById('window-music-next')
    const progressBar = document.getElementById('window-progress-bar')
    const volumeSlider = document.getElementById('window-music-volume')

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (!window.ytPlayer || !window.ytPlayer.getPlayerState) return
        const state = window.ytPlayer.getPlayerState()
        if (state === YT.PlayerState.PLAYING) {
          window.ytPlayer.pauseVideo()
        } else {
          window.ytPlayer.playVideo()
        }
      })
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const next = (MusicModule._currentTrack + 1) % MusicModule._playlist.length
        MusicModule._loadTrack(next, MusicModule._isPlaying)
      })
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const prev = (MusicModule._currentTrack - 1 + MusicModule._playlist.length) % MusicModule._playlist.length
        MusicModule._loadTrack(prev, MusicModule._isPlaying)
      })
    }

    if (progressBar) {
      progressBar.addEventListener('click', (e) => {
        if (!window.ytPlayer || !window.ytPlayer.getDuration) return
        const rect = progressBar.getBoundingClientRect()
        const pct = (e.clientX - rect.left) / rect.width
        window.ytPlayer.seekTo(pct * window.ytPlayer.getDuration(), true)
      })
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', function () {
        if (window.ytPlayer && window.ytPlayer.setVolume) window.ytPlayer.setVolume(parseInt(this.value, 10))
      })
    }

    if (typeof YT !== 'undefined' && YT.Player && !window.ytPlayer) {
      MusicModule._createPlayer()
    }

    MusicModule._pollYT()
    MusicModule._updateUI()
  }

  static _createPlayer() {
    window.ytPlayer = new YT.Player('yt-player', {
      height: '1', width: '1',
      videoId: MusicModule._playlist[MusicModule._currentTrack].id,
      playerVars: {
        autoplay: 0, controls: 0, disablekb: 1, fs: 0,
        modestbranding: 1, rel: 0,
        origin: window.location.origin || 'http://localhost'
      },
      events: {
        onReady: MusicModule._onReady,
        onStateChange: MusicModule._onStateChange,
        onError: MusicModule._onError
      }
    })
  }

  static _onReady(event) {
    MusicModule._updateUI()
    const vol = document.getElementById('window-music-volume')
    if (vol) event.target.setVolume(parseInt(vol.value, 10))
  }

  static _onStateChange(event) {
    const icon = document.getElementById('window-music-play-icon')
    if (event.data === YT.PlayerState.PLAYING) {
      MusicModule._isPlaying = true
      if (icon) icon.src = 'images/icons/pausa.png'
      MusicModule._startProgressLoop()
      if (typeof window.showToast === 'function') {
        window.showToast(MusicModule._playlist[MusicModule._currentTrack].name, MusicModule._playlist[MusicModule._currentTrack].artist)
      }
    } else if (event.data === YT.PlayerState.PAUSED) {
      MusicModule._isPlaying = false
      if (icon) icon.src = 'images/icons/play.png'
      MusicModule._stopProgressLoop()
    } else if (event.data === YT.PlayerState.BUFFERING) {
      if (icon) icon.src = 'images/icons/pausa.png'
    } else if (event.data === YT.PlayerState.ENDED) {
      MusicModule._currentTrack = (MusicModule._currentTrack + 1) % MusicModule._playlist.length
      MusicModule._loadTrack(MusicModule._currentTrack, true)
    }
  }

  static _onError() {
    MusicModule._currentTrack = (MusicModule._currentTrack + 1) % MusicModule._playlist.length
    MusicModule._loadTrack(MusicModule._currentTrack, MusicModule._isPlaying)
  }

  static _loadTrack(index, autoplay) {
    if (!window.ytPlayer || !window.ytPlayer.loadVideoById) return
    MusicModule._currentTrack = index
    MusicModule._updateUI()
    if (autoplay) {
      window.ytPlayer.loadVideoById(MusicModule._playlist[index].id)
    } else {
      window.ytPlayer.cueVideoById(MusicModule._playlist[index].id)
    }
    MusicModule._resetProgress()
  }

  static _updateUI() {
    const track = MusicModule._playlist[MusicModule._currentTrack]
    const nameEl = document.getElementById('window-music-name')
    const artistEl = document.getElementById('window-music-artist')
    if (nameEl) nameEl.textContent = track.name
    if (artistEl) artistEl.textContent = track.artist
  }

  static _startProgressLoop() {
    MusicModule._stopProgressLoop()
    MusicModule._progressTimer = setInterval(() => {
      if (!window.ytPlayer || !window.ytPlayer.getCurrentTime) return
      const cur = window.ytPlayer.getCurrentTime() || 0
      const dur = window.ytPlayer.getDuration() || 0
      const fill = document.getElementById('window-progress-fill')
      const pct = (dur > 0) ? ((cur / dur) * 100) + '%' : '0%'
      if (fill) fill.style.width = pct
    }, 500)
  }

  static _stopProgressLoop() {
    if (MusicModule._progressTimer) { clearInterval(MusicModule._progressTimer); MusicModule._progressTimer = null }
  }

  static _resetProgress() {
    const fill = document.getElementById('window-progress-fill')
    if (fill) fill.style.width = '0%'
  }

  static _pollYT() {
    const check = () => {
      if (typeof YT !== 'undefined' && YT.Player && !window.ytPlayer) {
        MusicModule._createPlayer()
      } else if (!window.ytPlayer) {
        setTimeout(check, 500)
      }
    }
    setTimeout(check, 500)
  }
}

MusicModule._playlist = [
  { id: 'lPlmFBYqzF0', name: 'Midnight Vibes', artist: 'Track 1' },
  { id: 'RGlIdPb7QTA', name: 'Electric Dreams', artist: 'Track 2' },
  { id: '6aouLxiL4Cw', name: 'Urban Flow', artist: 'Track 3' },
  { id: 'TQvXEza4fPc', name: 'Neon Lights', artist: 'Track 4' },
  { id: 'hPt1gUE1zAc', name: 'Sunset Drive', artist: 'Track 5' },
  { id: '5QdtKpZgtmU', name: 'Starlight', artist: 'Track 6' }
]
MusicModule._currentTrack = 0
MusicModule._isPlaying = false
MusicModule._progressTimer = null
export default MusicModule
