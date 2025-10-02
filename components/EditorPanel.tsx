import React, { useMemo } from 'react';
import { DiffLine, DiffType, Match } from '../types';

declare const Prism: any;

interface EditorPanelProps {
  id: string;
  title: string;
  onTitleChange: (newTitle: string) => void;
  text: string;
  onTextChange: (newText: string) => void;
  diffResult: DiffLine[] | null;
  scrollRef: (element: HTMLDivElement | null) => void;
  onScroll: (id: string, scrollTop: number, scrollLeft: number) => void;
  className?: string;
  isSyncing?: boolean;
  matches: Match[];
  activeMatch?: Match;
}

const getLineStyle = (type: DiffType): React.CSSProperties => {
  switch (type) {
    case DiffType.Added:
      return { backgroundColor: 'var(--color-diff-add-bg)' };
    case DiffType.Removed:
      return { backgroundColor: 'var(--color-diff-remove-bg)' };
    default:
      return {};
  }
};

const getLineSymbolClass = (type: DiffType): string => {
  switch (type) {
    case DiffType.Added:
      return 'text-[var(--color-diff-add-text)]';
    case DiffType.Removed:
      return 'text-[var(--color-diff-remove-text)]';
    default:
      return 'text-transparent'; // Use transparent for unchanged lines instead of muted color
  }
}

const getLanguageFromTitle = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.endsWith('.tsx')) return 'tsx';
    if (lowerTitle.endsWith('.ts')) return 'typescript';
    if (lowerTitle.endsWith('.jsx')) return 'jsx';
    if (lowerTitle.endsWith('.js') || lowerTitle.endsWith('.mjs')) return 'javascript';
    if (lowerTitle.endsWith('.css')) return 'css';
    if (lowerTitle.endsWith('.html') || lowerTitle.endsWith('.xml') || lowerTitle.endsWith('.svg')) return 'markup';
    if (lowerTitle.endsWith('.json')) return 'json';
    return 'javascript'; // Default language
};

const HighlightOverlay: React.FC<{ text: string, matches: Match[], activeMatch?: Match }> = ({ text, matches, activeMatch }) => {
    const sortedMatches = useMemo(() => [...matches].sort((a, b) => a.start - b.start), [matches]);

    if (matches.length === 0) {
        return <>{text}</>;
    }
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedMatches.forEach((match, i) => {
        // Add text before the match
        if (match.start > lastIndex) {
            parts.push(text.substring(lastIndex, match.start));
        }

        const isMatchActive = activeMatch && activeMatch.start === match.start && activeMatch.end === match.end;
        const style = {
            backgroundColor: isMatchActive ? 'var(--color-find-active-match-bg)' : 'var(--color-find-match-bg)',
            borderRadius: '2px',
        };

        // Add the highlighted match
        parts.push(
            <mark key={i} style={style}>
                {text.substring(match.start, match.end)}
            </mark>
        );

        lastIndex = match.end;
    });

    // Add any remaining text after the last match
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return <>{parts}</>;
};

export const EditorPanel: React.FC<EditorPanelProps> = ({ 
  id,
  title, 
  onTitleChange, 
  text, 
  onTextChange, 
  diffResult, 
  scrollRef, 
  onScroll,
  className = '',
  isSyncing = false,
  matches,
  activeMatch
}) => {
  const language = getLanguageFromTitle(title);
  const isBasePanel = !diffResult;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll(id, e.currentTarget.scrollTop, e.currentTarget.scrollLeft);
  };

  const renderContent = () => {
    const lines = diffResult || text.split('\n').map(line => ({ type: DiffType.Unchanged, text: line }));
    const grammar = typeof Prism !== 'undefined' ? Prism.languages[language] : null;

    let baseLineNum = 0;
    let currentLineNum = 0;

    return lines.map((line, i) => {
        const lineContent = line.text.length > 0 ? line.text : ' ';
        
        let highlightedHtml = lineContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if (grammar) {
            highlightedHtml = Prism.highlight(lineContent, grammar, language);
        }

        const isAdded = line.type === DiffType.Added;
        const isRemoved = line.type === DiffType.Removed;
        const isUnchanged = line.type === DiffType.Unchanged;

        if (isBasePanel) {
            baseLineNum++;
        } else {
            if (isUnchanged || isRemoved) baseLineNum++;
            if (isUnchanged || isAdded) currentLineNum++;
        }
        
        const symbol = isAdded ? '+' : isRemoved ? '-' : ' ';

        return (
            <div key={i} className="flex items-start min-h-[24px]" style={getLineStyle(line.type)}>
                <div className="flex-shrink-0 flex pr-4 text-[var(--color-text-muted)] select-none">
                    <span className="w-8 text-right">
                        {isBasePanel ? baseLineNum : (isUnchanged || isRemoved ? baseLineNum : '')}
                    </span>
                    <span className="w-8 ml-2 text-right">
                        {isBasePanel ? '' : (isUnchanged || isAdded ? currentLineNum : '')}
                    </span>
                </div>
                <span className={`w-4 flex-shrink-0 text-center select-none ${isBasePanel ? 'text-transparent' : getLineSymbolClass(line.type)}`}>
                    {isBasePanel ? ' ' : symbol}
                </span>
                <div className="flex-grow" aria-hidden="true">
                    <code 
                        className={`language-${language}`} 
                        dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
                    />
                </div>
            </div>
        );
    });
  };

  return (
    <div className={`relative flex flex-col bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg overflow-hidden h-full min-h-0 ${className}`}>
      {isSyncing && (
        <div className="absolute inset-0 bg-transparent pointer-events-none z-30 animate-pulse-sync"></div>
      )}
      <div className="bg-[var(--color-bg-tertiary)] px-4 py-2 text-[var(--color-text-primary)] flex-shrink-0 border-b border-[var(--color-border)]">
        <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="bg-transparent font-semibold text-[var(--color-text-primary)] w-full border-none outline-none focus:ring-1 focus:ring-[var(--color-accent)] rounded-sm px-1 -mx-1"
            aria-label="Panel Title"
        />
      </div>
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto code-font text-sm leading-6"
      >
        <div className="relative grid">
            <div
                className="col-start-1 row-start-1 z-0 p-2 whitespace-pre pointer-events-none"
                aria-hidden="true"
            >
                {renderContent()}
            </div>
            <div
                className="col-start-1 row-start-1 z-10 p-2 pl-28 whitespace-pre pointer-events-none text-transparent"
                aria-hidden="true"
            >
                <HighlightOverlay text={text} matches={matches} activeMatch={activeMatch} />
            </div>
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              spellCheck="false"
              className="col-start-1 row-start-1 z-20 w-full h-full p-2 pl-28 bg-transparent text-transparent caret-[var(--color-caret)] resize-none border-none outline-none whitespace-pre"
              wrap="off"
            />
        </div>
      </div>
    </div>
  );
};