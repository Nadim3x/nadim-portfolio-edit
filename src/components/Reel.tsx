import { useEffect, useRef, useState } from 'react';
import { useContent } from '@/lib/content-context';
import { CLIP_COUNT, type Lang } from '@/i18n';
import { PlayIcon, ExpandIcon, CloseIcon } from './icons';

type Props = {
  lang: Lang;
};

type ActiveClip = { index: number } | null;

export function Reel({ lang }: Props) {
  const { getValue, content } = useContent();
  const [failedCovers, setFailedCovers] = useState<Set<number>>(new Set());
  const [activeClip, setActiveClip] = useState<ActiveClip>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getCover = (clipNum: number): string => {
    const row = content[`settings.clip${clipNum}_cover`];
    return row ? (lang === 'bn' ? row.bn : row.en) : '';
  };

  const getVideo = (clipNum: number): string => {
    const row = content[`settings.clip${clipNum}_video`];
    return row ? row.en || row.bn : '';
  };

  const handleCoverError = (i: number) => {
    setFailedCovers((prev) => new Set(prev).add(i));
  };

  const openLightbox = (index: number) => {
    if (failedCovers.has(index) && !getVideo(index)) return;
    setActiveClip({ index });
  };

  const closeLightbox = () => setActiveClip(null);

  useEffect(() => {
    if (activeClip) {
      document.body.style.overflow = 'hidden';
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeClip]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const clipField = (i: number, field: 'title' | 'desc'): string => {
    return getValue(`reel.clip${i}.${field}`, lang).trim();
  };

  const activeIndex = activeClip?.index ?? null;
  const activeTitle = activeIndex ? clipField(activeIndex, 'title') : '';
  const activeDesc = activeIndex ? clipField(activeIndex, 'desc') : '';
  const activeVideo = activeIndex ? getVideo(activeIndex) : '';
  const isYouTube = activeVideo.includes('youtube.com') || activeVideo.includes('youtu.be');
  const isVimeo = activeVideo.includes('vimeo.com');

  return (
    <>
      <section className="reel" id="reel">
        <div className="reel-label mono">
          <span className="tc">00:00</span> — <span>{getValue('reel.tag', lang)}</span>
        </div>
        <div className="reel-grid-wrap">
          <div className="reel-grid">
            {Array.from({ length: CLIP_COUNT }, (_, idx) => {
              const i = idx + 1;
              const title = clipField(i, 'title');
              const desc = clipField(i, 'desc');
              const noVideo = failedCovers.has(i);
              const cover = getCover(i);
              return (
                <div
                  key={i}
                  className={`clip-card${noVideo ? ' no-video' : ''}`}
                  onClick={() => openLightbox(i)}
                >
                  <div className="clip-video-panel">
                    {cover && (
                      <img
                        className="clip-cover"
                        src={cover}
                        alt=""
                        onError={() => handleCoverError(i)}
                      />
                    )}
                    <div className="clip-placeholder">
                      <PlayIcon />
                      <span>{getValue('reel.addVideo', lang)}</span>
                    </div>
                  </div>
                  <div className="clip-info-panel">
                    <div
                      className={`clip-info-title${!title && !desc ? ' is-placeholder' : ''}`}
                    >
                      {!title && !desc ? getValue('reel.addInfo', lang) : title}
                    </div>
                    <div className="clip-info-desc">{desc}</div>
                  </div>
                  <div className="clip-expand">
                    <ExpandIcon />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <p className="reel-caption">{getValue('reel.caption', lang)}</p>
      </section>

      <div
        className={`lightbox${activeClip ? ' open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLightbox();
        }}
      >
        <div className="lightbox-inner">
          <button className="lightbox-close" aria-label="Close" onClick={closeLightbox}>
            <CloseIcon />
          </button>
          <div className="lightbox-frame">
            <div className="lightbox-header">
              <span className="rec-dot" style={{ width: 6, height: 6 }} />
              <span>{getValue('lightbox.playing', lang)}</span>
            </div>
            {activeVideo ? (
              isYouTube || isVimeo ? (
                <iframe
                  src={activeVideo}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title={activeTitle}
                />
              ) : (
                <video ref={videoRef} controls playsInline autoPlay>
                  <source src={activeVideo} type="video/mp4" />
                </video>
              )
            ) : (
              <video ref={videoRef} controls playsInline>
                {activeClip && (
                  <source src={`videos/clip-${activeClip.index}.mp4`} type="video/mp4" />
                )}
              </video>
            )}
          </div>
          <div className={`lightbox-info${!activeTitle && !activeDesc ? ' hidden' : ''}`}>
            <h3 className="lightbox-info-title">{activeTitle}</h3>
            <p className="lightbox-info-desc">{activeDesc}</p>
          </div>
        </div>
      </div>
    </>
  );
}
