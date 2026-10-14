import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import captionsData from "./data/captions.json";
import { type Caption, getActiveCaptionIndex } from "./lib/captions";
import "./styles.css";

const captions = captionsData satisfies Caption[];
const AUTO_SCROLL_RESUME_MS = 3000;
const AUDIO_SRC = "/congratulations-audio.mp4";
const PLAYBACK_RATES = [1, 1.25, 1.5, 2];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const captionPanelRef = useRef<HTMLDivElement>(null);
  const captionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [following, setFollowing] = useState(true);
  const [syncVersion, setSyncVersion] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }

  function seekAudio(event: ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    const nextTime = Number(event.currentTarget.value);
    if (!audio) return;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
    updateActiveCaption(nextTime);
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  }

  function cyclePlaybackRate() {
    const audio = audioRef.current;
    if (!audio) return;
    const currentRateIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextRate = PLAYBACK_RATES[(currentRateIndex + 1) % PLAYBACK_RATES.length];
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  }

  function updateActiveCaption(currentTime: number) {
    setActiveIndex(getActiveCaptionIndex(captions, currentTime));
  }

  function seekToCaption(caption: Caption) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = caption.start;
    resumeFollowing();
    updateActiveCaption(caption.start);
    void audio.play().catch(() => {
      // Browsers can block programmatic playback until the user presses play.
    });
  }

  function pauseAutoScrollBriefly() {
    setFollowing(false);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(resumeFollowing, AUTO_SCROLL_RESUME_MS);
  }

  function resumeFollowing() {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    setFollowing(true);
    setSyncVersion((value) => value + 1);
  }

  useEffect(() => () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const syncDuration = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    audio.addEventListener("loadedmetadata", syncDuration);
    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) syncDuration();
    return () => audio.removeEventListener("loadedmetadata", syncDuration);
  }, []);

  useEffect(() => {
    if (activeIndex < 0 || !following) {
      return;
    }

    const captionPanel = captionPanelRef.current;
    const activeCaption = captionRefs.current[activeIndex];

    if (!captionPanel || !activeCaption) {
      return;
    }

    const panelBounds = captionPanel.getBoundingClientRect();
    const captionBounds = activeCaption.getBoundingClientRect();
    captionPanel.scrollTo({
      top: Math.max(0, captionPanel.scrollTop + captionBounds.top - panelBounds.top -
        captionPanel.clientHeight / 2 + captionBounds.height / 2),
      behavior: "smooth"
    });
  }, [activeIndex, following, syncVersion]);

  return (
    <main className="app-shell">
      <section className="phone-frame" aria-label="English teaching player">
        <div className="video-panel">
          <audio
            ref={audioRef}
            className="lesson-audio-source"
            src={AUDIO_SRC}
            preload="metadata"
            aria-hidden="true"
            data-testid="lesson-audio"
            tabIndex={-1}
            onTimeUpdate={(event) => {
              const time = event.currentTarget.currentTime;
              setCurrentTime(time);
              updateActiveCaption(time);
            }}
            onLoadedMetadata={(event) => {
              setDuration(event.currentTarget.duration);
              updateActiveCaption(event.currentTarget.currentTime);
            }}
            onDurationChange={(event) => setDuration(event.currentTarget.duration)}
            onPlay={(event) => { setIsPlaying(true); updateActiveCaption(event.currentTarget.currentTime); resumeFollowing(); }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onSeeked={(event) => { updateActiveCaption(event.currentTarget.currentTime); resumeFollowing(); }}
          >
            Your browser does not support audio playback.
          </audio>
          <div className="audio-player-controls" role="group" aria-label="English lesson audio controls">
            <span className="audio-static-time-cover" aria-hidden="true"/>
            <div className="audio-player-pill">
              <button className="audio-play-button" type="button" onClick={togglePlayback} aria-label={isPlaying ? "暂停音频" : "播放音频"}>
                {isPlaying ? <Pause size={17} fill="currentColor"/> : <Play size={17} fill="currentColor"/>}
              </button>
              <span className="audio-time" aria-live="off">{formatTime(currentTime)} / {formatTime(duration)}</span>
              <input
                className="audio-seek"
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={seekAudio}
                aria-label="音频进度"
                aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
                style={{ "--audio-progress": `${duration ? (currentTime / duration) * 100 : 0}%` } as CSSProperties}
                disabled={!duration}
              />
              <button className="audio-volume-button" type="button" onClick={toggleMute} aria-label={isMuted ? "取消静音" : "静音"}>
                {isMuted ? <VolumeX size={17}/> : <Volume2 size={17}/>}
              </button>
              <button className="audio-rate-button" type="button" onClick={cyclePlaybackRate} aria-label={`播放速度 ${playbackRate} 倍`} title="切换播放速度">{playbackRate}×</button>
            </div>
          </div>
        </div>

        <div className="transcript-toolbar">
          <span>英文字幕</span>
          <button type="button" onClick={resumeFollowing} className={following ? "following" : ""}>
            {following ? "自动跟随" : "回到当前句"}
          </button>
        </div>
        <div
          ref={captionPanelRef}
          className="caption-panel"
          onWheel={pauseAutoScrollBriefly}
          onTouchStart={pauseAutoScrollBriefly}
          onKeyDown={pauseAutoScrollBriefly}
        >
          {captions.map((caption, index) => (
            <button
              key={`${caption.start}-${caption.en}`}
              ref={(element) => {
                captionRefs.current[index] = element;
              }}
              type="button"
              className={`caption-row ${index === activeIndex ? "active" : ""}`}
              onClick={() => seekToCaption(caption)}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              <span className="caption-en">{caption.en}</span>
              {caption.zh ? <span className="caption-zh">{caption.zh}</span> : null}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
