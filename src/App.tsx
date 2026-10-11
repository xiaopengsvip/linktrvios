import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon, Wordmark } from './components/Icons';
import { Reveal } from './components/Reveal';
import {
  CONNECT, COPY, LINKS, PROFILE, PROJECTS, SITE, STACK,
  type IconName, type Lang,
} from './data/content';

/* ------------------------------------------------------------
   工具
   ------------------------------------------------------------ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** 卡片内鼠标跟随光斑（桌面指针才启用） */
function spotlightHandlers() {
  return {
    onMouseMove: (e: React.MouseEvent<HTMLElement>) => {
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
      e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
    },
  };
}

/* ------------------------------------------------------------
   背景层
   ------------------------------------------------------------ */

function Backdrop() {
  return (
    <div className="bg" aria-hidden="true">
      <div className="bg__aura bg__aura--1" />
      <div className="bg__aura bg__aura--2" />
      <div className="bg__aura bg__aura--3" />
      <div className="bg__grid" />
      <div className="bg__noise" />
    </div>
  );
}

/* ------------------------------------------------------------
   区块标题
   ------------------------------------------------------------ */

function SectionHead({ idx, title, note }: { idx: string; title: string; note?: string }) {
  return (
    <div className="sechead">
      <div className="sechead__l">
        <span className="sechead__idx">{idx}</span>
        <h2 className="sechead__t">{title}</h2>
      </div>
      {note ? <span className="sechead__n">{note}</span> : null}
    </div>
  );
}

/* ------------------------------------------------------------
   App
   ------------------------------------------------------------ */

export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'en' || q === 'zh') return q;
    return navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  });
  const [toast, setToast] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrSrc, setQrSrc] = useState<string>('');
  const reduced = usePrefersReducedMotion();
  const toastTimer = useRef<number | undefined>(undefined);

  const t = COPY[lang];

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2000);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    const url = new URL(window.location.href);
    if (lang === 'en') url.searchParams.set('lang', 'en');
    else url.searchParams.delete('lang');
    window.history.replaceState({}, '', url.toString());
  }, [lang]);

  /* 分享 */
  const onShare = useCallback(async () => {
    const data = { title: t.shareTitle, text: t.bio, url: SITE.url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(SITE.url);
      flash(lang === 'zh' ? '链接已复制' : 'Link copied');
    } catch { /* 用户取消，忽略 */ }
  }, [t, lang, flash]);

  /* 复制邮箱 */
  const onCopyMail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      flash(t.copied);
    } catch {
      window.location.href = `mailto:${SITE.email}`;
    }
  }, [t, flash]);

  /* 二维码按需生成（首开才加载 qrcode，避免拖慢首屏） */
  useEffect(() => {
    if (!qrOpen || qrSrc) return;
    let alive = true;
    import('qrcode')
      .then((m) => m.toDataURL(SITE.url, {
        margin: 1, width: 480,
        color: { dark: '#050507', light: '#ffffff' },
      }))
      .then((d) => { if (alive) setQrSrc(d); })
      .catch(() => { if (alive) setQrSrc(''); });
    return () => { alive = false; };
  }, [qrOpen, qrSrc]);

  useEffect(() => {
    if (!qrOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setQrOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [qrOpen]);

  const statList = useMemo(
    () => [
      { n: String(LINKS.length), l: t.statProjects },
      { n: '6+', l: t.statYears },
      { n: '24/7', l: t.statUptime },
    ],
    [t],
  );

  return (
    <>
      <Backdrop />

      <div className="shell">
        {/* ---------------- 顶栏 ---------------- */}
        <header className="topbar">
          <div className="wrap topbar__inner">
            <a className="brand" href={SITE.url}>
              <span className="brand__mark"><Wordmark size={17} /></span>
              <span className="brand__text">
                <span className="brand__name">{SITE.domain}</span>
                <span className="brand__sub">Digital HQ</span>
              </span>
            </a>

            <div className="topbar__right">
              <div className="seg" role="group" aria-label="Language">
                <button className="seg__btn" data-on={lang === 'zh'} onClick={() => setLang('zh')}>中</button>
                <button className="seg__btn" data-on={lang === 'en'} onClick={() => setLang('en')}>EN</button>
              </div>
              <button className="iconbtn" onClick={onShare} aria-label={lang === 'zh' ? '分享' : 'Share'}>
                <Icon name="share" size={17} />
              </button>
              <button className="iconbtn" onClick={() => setQrOpen(true)} aria-label={t.ctaQr}>
                <Icon name="qr" size={17} />
              </button>
            </div>
          </div>
        </header>

        <main className="wrap">
          {/* ---------------- Hero ---------------- */}
          <section className="hero">
            <div className="hero__grid">
              <Reveal className="avatar">
                <span className="avatar__ring" aria-hidden="true" />
                <picture>
                  <source srcSet={PROFILE.avatar} type="image/webp" />
                  <img className="avatar__img" src={PROFILE.avatarFallback} alt={PROFILE.name}
                       width={150} height={150} fetchPriority="high" decoding="async" />
                </picture>
                <span className="avatar__badge" aria-hidden="true"><Icon name="shield" size={15} /></span>
              </Reveal>

              <div style={{ width: '100%' }}>
                <Reveal delay={60}>
                  <span className="status">
                    <span className="status__dot" />
                    {t.status}
                  </span>
                </Reveal>

                <Reveal delay={110}>
                  <h1 className="hero__name">
                    {t.nameLine1} <em>{t.nameAccent}</em>
                    <br />
                    {t.nameLine2}
                  </h1>
                </Reveal>

                <Reveal delay={160}>
                  <p className="hero__role">{PROFILE.name} — {t.role}</p>
                </Reveal>

                <Reveal delay={200}>
                  <p className="hero__bio">{t.bio}</p>
                </Reveal>

                <Reveal delay={240}>
                  <div className="hero__actions">
                    <button className="btn btn--primary" onClick={onCopyMail}>
                      <span className="btn__icon"><Icon name="mail" size={16} /></span>
                      {t.ctaMail}
                      <span className="btn__icon" style={{ opacity: 0.6 }}><Icon name="copy" size={14} /></span>
                    </button>
                    <button className="btn btn--ghost" onClick={() => setQrOpen(true)}>
                      <span className="btn__icon"><Icon name="qr" size={16} /></span>
                      {t.ctaQr}
                    </button>
                  </div>
                </Reveal>

                <Reveal delay={290}>
                  <div className="stats">
                    {statList.map((s) => (
                      <div className="stat" key={s.l}>
                        <div className="stat__n">{s.n}</div>
                        <div className="stat__l">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ---------------- 导航 ---------------- */}
          <section className="section" id="links">
            <Reveal>
              <SectionHead idx="01" title={t.navLinks} note={t.navLinksHint} />
            </Reveal>
            <div className="links">
              {LINKS.map((l, i) => (
                <Reveal key={l.id} delay={Math.min(i * 45, 360)}>
                  <a
                    className="lcard"
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ['--tint' as string]: l.tint }}
                    {...spotlightHandlers()}
                  >
                    <span className="lcard__ico"><Icon name={l.icon} size={21} /></span>
                    <span className="lcard__body">
                      <span className="lcard__t">{l.title}</span>
                      <span className="lcard__d">{l.desc}</span>
                    </span>
                    <span className="lcard__go" aria-hidden="true"><Icon name="arrowUpRight" size={16} /></span>
                  </a>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ---------------- 精选项目 ---------------- */}
          <section className="section" id="work">
            <Reveal>
              <SectionHead idx="02" title={t.navProjects} note={t.navProjectsHint} />
            </Reveal>
            <div className="projects">
              {PROJECTS.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i * 70, 280)}>
                  <a
                    className="pcard"
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ['--tint' as string]: p.tint }}
                  >
                    <span className="pcard__media">
                      <img src={p.image} alt={p.title} loading="lazy" decoding="async" width={1200} height={750} />
                      <span className="pcard__tag">{p.tag}</span>
                    </span>
                    <span className="pcard__body">
                      <span className="pcard__t">
                        {p.title}
                        <Icon name="arrowUpRight" size={15} />
                      </span>
                      <span className="pcard__d">{p.desc}</span>
                      <span className="chips">
                        {p.chips.map((c) => <span className="chip" key={c}>{c}</span>)}
                      </span>
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ---------------- 技术栈 ---------------- */}
          <section className="section" id="stack">
            <Reveal>
              <SectionHead idx="03" title={t.navStack} />
            </Reveal>
            <div className="stack">
              {STACK.map((g, i) => (
                <Reveal key={g.label} delay={i * 70}>
                  <div className="stackcol" style={{ ['--tint' as string]: g.tint }}>
                    <div className="stackcol__h">
                      <span className="stackcol__dot" />
                      {g.label}
                    </div>
                    <div className="stacklist">
                      {g.items.map((it) => <span className="stackitem" key={it}>{it}</span>)}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ---------------- 联系 ---------------- */}
          <section className="section" id="connect">
            <Reveal>
              <SectionHead idx="04" title={t.navConnect} note={SITE.domain} />
            </Reveal>
            <div className="connect">
              {CONNECT.map((c, i) => (
                <Reveal key={c.id} delay={i * 55}>
                  <a
                    className="ccard"
                    href={c.href}
                    {...(c.id === 'mail' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    <span className="ccard__ico"><Icon name={c.icon as IconName} size={18} /></span>
                    <span>
                      <span className="ccard__l">{c.label}</span>
                      <span className="ccard__v">{c.value}</span>
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>
          </section>
        </main>

        {/* ---------------- 页脚 ---------------- */}
        <footer className="footer">
          <div className="wrap footer__inner">
            <div className="footer__mono">© {SITE.year} {SITE.domain} · {t.footerNote}</div>
            <div className="footer__links footer__mono">
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href={PROFILE.x} target="_blank" rel="noopener noreferrer">X</a>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </div>
          </div>
        </footer>
      </div>

      {/* ---------------- Toast ---------------- */}
      {toast ? (
        <div className="toast" role="status">
          <span className="toast__dot"><Icon name="check" size={15} /></span>
          {toast}
        </div>
      ) : null}

      {/* ---------------- 二维码弹窗 ---------------- */}
      {qrOpen ? (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setQrOpen(false)}>
          <div className="modal__box" onClick={(e) => e.stopPropagation()}>
            {qrSrc
              ? <img className="modal__qr" src={qrSrc} alt="i00.si QR" width={480} height={480} />
              : <div className="modal__qr" style={{ aspectRatio: '1 / 1', display: 'grid', placeItems: 'center', color: '#111' }}>…</div>}
            <div className="modal__t">{SITE.host}</div>
            <div className="modal__d">{t.qrHint}</div>
            <button className="btn btn--ghost modal__close" onClick={() => setQrOpen(false)}>
              <span className="btn__icon"><Icon name="close" size={15} /></span>
              {t.close}
            </button>
          </div>
        </div>
      ) : null}

      {/* 供 reduced-motion 场景下禁止动效 */}
      <span hidden aria-hidden="true" data-reduced={reduced} />
    </>
  );
}
