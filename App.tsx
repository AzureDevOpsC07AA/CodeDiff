
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { PanelData, DiffLine, ThreePanelLayout, EditorTheme, Match, FindOptions } from './types';
import { calculateDiff } from './utils/diff';
import { summarizeDifferences } from './services/geminiService';
import { generateSimpleSummary } from './utils/summary';
import { Header } from './components/Header';
import { EditorPanel } from './components/EditorPanel';
import { FindReplaceWidget } from './components/FindReplaceWidget';
import { HelpModal } from './components/HelpModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { escapeRegExp } from './utils/regex';

const initialPanels: PanelData[] = [
    { id: crypto.randomUUID(), text: 'const Greeter = (name) => {\n  console.log("Hello, " + name);\n};\n\nGreeter("World");', title: 'Original JavaScript' },
    { id: crypto.randomUUID(), text: 'function Greeter(name) {\n  // A friendly greeting\n  console.log(`Hello, ${name}!`);\n}\n\nGreeter("Universe");\n', title: 'Refactored TypeScript' }
];

const App: React.FC = () => {
    const [panels, setPanels] = useState<PanelData[]>(initialPanels);
    const [diffResults, setDiffResults] = useState<(DiffLine[] | null)[]>([]);
    const [summary, setSummary] = useState<string>('');
    const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
    const [threePanelLayout, setThreePanelLayout] = useState<ThreePanelLayout>('stacked');
    const [theme, setTheme] = useState<EditorTheme>('dark');
    
    // Find & Replace State
    const [isFindVisible, setIsFindVisible] = useState(false);
    const [findQuery, setFindQuery] = useState('');
    const [replaceQuery, setReplaceQuery] = useState('');
    const [findOptions, setFindOptions] = useState<FindOptions>({ caseSensitive: false, useRegex: false });
    const [matches, setMatches] = useState<Match[]>([]);
    const [activeMatchIndex, setActiveMatchIndex] = useState(-1);

    // Code Folding State
    const [foldedLines, setFoldedLines] = useState<Map<string, Set<number>>>(new Map());
    
    // Help Modal State
    const [isHelpVisible, setIsHelpVisible] = useState(false);

    // API Key State (kept only in memory for the current session)
    const [apiKey, setApiKey] = useState<string>('');
    const [isApiKeyModalVisible, setIsApiKeyModalVisible] = useState<boolean>(false);

    const panelScrollRefs = useRef<(HTMLDivElement | null)[]>([]);
    const isSyncingScroll = useRef(false);

    // Theme Management Effect
    useEffect(() => {
        document.body.className = '';
        document.body.classList.add(`theme-${theme}`, 'overflow-x-hidden');
        
        const themes: EditorTheme[] = ['dark', 'light', 'solarized'];
        themes.forEach(t => {
            const link = document.getElementById(`prism-theme-${t}`) as HTMLLinkElement | null;
            if (link) {
                link.disabled = (t !== theme);
            }
        });
    }, [theme]);

    // Diff Calculation Effect
    useEffect(() => {
        if (panels.length < 2) {
            setDiffResults(panels.map(() => null));
            return;
        }
        const baseText = panels[0].text;
        const newDiffs = panels.map((panel, index) => {
            if (index === 0) return null; // Base panel has no diff against itself
            return calculateDiff(baseText, panel.text);
        });
        setDiffResults([null, ...newDiffs.slice(1)]);
    }, [panels]);

    // Find Matches Effect
    useEffect(() => {
        if (!findQuery || !isFindVisible) {
            setMatches([]);
            setActiveMatchIndex(-1);
            return;
        }
        
        const allMatches: Match[] = [];
        try {
            const query = findOptions.useRegex ? findQuery : escapeRegExp(findQuery);
            const regex = new RegExp(query, findOptions.caseSensitive ? 'g' : 'gi');
            
            panels.forEach(panel => {
                for (const match of panel.text.matchAll(regex)) {
                    if (match.index !== undefined) {
                        allMatches.push({
                            panelId: panel.id,
                            start: match.index,
                            end: match.index + match[0].length,
                        });
                    }
                }
            });

            setMatches(allMatches);
            setActiveMatchIndex(allMatches.length > 0 ? 0 : -1);
        } catch (error) {
            // Invalid regex
            setMatches([]);
            setActiveMatchIndex(-1);
        }
    }, [findQuery, findOptions, panels, isFindVisible]);

    // Scroll to Active Match Effect
    useEffect(() => {
        if (activeMatchIndex === -1 || matches.length === 0) return;
        
        const activeMatch = matches[activeMatchIndex];
        const panelIndex = panels.findIndex(p => p.id === activeMatch.panelId);
        const panelRef = panelScrollRefs.current[panelIndex];
        
        if (panelRef) {
            const textUntilMatch = panels[panelIndex].text.substring(0, activeMatch.start);
            const lineNumber = textUntilMatch.split('\n').length;
            const lineHeight = 24; // Corresponds to leading-6
            const targetScrollTop = (lineNumber - 1) * lineHeight;

            // Check if match is out of view
            const isOutOfView = targetScrollTop < panelRef.scrollTop || targetScrollTop > (panelRef.scrollTop + panelRef.clientHeight - lineHeight * 2);

            if (isOutOfView) {
                panelRef.scrollTo({
                    top: targetScrollTop - (panelRef.clientHeight / 3),
                    behavior: 'smooth',
                });
            }
        }
    }, [activeMatchIndex, matches, panels]);

    const addPanel = useCallback(() => {
        setPanels(prev => {
            if (prev.length >= 4) return prev;
            const newPanel: PanelData = { 
                id: crypto.randomUUID(), 
                text: '', 
                title: `Comparison ${prev.length}` 
            };
            return [...prev, newPanel];
        });
    }, []);

    const removeLastPanel = useCallback(() => {
        setPanels(currentPanels => {
            if (currentPanels.length <= 2) {
                return currentPanels;
            }
            const lastPanelId = currentPanels[currentPanels.length - 1].id;
            
            setFoldedLines(currentFoldedLines => {
                const newFoldedLines = new Map(currentFoldedLines);
                if (newFoldedLines.has(lastPanelId)) {
                    newFoldedLines.delete(lastPanelId);
                    return newFoldedLines;
                }
                return currentFoldedLines;
            });
    
            return currentPanels.slice(0, -1);
        });
    }, []);

    const updatePanelText = (id: string, newText: string) => {
        setPanels(prev => prev.map(p => (p.id === id ? { ...p, text: newText } : p)));
    };
    
    const updatePanelTitle = (id: string, newTitle: string) => {
        setPanels(prev => prev.map(p => (p.id === id ? { ...p, title: newTitle } : p)));
    };

    const handleSimpleSummary = useCallback(() => {
        if (panels.length < 2) {
            setSummary("At least two panels are needed for a summary.");
            return;
        }
        setSummary(generateSimpleSummary(diffResults, panels));
    }, [diffResults, panels]);

    const handleAiSummary = useCallback(async () => {
        if (!apiKey) {
            setIsApiKeyModalVisible(true);
            return;
        }
        if (isSummarizing) return;
        setIsSummarizing(true);
        setSummary('');
        const result = await summarizeDifferences(panels, apiKey);
        setSummary(result);
        setIsSummarizing(false);
    }, [panels, isSummarizing, apiKey]);
    
    const toggleHelpModal = useCallback(() => setIsHelpVisible(v => !v), []);

    const handleSaveApiKey = (key: string) => {
        // Store API key only in memory for this session; do not persist to localStorage.
        setApiKey(key);
    };

    // Keyboard Shortcuts Effect
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modKey = isMac ? e.metaKey : e.ctrlKey;
            const target = e.target as HTMLElement;
            const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

            // Toggle Help: '?' or Cmd/Ctrl + /
            if (e.key === '?' || (modKey && e.key === '/')) {
                if (isEditing && e.key === '?') return; 
                e.preventDefault();
                toggleHelpModal();
                return;
            }

            // Toggle Find/Replace: Cmd/Ctrl + F
            if (modKey && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                setIsFindVisible(v => !v);
            }

            // The rest of the shortcuts should not trigger while editing text.
            if (isEditing) return;

            // AI Summary: Cmd/Ctrl + Shift + S
            if (modKey && e.shiftKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                handleAiSummary();
            }
    
            // Add Panel: Cmd/Ctrl + Alt + N
            if (modKey && e.altKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                addPanel();
            }
    
            // Remove Panel: Cmd/Ctrl + Alt + W
            if (modKey && e.altKey && e.key.toLowerCase() === 'w') {
                e.preventDefault();
                removeLastPanel();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleAiSummary, addPanel, removeLastPanel, toggleHelpModal]);


    const handleScroll = useCallback((scrolledPanelId: string, scrollTop: number, scrollLeft: number) => {
        if (isSyncingScroll.current) return;
        isSyncingScroll.current = true;
        
        const scrolledPanelIndex = panels.findIndex(p => p.id === scrolledPanelId);
        if (scrolledPanelIndex === -1) {
            requestAnimationFrame(() => { isSyncingScroll.current = false; });
            return;
        }

        panelScrollRefs.current.forEach((ref, index) => {
            if (ref && index !== scrolledPanelIndex) {
                ref.scrollTop = scrollTop;
                ref.scrollLeft = scrollLeft;
            }
        });
        
        requestAnimationFrame(() => {
            isSyncingScroll.current = false;
        });
    }, [panels]);

    const handleToggleFold = (panelId: string, line: number) => {
        setFoldedLines((prev: Map<string, Set<number>>) => {
            const newMap = new Map(prev);
            const panelSet = new Set(newMap.get(panelId) || []);
            if (panelSet.has(line)) {
                panelSet.delete(line);
            } else {
                panelSet.add(line);
            }
            newMap.set(panelId, panelSet);
            return newMap;
        });
    };

    const handleFindNext = () => setActiveMatchIndex(prev => (prev + 1) % matches.length);
    const handleFindPrev = () => setActiveMatchIndex(prev => (prev - 1 + matches.length) % matches.length);

    const handleReplace = () => {
        if (activeMatchIndex === -1 || matches.length === 0) return;
        const match = matches[activeMatchIndex];
        const panel = panels.find(p => p.id === match.panelId);
        if (!panel) return;

        const newText = panel.text.substring(0, match.start) + replaceQuery + panel.text.substring(match.end);
        updatePanelText(panel.id, newText);
    };

    const handleReplaceAll = () => {
        if (!findQuery || matches.length === 0) return;
        
        const panelUpdates = new Map<string, string>();

        panels.forEach(panel => {
            const query = findOptions.useRegex ? findQuery : escapeRegExp(findQuery);
            const regex = new RegExp(query, findOptions.caseSensitive ? 'g' : 'gi');
            const newText = panel.text.replace(regex, replaceQuery);
            if (newText !== panel.text) {
                panelUpdates.set(panel.id, newText);
            }
        });

        setPanels(prevPanels => prevPanels.map(p => panelUpdates.has(p.id) ? { ...p, text: panelUpdates.get(p.id)! } : p));
    };


    const getGridClasses = (): string => {
        const count = panels.length;
        if (count <= 2) {
            return `grid grid-cols-1 md:grid-cols-${count} gap-4`;
        }
        if (count === 3) {
            return threePanelLayout === 'side-by-side' 
                ? 'grid grid-cols-1 md:grid-cols-3 gap-4' 
                : 'grid grid-cols-1 md:grid-cols-2 gap-4';
        }
        return 'grid grid-cols-1 md:grid-cols-2 gap-4';
    };

    const getPanelClasses = (index: number): string => {
        if (panels.length === 3 && threePanelLayout === 'stacked' && index === 2) {
            return 'md:col-span-2';
        }
        return '';
    };

    const panelMatches = useMemo(() => {
        const result = new Map<string, Match[]>();
        panels.forEach(p => result.set(p.id, []));
        matches.forEach(m => result.get(m.panelId)?.push(m));
        return result;
    }, [panels, matches]);


    return (
        <div className="flex flex-col h-screen max-h-screen p-4 gap-4 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
            <Header
                panelCount={panels.length}
                onAddPanel={addPanel}
                onRemovePanel={removeLastPanel}
                onSimpleSummary={handleSimpleSummary}
                onAiSummary={handleAiSummary}
                isSummarizing={isSummarizing}
                threePanelLayout={threePanelLayout}
                onToggleLayout={() => setThreePanelLayout(p => p === 'stacked' ? 'side-by-side' : 'stacked')}
                theme={theme}
                onThemeChange={setTheme}
                onToggleFind={() => setIsFindVisible(v => !v)}
                onToggleHelp={toggleHelpModal}
            />
            
            {isHelpVisible && <HelpModal onClose={toggleHelpModal} />}
            {isApiKeyModalVisible && <ApiKeyModal onClose={() => setIsApiKeyModalVisible(false)} onSave={handleSaveApiKey} currentKey={apiKey} />}

            {isFindVisible && (
                <FindReplaceWidget
                    findQuery={findQuery}
                    onFindQueryChange={setFindQuery}
                    replaceQuery={replaceQuery}
                    onReplaceQueryChange={setReplaceQuery}
                    options={findOptions}
                    onOptionsChange={setFindOptions}
                    onFindNext={handleFindNext}
                    onFindPrev={handleFindPrev}
                    onReplace={handleReplace}
                    onReplaceAll={handleReplaceAll}
                    matchCount={matches.length}
                    activeMatchIndex={activeMatchIndex}
                    onClose={() => setIsFindVisible(false)}
                />
            )}

            <main className={`flex-1 ${getGridClasses()} min-h-0`}>
                {panels.map((panel, index) => (
                    <EditorPanel
                        key={panel.id}
                        id={panel.id}
                        className={getPanelClasses(index)}
                        title={panel.title}
                        onTitleChange={(newTitle) => updatePanelTitle(panel.id, newTitle)}
                        text={panel.text}
                        onTextChange={(newText) => updatePanelText(panel.id, newText)}
                        diffResult={diffResults[index] || null}
                        scrollRef={el => panelScrollRefs.current[index] = el}
                        onScroll={handleScroll}
                        matches={panelMatches.get(panel.id) || []}
                        activeMatch={matches[activeMatchIndex]?.panelId === panel.id ? matches[activeMatchIndex] : undefined}
                        foldedLines={foldedLines.get(panel.id) || new Set()}
                        onToggleFold={(line: number) => handleToggleFold(panel.id, line)}
                    />
                ))}
            </main>
            {(isSummarizing || summary) && (
                <div className="flex-shrink-0 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg p-4 max-h-48 overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-2 text-[var(--color-accent)]">Summary of Differences</h3>
                    {isSummarizing ? (
                        <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                           <div className="w-4 h-4 border-2 border-t-transparent border-[var(--color-accent)] rounded-full animate-spin"></div>
                           <span>Analyzing changes...</span>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">{summary}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default App;