import { useEffect, useRef, useState } from "react";
import captionsData from "./data/captions.json";
import { type Caption, getActiveCaptionIndex } from "./lib/captions";
import "./styles.css";

const captions = captionsData satisfies Caption[];
const AUTO_SCROLL_RESUME_MS = 3000;
const VIDEO_SRC = "/How%20to%20Congratulate%20Someone%20in%20English.mp4";

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const captionPanelRef = useRef<HTMLDivElement>(null);
  const captionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [following, setFollowing] = useState(true);
  const [syncVersion, setSyncVersion] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);

  function updateActiveCaption(currentTime: number) {
    setActiveIndex(getActiveCaptionIndex(captions, currentTime));
  }

  function seekToCaption(caption: Caption) {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = caption.start;
    resumeFollowing();
    updateActiveCaption(caption.start);
    void video.play().catch(() => {
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
          <video
            ref={videoRef}
            className="lesson-video"
            src={VIDEO_SRC}
            poster="/lesson-background.png"
            controls
            playsInline
            preload="metadata"
            aria-label="English lesson video"
            onTimeUpdate={(event) =>
              updateActiveCaption(event.currentTarget.currentTime)
            }
            onLoadedMetadata={(event) => updateActiveCaption(event.currentTarget.currentTime)}
            onPlay={(event) => { updateActiveCaption(event.currentTarget.currentTime); resumeFollowing(); }}
            onSeeked={(event) => { updateActiveCaption(event.currentTarget.currentTime); resumeFollowing(); }}
          >
            Your browser does not support the video tag.
          </video>
          <div className="video-hint">
            <span>How to Congratulate Someone in English</span>
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
