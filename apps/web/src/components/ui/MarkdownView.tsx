import React from 'react';

function renderInline(text: string): React.ReactNode[] {
  // Tokenize inline code `...`, bold **...**, and italic *...* safely without dangerouslySetInnerHTML
  const tokens: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const raw = match[0];
    if (raw.startsWith('`') && raw.endsWith('`')) {
      tokens.push(
        <code
          key={key++}
          className="rounded-md bg-indigo-50 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-indigo-800 border border-indigo-100"
        >
          {raw.slice(1, -1)}
        </code>,
      );
    } else if (raw.startsWith('**') && raw.endsWith('**')) {
      tokens.push(
        <strong key={key++} className="font-semibold text-slate-900">
          {renderInline(raw.slice(2, -2))}
        </strong>,
      );
    } else if (raw.startsWith('*') && raw.endsWith('*')) {
      tokens.push(
        <em key={key++} className="italic text-slate-700">
          {raw.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }
  return tokens;
}

export function MarkdownView({
  content,
  className = '',
}: {
  content: string;
  className?: string;
}) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    if (!line.trim()) {
      i++;
      continue;
    }

    // Headings (# .. ####)
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      if (level <= 2) {
        blocks.push(
          <h4
            key={key++}
            className="pt-2 text-sm font-bold text-slate-900 border-b border-slate-200/80 pb-1"
          >
            {renderInline(headingText)}
          </h4>,
        );
      } else {
        blocks.push(
          <h5 key={key++} className="pt-2 text-xs font-bold uppercase tracking-wide text-indigo-700">
            {renderInline(headingText)}
          </h5>,
        );
      }
      i++;
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('> ')) {
        quoteLines.push(lines[i].trimStart().slice(2));
        i++;
      }
      blocks.push(
        <blockquote
          key={key++}
          className="rounded-r-xl border-l-3 border-indigo-400 bg-indigo-50/50 px-3 py-2 text-xs italic text-slate-700"
        >
          {renderInline(quoteLines.join(' '))}
        </blockquote>,
      );
      continue;
    }

    // Unordered list (- or *)
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, '').trim());
        i++;
      }
      blocks.push(
        <ul key={key++} className="space-y-1.5 pl-4 list-disc marker:text-indigo-500">
          {items.map((item, idx) => (
            <li key={idx} className="text-[13px] leading-relaxed text-slate-700">
              {renderInline(item)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    // Ordered list (1. 2. ...)
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, '').trim());
        i++;
      }
      blocks.push(
        <ol key={key++} className="space-y-1.5 pl-5 list-decimal marker:font-semibold marker:text-indigo-600">
          {items.map((item, idx) => (
            <li key={idx} className="text-[13px] leading-relaxed text-slate-700">
              {renderInline(item)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    // Paragraph
    const paraLines: string[] = [line.trim()];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !lines[i].trimStart().startsWith('> ') &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    blocks.push(
      <p key={key++} className="text-[13px] leading-relaxed text-slate-700">
        {renderInline(paraLines.join(' '))}
      </p>,
    );
  }

  return <div className={`space-y-2.5 ${className}`}>{blocks}</div>;
}
