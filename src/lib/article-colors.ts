// Color config shared between server and client components
const COLOR_MAP: Record<string, { primary: string; background: string; border: string; hoverShadow: string }> = {
  cyan: {
    primary: 'var(--cyan)',
    background: 'rgba(0, 229, 255, 0.08)',
    border: 'rgba(0, 229, 255, 0.2)',
    hoverShadow: '0 8px 24px rgba(0, 229, 255, 0.15)',
  },
  purple: {
    primary: 'var(--purple)',
    background: 'rgba(185, 133, 244, 0.08)',
    border: 'rgba(185, 133, 244, 0.2)',
    hoverShadow: '0 8px 24px rgba(185, 133, 244, 0.15)',
  },
  blue: {
    primary: 'var(--blue)',
    background: 'rgba(96, 165, 250, 0.08)',
    border: 'rgba(96, 165, 250, 0.2)',
    hoverShadow: '0 8px 24px rgba(96, 165, 250, 0.15)',
  },
  green: {
    primary: 'var(--green)',
    background: 'rgba(62, 255, 163, 0.08)',
    border: 'rgba(62, 255, 163, 0.2)',
    hoverShadow: '0 8px 24px rgba(62, 255, 163, 0.15)',
  },
  yellow: {
    primary: 'var(--yellow)',
    background: 'rgba(255, 209, 102, 0.08)',
    border: 'rgba(255, 209, 102, 0.2)',
    hoverShadow: '0 8px 24px rgba(255, 209, 102, 0.15)',
  },
  pink: {
    primary: 'var(--pink)',
    background: 'rgba(255, 107, 157, 0.08)',
    border: 'rgba(255, 107, 157, 0.2)',
    hoverShadow: '0 8px 24px rgba(255, 107, 157, 0.15)',
  },
  orange: {
    primary: 'var(--orange)',
    background: 'rgba(255, 159, 28, 0.08)',
    border: 'rgba(255, 159, 28, 0.2)',
    hoverShadow: '0 8px 24px rgba(255, 159, 28, 0.15)',
  },
};

export function getColorConfig(color: string) {
  return COLOR_MAP[color] || COLOR_MAP.cyan;
}
