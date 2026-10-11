import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './components/Icons';
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
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);
  const shareTimer = useRef<number | undefined>(undefined);

  /* 环境识别：微信内置浏览器 / 移动端 */
  const env = useMemo(() => {
    const ua = navigator.userAgent || '';
    return {
      wechat: /MicroMessenger/i.test(ua),
      qq: /\sQQ\//i.test(ua) || /QQBrowser/i.test(ua),
      mobile: /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || window.innerWidth < 720,
    };
  }, []);
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

  /* 分享文案：纯文本版，粘到任何平台都能带出完整信息 */
  const shareText = useMemo(
    () =>
      [
        `${t.shareTitle}`,
        t.shareDesc,
        lang === 'zh' ? '多智能体编排 · 自动化流程 · 私有化部署' : 'Multi-agent orchestration · Automation · Private deployment',
        SITE.url,
      ].join('\n'),
    [t, lang],
  );

  /* 原生分享（移动端 / 支持的浏览器） */
  const onShare = useCallback(async () => {
    const data = { title: t.shareTitle, text: t.shareDesc, url: SITE.url };
    if (env.wechat) {
      // 微信内不支持 Web Share / 自定义分享，给出明确手势引导
      flash(t.shareWechatTip);
      return;
    }
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
    } catch {
      return; // 用户取消，静默
    }
    setShareOpen(true);
  }, [t, env, flash]);

  /* 复制分享文案 */
  const onCopyShareText = useCallback(async () => {
    let ok = true;
    try {
      await navigator.clipboard.writeText(shareText);
    } catch {
      ok = false;
    }
    setShareCopied(ok);
    window.clearTimeout(shareTimer.current);
    shareTimer.current = window.setTimeout(() => setShareCopied(false), 2000);
    flash(ok ? t.shareCopiedText : SITE.url);
  }, [shareText, t, flash]);

  /* 分享到 X（intent 已带 url，X 会自动抓取卡片） */
  const shareToX = useCallback(() => {
    const u = `https://x.com/intent/post?text=${encodeURIComponent(t.shareTitle)}&url=${encodeURIComponent(SITE.url)}`;
    window.open(u, '_blank', 'noopener,noreferrer');
  }, [t]);

  /* 复制邮箱 */
  const onCopyMail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      flash(t.copied);
    } catch {
      window.location.href = `mailto:${SITE.email}`;
    }
  }, [t, flash]);

  /* 复制站点链接：按钮给出明确成功态 */
  const onCopyLink = useCallback(async () => {
    let ok = true;
    try {
      await navigator.clipboard.writeText(SITE.url);
    } catch {
      ok = false;
    }
    setCopied(ok);
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(false), 1800);
    flash(ok ? t.copiedLink : SITE.url);
  }, [t, flash]);

  /* 二维码按需生成（首开才加载 qrcode，避免拖慢首屏）
     容错级别 H：中央叠品牌徽标后依然可扫 */
  useEffect(() => {
    if (!qrOpen || qrSrc) return;
    let alive = true;
    import('qrcode')
      .then((m) => m.toDataURL(SITE.url, {
        margin: 1, width: 480, errorCorrectionLevel: 'H',
        color: { dark: '#050507', light: '#ffffff' },
      }))
      .then((d) => { if (alive) setQrSrc(d); })
      .catch(() => { if (alive) setQrSrc(''); });
    return () => { alive = false; };
  }, [qrOpen, qrSrc]);

  useEffect(() => {
    const anyOpen = qrOpen || shareOpen;
    if (!anyOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (shareOpen) setShareOpen(false); else setQrOpen(false);
    };
    setCopied(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [qrOpen, shareOpen]);

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
              <span className="brand__mark">
                <img src="/logo-64.png" srcSet="/logo-64.png 1x, /logo-128.png 2x"
                     width={30} height={30} alt="" decoding="async" />
              </span>
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

      {/* ---------------- 扫码浮窗（桌面居中卡片 / 移动端底部抽屉） ---------------- */}
      {qrOpen ? (
        <div className="sheet" role="dialog" aria-modal="true" aria-label={t.qrTitle}
             onClick={() => setQrOpen(false)}>
          <div className="sheet__panel" onClick={(e) => e.stopPropagation()}>
            <span className="sheet__grip" aria-hidden="true" />
            <button className="sheet__x" onClick={() => setQrOpen(false)} aria-label={t.close}>
              <Icon name="close" size={16} />
            </button>

            <div className="sheet__head">
              <span className="sheet__mark">
                <img src="/logo-64.png" srcSet="/logo-64.png 1x, /logo-128.png 2x"
                     width={34} height={34} alt="" decoding="async" />
              </span>
              <span>
                <span className="sheet__host">{SITE.host}</span>
                <span className="sheet__sub">{SITE.domain} · Digital HQ</span>
              </span>
            </div>

            <h2 className="sheet__t">{t.qrTitle}</h2>
            <p className="sheet__d">{t.qrHint}</p>

            <div className="qrwrap">
              {qrSrc
                ? <img className="qrwrap__img" src={qrSrc} alt={`${SITE.host} QR`} width={480} height={480} />
                : <div className="qrwrap__skel" />}
              <span className="qrwrap__brand">
                <img src="/logo-64.png" width={36} height={36} alt="" decoding="async" />
              </span>
            </div>

            <div className="sheet__url">
              <Icon name="globe" size={14} />
              <code>{SITE.url.replace(/^https:\/\//, '').replace(/\/$/, '')}</code>
            </div>

            <div className="sheet__acts">
              <button className="btn btn--primary" onClick={onCopyLink} data-done={copied}>
                <span className="btn__icon">
                  <Icon name={copied ? 'check' : 'copy'} size={15} />
                </span>
                {copied ? t.copiedLink : t.copyLink}
              </button>
              <button className="btn btn--ghost" onClick={() => setShareOpen(true)}>
                <span className="btn__icon"><Icon name="share" size={15} /></span>
                {t.share}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ---------------- 分享浮窗：链接预览卡 + 分享文案 + 各平台入口 ---------------- */}
      {shareOpen ? (
        <div className="sheet sheet--share" role="dialog" aria-modal="true" aria-label={t.shareHeading}
             onClick={() => setShareOpen(false)}>
          <div className="sheet__panel" onClick={(e) => e.stopPropagation()}>
            <span className="sheet__grip" aria-hidden="true" />
            <button className="sheet__x" onClick={() => setShareOpen(false)} aria-label={t.close}>
              <Icon name="close" size={16} />
            </button>

            <div className="sheet__head">
              <span className="sheet__mark">
                <img src="/logo-64.png" srcSet="/logo-64.png 1x, /logo-128.png 2x"
                     width={34} height={34} alt="" decoding="async" />
              </span>
              <span>
                <span className="sheet__host">{t.shareHeading}</span>
                <span className="sheet__sub">{t.sharePreviewLabel}</span>
              </span>
            </div>

            {/* 链接预览卡：真实复刻 X / 微信 抓取到的封面 + 标题 + 简介 */}
            <div className="lprev">
              <img className="lprev__cover" src="/og-image.png" width={1200} height={630}
                   alt={t.shareTitle} decoding="async" />
              <div className="lprev__body">
                <span className="lprev__dom">
                  <img src="/favicon-32.png" width={15} height={15} alt="" decoding="async" />
                  {SITE.host}
                </span>
                <span className="lprev__t">{t.shareTitle}</span>
                <span className="lprev__d">{t.shareDesc}</span>
              </div>
            </div>

            {/* 分享文案预览（可复制） */}
            <pre className="sheet__text">{shareText}</pre>

            <div className="sheet__acts sheet__acts--3">
              <button className="btn btn--primary" onClick={onCopyShareText} data-done={shareCopied}>
                <span className="btn__icon">
                  <Icon name={shareCopied ? 'check' : 'copy'} size={15} />
                </span>
                {shareCopied ? t.shareCopiedText : t.shareCopyText}
              </button>
              <button className="btn btn--ghost" onClick={shareToX}>
                <span className="btn__icon"><Icon name="x" size={14} /></span>
                {t.shareToX}
              </button>
              <button className="btn btn--ghost" onClick={onShare}>
                <span className="btn__icon"><Icon name="wechat" size={15} /></span>
                {t.shareWechat}
              </button>
            </div>

            <p className="sheet__note">
              {env.wechat || env.qq ? t.shareWechatTip : t.shareNote}
            </p>
          </div>
        </div>
      ) : null}

      {/* 供 reduced-motion 场景下禁止动效 */}
      <span hidden aria-hidden="true" data-reduced={reduced} />
    </>
  );
}
