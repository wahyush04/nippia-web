import React, { useId } from 'react';

interface FiguralShape {
  type: 'arrow' | 'dot' | 'square' | 'circle' | 'triangle' | 'polygon';
  angle?: number;
  corner?: 'TL' | 'TR' | 'BL' | 'BR' | 'CENTER';
  sides?: number;
  fill?: string;
  stroke?: string;
}

export interface SvgNode {
  tag: 'path' | 'circle' | 'ellipse' | 'rect' | 'polygon' | 'polyline' | 'line' | 'text' | 'g';
  attrs?: Record<string, string | number>;
  text?: string;
  children?: SvgNode[];
}

export interface FiguralCellSpec {
  shapes?: FiguralShape[];
  nodes?: SvgNode[];
  rotate?: number;
}

function getCornerCoords(corner?: string): { x: number; y: number } {
  switch (corner) {
    case 'TL':
      return { x: 20, y: 20 };
    case 'TR':
      return { x: 80, y: 20 };
    case 'BL':
      return { x: 20, y: 80 };
    case 'BR':
      return { x: 80, y: 80 };
    default:
      return { x: 50, y: 50 };
  }
}

function polygonPoints(cx: number, cy: number, r: number, sides: number): string {
  const pts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const theta = (Math.PI * 2 * i) / sides - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(theta)).toFixed(1)},${(cy + r * Math.sin(theta)).toFixed(1)}`);
  }
  return pts.join(' ');
}

function resolvePatternAttr(val: string | number | undefined, uid: string): string | number | undefined {
  if (typeof val !== 'string') return val;
  if (val.startsWith('pat:')) {
    return `url(#${uid}-${val.slice(4)})`;
  }
  return val;
}

function renderSvgNode(node: SvgNode, idx: number, uid: string): React.ReactNode {
  const rawAttrs = node.attrs || {};
  const mappedAttrs: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(rawAttrs)) {
    const resolved = resolvePatternAttr(v, uid);
    if (resolved !== undefined) mappedAttrs[k] = resolved;
  }

  const children = node.children?.map((c, cIdx) => renderSvgNode(c, cIdx, uid));

  switch (node.tag) {
    case 'path':
      return <path key={idx} {...mappedAttrs} />;
    case 'circle':
      return <circle key={idx} {...mappedAttrs} />;
    case 'ellipse':
      return <ellipse key={idx} {...mappedAttrs} />;
    case 'rect':
      return <rect key={idx} {...mappedAttrs} />;
    case 'polygon':
      return <polygon key={idx} {...mappedAttrs} />;
    case 'polyline':
      return <polyline key={idx} {...mappedAttrs} />;
    case 'line':
      return <line key={idx} {...mappedAttrs} />;
    case 'text':
      return (
        <text key={idx} {...mappedAttrs}>
          {node.text}
        </text>
      );
    case 'g':
      return (
        <g key={idx} {...mappedAttrs}>
          {children}
        </g>
      );
    default:
      return null;
  }
}

function CellSvg({ cell, size = 84 }: { cell: FiguralCellSpec | null; size?: number }) {
  const uid = useId().replace(/:/g, '');

  if (!cell) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/60 font-bold text-indigo-700"
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="rounded-xl border border-slate-200 bg-white shadow-2xs shrink-0"
    >
      <defs>
        <pattern id={`${uid}-hatch-diag`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#0f172a" strokeWidth="2.4" />
        </pattern>
        <pattern id={`${uid}-hatch-diag-rev`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#0f172a" strokeWidth="2.4" />
        </pattern>
        <pattern id={`${uid}-hatch-horiz`} width="8" height="7" patternUnits="userSpaceOnUse">
          <line x1="0" y1="3.5" x2="8" y2="3.5" stroke="#0f172a" strokeWidth="2.2" />
        </pattern>
        <pattern id={`${uid}-hatch-vert`} width="7" height="8" patternUnits="userSpaceOnUse">
          <line x1="3.5" y1="0" x2="3.5" y2="8" stroke="#0f172a" strokeWidth="2.2" />
        </pattern>
        <pattern id={`${uid}-hatch-grid`} width="9" height="9" patternUnits="userSpaceOnUse">
          <path d="M 9 0 L 0 0 0 9" fill="none" stroke="#0f172a" strokeWidth="1.8" />
        </pattern>
        <pattern id={`${uid}-dots-dense`} width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="#0f172a" />
          <circle cx="5.5" cy="5.5" r="1.2" fill="#0f172a" />
        </pattern>
        <pattern id={`${uid}-dots-checker`} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="5" height="5" fill="#0f172a" />
          <rect x="5" y="5" width="5" height="5" fill="#0f172a" />
        </pattern>
      </defs>

      <g transform={cell.rotate ? `rotate(${cell.rotate} 50 50)` : undefined}>
        {(cell.nodes || []).map((n, idx) => renderSvgNode(n, idx, uid))}
        {(cell.shapes || []).map((s, idx) => {
          const fill = s.fill ?? '#1e3a8a';
          const stroke = s.stroke ?? '#1e3a8a';
          const pos = getCornerCoords(s.corner);

          if (s.type === 'arrow') {
            return (
              <g key={`sh-${idx}`} transform={`rotate(${s.angle ?? 0} 50 50)`}>
                <line x1="50" y1="74" x2="50" y2="28" stroke={fill} strokeWidth="6" strokeLinecap="round" />
                <polygon points="50,16 36,36 64,36" fill={fill} />
              </g>
            );
          }

          if (s.type === 'dot') {
            return <circle key={`sh-${idx}`} cx={pos.x} cy={pos.y} r="9" fill={fill} />;
          }

          if (s.type === 'square') {
            const isCorner = Boolean(s.corner && s.corner !== 'CENTER');
            const side = isCorner ? 18 : 52;
            return (
              <rect
                key={`sh-${idx}`}
                x={pos.x - side / 2}
                y={pos.y - side / 2}
                width={side}
                height={side}
                rx="2"
                fill={fill === 'none' ? 'transparent' : fill}
                stroke={stroke}
                strokeWidth="4"
              />
            );
          }

          if (s.type === 'circle') {
            const isCorner = Boolean(s.corner && s.corner !== 'CENTER');
            const r = isCorner ? 11 : 27;
            return (
              <circle
                key={`sh-${idx}`}
                cx={pos.x}
                cy={pos.y}
                r={r}
                fill={fill === 'none' ? 'transparent' : fill}
                stroke={stroke}
                strokeWidth="4"
              />
            );
          }

          if (s.type === 'triangle') {
            const isCorner = Boolean(s.corner && s.corner !== 'CENTER');
            const r = isCorner ? 12 : 28;
            return (
              <polygon
                key={`sh-${idx}`}
                points={polygonPoints(pos.x, pos.y, r, 3)}
                fill={fill === 'none' ? 'transparent' : fill}
                stroke={stroke}
                strokeWidth="4"
              />
            );
          }

          if (s.type === 'polygon') {
            const isCorner = Boolean(s.corner && s.corner !== 'CENTER');
            const r = isCorner ? 12 : 28;
            return (
              <polygon
                key={`sh-${idx}`}
                points={polygonPoints(pos.x, pos.y, r, s.sides ?? 5)}
                fill={fill === 'none' ? 'transparent' : fill}
                stroke={stroke}
                strokeWidth="4"
              />
            );
          }

          return null;
        })}
      </g>
    </svg>
  );
}

export function FiguralRenderer({
  spec,
  compact = false,
}: {
  spec: Record<string, unknown> | null | undefined;
  compact?: boolean;
}) {
  if (!spec) return null;
  const kind = spec.kind as string | undefined;

  if (!kind && (Array.isArray(spec.shapes) || Array.isArray(spec.nodes))) {
    return (
      <div className="inline-flex">
        <CellSvg cell={spec as FiguralCellSpec} size={compact ? 64 : 78} />
      </div>
    );
  }

  if (kind === 'serial') {
    const frames = (spec.frames as FiguralCellSpec[]) || [];
    return (
      <div className="my-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
        {frames.map((frame, i) => (
          <React.Fragment key={i}>
            <CellSvg cell={frame} size={82} />
            <span className="text-slate-400 font-bold">→</span>
          </React.Fragment>
        ))}
        <CellSvg cell={null} size={82} />
      </div>
    );
  }

  if (kind === 'analogy') {
    const pairA = (spec.pairA as FiguralCellSpec[]) || [];
    const pairB = (spec.pairB as FiguralCellSpec[]) || (spec.pairBStart ? [spec.pairBStart as FiguralCellSpec] : []);
    return (
      <div className="my-3 flex flex-wrap items-center gap-2.5 rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
        {pairA.map((cell, i) => (
          <React.Fragment key={`a-${i}`}>
            <CellSvg cell={cell} size={76} />
            {i < pairA.length - 1 && <span className="text-indigo-600 font-bold text-lg">→</span>}
          </React.Fragment>
        ))}
        <span className="mx-1.5 text-slate-400 font-bold text-lg">::</span>
        {pairB.map((cell, i) => (
          <React.Fragment key={`b-${i}`}>
            <CellSvg cell={cell} size={76} />
            <span className="text-indigo-600 font-bold text-lg">→</span>
          </React.Fragment>
        ))}
        <CellSvg cell={null} size={76} />
      </div>
    );
  }

  if (kind === 'matrix') {
    const grid = (spec.grid as Array<Array<FiguralCellSpec | null>>) || [];
    return (
      <div className="my-3 inline-grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
        {grid.flat().map((cell, idx) => (
          <div key={idx}>
            <CellSvg cell={cell} size={78} />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
