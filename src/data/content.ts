/* ============================================================
   i00.si — 内容数据（唯一数据源，改文案只动这里）
   ============================================================ */

export type IconName =
  | 'globe' | 'gauge' | 'sparkles' | 'bot' | 'zap' | 'network' | 'notebook' | 'book'
  | 'arrowUpRight' | 'chevronRight' | 'mail' | 'github' | 'x' | 'qr' | 'share'
  | 'copy' | 'check' | 'close' | 'wechat' | 'pin' | 'shield';

export interface LinkItem {
  id: string;
  title: string;
  desc: string;
  url: string;
  icon: IconName;
  tint: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  desc: string;
  image: string;
  tag: string;
  chips: string[];
  url: string;
  tint: string;
}

export interface StackGroup {
  label: string;
  tint: string;
  items: string[];
}

export const SITE = {
  url: 'https://linktr.i00.si/',
  domain: 'i00.si',
  host: 'linktr.i00.si',
  email: 'i00@i00.si',
  year: new Date().getFullYear(),
};

export const PROFILE = {
  name: 'Everett',
  avatar: '/avatar.webp',
  avatarFallback: '/avatar.jpg',
  github: 'https://github.com/xiaopengsvip',
  x: 'https://x.com/reoe_x',
  homepage: 'https://allapple.top',
};

export const LINKS: LinkItem[] = [
  { id: '1', title: 'allapple.top',         desc: '官方主页 · 聚合中心',  url: 'https://allapple.top',            icon: 'globe',    tint: '#6ea8fe' },
  { id: '2', title: 'dashboard.allapple.top', desc: '项目管理面板',       url: 'https://dashboard.allapple.top',  icon: 'gauge',    tint: '#a78bfa' },
  { id: '3', title: 'aios.vios.top',        desc: 'AI 工作台 · 智能助手', url: 'https://aios.vios.top',            icon: 'sparkles', tint: '#d8b4fe' },
  { id: '4', title: 'openclaw.allapple.top', desc: '个人 AI 助手',        url: 'https://openclaw.allapple.top',   icon: 'bot',      tint: '#f9a8d4' },
  { id: '5', title: 'enxx.allapple.top',    desc: '英语自学平台',         url: 'https://enxx.allapple.top',       icon: 'zap',      tint: '#fcd34d' },
  { id: '6', title: 'genealogy.allapple.top', desc: '葛氏族谱平台',       url: 'https://genealogy.allapple.top',  icon: 'network',  tint: '#6ee7b7' },
  { id: '7', title: 'notes.allapple.top',   desc: '极简笔记与博客',       url: 'https://notes.allapple.top',      icon: 'notebook', tint: '#67e8f9' },
  { id: '8', title: 'docs.allapple.top',    desc: 'API 文档',            url: 'https://docs.allapple.top',       icon: 'book',     tint: '#fda4af' },
];

export const PROJECTS: ProjectItem[] = [
  {
    id: '1',
    title: 'AIOS 智能工作台',
    desc: '企业级 AI 超级工作台，全平台覆盖，集成多模型 AI 对话、图片生成、MCP 工作流与 Agent 编排。',
    image: '/projects/aios.png',
    tag: 'Flagship',
    chips: ['AI', 'React', 'Node.js'],
    url: 'https://aios.vios.top',
    tint: '#c084fc',
  },
  {
    id: '2',
    title: 'OpenClaw',
    desc: '真正能做事的个人 AI 助手。支持本地大模型、浏览器控制、系统级访问与持久化记忆。',
    image: '/projects/openclaw.png',
    tag: 'AI Agent',
    chips: ['Local LLM', 'Browser', 'Memory'],
    url: 'https://openclaw.allapple.top',
    tint: '#f472b6',
  },
  {
    id: '3',
    title: 'ENXX 英语自学',
    desc: 'AI 驱动的英语自学平台：纠错 / 翻译 / 拆句 / 口语陪练，内置艾宾浩斯复习系统。',
    image: '/projects/enxx.png',
    tag: 'Education',
    chips: ['AI', 'NLP', 'Spaced Repetition'],
    url: 'https://enxx.allapple.top',
    tint: '#fbbf24',
  },
  {
    id: '4',
    title: 'AllApple Dashboard',
    desc: '域名体系管理中心：12 项目 / 13 子域统一管理，Caddy 集成与 EVR-AI 同步。',
    image: '/projects/dashboard.png',
    tag: 'DevOps',
    chips: ['Dashboard', 'Next.js', 'Automation'],
    url: 'https://dashboard.allapple.top',
    tint: '#a78bfa',
  },
];

export const STACK: StackGroup[] = [
  {
    label: 'Frontend',
    tint: '#6ea8fe',
    items: ['React', 'TypeScript', 'Vite', 'Tailwind', 'Framer Motion', 'Next.js'],
  },
  {
    label: 'Backend & AI',
    tint: '#6ee7b7',
    items: ['Node.js', 'Python', 'FastAPI', 'Multi-Agent', 'RAG', 'MCP'],
  },
  {
    label: 'Infra & Ops',
    tint: '#fcd34d',
    items: ['Docker', 'PostgreSQL', 'Caddy', 'Cloudflare', 'Vercel', 'CI/CD'],
  },
];

export const COPY = {
  zh: {
    navLinks: '导航',
    navLinksHint: '8 个入口',
    navProjects: '精选项目',
    navProjectsHint: '4 个作品',
    navStack: '技术栈',
    navConnect: '联系我',
    role: 'AI 系统架构师 / 全栈工程师',
    nameLine1: '构建',
    nameAccent: '会做事的',
    nameLine2: '智能系统',
    bio: '从多智能体编排到自动化流程，从私有化部署到产品级系统设计 —— 让 AI 真正替人干活。',
    status: '深圳 · 可承接项目',
    ctaMail: '发邮件',
    ctaQr: '扫码访问',
    copied: '邮箱已复制',
    shareTitle: 'i00.si — Everett · AI 系统架构师',
    shareHeading: '分享到',
    sharePreviewLabel: '分享预览 · 封面与文案自动带出',
    shareDesc: 'AI 系统架构师的数字总部：AIOS / OpenClaw / ENXX 等 8 个项目入口。',
    shareCopyText: '复制分享文案',
    shareCopiedText: '分享文案已复制',
    shareToX: '分享到 X',
    shareWechat: '微信 / 朋友圈',
    shareWechatTip: '微信内：点右上角 ··· → 发送给朋友 / 分享到朋友圈',
    shareNote: '已适配 X 卡片与微信分享（封面、标题、简介自动读取）',
    qrHint: '用手机相机扫码，随时打开我的数字总部',
    qrTitle: '扫码打开本站',
    copyLink: '复制链接',
    copiedLink: '链接已复制',
    share: '分享',
    close: '关闭',
    statProjects: '个项目',
    statYears: '年经验',
    statUptime: '在线',
    footerNote: 'Built with React · Vite — 自有域名与架构',
  },
  en: {
    navLinks: 'DIRECTORY',
    navLinksHint: '8 entries',
    navProjects: 'FEATURED WORK',
    navProjectsHint: '4 projects',
    navStack: 'STACK',
    navConnect: 'CONNECT',
    role: 'AI System Architect / Full-stack Engineer',
    nameLine1: 'Building',
    nameAccent: 'intelligent',
    nameLine2: 'systems that ship.',
    bio: 'From multi-agent orchestration to automation pipelines, private deployment to product-grade system design — making AI actually do the work.',
    status: 'Shenzhen · Open to work',
    ctaMail: 'Email me',
    ctaQr: 'Scan to open',
    copied: 'Email copied',
    shareTitle: 'i00.si — Everett · AI System Architect',
    shareHeading: 'Share to',
    sharePreviewLabel: 'Link preview · cover & copy auto-filled',
    shareDesc: 'The digital HQ of an AI System Architect: AIOS, OpenClaw, ENXX and 5 more.',
    shareCopyText: 'Copy share text',
    shareCopiedText: 'Share text copied',
    shareToX: 'Share on X',
    shareWechat: 'WeChat / Moments',
    shareWechatTip: 'In WeChat: tap ··· at top right → Send to Chat / Moments',
    shareNote: 'X cards and WeChat shares are configured (cover, title, description).',
    qrHint: 'Point your phone camera at the code',
    qrTitle: 'Scan to open',
    copyLink: 'Copy link',
    copiedLink: 'Link copied',
    share: 'Share',
    close: 'Close',
    statProjects: 'projects',
    statYears: 'years',
    statUptime: 'online',
    footerNote: 'Built with React · Vite — own domain & infrastructure',
  },
};

export type Lang = keyof typeof COPY;

export const CONNECT = [
  { id: 'mail',  label: 'Email',  value: SITE.email,                 href: `mailto:${SITE.email}`,      icon: 'mail'   as IconName },
  { id: 'web',   label: 'Website', value: 'allapple.top',            href: PROFILE.homepage,            icon: 'globe'  as IconName },
  { id: 'gh',    label: 'GitHub',  value: 'xiaopengsvip',            href: PROFILE.github,              icon: 'github' as IconName },
  { id: 'x',     label: 'X',       value: '@reoe_x',                 href: PROFILE.x,                   icon: 'x'      as IconName },
];
