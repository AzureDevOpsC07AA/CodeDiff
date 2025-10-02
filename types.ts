export enum DiffType {
  Unchanged = 'unchanged',
  Added = 'added',
  Removed = 'removed',
}

export interface DiffLine {
  type: DiffType;
  text: string;
}

export interface PanelData {
  id: string;
  text: string;
  title: string;
}

export type ThreePanelLayout = 'stacked' | 'side-by-side';

export type EditorTheme = 'dark' | 'light' | 'solarized';

export interface Match {
  panelId: string;
  start: number;
  end: number;
}

export interface FindOptions {
  caseSensitive: boolean;
  useRegex: boolean;
}
