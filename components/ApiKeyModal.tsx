
import React, { useState } from 'react';

interface ApiKeyModalProps {
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, onSave, currentKey }) => {
  const [apiKey, setApiKey] = useState(currentKey);

  const handleSave = () => {
    onSave(apiKey);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-key-modal-title"
    >
      <div
        className="bg-[var(--color-bg-secondary)] rounded-lg shadow-xl w-full max-w-md p-6 border border-[var(--color-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="api-key-modal-title" className="text-xl font-bold text-[var(--color-text-primary)]">Gemini API Key</h2>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-full text-[var(--color-text-muted)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          To use the AI summary feature, please provide your Google Gemini API key. Your key will be used only in this session and will not be stored in your browser.
        </p>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="w-full bg-[var(--color-bg-tertiary)] px-3 py-2 rounded-md text-sm outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-6"
        />
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md text-[var(--color-text-primary)] bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-tertiary-hover)]">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white rounded-md bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)]">
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
};
