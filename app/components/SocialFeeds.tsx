'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    twttr?: { widgets?: { load: (element?: HTMLElement) => void } };
    instgrm?: { Embeds?: { process: () => void } };
  }
}

function SocialIcon({ platform }: { platform: 'facebook' | 'instagram' | 'x' }) {
  if (platform === 'facebook') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5H17V3.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.1H7.8V13h2.7v8h3.7Z" /></svg>;
  }

  if (platform === 'instagram') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.7" r="1" className="social-dot" /></svg>;
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4l6.2 8.3L4.5 20h2.4l4.4-5.9 4.4 5.9H20l-6.5-8.7L18.8 4h-2.4l-4 5.4L8.4 4H4Zm4 1.8h.8l7.1 9.5h-.8L8 5.8Z" /></svg>;
}

function loadScript(id: string, src: string, onReady: () => void) {
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) {
    onReady();
    return;
  }

  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  script.onload = onReady;
  document.body.appendChild(script);
}

export default function SocialFeeds({ priorityOnly = false, facebookUrl = 'https://www.facebook.com/p/StMochtas-GFC-100033954378543/', instagramUrl = 'https://www.instagram.com/st.mochtas/', xUrl = 'https://x.com/StMochtas1934' }: { priorityOnly?: boolean; facebookUrl?: string; instagramUrl?: string; xUrl?: string }) {
  const facebookPanel = useRef<HTMLDivElement>(null);
  const xPanel = useRef<HTMLDivElement>(null);
  const [facebookWidth, setFacebookWidth] = useState(500);

  useEffect(() => {
    if (!priorityOnly) {
      loadScript('x-widgets-script', 'https://platform.twitter.com/widgets.js', () => {
        if (xPanel.current) window.twttr?.widgets?.load(xPanel.current);
      });
    }

    loadScript('instagram-embed-script', 'https://www.instagram.com/embed.js', () => {
      window.instgrm?.Embeds?.process();
    });

    const panel = facebookPanel.current;
    if (!panel) return;

    const updateFacebookWidth = () => setFacebookWidth(Math.max(280, Math.min(500, Math.floor(panel.clientWidth))));
    updateFacebookWidth();
    const observer = new ResizeObserver(updateFacebookWidth);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [priorityOnly]);

  const facebookEmbed = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(facebookUrl)}&tabs=timeline&width=${facebookWidth}&height=610&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`;
  const accountName = (value: string) => { try { return `@${new URL(value).pathname.split('/').filter(Boolean).pop() ?? 'St. Mochtas'}`; } catch { return 'St. Mochtas GFC'; } };
  const instagramName = accountName(instagramUrl);
  const xName = accountName(xUrl);

  return (
    <section className="social-section" id="social" aria-labelledby="social-heading">
      <div className="shell">
        <div className="social-heading">
          <div>
            <p className="eyebrow">{priorityOnly ? 'Club notices & updates' : 'Latest from the club'}</p>
            <h2 id="social-heading">{priorityOnly ? 'From the club first.' : 'Follow St. Mochtas.'}</h2>
          </div>
          <p>{priorityOnly ? 'Facebook and Instagram are the first place to check for club notices, event updates and match-day photographs.' : 'Team news, match-day photographs and club updates from our official social channels.'}</p>
        </div>

        <div className={`social-feed-grid${priorityOnly ? ' priority-social-grid' : ''}`}>
          <article className="social-feed-card facebook-feed">
            <header><span className="social-brand-icon"><SocialIcon platform="facebook" /></span><div><small>Latest club posts</small><h3>Facebook</h3></div><a href={facebookUrl} aria-label="Open St. Mochtas GFC on Facebook">Open <b>↗</b></a></header>
            <div className="social-embed-frame facebook-frame" ref={facebookPanel}>
              <iframe
                src={facebookEmbed}
                title="Latest posts from St. Mochtas GFC on Facebook"
                width={facebookWidth}
                height="610"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            </div>
          </article>

          <article className="social-feed-card instagram-feed">
            <header><span className="social-brand-icon"><SocialIcon platform="instagram" /></span><div><small>Latest six posts</small><h3>Instagram</h3></div><a href={instagramUrl} aria-label="Open St. Mochtas GFC on Instagram">Open <b>↗</b></a></header>
            <div className="social-embed-frame instagram-frame">
              <blockquote
                className="instagram-media"
                data-instgrm-permalink={`${instagramUrl}?utm_source=ig_embed&utm_campaign=loading`}
                data-instgrm-version="14"
              >
                <a href={instagramUrl}>View the latest from {instagramName} on Instagram</a>
              </blockquote>
            </div>
            <a className="instagram-more" href={instagramUrl}>View the full Instagram profile <span>→</span></a>
          </article>

          {!priorityOnly && <article className="social-feed-card x-feed">
            <header><span className="social-brand-icon"><SocialIcon platform="x" /></span><div><small>Latest club posts</small><h3>X</h3></div><a href={xUrl} aria-label="Open St. Mochtas GFC on X">Open <b>↗</b></a></header>
            <div className="social-embed-frame" ref={xPanel}>
              <a
                className="twitter-timeline"
                data-height="610"
                data-chrome="nofooter transparent"
                data-dnt="true"
                href={xUrl}
              >
                Latest posts from {xName}
              </a>
            </div>
          </article>}
        </div>

        <p className="social-note">Posts are supplied by the social platforms. If a feed is unavailable, use the Open link to visit the club account directly.</p>
      </div>
    </section>
  );
}
