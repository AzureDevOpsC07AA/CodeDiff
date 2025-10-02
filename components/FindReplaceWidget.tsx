import React from 'react';
import { IconButton } from './IconButton';
import { FindOptions } from '../types';

interface FindReplaceWidgetProps {
    findQuery: string;
    onFindQueryChange: (query: string) => void;
    replaceQuery: string;
    onReplaceQueryChange: (query: string) => void;
    options: FindOptions;
    onOptionsChange: (options: FindOptions) => void;
    onFindNext: () => void;
    onFindPrev: () => void;
    onReplace: () => void;
    onReplaceAll: () => void;
    matchCount: number;
    activeMatchIndex: number;
    onClose: () => void;
}

export const FindReplaceWidget: React.FC<FindReplaceWidgetProps> = ({
    findQuery,
    onFindQueryChange,
    replaceQuery,
    onReplaceQueryChange,
    options,
    onOptionsChange,
    onFindNext,
    onFindPrev,
    onReplace,
    onReplaceAll,
    matchCount,
    activeMatchIndex,
    onClose
}) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                onFindPrev();
            } else {
                onFindNext();
            }
        }
    };

    return (
        <div className="flex-shrink-0 flex items-center gap-4 bg-[var(--color-bg-secondary)] p-3 rounded-lg border border-[var(--color-border)]">
            <div className="flex flex-col gap-2 flex-grow">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Find"
                        value={findQuery}
                        onChange={(e) => onFindQueryChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-grow bg-[var(--color-bg-tertiary)] px-2 py-1 rounded-md text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                    <span className="text-sm text-[var(--color-text-muted)] w-24 text-center">
                        {matchCount > 0 ? `${activeMatchIndex + 1} of ${matchCount}` : 'No results'}
                    </span>
                    <IconButton onClick={onFindPrev} disabled={matchCount === 0} ariaLabel="Previous match">
                        <ChevronUpIcon />
                    </IconButton>
                    <IconButton onClick={onFindNext} disabled={matchCount === 0} ariaLabel="Next match">
                        <ChevronDownIcon />
                    </IconButton>
                </div>
                <div className="flex items-center gap-2">
                     <input
                        type="text"
                        placeholder="Replace"
                        value={replaceQuery}
                        onChange={(e) => onReplaceQueryChange(e.target.value)}
                        className="flex-grow bg-[var(--color-bg-tertiary)] px-2 py-1 rounded-md text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                    <button onClick={onReplace} disabled={matchCount === 0} className="px-3 py-1 text-sm rounded-md bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary-hover)] disabled:opacity-50 disabled:cursor-not-allowed">
                        Replace
                    </button>
                    <button onClick={onReplaceAll} disabled={matchCount === 0} className="px-3 py-1 text-sm rounded-md bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary-hover)] disabled:opacity-50 disabled:cursor-not-allowed">
                        Replace All
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <IconButton 
                    onClick={() => onOptionsChange({ ...options, caseSensitive: !options.caseSensitive })} 
                    isActive={options.caseSensitive}
                    ariaLabel="Toggle Case Sensitive"
                >
                    <CaseSensitiveIcon />
                </IconButton>
                <IconButton
                    onClick={() => onOptionsChange({ ...options, useRegex: !options.useRegex })} 
                    isActive={options.useRegex}
                    ariaLabel="Toggle Regex"
                >
                    <RegexIcon />
                </IconButton>
                 <IconButton onClick={onClose} ariaLabel="Close find and replace">
                    <CloseIcon />
                </IconButton>
            </div>
        </div>
    );
};


// SVG Icons
const ChevronUpIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
);
const ChevronDownIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);
const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const CaseSensitiveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 15 4-8 4 8"/>
        <path d="M4 13h6"/>
        <path d="M15 20v-5.5a2.5 2.5 0 0 1 5 0V20"/>
        <path d="M15 17h5"/>
    </svg>
);
const RegexIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 5v14"/>
        <path d="m13 7 4 4-4 4"/>
        <path d="m7 7-4 4 4 4"/>
        <path d="M3 5v14"/>
    </svg>
);
