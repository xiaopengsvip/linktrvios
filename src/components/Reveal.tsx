import { useEffect, useRef, type ReactNode, type CSSProperties } from 'react';

interface Props {
  children: ReactNode;
  /** 进场延迟（毫秒），用于错位式依次浮现 */
  delay?: number;
  as?: 'div' | 'section' | 'li';
  className?: string;
  style?: CSSProperties;
}

/**
 * 滚动进场：IntersectionObserver 驱动，一次性触发，无第三方动画库。
 *
 * 关键：绝不能出现「内容永久不可见」。三层兜底 ——
 *  1) 挂载时同步判断是否已在视口内，是则下一帧立即显示（动画照常播放）；
 *  2) 不支持 IntersectionObserver 时直接显示；
 *  3) 1.4s 安全网，无论如何强制显示（覆盖 IO 在后台标签页/无头环境不触发的情况）。
 */
export function Reveal({ children, delay = 0, as = 'div', className, style }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => {
      if (el.dataset.in === 'true') return;
      // 隐藏标签页里动画/过渡可能被冻结，直接给终态，绝不留下不可见内容
      if (document.visibilityState === 'hidden') el.style.animationDuration = '1ms';
      el.dataset.in = 'true';
    };

    // 1) 已在视口内 -> 下一帧显示，保证过渡动画仍然播放
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < vh * 1.02 && rect.bottom > -40) {
      const raf = requestAnimationFrame(() => requestAnimationFrame(show));
      window.setTimeout(show, 600); // 双保险
      return () => { cancelAnimationFrame(raf); };
    }

    // 2) 环境不支持 -> 直接显示
    if (typeof IntersectionObserver === 'undefined') {
      show();
      return;
    }

    // 3) 常规滚动进场 + 安全网
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = 'true';
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    );
    io.observe(el);

    const safety = window.setTimeout(show, 1400);
    return () => { io.disconnect(); window.clearTimeout(safety); };
  }, []);

  const Tag = as as 'div';
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={['reveal', className].filter(Boolean).join(' ')}
      style={{ ['--rd' as string]: delay ? `${delay}ms` : undefined, ...style }}
    >
      {children}
    </Tag>
  );
}
