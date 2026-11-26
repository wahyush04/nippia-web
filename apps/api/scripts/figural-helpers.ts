export interface SvgNode {
  tag: 'path' | 'circle' | 'ellipse' | 'rect' | 'polygon' | 'polyline' | 'line' | 'text' | 'g';
  attrs?: Record<string, string | number>;
  text?: string;
  children?: SvgNode[];
}

export interface CellSpec {
  nodes: SvgNode[];
  rotate?: number;
}

export const PAT = {
  DIAG: 'pat:hatch-diag',
  DIAG_REV: 'pat:hatch-diag-rev',
  HORIZ: 'pat:hatch-horiz',
  VERT: 'pat:hatch-vert',
  GRID: 'pat:hatch-grid',
  DOTS: 'pat:dots-dense',
  CHECKER: 'pat:dots-checker',
  BLACK: '#0f172a',
  WHITE: '#ffffff',
  NONE: 'transparent',
} as const;

const S = '#0f172a';

export function cell(nodes: SvgNode[], rotate?: number): CellSpec {
  return rotate ? { nodes, rotate } : { nodes };
}

export function g(nodes: SvgNode[], attrs: Record<string, string | number> = {}): SvgNode {
  return { tag: 'g', attrs, children: nodes };
}

export function line(x1: number, y1: number, x2: number, y2: number, sw = 2.6, extra: Record<string, string | number> = {}): SvgNode {
  return { tag: 'line', attrs: { x1, y1, x2, y2, stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round', ...extra } };
}

export function rect(x: number, y: number, width: number, height: number, fill: string = PAT.NONE, sw = 2.5, extra: Record<string, string | number> = {}): SvgNode {
  return { tag: 'rect', attrs: { x, y, width, height, fill, stroke: S, 'stroke-width': sw, ...extra } };
}

export function circle(cx: number, cy: number, r: number, fill: string = PAT.NONE, sw = 2.5, extra: Record<string, string | number> = {}): SvgNode {
  return { tag: 'circle', attrs: { cx, cy, r, fill, stroke: S, 'stroke-width': sw, ...extra } };
}

export function ellipse(cx: number, cy: number, rx: number, ry: number, fill: string = PAT.NONE, sw = 2.5, extra: Record<string, string | number> = {}): SvgNode {
  return { tag: 'ellipse', attrs: { cx, cy, rx, ry, fill, stroke: S, 'stroke-width': sw, ...extra } };
}

export function poly(points: string, fill: string = PAT.NONE, sw = 2.5, extra: Record<string, string | number> = {}): SvgNode {
  return { tag: 'polygon', attrs: { points, fill, stroke: S, 'stroke-width': sw, 'stroke-linejoin': 'round', ...extra } };
}

export function path(d: string, fill: string = PAT.NONE, sw = 2.5, extra: Record<string, string | number> = {}): SvgNode {
  return { tag: 'path', attrs: { d, fill, stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...extra } };
}

export function txt(x: number, y: number, value: string, size = 13, extra: Record<string, string | number> = {}): SvgNode {
  return {
    tag: 'text',
    text: value,
    attrs: { x, y, fill: S, 'font-size': size, 'font-weight': '700', 'text-anchor': 'middle', 'dominant-baseline': 'central', ...extra },
  };
}

export function regularPoly(cx: number, cy: number, r: number, sides: number, fill: string = PAT.NONE, rotDeg = 0, sw = 2.5): SvgNode {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const a = ((Math.PI * 2 * i) / sides) - Math.PI / 2 + (rotDeg * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return poly(pts.join(' '), fill, sw);
}

export function starShape(cx: number, cy: number, rOuter: number, rInner: number, pointsCount: number, fill: string = PAT.NONE, rotDeg = 0, sw = 2.2): SvgNode {
  const pts: string[] = [];
  for (let i = 0; i < pointsCount * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (Math.PI * i) / pointsCount - Math.PI / 2 + (rotDeg * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return poly(pts.join(' '), fill, sw);
}

export function arrowLine(x1: number, y1: number, x2: number, y2: number, sw = 2.6, headSize = 7, filled = true): SvgNode {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const p1x = x2 - headSize * Math.cos(angle - Math.PI / 6);
  const p1y = y2 - headSize * Math.sin(angle - Math.PI / 6);
  const p2x = x2 - headSize * Math.cos(angle + Math.PI / 6);
  const p2y = y2 - headSize * Math.sin(angle + Math.PI / 6);
  return g([
    line(x1, y1, x2, y2, sw),
    poly(`${x2.toFixed(1)},${y2.toFixed(1)} ${p1x.toFixed(1)},${p1y.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)}`, filled ? S : PAT.WHITE, 1.8),
  ]);
}

export function heartPath(cx: number, cy: number, scale = 1, fill: string = PAT.NONE): SvgNode {
  const d = `M 0 ${7 * scale} C ${-14 * scale} ${-3 * scale}, ${-13 * scale} ${-16 * scale}, 0 ${-7 * scale} C ${13 * scale} ${-16 * scale}, ${14 * scale} ${-3 * scale}, 0 ${7 * scale} Z`;
  return g([path(d, fill, 2)], { transform: `translate(${cx} ${cy})` });
}

export function plusCross(cx: number, cy: number, armLen: number, armHalfW: number, fill: string = PAT.NONE): SvgNode {
  const a = armLen;
  const w = armHalfW;
  const pts = [
    `${cx - w},${cy - a}`, `${cx + w},${cy - a}`,
    `${cx + w},${cy - w}`, `${cx + a},${cy - w}`,
    `${cx + a},${cy + w}`, `${cx + w},${cy + w}`,
    `${cx + w},${cy + a}`, `${cx - w},${cy + a}`,
    `${cx - w},${cy + w}`, `${cx - a},${cy + w}`,
    `${cx - a},${cy - w}`, `${cx - w},${cy - w}`,
  ].join(' ');
  return poly(pts, fill, 2.2);
}

export function sectorPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number, fill: string = PAT.BLACK): SvgNode {
  const s = ((startDeg - 90) * Math.PI) / 180;
  const e = ((endDeg - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(s);
  const y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e);
  const y2 = cy + r * Math.sin(e);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  const d = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
  return path(d, fill, 2);
}

export function dominoDots(cols: number[]): SvgNode[] {
  // 4-column domino inside 100x100 box, 3 dot rows per column (top/mid/bot)
  const nodes: SvgNode[] = [
    rect(8, 12, 84, 76, PAT.WHITE, 2.2),
    line(29, 12, 29, 88, 1.5),
    line(50, 12, 50, 88, 1.5),
    line(71, 12, 71, 88, 1.5),
  ];
  const colXs = [18.5, 39.5, 60.5, 81.5];
  const rowYs = [25, 42, 58, 75];
  cols.forEach((count, ci) => {
    const cx = colXs[ci];
    for (let r = 0; r < Math.min(4, count); r++) {
      nodes.push(circle(cx, rowYs[r], 4, PAT.BLACK, 1));
    }
  });
  return nodes;
}
