import React from 'react';
import { IconButton } from './IconButton';
import { ThreePanelLayout, EditorTheme } from '../types';

interface HeaderProps {
  panelCount: number;
  onAddPanel: () => void;
  onRemovePanel: () => void;
  onSummarize: () => void;
  isSummarizing: boolean;
  threePanelLayout: ThreePanelLayout;
  onToggleLayout: () => void;
  theme: EditorTheme;
  onThemeChange: (theme: EditorTheme) => void;
  onToggleFind: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  panelCount, 
  onAddPanel, 
  onRemovePanel, 
  onSummarize, 
  isSummarizing,
  threePanelLayout,
  onToggleLayout,
  theme,
  onThemeChange,
  onToggleFind
}) => {
  return (
    <header className="flex-shrink-0 flex items-center justify-between bg-[var(--color-bg-secondary)] p-3 rounded-lg border border-[var(--color-border)]">
      <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
        CodeDiff <span className="text-[var(--color-accent)]">Pro</span>
      </h1>
      <div className="flex items-center gap-4">
        <IconButton onClick={onToggleFind} ariaLabel="Find and Replace">
          <FindIcon />
        </IconButton>
        
        <div className="relative">
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as EditorTheme)}
            className="appearance-none bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] font-semibold text-sm rounded-md py-2 pl-9 pr-4 cursor-pointer hover:bg-[var(--color-bg-tertiary-hover)] hover:text-[var(--color-text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg-secondary)] focus:ring-[var(--color-accent)]"
            aria-label="Select color theme"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="solarized">Solarized</option>
          </select>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">
            <ThemeIcon />
          </div>
        </div>

        <div className="w-px h-6 bg-[var(--color-border)]"></div>

        <div className="flex items-center gap-2">
            {panelCount === 3 && (
                <>
                    <IconButton onClick={onToggleLayout} ariaLabel="Toggle 3-panel layout">
                        {threePanelLayout === 'stacked' ? <SideBySideLayoutIcon /> : <StackedLayoutIcon />}
                    </IconButton>
                    <div className="w-px h-6 bg-[var(--color-border)]"></div>
                </>
            )}
          <span className="text-sm text-[var(--color-text-muted)]">Panels:</span>
          <IconButton onClick={onRemovePanel} disabled={panelCount <= 2} ariaLabel="Remove panel">
            <MinusIcon />
          </IconButton>
          <span className="font-semibold text-[var(--color-text-primary)] w-4 text-center">{panelCount}</span>
          <IconButton onClick={onAddPanel} disabled={panelCount >= 4} ariaLabel="Add panel">
            <PlusIcon />
          </IconButton>
        </div>
        <button
          onClick={onSummarize}
          disabled={isSummarizing || panelCount < 2}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[var(--color-accent-bg)] rounded-md transition-colors hover:bg-[var(--color-accent-bg-hover)] disabled:bg-[var(--color-bg-tertiary)] disabled:text-[var(--color-text-disabled)] disabled:cursor-not-allowed"
        >
          {isSummarizing ? <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div> : <SparklesIcon />}
          <span>{isSummarizing ? 'Analyzing...' : 'AI Summary'}</span>
        </button>
      </div>
    </header>
  );
};

// SVG Icons
const FindIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const ThemeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
    </svg>
);

const PlusIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const MinusIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const SparklesIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m1-12h.01M17 3h.01M17 17h.01M21 17h.01M12 9a3 3 0 100-6 3 3 0 000 6zM3 9a3 3 0 100-6 3 3 0 000 6zm3 12a3 3 0 100-6 3 3 0 000 6zm12-6a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);

const StackedLayoutIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="9" width="14" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
);

const SideBySideLayoutIcon: React.FC = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="6" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="11" y="2" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
);