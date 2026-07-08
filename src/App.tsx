import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Video, NotebookPen, Share2, Mail,
  QrCode, BadgeCheck, ChevronRight, X,
  Copy, Check, Sparkles, Zap, PenTool,
  ExternalLink
} from 'lucide-react';
import './index.css';

/* ============================================================
   类型定义
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

interface Project {
  id: string;
  title: string;
  desc: string;
  image: string;
  tags: string[];
  url: string;
  color: string;
}

/* ============================================================
   多语言文案
   ============================================================ */

const translations = {
  zh: {
    name: 'Evrett',
    title: '全栈开发者 · AI 探索者',
    bio: '热爱技术与设计，专注于创造优秀的数字体验。擅长 AI 应用开发、全栈工程和产品设计。',
    digitalCard: '数字名片',
    sharePage: '分享',
    linksTitle: '导航',
    projectsTitle: '精选项目',
    skillsTitle: '技能领域',
    socialTitle: '联系我',
    footer: '© {year} Evrett · All rights reserved',
    scanQR: '扫码访问',
    close: '关闭',
    copied: '已复制',
    copyLink: '复制链接',
    viewProject: '查看项目',
  },
  en: {
    name: 'Evrett',
    title: 'Full-stack Developer · AI Explorer',
    bio: 'Passionate about technology and design, focused on creating excellent digital experiences. Specializing in AI applications, full-stack engineering, and product design.',
    digitalCard: 'Digital Card',
    sharePage: 'Share',
    linksTitle: 'LINKS',
    projectsTitle: 'FEATURED PROJECTS',
    skillsTitle: 'SKILLS',
    socialTitle: 'CONNECT',
    footer: '© {year} Evrett · All rights reserved',
    scanQR: 'Scan to visit',
    close: 'Close',
    copied: 'Copied',
    copyLink: 'Copy Link',
    viewProject: 'View Project',
  }
};

type Lang = keyof typeof translations;

/* ============================================================
   静态数据
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
  {
    id: '6',
    title: 'gzh.allapple.top',
    desc: '公众号排版引擎',
    url: 'https://gzh.allapple.top',
    icon: React.createElement(PenTool),
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.3)',
  },
];

const projects: Project[] = [
  {
    id: '1',
    title: 'AIOS 智能工作台',
    desc: '集成多种 AI 模型的智能助手平台，支持多轮对话、代码生成、文档处理等功能。',
    image: '/projects/aios.png',
    tags: ['AI', 'React', 'Node.js'],
    url: 'https://aios.vios.top',
    color: '#a855f7',
  },
  {
    id: '2',
    title: '短视频流媒体',
    desc: '高性能视频流媒体平台，支持实时转码、智能推荐和多端播放。',
    image: '/projects/video.png',
    tags: ['视频', 'FFmpeg', 'Vue'],
    url: 'https://all.allapple.top',
    color: '#ec4899',
  },
  {
    id: '3',
    title: '公众号排版引擎',
    desc: 'AI 驱动的 Markdown 转微信公众号排版工具，多主题一键切换。',
    image: '/projects/gzh.png',
    tags: ['Markdown', 'AI', '设计'],
    url: 'https://gzh.allapple.top',
    color: '#06b6d4',
  },
];

const skills = [
  { name: 'React', color: '#61dafb' },
  { name: 'TypeScript', color: '#3178c6' },
  { name: 'Node.js', color: '#339933' },
  { name: 'Python', color: '#3776ab' },
  { name: 'AI/ML', color: '#ff6f61' },
  { name: 'PostgreSQL', color: '#336791' },
  { name: 'Docker', color: '#2496ed' },
  { name: 'UI Design', color: '#ff4081' },
  { name: 'Figma', color: '#f24e1e' },
  { name: 'Git', color: '#f05032' },
];

/* ============================================================
   粒子背景（仅桌面端通过 CSS 控制隐藏）
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
      aria-hidden="true"
    />
  );
};

/* ============================================================
   二维码弹窗
   ============================================================ */

const QRModal: React.FC<{ onClose: () => void; lang: Lang }> = ({ onClose, lang }) => {
  const t = translations[lang];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    import('qrcode').then((QRCode: any) => {
      if (canvasRef.current) {
        QRCode.toCanvas(canvasRef.current, 'https://linktr.vios.top', {
          width: 200,
          margin: 2,
          color: { dark: '#ffffff', light: '#00000000' },
        });
      }
    });
  }, []);

  // Esc 关闭弹窗
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-label={t.scanQR}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{ position: 'relative' }}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label={t.close}
        >
          <X size={16} />
        </button>
        <div className="modal-title" id="qr-modal-title">{t.scanQR}</div>
        <canvas ref={canvasRef} style={{ margin: '0 auto', display: 'block' }} aria-label={t.scanQR} />
      </motion.div>
    </motion.div>
  );
};

/* ============================================================
   主应用
   ============================================================ */

const App: React.FC = () => {
  const [lang, setLang] = useState<Lang>('zh');
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = translations[lang];

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('https://linktr.vios.top');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = 'https://linktr.vios.top';
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
          title: 'Evrett',
          text: t.bio,
          url: 'https://linktr.vios.top',
        });
      } catch {}
    } else {
      handleCopy();
    }
  }, [handleCopy, t.bio]);

  // 分享到 X（与 X 主页入口分开）
  const handleShareToX = useCallback(() => {
    const text = "Check out Evrett's portfolio! 🚀";
    const url = 'https://linktr.vios.top';
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(xUrl, '_blank', 'width=550,height=420');
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* 背景层 */}
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

      {/* 语言切换 */}
      <div className="lang-toggle" role="group" aria-label="Language">
        <button
          className={`lang-btn ${lang === 'zh' ? 'active' : ''}`}
          onClick={() => setLang('zh')}
          aria-label="切换到中文"
          aria-pressed={lang === 'zh'}
        >
          中
        </button>
        <button
          className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
          onClick={() => setLang('en')}
          aria-label="Switch to English"
          aria-pressed={lang === 'en'}
        >
          EN
        </button>
      </div>

      {/* 主内容 */}
      <div className="main-content">
        {/* 个人资料 */}
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
            <div className="verified-badge" aria-hidden="true">
              <BadgeCheck />
            </div>
          </div>

          <div className="profile-name shimmer-text">{t.name}</div>
          <div className="profile-title">{t.title}</div>
          <div className="profile-bio">{t.bio}</div>
        </motion.div>

        {/* 操作按钮 */}
        <motion.div
          className="actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <button className="action-btn" onClick={() => setShowQR(true)} aria-label={t.digitalCard}>
            <QrCode />
            {t.digitalCard}
          </button>
          <button className="action-btn" onClick={handleShare} aria-label={copied ? t.copied : t.sharePage}>
            {copied ? <Check /> : <Share2 />}
            {copied ? t.copied : t.sharePage}
          </button>
        </motion.div>

        {/* 技能领域 */}
        <motion.div
          className="skills-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="section-title">{t.skillsTitle}</div>
          <div className="skills-grid">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.name}
                className="skill-tag"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.1, y: -2 }}
                style={{ borderColor: `${skill.color}40` }}
              >
                <span className="skill-dot" style={{ background: skill.color }} />
                {skill.name}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 导航链接 */}
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

        {/* 精选项目 */}
        <motion.div
          className="projects-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="section-title">{t.projectsTitle}</div>
          <div className="projects-grid">
            {projects.map((project, i) => (
              <motion.a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.15, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="project-image">
                  <img src={project.image} alt={project.title} loading="lazy" />
                  <div className="project-overlay">
                    <ExternalLink size={20} />
                  </div>
                </div>
                <div className="project-info">
                  <div className="project-title">{project.title}</div>
                  <div className="project-desc">{project.desc}</div>
                  <div className="project-tags">
                    {project.tags.map((tag) => (
                      <span key={tag} className="project-tag" style={{ color: project.color }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* 社交链接 */}
        <motion.div
          className="social-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="section-title">{t.socialTitle}</div>
          <div className="social-grid">
            {/* GitHub 主页 */}
            <a
              href="https://github.com/xiaopengsvip"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              aria-label="GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            {/* X 主页入口 */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              aria-label="X (Twitter)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231h0.001Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
              </svg>
            </a>
            {/* 分享到 X（与主页入口分开） */}
            <button
              className="social-btn twitter-share"
              onClick={handleShareToX}
              aria-label="分享到 X"
            >
              <Share2 size={20} aria-hidden="true" />
            </button>
            {/* 邮箱 */}
            <a
              href="mailto:hi@allapple.top"
              className="social-btn"
              aria-label="Email"
            >
              <Mail size={20} aria-hidden="true" />
            </a>
            {/* 复制链接 */}
            <button
              className="social-btn"
              onClick={handleCopy}
              aria-label={t.copyLink}
            >
              {copied ? <Check size={20} aria-hidden="true" /> : <Copy size={20} aria-hidden="true" />}
            </button>
          </div>
        </motion.div>

        {/* 页脚 */}
        <div className="footer">
          <div className="footer-content">
            <span>{t.footer.replace('{year}', String(currentYear))}</span>
            <span className="footer-dot">·</span>
            <span>Powered by React</span>
          </div>
        </div>
      </div>

      {/* 二维码弹窗 */}
      <AnimatePresence>
        {showQR && <QRModal onClose={() => setShowQR(false)} lang={lang} />}
      </AnimatePresence>
    </>
  );
};

export default App;
