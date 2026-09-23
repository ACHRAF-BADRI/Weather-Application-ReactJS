import { useEffect, useId, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

// Accessible combobox: type → debounced suggestions → arrows/Enter or tap to add.
export default function CitySearch({ onAdd }) {
  const { t } = useI18n();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSearching(true);
      setOpen(true);
      api
        .search(q, { signal: controller.signal })
        .then((results) => {
          setSuggestions(results);
          setActive(-1);
          setOpen(true);
        })
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const close = (event) => boxRef.current && !boxRef.current.contains(event.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  function choose(place) {
    if (!place) return;
    onAdd({ name: place.name, q: `id:${place.id}` });
    setQuery('');
    setSuggestions([]);
    setOpen(false);
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(suggestions[active] || suggestions[0]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  const showList = open && (searching || suggestions.length > 0);

  return (
    <div ref={boxRef} className="relative flex-1">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-subtle">
            ⌕
          </span>
          <input
            type="search"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            aria-label={t('home.searchPlaceholder')}
            className="input pl-10"
            placeholder={t('home.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            autoComplete="off"
          />
        </div>
        <button type="button" className="btn-primary px-5" disabled={!suggestions.length} onClick={() => choose(suggestions[active] || suggestions[0])}>
          {t('home.add')}
        </button>
      </div>

      {showList && (
        <ul id={listId} role="listbox" className="glass absolute inset-x-0 top-full z-20 mt-2 max-h-72 overflow-auto p-1.5">
          {searching
            ? Array.from({ length: 3 }, (_, i) => (
                <li key={i} className="px-4 py-3">
                  <div className="skeleton h-4 w-2/5" />
                  <div className="skeleton mt-2 h-3 w-1/3" />
                </li>
              ))
            : suggestions.map((place, index) => (
                <li
                  key={place.id}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(place)}
                  onMouseEnter={() => setActive(index)}
                  className={`cursor-pointer rounded-2xl px-4 py-3 ${index === active ? 'bg-tint/10' : ''}`}
                >
                  <span className="font-medium text-fg">{place.name}</span>
                  <span className="text-sm text-subtle">{[place.region, place.country].filter(Boolean).map((s) => `, ${s}`)}</span>
                </li>
              ))}
        </ul>
      )}
    </div>
  );
}
