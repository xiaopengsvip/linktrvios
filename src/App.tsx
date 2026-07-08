import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Video, NotebookPen, Share2, Send, Mail,
  QrCode, BadgeCheck, ChevronRight, X,
  Copy, Check, Sparkles, Zap
} from 'lucide-react';
import './index.css';

/* ============================================================
   Types
   ============================================================ */

interface LinkItem {
  id: string;
  title: string;
  desc: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
}

/* ============================================================
   Translations
   ============================================================ */

const translations = {
  zh: {
    name: 'Evrett',
    bio: 'Apple风格聚合页 · 视频 · 音乐 · 灵感',
    digitalCard: '数字名片',
    sharePage: '分享本页',
    linksTitle: '导航',
    galleryTitle: '精选图集',
    socialTitle: '关注我们',
    footer: '© {year} allapple.top · Designed by 小鹏',
    scanQR: '扫码访问',
    close: '关闭',
    copied: '已复制',
    copyLink: '复制链接',
  },
  en: {
    name: 'Evrett',
    bio: 'Apple Style Hub · Video · Music · Inspiration',
    digitalCard: 'Digital Card',
    sharePage: 'Share',
    linksTitle: 'LINKS',
    galleryTitle: 'GALLERY',
    socialTitle: 'FOLLOW US',
    footer: '© {year} allapple.top · Designed by Xiaopeng',
    scanQR: 'Scan to visit',
    close: 'Close',
    copied: 'Copied',
    copyLink: 'Copy Link',
  }
};

type Lang = keyof typeof translations;

/* ============================================================
   Data
   ============================================================ */

const links: LinkItem[] = [
  {
    id: '1',
    title: 'allapple.top',
    desc: '官方主页 · 聚合中心',
    url: 'https://allapple.top',
    icon: React.createElement(Globe),
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.3)',
  },
  {
    id: '2',
    title: 'all.allapple.top',
    desc: '短视频流媒体平台',
    url: 'https://all.allapple.top',
    icon: React.createElement(Video),
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.3)',
  },
  {
    id: '3',
    title: 'notes.allapple.top',
    desc: '极简笔记与博客',
    url: 'https://notes.allapple.top',
    icon: React.createElement(NotebookPen),
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.3)',
  },
  {
    id: '4',
    title: 'aios.vios.top',
    desc: 'AI 工作台 · 智能助手',
    url: 'https://aios.vios.top',
    icon: React.createElement(Sparkles),
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.3)',
  },
  {
    id: '5',
    title: 'enxx.allapple.top',
    desc: '英语自学平台',
    url: 'https://enxx.allapple.top',
    icon: React.createElement(Zap),
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.3)',
  },
];

const galleryImages = [
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=600&auto=format&fit=crop',
];

/* ============================================================
   Particles Background
   ============================================================ */

const Particles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    radius: number; opacity: number; color: string;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#00f5ff', '#a855f7', '#ec4899', '#3b82f6'];

    const count = Math.min(60, Math.floor(window.innerWidth / 25));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse);

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      particles.forEach((p, i) => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150 * 0.5;
          p.vx += (dx / dist) * force * 0.1;
          p.vy += (dy / dist) * force * 0.1;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.vy *= 0.99;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - d / 120) * 0.15;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, zIndex: 1 }}
    />
  );
};

/* ============================================================
   QR Code Modal
   ============================================================ */

const QRModal: React.FC<{ onClose: () => void; lang: Lang }> = ({ onClose, lang }) => {
  const t = translations[lang];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    import('qrcode').then((QRCode: any) => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, 'https://linktr.allapple.top', {
          width: 200,
          margin: 2,
          color: { dark: '#ffffff', light: '#00000000' },
        });
      }
    });
  }, []);

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <button className="modal-close" onClick={onClose}>
          <X size={16} />
        </button>
        <div className="modal-title">{t.scanQR}</div>
        <canvas ref={canvasRef} style={{ margin: '0 auto', display: 'block' }} />
      </motion.div>
    </motion.div>
  );
};

/* ============================================================
   Main App
   ============================================================ */

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>('zh');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = translations[lang];

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('https://linktr.allapple.top');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = 'https://linktr.allapple.top';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'allapple.top',
          text: t.bio,
          url: 'https://linktr.allapple.top',
        });
      } catch {}
    } else {
      handleCopy();
    }
  }, [handleCopy, t.bio]);

  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* Background */}
      <div className="bg-canvas">
        <div className="mesh-gradient" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="stars" />
        <div className="grid-overlay" />
        <Particles />
        <div className="noise" />
      </div>

      {/* Language Toggle */}
      <div className="lang-toggle">
        <button
          className={`lang-btn ${lang === 'zh' ? 'active' : ''}`}
          onClick={() => setLang('zh')}
        >
          中
        </button>
        <button
          className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
          onClick={() => setLang('en')}
        >
          EN
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Profile */}
        <motion.div
          className="profile"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="avatar-wrapper">
            <div className="avatar-ring">
              <img
                className="avatar"
                src="/avatar.jpg"
                alt="Profile"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%230a0a1a" width="200" height="200"/><circle fill="%232a2a4a" cx="100" cy="80" r="35"/><ellipse fill="%232a2a4a" cx="100" cy="160" rx="50" ry="35"/></svg>'
                  );
                }}
              />
            </div>
            <div className="verified-badge">
              <BadgeCheck />
            </div>
          </div>

          <div className="profile-name shimmer-text">{t.name}</div>
          <div className="profile-bio">{t.bio}</div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <button className="action-btn" onClick={() => setShowQR(true)}>
            <QrCode />
            {t.digitalCard}
          </button>
          <button className="action-btn" onClick={handleShare}>
            {copied ? <Check /> : <Share2 />}
            {copied ? t.copied : t.sharePage}
          </button>
        </motion.div>

        {/* Links Section */}
        <div className="section-title">{t.linksTitle}</div>
        <div className="links-section">
          {links.map((link, i) => (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1 + i * 0.08,
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              style={{
                '--glow-color': link.glowColor,
                animationDelay: `${i * 0.1}s`,
              } as React.CSSProperties}
            >
              <div
                className="link-icon"
                style={{
                  background: `${link.color}15`,
                  color: link.color,
                }}
              >
                {link.icon}
              </div>
              <div className="link-info">
                <div className="link-title">{link.title}</div>
                <div className="link-desc">{link.desc}</div>
              </div>
              <div className="link-arrow">
                <ChevronRight size={18} />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Gallery Section */}
        <motion.div
          className="gallery-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="section-title">{t.galleryTitle}</div>
          <div className="gallery-scroll">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                className="gallery-item"
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                <img src={img} alt={`Gallery ${i + 1}`} loading="lazy" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Section */}
        <motion.div
          className="social-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
            title="X (Twitter)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231h0.001Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
            </svg>
          </a>
          <a href="mailto:hi@allapple.top" className="social-btn" title="Email">
            <Mail size={20} />
          </a>
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="social-btn"
            title="Telegram"
          >
            <Send size={20} />
          </a>
          <button className="social-btn" onClick={handleCopy} title={t.copyLink}>
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </motion.div>

        {/* Footer */}
        <div className="footer">
          {t.footer.replace('{year}', String(currentYear))}
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <QRModal onClose={() => setShowQR(false)} lang={lang} />
        )}
      </AnimatePresence>
    </>
  );
};

export default App;
