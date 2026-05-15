'use client';

import type { LanguageCode } from '../lib/languages/registry';
import { getAllLanguages } from '../lib/languages/registry';

export function LanguageSwitcher({
  current,
  onChange,
}: {
  current: string;
  onChange: (code: LanguageCode) => void;
}) {
  const languages = getAllLanguages();

  return (
    <div
      className="flex items-center rounded-full overflow-hidden"
      style={{ filter: 'url(#sketch)' }}
    >
      {languages.map((lang, i) => {
        const isActive = lang.code === current;
        return (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code as LanguageCode)}
            aria-label={`Switch to ${lang.name}`}
            aria-pressed={isActive}
            className={`px-3 py-1.5 text-xs font-semibold transition-all duration-300 ${
              i > 0 ? 'border-l border-zinc-200 dark:border-zinc-700' : ''
            } ${
              isActive
                ? 'text-zinc-900 dark:text-zinc-50 bg-zinc-900/10 dark:bg-zinc-50/10'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50'
            }`}
          >
            {lang.code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
